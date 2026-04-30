# 🦌 Rudolph Schedule — 프로젝트 분석 리포트

> **분석 일자**: 2026-04-30
> **분석 대상 커밋**: `d9f6304` (main HEAD)
> **버전**: `1.0.0-alpha.1`

---

## 1. 프로젝트 개요

| 항목 | 내용 |
|------|------|
| **이름** | Rudolph Schedule (2026 루돌프 스케줄) |
| **목적** | 에이전시 프로젝트와 브랜드 리뉴얼 일정을 한눈에 관리하는 SPA 스케줄러 |
| **타입** | 프론트엔드 단독 SPA (No Backend, localStorage 기반) |
| **언어/UI** | 한국어 우선 |
| **총 코드량** | 2,196 라인 (TypeScript + CSS, 21개 파일) |
| **의존성 규모** | 7개 dep / 16개 devDep |

---

## 2. 기술 스택

### 2.1 런타임
- **React 19.2.4** + **React DOM 19.2.4**
- **TypeScript 5.9.3** (strict + `noUncheckedIndexedAccess`)
- **Vite 8.0.0** (빌드 결과: 395KB JS, 56KB CSS, gzip 후 ~133KB)

### 2.2 스타일링
- **Tailwind CSS 4.2.1** — `@import "tailwindcss"` + `@theme` 디렉티브 기반
- **PostCSS 8.5.8** + autoprefixer
- 시맨틱 토큰 시스템 (`--color-background`, `--color-card`, `--color-primary` 등)
- `.dark` 클래스 오버라이드로 다크모드 구현

### 2.3 도메인 라이브러리
- **date-fns 4.1.0** — 모든 날짜 연산
- **framer-motion 12.36.0** — 페이지/모달 전환 애니메이션
- **lucide-react 0.577.0** — 아이콘
- **clsx 2.1.1**, **tailwind-merge 3.5.0** — 클래스 병합 유틸

### 2.4 개발 도구
- **ESLint 9.39.4** (flat config, **현재 .js/.jsx만 린트** — TS 파일은 `tsc --noEmit`이 게이트)

---

## 3. 아키텍처

### 3.1 컴포넌트 트리
```
App.tsx (145 LOC)
├─ ErrorBoundary (73 LOC) — 데이터 초기화 escape hatch
├─ AnimatePresence
│  ├─ Dashboard (468 LOC) — 프로젝트 목록, CRUD, 60×60 이미지 크롭, 테마 토글
│  │  ├─ Modal (61 LOC) — 공용 모달
│  │  └─ ConfirmModal (75 LOC) — 삭제 확인
│  └─ ProjectScheduler (197 LOC) — 월/주 토글 + 일정 CRUD
│     ├─ CalendarHeader (90 LOC) — 월/주 네비, framer-motion layoutId
│     ├─ CalendarGrid (92 LOC) — 7×N 월 뷰
│     │  └─ DayCell (88 LOC)
│     │     └─ ScheduleItem (75 LOC)
│     ├─ WeekView (222 LOC) — 24h × 7d, 60px/h, NowIndicator
│     └─ ScheduleModal (212 LOC) — Event/Task 탭 폼
└─ useCalendar (96 LOC, hook) — days, totalWeeks, lane Map 도출
```

### 3.2 상태 관리
- **단일 진실 원천**: `App.tsx`의 useState (props 드릴링)
  - `projects[]` · `dashboardConfig` · `theme` · `selectedProject`
- **외부 상태 라이브러리 없음** (Redux/Zustand/Jotai 미사용)
- **URL 동기화**: `?project=<id>` ↔ `selectedProject` (pushState/popstate)

### 3.3 라우팅
- 라우터 라이브러리 없음 — `App.tsx`가 직접 query string 처리
- 페이지 = Dashboard | ProjectScheduler 양자택일

---

## 4. 데이터 모델

### 4.1 타입 (`src/types/project.ts`)

