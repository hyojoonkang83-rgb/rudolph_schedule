# Rudolph Schedule — 프로젝트 히스토리 & 진행사항 분석

> **분석 일자**: 2026-04-30
> **분석 대상 브랜치**: `main` @ `311319c` (origin/main 동기화 완료)
> **저장소 경로**: `/Users/joon/Desktop/Ai_project/rudolph_schedule`

본 문서는 git 커밋 로그, reflog, 워킹트리 상태, 실제 소스 코드를 모두 더블체크하여 작성된 진행 보고서입니다.

---

## 1. 프로젝트 개요

| 항목 | 내용 |
|---|---|
| **프로젝트명** | Rudolph Schedule (2026 루돌프 스케줄) |
| **목적** | 에이전시 프로젝트와 브랜드 리뉴얼 일정을 한눈에 관리하는 프리미엄 스케줄러 |
| **개발 기간** | 2026-03-18 ~ 2026-03-31 (약 13일, 17개 커밋) |
| **HEAD 커밋** | `311319c` — R_schedule_6 |
| **package.json 버전** | `0.5.0` |
| **UI 표시 버전 배지** | `v0.6-Stable` ⚠ 불일치 |

### 1.1 기술 스택 (package.json 검증 완료)

| 영역 | 채택 기술 |
|---|---|
| **Frontend** | React `19.2.4`, TypeScript `5.9.3` |
| **Styling** | Tailwind CSS `4.2.1` (v4 신규 `@theme` 디렉티브 사용) |
| **Animation** | Framer Motion `12.36.0` |
| **Icons** | Lucide React `0.577.0` |
| **Date** | date-fns `4.1.0` |
| **Build** | Vite `8.0.0` |
| **Lint** | ESLint `9.39.4` (flat config) |

### 1.2 빌드/타입 검증 결과 (실측)

| 검증 | 결과 | 상세 |
|---|---|---|
| `npm run build` | ✅ 통과 | 472ms, JS 395KB(gzip 123KB), CSS 56KB(gzip 9.3KB) |
| `npx tsc --noEmit` | ✅ 통과 | 에러 0건 |
| 코드 규모 | 2,120 LOC | `.ts`/`.tsx` 합산 |

---

## 2. 커밋 타임라인 (17개)

| # | Hash | 날짜 | 메시지 | 핵심 변화 |
|---|---|---|---|---|
| 1 | `d89b6b3` | 03-18 | Initial commit: 저장소 초기화 | 작업 시작 세이브포인트 |
| 2 | `ca6849c` | 03-18 | Stable Milestone: Atomic Architecture & TypeScript Migration | TS 전환 + 원자 구조 |
| 3 | `7c86d76` | 03-18 | Stable Milestone 2.0: Resilience, Accessibility & UI Polishing | ErrorBoundary, ARIA |
| 4 | `6e07a8e` | 03-18 | Stable V4: Performance Optimization & Total Audit | useCallback/useMemo |
| 5 | `7c4e591` | 03-18 | Stable V4: README 전문화 | 문서화 |
| 6 | `a8ba886` | 03-19 | feat: stabilize and optimize | App.css 184줄 제거, 토큰화 |
| 7 | `6a29170` | 03-19 | Stable V5 | 미세 조정 |
| 8 | `1fb1231` | 03-26 | R_schedule_1 | `.agent/` 페르소나·워크플로우 추가 |
| 9 | `682beda` | 03-26 | R_schedule_2: Light/dark mode 영구 상태 | 테마 토글 + localStorage |
| 10 | `9f18bf7` | 03-26 | R_schedule_3: 시맨틱 CSS 변수 마이그레이션 | 라이트모드 가시성 픽스 |
| 11 | `72f243d` | 03-26 | R_schedule_4 | Dashboard 대규모 리팩토링(+196), Modal·ConfirmModal 정리 |
| 12 | `0c8dd08` | 03-26 | R_schedule_5: 이미지 60px 자동 리사이징 | 캔버스 기반 정사각 크롭 |
| 13 | `f18da12` | 03-26 | R_schedule_5 | **WeekView 신규(+219)**, ScheduleItem/CalendarHeader 개선 |
| 14 | `e2f19f2` | 03-26 | R_schedule_5_stable | ScheduleModal 일괄 정리 |
| 15 | `6913002` | 03-26 | R_schedule_7_compact_ui | (롤백됨, reflog에만 존재) |
| 16 | `72b4e27` | 03-31 | Backup before rolling back to R_schedule_5_stable | (롤백됨, reflog에만 존재) |
| 17 | `311319c` | 03-31 | **R_schedule_6** ← HEAD | URL 기반 라우팅, 테마 초기화 SSR-safe |

