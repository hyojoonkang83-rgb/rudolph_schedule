# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Vite dev server at http://localhost:5173
npm run build     # Type-check is implicit via tsc; produces dist/
npm run preview   # Preview the production build
npm run lint      # ESLint (flat config) — currently only lints .js/.jsx
npx tsc --noEmit  # TypeScript type-check (strict + noUncheckedIndexedAccess)
```

There is no test runner configured. Do not invent `npm test` — ask before introducing one.

## Architecture

The app is a single-page React 19 + TypeScript scheduler with **no backend**: all state lives in `localStorage` and the only "navigation" is a `?project=<id>` query string handled inside `App.tsx`.

```
App.tsx ── reads/writes localStorage via utils/storage.ts
  │        owns: projects[], dashboardConfig, theme, selectedProject
  │        synchronizes selectedProject ↔ ?project=<id> URL via pushState/popstate
  │
  ├─ <Dashboard>            project list, create/edit/delete, 60×60 image crop, theme toggle
  └─ <ProjectScheduler>     month/week toggle, schedule CRUD
       ├─ useCalendar()     pure hook: derives `days`, `monthStart`, `totalWeeks`,
       │                    and a Map<scheduleId, laneIndex> using a greedy non-overlap
       │                    placement (sorted by startDate asc, then longer-first).
       ├─ <CalendarHeader>  month/week nav + view-mode toggle (framer-motion layoutId)
       ├─ <CalendarGrid>    month view; 7×N grid driven by `totalWeeks`
       │   └─ <DayCell>     renders <ScheduleItem> bars positioned by `lane * 28px`
       ├─ <WeekView>        24h × 7d grid, 60px/hour, NowIndicator updates every 60s
       └─ <ScheduleModal>   add/edit form; Event vs Task tabs decide `type`
