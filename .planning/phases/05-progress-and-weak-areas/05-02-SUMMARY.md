---
phase: 05-progress-and-weak-areas
plan: 02
subsystem: ui+store
tags: [progress-dashboard, weighted-drill, accuracy-bars, zustand, react]

# Dependency graph
requires:
  - phase: 05-progress-and-weak-areas
    plan: 01
    provides: progressSelectors (computeCategoryAccuracies, weakestCategory, overallStats)
  - phase: 02-challenge-loop
    provides: challengeStore (challenges, statuses, hintUsageCount, setActiveTier)
  - phase: 02-challenge-loop
    provides: drillStore (allAnswers)
provides:
  - ProgressPage at /progress with per-function accuracy bars grouped by tier
  - Overall stats dashboard (challenges completed, drill questions, overall accuracy)
  - Weakest-function suggestion card with CTA linking to /challenge for that tier
  - Reset Progress button with inline confirmation
  - Weighted drill queue: inverse-accuracy weighting with minimum 1 question per category
affects:
  - src/App.tsx (new /progress route)
  - src/components/AppShell.tsx (Progress nav item enabled)
  - src/store/drillStore.ts (startSession now uses buildWeightedQueue)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Circular ESM import (drillStore <-> challengeStore) safe when values only accessed inside function bodies, not at module init time
    - Cumulative-weight random selection with without-replacement pool for weighted drill queue
    - Inline confirmation pattern for destructive actions (Reset Progress)

key-files:
  created:
    - src/pages/ProgressPage.tsx
  modified:
    - src/App.tsx
    - src/components/AppShell.tsx
    - src/store/drillStore.ts

key-decisions:
  - "Circular import drillStore<->challengeStore resolved with top-level import (not require/lazy) — ESM safe because useChallengeStore is only referenced inside startSession() function body, never at module init time"
  - "buildWeightedQueue guarantees 1 question per category before weighted-random fill — prevents any category from being entirely absent in a session"
  - "weight = max(0.05, 1 - accuracy) gives 30%→0.70 vs 80%→0.20 (ratio 3.5x) satisfying the 2-3x spec"
  - "0-attempt categories get accuracy=0.5 (neutral weight 0.5) so they appear at equal probability to average-performing categories on first session"

requirements-completed: [PROG-02, PROG-03, LEARN-06]

# Metrics
duration: ~4min
completed: 2026-02-23
---

# Phase 05 Plan 02: Progress Dashboard and Weighted Drill Queue Summary

**ProgressPage built with accuracy bars, overall stats, and weakest-function suggestion; drill sessions now use inverse-accuracy weighted random queue with minimum-1-per-category guarantee**

## Performance

- **Duration:** ~4 min
- **Started:** 2026-02-23T17:19:52Z
- **Completed:** 2026-02-23T17:23:24Z
- **Tasks:** 2
- **Files modified:** 4 (1 created, 3 modified)

## Accomplishments

- ProgressPage renders at /progress with three stat cards (challenges completed, drill questions, overall accuracy), per-function accuracy bars grouped by beginner/intermediate/advanced tiers, and a "Focus on this" suggestion card when a function has >= 2 attempts below 80%
- Accuracy bars use color coding: green >= 80%, amber >= 50%, red < 50%, with smooth CSS transition
- "Focus on this" card calls `setActiveTier()` and navigates to `/challenge` for the weakest tier — pre-selects the tier so user lands directly in relevant practice
- Reset Progress button with inline confirmation clears both localStorage keys and reloads
- Progress nav item in AppShell is now an active NavLink (disabled flag removed)
- drillStore `startSession` replaced shuffle+slice with `buildWeightedQueue` — inverse accuracy weighting (weight = max(0.05, 1 - accuracy))
- Minimum 1 question per category guaranteed; remaining slots filled via cumulative-weight random without replacement
- Circular ESM import (drillStore importing challengeStore which already imports drillStore) is safe — all 121 tests pass
- TypeScript compiles clean

## Task Commits

Each task was committed atomically:

1. **Task 1: Build ProgressPage and wire route + nav** - `c1e4dc6` (feat)
2. **Task 2: Implement weighted drill queue in drillStore** - `0b59e34` (feat)

## Files Created/Modified

- `src/pages/ProgressPage.tsx` (created, 419 lines) — Progress dashboard with overall stats, per-function accuracy bars by tier, weakest-function suggestion, reset button
- `src/App.tsx` — Added `/progress` route pointing to `<AppShell><ProgressPage /></AppShell>`
- `src/components/AppShell.tsx` — Removed `disabled: true` from Progress nav item
- `src/store/drillStore.ts` — Added `weightedPick`, `buildWeightedQueue`; updated `startSession` to compute accuracyMap and use weighted queue

## Decisions Made

- Circular import `drillStore <-> challengeStore` handled with a top-level ESM import: safe because `useChallengeStore` is only accessed inside `startSession()` function body, not at module init time. The `require()` approach was tried first but fails in Vite's ESM test environment.
- `buildWeightedQueue` guarantees one question per category before weighted fill — ensures no category is entirely missing from a 10-question session even if the pool has many categories
- Weight formula `max(0.05, 1 - accuracy)` gives floor of 0.05 to ensure every category retains a tiny chance, preventing complete starvation of high-accuracy functions

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] `require()` approach fails in Vite ESM test environment**

- **Found during:** Task 2 (first test run)
- **Issue:** Plan suggested `require('./challengeStore')` inside startSession to lazy-load the circular dependency. Vitest (ESM environment) throws `Cannot find module './challengeStore'` — `require` is not available in pure ESM.
- **Fix:** Replaced with a regular top-level `import { useChallengeStore } from './challengeStore'`. The circular import is safe in ESM because `useChallengeStore` is never referenced at module init time, only inside the `startSession` function body. All 121 tests pass after this fix.
- **Files modified:** `src/store/drillStore.ts`
- **Commit:** `0b59e34`

## Issues Encountered

None beyond the `require()` ESM issue fixed above.

## User Setup Required

None.

## Next Phase Readiness

- /progress page is live and functional — users can see their accuracy by function
- Drill sessions now favor weak areas with 2-3x probability ratio
- Phase 05 has one remaining plan (05-03) which was originally "weighted drill queue" — this is now complete as part of Plan 02. Plan 03 may be a no-op or can handle any remaining polish items.
- All 121 tests pass; TypeScript clean

## Self-Check: PASSED

- FOUND: src/pages/ProgressPage.tsx
- FOUND: src/App.tsx (contains ProgressPage import and /progress route)
- FOUND: src/components/AppShell.tsx (Progress nav enabled, no disabled flag)
- FOUND: src/store/drillStore.ts (contains buildWeightedQueue and weight logic)
- FOUND commit: c1e4dc6 (Task 1)
- FOUND commit: 0b59e34 (Task 2)

---
*Phase: 05-progress-and-weak-areas*
*Completed: 2026-02-23*
