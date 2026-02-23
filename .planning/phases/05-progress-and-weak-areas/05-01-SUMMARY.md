---
phase: 05-progress-and-weak-areas
plan: 01
subsystem: store
tags: [zustand, persist, localStorage, progressSelectors, accuracy]

# Dependency graph
requires:
  - phase: 03-content-library
    provides: Challenge data with category/tier fields that selectors compute over
  - phase: 02-challenge-loop
    provides: challengeStore and drillStore with statuses/allAnswers state shape
provides:
  - Zustand persist middleware wiring both stores to localStorage
  - safeLocalStorage wrapper for private-browsing safety
  - computeCategoryAccuracies selector (per-function grid+drill accuracy)
  - weakestCategory selector (lowest-accuracy function with minAttempts filter)
  - overallStats selector (totalChallengesCompleted, totalDrillAnswered, overallAccuracy, hintUsageCount)
affects:
  - 05-02-progress-dashboard (reads from these selectors)
  - 05-03-weighted-drill-queue (uses computeCategoryAccuracies for weighting)

# Tech tracking
tech-stack:
  added: [zustand/middleware persist, zustand/middleware createJSONStorage]
  patterns:
    - Zustand persist with partialize to selectively persist durable state only
    - Record<challengeId, ChallengeStatus> as stable persisted schema (vs fragile array index)
    - _hydratedStatusRecord internal field pattern for deferred array rebuild at loadChallenges time
    - Pure selector functions in dedicated file for derived metrics

key-files:
  created:
    - src/store/safeStorage.ts
    - src/store/progressSelectors.ts
  modified:
    - src/store/challengeStore.ts
    - src/store/drillStore.ts

key-decisions:
  - "Persist challengeStatuses as Record<string, ChallengeStatus> keyed by challengeId — stable across challenge reordering (vs fragile array index)"
  - "Use _hydratedStatusRecord internal state field to bridge persist merge and loadChallenges — challenges[] not available at hydration time, so merge stores the Record and loadChallenges rebuilds the array after challenges load"
  - "Partialize excludes all session state: timer, currentIndex, isLocked, hintVisible, phase, questions, answers — only durable history persists"
  - "hintUsageCount is a global counter incremented in showHint() — not per-challenge, per plan spec"
  - "computeCategoryAccuracies uses simple unweighted accuracy for display (gridCorrect+drillCorrect)/(gridTotal+drillTotal) — separate from the weighted tier-gating logic in computeTierUnlocked"
  - "Skipped challenges excluded from gridTotal in accuracy calculation — only correct/incorrect count as attempts (Pitfall 5 from RESEARCH.md)"

patterns-established:
  - "Pure selectors pattern: progressSelectors.ts holds all derived metrics as pure functions — never store derived values in Zustand"
  - "safeLocalStorage wrapper: all localStorage access goes through try-catch wrapper, imported by stores"

requirements-completed: [PROG-01, PROG-02]

# Metrics
duration: 4min
completed: 2026-02-23
---

# Phase 05 Plan 01: Persistence and Progress Selectors Summary

**Zustand persist middleware added to both stores with challengeId-keyed Record schema; pure progressSelectors module exports computeCategoryAccuracies, weakestCategory, and overallStats**

## Performance

- **Duration:** ~4 min
- **Started:** 2026-02-23T09:13:26Z
- **Completed:** 2026-02-23T09:16:49Z
- **Tasks:** 2
- **Files modified:** 4 (2 created, 2 modified)

## Accomplishments
- Both Zustand stores wire to localStorage via persist middleware with partialize — only durable history survives page reload
- Challenge statuses persisted as `Record<string, ChallengeStatus>` keyed by challengeId for stability across data file reordering
- safeStorage.ts ensures private browsing mode works without errors
- progressSelectors.ts provides three pure selector functions that power the Phase 05 Plan 02 dashboard and Plan 03 weighted drill queue
- All 121 existing tests pass unchanged after middleware addition

## Task Commits

Each task was committed atomically:

1. **Task 1: Add persist middleware to challengeStore and drillStore** - `a115a29` (feat)
2. **Task 2: Create progress selector functions** - `5734813` (feat)

## Files Created/Modified
- `src/store/safeStorage.ts` - Try-catch localStorage wrapper; silently no-ops in private browsing
- `src/store/challengeStore.ts` - Added persist middleware: statuses as Record, hintUsageCount tracking, _hydratedStatusRecord pattern, loadChallenges restores from hydrated data
- `src/store/drillStore.ts` - Added persist middleware: only allAnswers persisted, all session state excluded
- `src/store/progressSelectors.ts` - computeCategoryAccuracies, weakestCategory, overallStats pure functions with CategoryAccuracy and OverallStats interfaces

## Decisions Made
- `_hydratedStatusRecord` as an internal state field solves the timing problem: at persist merge time, `challenges[]` is empty (not yet loaded from static data), so the Record is stored in state and `loadChallenges` rebuilds the array after challenges are available
- Simple unweighted accuracy for display (`(gridCorrect + drillCorrect) / totalAttempts`) distinct from the 100%/50% weighted scoring used for tier gating in `computeTierUnlocked` — display accuracy should be intuitive to users
- Skipped challenges excluded from `gridTotal` per RESEARCH.md Pitfall 5 — a skipped challenge is not a wrong answer

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Both stores now persist durable data to localStorage and restore on page reload
- progressSelectors.ts is ready for ProgressPage (Plan 02) to import and render
- computeCategoryAccuracies output is ready for drill queue weighting (Plan 03)
- TypeScript compiles clean; all 121 tests pass

## Self-Check: PASSED

- FOUND: src/store/safeStorage.ts
- FOUND: src/store/challengeStore.ts
- FOUND: src/store/drillStore.ts
- FOUND: src/store/progressSelectors.ts
- FOUND: .planning/phases/05-progress-and-weak-areas/05-01-SUMMARY.md
- FOUND commit: a115a29 (Task 1)
- FOUND commit: 5734813 (Task 2)

---
*Phase: 05-progress-and-weak-areas*
*Completed: 2026-02-23*