```typescript
interface Project {
  id: string;
  clientName: string;
  projectName: string;
  imageUrl?: string;
  schedules: Schedule[];
}

interface Schedule {
  id: string;
  title: string;
  startDate: string;        // ISO yyyy-MM-dd
  endDate: string;
  startTime?: string|null;  // HH:mm
  endTime?: string|null;
  isAllDay: boolean;
  color: string;
  type: 'work' | 'meeting' | 'deadline';
  category?: 'event' | 'task';
  memo?: string;
  startTimezone?: string;
  endTimezone?: string;
  lane?: number;            // 비-영속 (useCalendar가 계산)
}
```

### 4.2 영속화 (`src/utils/storage.ts`)

| localStorage 키 | 내용 |
|-----------------|------|
| `rudolph_schedule_data` | 프로젝트 배열 |
| `rudolph_dashboard_config` | 대시보드 타이틀/설명 |
| `rudolph_theme` | `'light'` \| `'dark'` |

**`getProjects()`의 3가지 책임** (단일 진입점):
1. 레거시 키 마이그레이션 (`design_agency_projects` → 신규 키)
2. 빈 데이터 시 샘플 프로젝트 시딩
3. 항목 단위 검증 후 깨진 레코드 자동 제거 + 디스크 재저장

**ID 생성**: `generateId(prefix)` = `crypto.randomUUID().split('-')[0]` + `Date.now().toString(36).slice(-4)`

---

## 5. 핵심 알고리즘: Lane 배치

`useCalendar.ts`의 `scheduleToLaneMap` (Greedy 비충돌 배치):

1. **검증**: `parseISO` try/catch로 손상된 일정 필터
2. **정렬**: `startDate` 오름차순, 동일 시작이면 `endDate` 내림차순(긴 것 우선)
3. **배치**: 각 일정마다 lanes 배열을 순회 → 충돌 없는 첫 lane에 삽입, 없으면 새 lane
4. **반환**: `Map<scheduleId, laneIndex>` — `DayCell`이 `lane * 28px`로 위치 결정

**비-영속 필드**: `Schedule.lane`은 저장 안 됨, 매 렌더링 재계산.

---

## 6. 디자인 시스템

### 6.1 시맨틱 토큰 (`src/index.css`)

```css
@theme {
  --color-background: #FFFFFF;     /* dark: #000000 */
  --color-foreground: #1A1A1A;     /* dark: #F5F5F7 */
  --color-primary:    #0057FF;
  --color-primary-dark: #0046CC;
  --color-muted:      #F5F5F7;     /* dark: #1C1C1E */
  --color-border:     #E5E5E7;     /* dark: #2C2C2E */
  --color-card:       #FFFFFF;     /* dark: #0F0F10 */
  --color-surface:    #FBFBFC;     /* dark: #161618 */
  --font-sans: "Inter", -apple-system, ...;
}
```

**규칙** (CLAUDE.md):
- ✅ `bg-card`, `text-foreground`, `border-border` 같은 시맨틱 토큰만 사용
- ❌ `bg-white dark:bg-zinc-900` 같은 하드코딩 금지

### 6.2 색상 팔레트 (`PRESET_COLORS`, `constants.ts`)
6개 색상 (blue/purple/green/yellow/red/indigo), 각각 `{id, hex, bg, text, light, border}` 보유.

**중요**: WeekView는 Tailwind 클래스를 런타임 보간할 수 없으므로 `colorData.hex`를 `style={{backgroundColor}}`에 직접 주입.

### 6.3 접근성
- `:focus-visible` → `ring-2 ring-primary ring-offset-2`
- `scrollbar-gutter: stable` → 모달 열림 시 레이아웃 점프 방지

---

## 7. 주요 기능

### 7.1 한국 2026 공휴일 (`src/utils/calendar.ts`)
- `HOLIDAYS_2026` Record 20개 항목 (신정~성탄절, 대체공휴일 포함)
- export: `isSunday(date)` · `isHoliday(date)` · `getHolidayName(date)`
- 통합 위치: `DayCell.tsx:29-32`

