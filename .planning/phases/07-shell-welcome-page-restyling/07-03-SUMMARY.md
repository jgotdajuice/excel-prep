---
phase: 07-shell-welcome-page-restyling
plan: 03
subsystem: ui
tags: [react, tailwind, design-tokens, statcard, progress, shortcuts, clsx]

# Dependency graph
requires:
  - phase: 06-design-foundation
    provides: "@theme tokens (brand, brand-dark, base, border, muted, text-primary), Button and Card UI primitives"
  - plan: 07-01
    provides: "AppShell and WelcomePage restyled as consistent shell"

provides:
  - "StatCard primitive at src/components/ui/StatCard.tsx"
  - "ProgressPage restyled — Card, StatCard, Button shared components; zero inline styles except AccuracyBar fill"
  - "ShortcutsPage restyled — zero inline styles"
  - "ShortcutSetup restyled — clsx optionBtnClass, Button for Start Session, zero inline styles"

affects: []

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "StatCard = Card base + label (text-xs text-muted uppercase tracking-wide) + value (text-2xl font-bold text-brand-dark)"
    - "optionBtnClass(active) pattern: clsx toggling border-brand/bg-brand-light vs border-border/bg-surface"
    - "AccuracyBar fill div retains inline style for dynamic width + color (runtime values from state)"

key-files:
  created:
    - src/components/ui/StatCard.tsx
  modified:
    - src/pages/ProgressPage.tsx
    - src/pages/ShortcutsPage.tsx
    - src/components/shortcuts/ShortcutSetup.tsx

key-decisions:
  - "AccuracyBar fill div keeps inline style for width and backgroundColor — both are dynamic runtime values computed from accuracy state, not design tokens"
  - "optionBtnClass uses clsx (same pattern as Button) — local function rather than inline ternary for readability"
  - "StatCard uses Card as base (inherits bg-surface, border, rounded-card, padding) — no duplication of container styles"

requirements-completed: [VIS-02]

# Metrics
duration: ~2min
completed: 2026-02-23
---

# Phase 7 Plan 3: StatCard, ProgressPage, and ShortcutsPage Restyling Summary

**StatCard primitive created and ProgressPage/ShortcutsPage/ShortcutSetup converted from inline styles to Tailwind utilities consuming design tokens and shared UI components, completing VIS-02 for all non-challenge pages**

## Performance

- **Duration:** ~2 min
- **Started:** 2026-02-23T20:07:22Z
- **Completed:** 2026-02-23T20:09:19Z
- **Tasks:** 2
- **Files modified:** 4 (1 created, 3 modified)

## Accomplishments

- Created `StatCard.tsx` — metric display primitive using Card base with label (uppercase, muted, xs) + value (2xl, bold, brand-dark)
- ProgressPage: 3 top-level stats replaced with `<StatCard>` grid components
- ProgressPage: tier sections wrapped with `<Card shadow className="mb-4">`
- ProgressPage: Focus, Reset, Yes-reset, Cancel buttons all use `<Button>` with appropriate variants (primary, ghost, danger)
- ProgressPage: AccuracyBar fully Tailwind except fill div `style={{ width, backgroundColor }}` for dynamic runtime values
- ShortcutsPage: single inline style object replaced with `className="p-6 overflow-y-auto h-full"`
- ShortcutSetup: `btnStyle()` helper, `sectionLabel`, and `rowStyle` CSS-in-JS removed entirely
- ShortcutSetup: `optionBtnClass(active)` using clsx — active = brand border/bg, inactive = border/surface with hover
- ShortcutSetup: Start Session replaced with `<Button>` shared component

## Task Commits

Each task was committed atomically:

1. **Task 1: Create StatCard primitive and restyle ProgressPage** — `1053f27` (feat)
2. **Task 2: Restyle ShortcutsPage and ShortcutSetup** — `3184c0b` (feat)

## Files Created/Modified

- `src/components/ui/StatCard.tsx` — New: metric display primitive (label + value) using Card
- `src/pages/ProgressPage.tsx` — Full Tailwind restyle; imports Card, StatCard, Button
- `src/pages/ShortcutsPage.tsx` — Wrapper div inline style removed; Tailwind utilities applied
- `src/components/shortcuts/ShortcutSetup.tsx` — btnStyle/sectionLabel/rowStyle removed; optionBtnClass + Button added

## Decisions Made

- AccuracyBar fill div retains `style={{ width: widthPct, backgroundColor: color }}` — both values are computed at runtime from accuracy state, not design-token-resolvable at build time
- `optionBtnClass(active)` as local function (mirrors Button's variant approach) — cleaner than inline ternary per button
- StatCard delegates container styling entirely to Card — no style duplication

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- VIS-02 is complete: all non-challenge pages (AppShell, WelcomePage, ProgressPage, ShortcutsPage) are Tailwind-styled with design tokens
- ChallengePage and DrillPage restyling (if planned) can proceed with the same token/component patterns
- StatCard is available for reuse in any future metrics/dashboard contexts

---
*Phase: 07-shell-welcome-page-restyling*
*Completed: 2026-02-23*

## Self-Check: PASSED

- FOUND: src/components/ui/StatCard.tsx
- FOUND: src/pages/ProgressPage.tsx
- FOUND: src/pages/ShortcutsPage.tsx
- FOUND: src/components/shortcuts/ShortcutSetup.tsx
- FOUND: .planning/phases/07-shell-welcome-page-restyling/07-03-SUMMARY.md
- FOUND commit: 1053f27
- FOUND commit: 3184c0b