> 표의 #15·#16은 `git log`에는 없지만 `git reflog`에 남아 있습니다. `R_schedule_7_compact_ui` → 백업 브랜치 → `R_schedule_5_stable`로 reset → 다시 `R_schedule_6`로 재출발한 의도적 롤백 흐름이 확인됩니다.

### 2.1 마일스톤 구간 요약

```
구간 1 (03-18 ~ 03-19) : Stable V1 ~ V5  → 골격 안정화
                         타입스크립트 마이그레이션, 성능 최적화, 시맨틱 토큰화
구간 2 (03-26 단일일자 폭주): R_schedule_1 ~ 5_stable
                         테마 시스템, 캘린더 리뉴얼(WeekView 신설), 이미지 처리
구간 3 (03-26 ~ 03-31) : R_schedule_7 시도 → 롤백 → R_schedule_6
                         컴팩트 UI 실험을 일단 후퇴시키고 R_schedule_5_stable 위에 안전 항해
```

---

## 3. 현재 아키텍처 (HEAD `311319c` 기준 검증)

```
src/
├── App.tsx                     라우팅(?project=ID) + 테마 토글 + 오케스트레이션
├── main.tsx                    엔트리
├── index.css                   Tailwind v4 @theme 토큰, 다크모드 변수
├── types/
│   └── project.ts              Project, Schedule 인터페이스 (memo 필드는 워킹트리에서 추가됨)
├── utils/
│   ├── storage.ts              localStorage CRUD, 마이그레이션, 샘플 시드
│   └── calendar.ts             ⚠ 현재 untracked (한국 공휴일 데이터)
└── components/
    ├── Dashboard.tsx           프로젝트 목록·생성·삭제·이미지 60px 리사이즈·인라인 편집
    ├── Modal.tsx               공용 모달 셸
    ├── ConfirmModal.tsx        삭제 확인 모달
    ├── ErrorBoundary.tsx       전역 에러 바운더리
    └── scheduler/
        ├── ProjectScheduler.tsx  스케줄러 셸 (월/주 뷰 토글)
        ├── CalendarHeader.tsx    상단 네비(이전/오늘/다음 + 뷰 모드)
        ├── CalendarGrid.tsx      월간 7×N 그리드
        ├── DayCell.tsx           일자 셀 (일정 표시·더보기)
        ├── WeekView.tsx          주간 뷰 (24시간 그리드 + NowIndicator)
        ├── ScheduleItem.tsx      일정 막대(month-view용)
        ├── ScheduleModal.tsx     일정 추가/수정 모달
        ├── useCalendar.ts        Lane 알고리즘(겹침 방지) + 일자 산출
        └── constants.ts          PRESET_COLORS, TIMEZONES
```

### 3.1 핵심 도메인 모델

```typescript
// src/types/project.ts (HEAD)
interface Schedule {
  id: string;
  title: string;
  startDate: string;          // 'yyyy-MM-dd'
  endDate: string;
  startTime?: string | null;  // 'HH:mm'
  endTime?: string | null;
  isAllDay: boolean;
  color: string;              // PRESET_COLORS의 id
  type: 'work' | 'meeting' | 'deadline';
  category?: 'event' | 'task';
  // memo?: string            // ← 워킹트리 변경에서 추가됨 (HEAD에는 없음)
  startTimezone?: string;
  endTimezone?: string;
  lane?: number;              // useCalendar가 계산하는 겹침 회피 인덱스
}

interface Project {
  id: string;
  clientName: string;
  projectName: string;
  imageUrl?: string;          // dataURL (60×60 리사이즈)
  schedules: Schedule[];
}
```

### 3.2 영속성 계층 (`utils/storage.ts`)

- **현재 키**: `rudolph_schedule_data`, `rudolph_dashboard_config`, `rudolph_theme`
- **레거시 마이그레이션**: 구 키 `design_agency_projects` 자동 이전 후 삭제
- **방어 로직**: JSON 파싱 실패 → 샘플 데이터 반환, 배열/필수 필드 검증으로 손상 항목 자동 정리
- **ID 생성**: `crypto.randomUUID()` + `Date.now().toString(36)` 조합으로 충돌 방지

---

## 4. 워킹트리 미커밋 변경사항 분석 (실질적 R_schedule_7 재시도)

> `git status`상 13개 수정 파일 + 1개 신규 파일. 본질적으로 이전에 롤백되었던 `R_schedule_7_compact_ui` 작업을 더 안전한 R_schedule_6 위에 다시 쌓고 있는 진행 단계로 판단됩니다.

### 4.1 신규 파일 (untracked)

