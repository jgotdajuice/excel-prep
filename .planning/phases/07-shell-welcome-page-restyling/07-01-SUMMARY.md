---
phase: 07-shell-welcome-page-restyling
plan: 01
subsystem: ui
tags: [react, tailwind, design-tokens, appshell, welcome, clsx]

# Dependency graph
requires:
  - phase: 06-design-foundation
    provides: "@theme tokens (brand, brand-dark, base, border, muted, text-primary), Button and Card UI primitives, Inter font"

provides:
  - "AppShell restyled with Tailwind utilities consuming @theme tokens — zero inline styles"
  - "WelcomePage restyled with Tailwind utilities, How it works onboarding section, shared Button component"

affects: [08-drill-page-restyling, 09-challenge-page-restyling, 10-progress-page-restyling]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "NavLink className callback with clsx for active/inactive state — use instead of style callback"
    - "Card component wraps page sections needing bg-surface + border + rounded-card + optional shadow"

key-files:
  created: []
  modified:
    - src/components/AppShell.tsx
    - src/pages/WelcomePage.tsx

key-decisions:
  - "NavLink uses className callback (not style callback) with clsx for isActive toggling — consistent with Tailwind approach"
  - "Sidebar width uses w-[220px] min-w-[220px] arbitrary values (w-55 not verified in Tailwind v4 default scale)"
  - "WelcomePage secondary CTA uses variant='secondary' (bg-brand-light + border-brand) rather than ghost — matches design intent"

patterns-established:
  - "NavLink active/inactive pattern: clsx with isActive callback — text-brand-dark + border-brand for active, text-text-primary/70 + border-transparent for inactive"
  - "Page layout: min-h-full flex flex-col items-center justify-center bg-base — no min-h-screen since AppShell provides the full-height frame"

requirements-completed: [UX-01]

# Metrics
duration: 8min
completed: 2026-02-23
---

# Phase 7 Plan 1: Shell and Welcome Page Restyling Summary

**AppShell and WelcomePage converted from inline styles to Tailwind utilities consuming @theme tokens, with a How it works onboarding section added to WelcomePage using shared Button and Card components**

## Performance

- **Duration:** ~8 min
- **Started:** 2026-02-23T19:57:00Z
- **Completed:** 2026-02-23T20:05:20Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- AppShell header, sidebar, and nav links fully Tailwind-styled using bg-brand-dark, bg-base, border-border, text-muted tokens
- NavLink active indicator: green left border (border-brand) + bold text (text-brand-dark) via clsx className callback
- WelcomePage "How it works" section with 3 numbered bullets: practice formulas, instant feedback, track progress
- WelcomePage CTA buttons replaced with shared Button component (primary and secondary variants)
- All onMouseEnter/onMouseLeave handlers removed — Button handles hover via Tailwind

## Task Commits

Each task was committed atomically:

1. **Task 1: Restyle AppShell from inline styles to Tailwind utilities** - `5fddb37` (feat)
2. **Task 2: Restyle WelcomePage with onboarding section and shared Button** - `0735416` (feat)

**Plan metadata:** (docs commit — see below)

## Files Created/Modified
- `src/components/AppShell.tsx` - Full Tailwind restyle: header, sidebar, nav links with active indicator; added clsx import
- `src/pages/WelcomePage.tsx` - Full Tailwind restyle; How it works section; Button + Card imports; removed mouse handlers

## Decisions Made
- NavLink uses `className` callback with clsx (not `style` callback) — consistent with Tailwind approach where all styling comes from utility classes
- Sidebar uses `w-[220px] min-w-[220px]` arbitrary values; w-55 would be 220px in Tailwind's 4px scale but using explicit value for clarity
- WelcomePage secondary button uses `variant="secondary"` (brand-light background with brand border) rather than `variant="ghost"` — matches the green-accented design intent

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- AppShell provides the fully-styled outer frame for all 5 routes — subsequent page restyling phases work within a consistent shell
- WelcomePage onboarding section is live; first-time users see the learning loop explained
- Phase 8 (DrillPage restyling) and Phase 9 (ChallengePage restyling) can proceed

---
*Phase: 07-shell-welcome-page-restyling*
*Completed: 2026-02-23*