```

### Data model (`src/types/project.ts`)

- `Project { id, clientName, projectName, imageUrl?, schedules[] }`
- `Schedule { id, title, startDate, endDate, startTime?, endTime?, isAllDay, color, type, category?, ... }`
- Dates are ISO `yyyy-MM-dd` strings, times are `HH:mm`. All conversion uses `date-fns` `parseISO`/`format`.
- `lane?: number` is **computed** by `useCalendar`, not persisted.

### Persistence (`src/utils/storage.ts`)

- Keys: `rudolph_schedule_data`, `rudolph_dashboard_config`, `rudolph_theme`.
- `getProjects()` performs three things on every read: legacy-key migration (`design_agency_projects` → new key), sample seeding when empty, and per-item validation that drops malformed records back to disk. Treat it as the single source of truth — do not read `localStorage` directly elsewhere.
- IDs come from `generateId(prefix)` which combines `crypto.randomUUID()` and `Date.now().toString(36)`.

### Styling

- **Tailwind v4** via `@import "tailwindcss"` in `src/index.css`. Design tokens live in the `@theme` block (`--color-background`, `--color-foreground`, `--color-primary`, …) and the `.dark` class overrides them under `@layer base`. The legacy `tailwind.config.js` is effectively unused for theming.
- Always reach for the semantic tokens (`bg-card`, `text-foreground`, `border-border`) instead of literals like `bg-white dark:bg-zinc-900` — this was a deliberate migration (commit `9f18bf7`) and mixing styles regresses light-mode contrast.
- `PRESET_COLORS` in `src/components/scheduler/constants.ts` is the canonical schedule-color palette. Each entry now carries a `hex` field; `WeekView` reads `colorData.hex` directly because Tailwind utility classes cannot be interpolated at runtime.

### Resilience

- `<ErrorBoundary>` wraps the whole app and offers a "wipe localStorage and reload" escape hatch.
- Calendar logic (`useCalendar`, `CalendarGrid.getSchedulesForDay`, `ScheduleItem`) wraps every `parseISO` in try/catch — keep this pattern when adding date handling, since user data may have been hand-edited in DevTools.

## Conventions worth preserving

- **Korean-first UI copy.** All visible text is Korean; English only appears in code identifiers and small uppercase accent labels (e.g. `New Schedule`).
- **TypeScript strict + `noUncheckedIndexedAccess`** is on. Array element access (`days[i]`, `PRESET_COLORS[0]`) returns `T | undefined` — existing code uses non-null assertions (`!`) where invariants hold; match the surrounding style rather than restructuring.
- **ESLint flat config currently only targets `.js/.jsx`.** TypeScript files are not linted by `npm run lint`. Type-check via `tsc --noEmit` is the real gate.
- The `.agent/` directory holds the project's "Dolf" persona, skills, and workflow definitions (`AGENTS.md`, `SKILLS.md`, `rules.md`, `workflows/`). Treat them as authoritative for tone, naming, and review process.

## Repo state notes

- The current main branch is `R_schedule_6` (commit `311319c`). Reflog shows an earlier `R_schedule_7_compact_ui` was rolled back; if you see references to "R7" work, check `backup/r7-retry-2026-04-30` before assuming features are missing.
- `package.json` says `"version": "0.5.0"` but `Dashboard.tsx` renders a `v0.6-Stable` badge. They drift; bump both together.
- `.gitignore` covers `node_modules`, `dist`, `build`, `.env`, `.DS_Store`, `.gemini`. The committed `dist/` directory predates this rule — do not regenerate it as part of unrelated work.

---

## 프로젝트 특수 컨벤션 (v1.0 업그레이드 컨텍스트)

### 한국어 우선 원칙
- 모든 응답, 커밋 메시지, 주석, UI 텍스트는 한국어 우선
- 커밋 형식: `type: 한국어 요약 (영문 keyword)`
  예: `feat: 한국 공휴일 표시 시스템 추가 (holidays-2026)`

### 시맨틱 토큰 100% 사용
- `bg-card`, `text-foreground` 등 시맨틱 토큰만 사용
- `bg-white`, `bg-zinc-900` 등 직접 색상 클래스 금지
- Tailwind v4의 `@theme` 디렉티브 기반

### 돌프(Dolf) 페르소나
- `.agent/AGENTS.md`, `.agent/rules.md`, `.agent/SKILLS.md` 참조
- UX/UI 기획 + Frontend + Backend 3 역할 통합
- Identity Locking, SCoT 적용

### 알려진 함정 (반복 실수 방지)
- **WeekView 색상**: `var(--color-${id})` 사용 금지 → `PRESET_COLORS.hex` 직접 참조
- **23시 경계**: `endTime`은 `00:00` 대신 `23:59`
- **ScheduleModal type 셀렉터**: 제거됨, `ProjectScheduler.handleSubmitSchedule`이 자동 결정
- **Schedule.memo 필드**: 워킹트리 변경에 추가됨 (HEAD에는 아직 없음)

### 4개 병렬 브랜치 운용 (v1.0 업그레이드)
- `feature/v1-foundation`: 컴팩트 UI + 공휴일 + 버그픽스 (베이스)
- `feature/v1-supabase`: localStorage → Supabase 마이그레이션
- `feature/v1-notifications`: 알림/리마인더 시스템
- `feature/v1-collaboration`: 다중 사용자 팀 협업

### 백업 브랜치 (참조용)
- `backup/r7-retry-2026-04-30`: R_schedule_7 재시도 보존 (15개 파일)
- `backup_before_rollback`: 이전 롤백 시점

### localStorage 키 (Supabase 마이그레이션 시 참조)
- `rudolph_schedule_data`
- `rudolph_dashboard_config`
- `rudolph_theme`

### 보안 원칙
- `.env.local`의 Supabase 키 절대 커밋 금지
- `VITE_` prefix 환경변수만 클라이언트 노출
- Supabase service_role 키는 클라이언트에서 절대 사용 금지