**`src/utils/calendar.ts`** — 2026년 한국 공휴일 시스템
```ts
HOLIDAYS_2026: 신정, 설날(3일), 3.1절+대체, 어린이날, 부처님오신날+대체,
              지방선거, 현충일, 광복절+대체, 추석(3일), 개천절, 한글날, 성탄절
isSunday(date), isHoliday(date), getHolidayName(date)
```

### 4.2 변경 파일 13개 (의미 단위)

| 카테고리 | 파일 | 핵심 변경 |
|---|---|---|
| **공휴일/주말 시각화** | `DayCell.tsx` | 일요일·공휴일 빨간색 표시, 공휴일명 레이블, 셀 높이 `flex` 동적화 |
| **모바일 반응형** | `CalendarGrid.tsx` | `min-w-[700px]` 가로 스크롤, `gridTemplateRows`로 주(週)별 동적 높이, `clamp(500px, 70vh, 650px)` |
| | `CalendarHeader.tsx` | `sm:flex-row` 분기, "오늘" 텍스트 → 시각적 디바이더로 축소 ⚠ |
| | `ProjectScheduler.tsx` | `pb-20 sm:pb-28` 모바일 하단 여백 |
| **컴팩트 UI** | `ScheduleModal.tsx` | 모달 너비 `max-w-md → max-w-sm`, 입력 패딩 `py-4 → py-2.5`, 종류(실무/미팅/마감) 3-grid 셀렉터 **삭제** |
| | `Modal.tsx` | `max-w-md → max-w-sm`, padding 축소, `bg-white dark:bg-zinc-900 → bg-card` 토큰화 |
| | `ConfirmModal.tsx` | 동일하게 `bg-card`로 통일 |
| **색상 시스템 안정화** | `constants.ts` | `PRESET_COLORS`에 `hex` 필드 추가 |
| | `WeekView.tsx` | `var(--color-${schedule.color})` (정의 안 된 변수 참조) → `colorData.hex`로 교체 ⭐ 버그픽스 |
| **Lane 계산 보정** | `useCalendar.ts` | `totalWeeks` 반환 추가 |
| **시간 경계 안전성** | `ProjectScheduler.tsx` | `handleDayClick`: 23시 클릭 시 `endTime`을 `00:00` 대신 `23:59`로 ⭐ 버그픽스 |
| **타입 확장** | `types/project.ts` | `Schedule.memo?: string` 추가 (모달의 메모 입력과 매칭) |
| **다크모드 잔여** | `Dashboard.tsx` | 삭제 버튼 hover에 `dark:hover:bg-red-950/30` 추가 |
| **레이아웃 안정** | `index.css` | `scrollbar-gutter: stable` (스크롤바 등장 시 레이아웃 점프 방지) |
| **현지화** | `DayCell.tsx` | `"+ N more"` → `"+N개 더보기"` |
| **NowIndicator 보정** | `WeekView.tsx` | 빨간 점 위치 계산을 컬럼 정중앙으로 정확화, 시간 라벨 위치 `-left-14 → -left-16` |

### 4.3 잠재 이슈 더블체크

| 항목 | 검증 결과 |
|---|---|
| ScheduleModal에서 `type` 선택 UI 제거 | `ProjectScheduler.handleSubmitSchedule`에서 `type: modalTab === 'event' ? (form.type \|\| 'work') : 'deadline'` 로 자동 결정 → ✅ 정상 |
| `Schedule.type`이 여전히 필수 | `useCalendar`의 lane 계산은 `type`을 사용하지 않음 → ✅ 영향 없음 |
| `ConfirmModal`이 props에 `type`을 받지만 호출부에서는 미전달 | 기본값 `'danger'`로 fallback → ✅ |
| `WeekView`의 `var(--color-${color})` 참조 | tailwind `@theme`에 정의된 토큰명과 PRESET_COLORS의 id가 매핑되지 않아 fallback color로 표시되던 문제 → ✅ hex 직접 사용으로 해결 |
| `package.json` 0.5.0 vs UI 배지 v0.6-Stable | ⚠ 불일치 — 다음 커밋에서 `version: "0.6.0"` 동기화 권장 |
| `dist/` 폴더 커밋 추적 여부 | `.gitignore` 47B만 존재, `dist/` 명시 확인 필요 ⚠ |

---

## 5. 주요 기능 구현 검증 (실제 코드 기준)

### 5.1 테마 시스템 (라이트/다크)
- `App.tsx`: `prefers-color-scheme` 시스템 설정 우선 → `localStorage('rudolph_theme')`로 영속
- `index.css`: `@theme` 토큰 + `.dark` 클래스 오버라이드
- 토글 시 `<html>`의 클래스 토글 + 저장
- ✅ 검증됨