### 7.2 월 / 주 뷰 토글
- `framer-motion`의 `layoutId`로 헤더 전환 애니메이션
- 주 뷰: 24시간 × 7일 격자, 60px/시간, **NowIndicator**가 60초마다 갱신

### 7.3 일정 모달 (`ScheduleModal`)
- Event / Task 탭 분기
- All-day 토글
- 23시 시작 시 endTime 자동 `23:59` (00:00 경계 버그 회피)
- 색상 6개, 메모, 삭제 버튼

### 7.4 ErrorBoundary
- 모든 미캐치 에러 → 에러 화면
- "다시 시도" + "**데이터 전체 초기화**" 두 가지 액션 (`localStorage.clear()`)

---

## 8. 알려진 함정 / 컨벤션

| 항목 | 내용 |
|------|------|
| **WeekView 색상** | `var(--color-${id})` 금지 → `PRESET_COLORS.hex` 직접 참조 |
| **23시 endTime** | `00:00` 대신 `23:59` (날짜 경계 회피) |
| **ScheduleModal type 셀렉터** | 제거됨, `ProjectScheduler.handleSubmitSchedule`이 자동 결정 |
| **strict + noUncheckedIndexedAccess** | `array[i]`는 `T \| undefined` → 기존 코드는 `!` non-null 단언 사용 |
| **린트 범위** | `npm run lint`는 .js/.jsx만 — TS는 `npx tsc --noEmit`이 실제 게이트 |
| **테스트 러너** | **없음** — `npm test` 명령 발명 금지 |

---

## 9. 디렉토리 구조

```
rudolph_schedule/
├─ .agent/                 # Dolf 페르소나/룰 (workflow 4종)
├─ .claude/commands/       # 슬래시 커맨드 (.agent에서 승격)
│  ├─ batch-ship.md
│  ├─ dolf-insight.md
│  ├─ fact-check.md
│  └─ ux-audit.md
├─ src/
│  ├─ App.tsx              # 진입점, 상태 + URL 동기화
│  ├─ main.tsx
│  ├─ index.css            # @theme + .dark 토큰
│  ├─ assets/              # hero.png 등
│  ├─ components/
│  │  ├─ Dashboard.tsx
│  │  ├─ Modal.tsx
│  │  ├─ ConfirmModal.tsx
│  │  ├─ ErrorBoundary.tsx
│  │  └─ scheduler/
│  │     ├─ ProjectScheduler.tsx
│  │     ├─ CalendarHeader.tsx
│  │     ├─ CalendarGrid.tsx
│  │     ├─ DayCell.tsx
│  │     ├─ ScheduleItem.tsx
│  │     ├─ WeekView.tsx
│  │     ├─ ScheduleModal.tsx
│  │     ├─ useCalendar.ts
│  │     └─ constants.ts
│  ├─ types/project.ts
│  └─ utils/
│     ├─ storage.ts
│     └─ calendar.ts       # 신규 (d9f6304)
├─ CLAUDE.md               # 프로젝트 컨텍스트 (Claude Code용)
├─ README.md
├─ package.json
├─ tsconfig.json
├─ tailwind.config.js      # ⚠️ 사실상 미사용 (Tailwind v4는 @theme 사용)
├─ vite.config.js
├─ eslint.config.js
└─ dist/                   # .gitignore로 제외됨
```

---

## 10. Git / 브랜치 운용

### 10.1 브랜치 토폴로지

| 브랜치 | HEAD | 용도 |
|--------|------|------|
| `main` | d9f6304 | 안정 라인 (origin 동기화) |
| `feature/v1-foundation` | d9f6304 | 컴팩트 UI 추가 |
| `feature/v1-supabase` | d9f6304 | localStorage → Supabase 마이그레이션 |
| `feature/v1-notifications` | d9f6304 | 알림/리마인더 |
| `feature/v1-collaboration` | d9f6304 | 다중 사용자 협업 |
| `backup/r7-retry-2026-04-30` | (보존) | R_schedule_7 재시도 (15개 파일 보존) |
| `backup_before_rollback` | (보존) | 이전 롤백 시점 |