### 5.2 URL 라우팅
- `?project=<ID>` 쿼리스트링으로 직접 진입 가능
- `popstate` 핸들러로 브라우저 뒤로가기 지원
- 공유 링크 복사 기능 (Dashboard, ProjectScheduler 양쪽)
- ✅ 검증됨

### 5.3 Lane 기반 일정 배치 (`useCalendar.ts`)
- 시작일 오름차순 + 같은 시작일이면 **긴 일정 우선** 정렬
- 빈 lane 탐색 → 충돌(겹침) 시 다음 lane 시도 → 없으면 새 lane 생성
- `parseISO` 실패에 대한 try/catch 방어
- ✅ 검증됨

### 5.4 주간 뷰 (`WeekView.tsx`)
- 24시간 × 7일 그리드, 1시간당 60px
- 마운트 시 8AM(480px)으로 자동 스크롤
- All-day 일정은 헤더 영역, 시간 일정은 본문 영역에 분리 렌더
- 1분 주기 setInterval로 NowIndicator 업데이트
- ✅ 검증됨

### 5.5 이미지 업로드 (Dashboard 60px 리사이즈)
- FileReader → Image → Canvas 60×60 정사각 중앙 크롭 → dataURL
- localStorage 용량 부담 최소화
- ✅ 검증됨

### 5.6 데이터 복원력
- `getProjects()`: 손상 데이터 자동 복구, 마이그레이션, 샘플 시드
- `ErrorBoundary`: 전역 React 에러 캐치
- `parseISO` 실패 항목은 lane 계산에서 자동 제외
- ✅ 검증됨

---

## 6. 종합 진행 상태

### 6.1 안정 기능 (HEAD에 커밋 완료)
- ✅ 대시보드 그리드 + 인라인 편집 + 공유 링크
- ✅ 월간/주간 뷰 토글 (애니메이션 layoutId)
- ✅ 라이트/다크 테마 영속화
- ✅ Lane 기반 겹침 회피
- ✅ 60px 이미지 리사이즈
- ✅ localStorage 영속 + 마이그레이션 + 에러 복원
- ✅ ErrorBoundary + 키보드 접근성 (ARIA)

### 6.2 진행 중 (워킹트리, 미커밋)
- 🟡 한국 2026 공휴일 표시 시스템 (신규 calendar.ts)
- 🟡 모바일 반응형 (가로 스크롤, 패딩, 폰트 단계)
- 🟡 모달/시트 컴팩트 UI 일괄 다이어트
- 🟡 ScheduleModal type 셀렉터 단순화
- 🟡 WeekView 색상 시스템 hex 직접 참조 전환 (버그픽스)
- 🟡 23시 경계 endTime 안전성 (버그픽스)
- 🟡 시맨틱 카드 토큰(`bg-card`) 통일
- 🟡 Schedule.memo 필드 + 메모 입력 와이어링

### 6.3 알려진 정합성 이슈
- ⚠ `package.json` 버전(0.5.0)과 UI 배지(v0.6-Stable) 불일치
- ⚠ `dist/`가 추적되고 있을 가능성 — `.gitignore`(47B)에 누락 의심

### 6.4 권장 다음 액션
1. 워킹트리 변경 13+1개 파일을 의미 단위로 2~3개 커밋으로 분리 (공휴일 / 컴팩트 UI / 버그픽스)
2. `package.json` 버전 0.6.0 으로 동기화
3. `.gitignore`에 `dist/`, `node_modules/` 명시 검증
4. `R_schedule_7` 컨셉을 다시 정식 커밋으로 승격 + 태그 부여

---

## 7. 메타: 협업 컨벤션 (`.agent/`)

`.agent/` 디렉토리에 **"돌프(Dolf)"** 페르소나 + 워크플로우 4종이 정의되어 있습니다.

| 파일 | 역할 |
|---|---|
| `AGENTS.md` | UX/UI 기획자 · Frontend 엔지니어 · Backend 엔지니어 3 역할 정의 |
| `SKILLS.md` | Design DNA Synthesizer / Atomic Architect / Security Oracle / Visual Validator |
| `rules.md` | Identity Locking, SCoT, 한국어 우선 출력 등 사고 프로토콜 |
| `workflows/batch-ship.md` | 배치 출하 워크플로우 |
| `workflows/dolf-insight.md` | 인사이트 추출 |
| `workflows/fact-check.md` | 사실 검증 |
| `workflows/ux-audit.md` | UX 오딧 |

이 컨벤션은 모든 산출물의 한국어 우선·시맨틱 토큰 100% 준수·보안 우선 원칙을 명문화하며, 본 프로젝트의 코드 스타일(시맨틱 CSS 변수 통일, ARIA 표준, ErrorBoundary 적용)과 정확히 일치합니다.

---

*Generated by Claude (Opus 4.7, 1M context) — 2026-04-30*