### 10.2 최근 5개 커밋

```
d9f6304 feat: 워킹트리 변경분 통합 적용 (compact-ui-and-fixes)
c90b6b4 chore: .agent 워크플로우를 슬래시 커맨드로 승격 (slash-commands)
283e4a6 chore: 버전 1.0.0-alpha.1로 동기화 (version-bump)
dfe30d4 chore: .gitignore 표준 템플릿으로 보강 (gitignore-standard)
c2b63c3 docs: CLAUDE.md 프로젝트 컨텍스트 추가 (project-context)
```

### 10.3 커밋 컨벤션
- 형식: `type: 한국어 요약 (영문 keyword)`
- 한국어 우선, 영문 keyword는 식별용

---

## 11. 빌드 / 검증 결과

| 검증 | 결과 |
|------|------|
| `npm run build` | ✅ 0 에러 (258ms, 2969 modules) |
| `npx tsc --noEmit` | ✅ 0건 |
| 워킹트리 | ✅ clean |
| origin/main 동기화 | ✅ |
| 빌드 산출물 | `dist/index.html` 0.58KB · `index-*.css` 56.71KB · `index-*.js` 395.03KB |

---

## 12. 강점 / 개선 여지

### 12.1 강점 ✅
- **단순한 데이터 흐름**: 외부 상태 라이브러리 없이 props 드릴링만으로 동작
- **시맨틱 토큰 일관성**: 거의 모든 UI가 `bg-card`/`text-foreground` 토큰화 완료
- **방어적 데이터 처리**: `getProjects`의 3중 안전망 + ErrorBoundary 데이터 초기화
- **순수 함수형 캘린더 훅**: `useCalendar`가 부수효과 없이 lane 계산
- **strict TS**: `noUncheckedIndexedAccess`까지 활성화

### 12.2 개선 여지 ⚠️
- **테스트 부재**: 단위 테스트 0개 — Lane 배치 알고리즘 등 핵심 로직에 회귀 위험
- **공휴일 하드코딩**: 2026년 1년만 정의 → 2027년 데이터 갱신 필요
- **백엔드 부재**: `feature/v1-supabase`로 해결 예정 (이미 브랜치 존재)
- **468 LOC Dashboard.tsx**: 단일 컴포넌트가 비대 → 모달/카드/메뉴 분리 검토
- **README와 실제 상태 불일치**: README에 "Stable V4"로 표기, 실제는 v1.0.0-alpha.1
- **`tailwind.config.js`**: Tailwind v4 마이그레이션 후 사실상 미사용 — 정리 가능
- **린트 커버리지**: ESLint가 .js/.jsx만 검사, TS는 `tsc`만 — `typescript-eslint` 도입 검토

---

## 13. 다음 마일스톤 (브랜치 매핑)

| 브랜치 | 작업 내용 | 예상 공수 |
|--------|-----------|----------|
| `feature/v1-foundation` | 컴팩트 UI 추가 작업 | — |
| `feature/v1-supabase` | localStorage → Supabase 마이그레이션 | 1~2일 |
| `feature/v1-notifications` | 알림/리마인더 시스템 | 반나절 |
| `feature/v1-collaboration` | 팀 협업 (다중 사용자) | 1일 |

---

## 14. 종합 평가

> **v1.0-alpha.1 단계의 견고한 단일 페이지 스케줄러.**
> 외부 의존성을 최소화하고 시맨틱 토큰 시스템을 일관되게 적용하여, 코드 레벨에서 다크모드/모달 깨짐 같은 회귀 가능성을 차단하는 데 성공한 상태.
> 핵심 위험은 **테스트 부재**와 **백엔드 부재**이며, 둘 다 별도 브랜치로 분리되어 마일스톤이 명확함.
> 빌드/타입 게이트는 0 에러로 통과하므로 v1.0-alpha 공식 선언이 가능한 시점.
