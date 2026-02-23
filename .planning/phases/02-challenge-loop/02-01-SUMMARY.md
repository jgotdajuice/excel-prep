---
phase: 02-challenge-loop
plan: 01
subsystem: engine
tags: [hyperformula, zustand, typescript, vitest, finance, tdd]

# Dependency graph
requires:
  - phase: 01-formula-engine
    provides: buildExcelCompatEngine, HyperFormula integration, DetailedCellError, graded formula evaluation

provides:
  - AnswerCell, Challenge, ChallengeStatus, GradeResult TypeScript interfaces (src/types/index.ts)
  - gradeCell pure function with numeric tolerance and DetailedCellError handling (src/engine/grader.ts)
  - 8-test grader test suite covering all correctness cases (src/engine/grader.test.ts)
  - useChallengeStore Zustand store with full session state management (src/store/challengeStore.ts)
  - 3 engine-verified seed finance challenges: VLOOKUP, NPV, nested IF (src/data/challenges/index.ts)

affects: [02-02, 03-drill-mode, 04-progress]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - gradeCell pure function: all grading logic isolated, no side effects, easily testable
    - TDD red-green cycle: test written before implementation, verified failing before passing
    - Engine-verified expected values: all seed challenge answers computed via HyperFormula before authoring
    - Zustand 5 store: create() with inline implementation object, derived state computed inline in components

key-files:
  created:
    - src/engine/grader.ts
    - src/engine/grader.test.ts
    - src/store/challengeStore.ts
    - src/data/challenges/index.ts
  modified:
    - src/types/index.ts

key-decisions:
  - "DetailedCellError constructor takes CellError (not ErrorType) — must wrap: new DetailedCellError(new CellError(ErrorType.VALUE), '#VALUE!')"
  - "NPV seed challenge uses tolerance 0.5 to handle minor formula-path variation while still catching wrong answers"
  - "VLOOKUP seed challenge uses tolerance 0 (exact integer match) since salary is always an integer"
  - "gradeCellAction replaces existing grade for re-graded cells rather than appending — supports retry flow"

patterns-established:
  - "gradeCell: single responsibility, all grading logic flows through this one function — store actions call gradeCell, never grade inline"
  - "Engine-verified seed data: always compute expectedValue via buildExcelCompatEngine() before hardcoding — document the verified number in a comment"
  - "ChallengeStore setChallenge: resets all per-challenge UI state (grades, hint, explanation, lock, timer) atomically"

requirements-completed: [GRID-03, GRID-04, LEARN-01, LEARN-04]

# Metrics
duration: 3min
completed: 2026-02-23
---

# Phase 2 Plan 01: Challenge Data Layer and Grading Engine Summary

**Tested gradeCell pure function (numeric tolerance + DetailedCellError), Zustand challenge store with full session state, and 3 engine-verified finance seed challenges (VLOOKUP, NPV, nested IF)**

## Performance

- **Duration:** 3 min
- **Started:** 2026-02-23T07:02:43Z
- **Completed:** 2026-02-23T07:05:49Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments
- gradeCell handles three cases cleanly: correct (within tolerance), incorrect (returns gotValue + expectedValue), and error (extracts Excel error code from DetailedCellError)
- Zustand challengeStore manages complete challenge session: load, grade individual cells, lock grid when all cells graded, retry, skip, navigate prev/next, and tick timer
- Three finance seed challenges authored with realistic IB/finance scenario prompts, seed grid data, and expected values computed via HyperFormula engine at authoring time

## Task Commits

Each task was committed atomically:

1. **Task 1: Define challenge types and implement grader with tests** - `ea2811f` (feat)
2. **Task 2: Create Zustand challenge store and seed challenge data** - `41ee26a` (feat)

**Plan metadata:** [created below]

## Files Created/Modified
- `src/types/index.ts` - Extended with AnswerCell, Challenge, ChallengeStatus, GradeResult interfaces
- `src/engine/grader.ts` - gradeCell pure function: DetailedCellError detection, numeric tolerance, exact match
- `src/engine/grader.test.ts` - 8 unit tests covering all gradeCell cases (TDD red-green cycle)
- `src/store/challengeStore.ts` - useChallengeStore with load/grade/navigate/retry/skip/tick actions
- `src/data/challenges/index.ts` - 3 seed challenges: VLOOKUP salary lookup ($105k), NPV capex ($5,373.93), nested IF deal classifier ("Medium")

## Decisions Made
- `DetailedCellError` constructor takes `CellError` (not `ErrorType` directly) — the TypeScript type signature requires `new CellError(ErrorType.VALUE)` as the first argument. Tests and grader.ts both use this pattern.
- NPV seed challenge tolerance set to 0.5 to allow for minor formula-path variation while still catching clearly wrong answers (e.g., forgetting to add the initial outlay, which changes the result by ~50k).
- VLOOKUP seed challenge uses tolerance 0 (exact integer match) — salary is always an integer, no floating-point variation expected.
- `gradeCellAction` replaces the existing grade for a cell rather than appending, so retry/regrade flows work correctly without stale grades accumulating.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed DetailedCellError constructor type mismatch**
- **Found during:** Task 2 (npm run build)
- **Issue:** Plan specified `new DetailedCellError(ErrorType.VALUE, '#VALUE!')` but hyperformula's TypeScript signature requires `new DetailedCellError(CellError, string)` — `ErrorType` is not assignable to `CellError`
- **Fix:** Updated grader.test.ts to use `new DetailedCellError(new CellError(ErrorType.VALUE), '#VALUE!')` and imported `CellError` from hyperformula
- **Files modified:** src/engine/grader.test.ts
- **Verification:** `npm run build` passes, `npx vitest run` all 21 tests pass
- **Committed in:** 41ee26a (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (Rule 1 - Bug)
**Impact on plan:** Required fix for TypeScript build compatibility. Test behavior unchanged.

## Issues Encountered
- None beyond the DetailedCellError constructor fix documented above.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All data types, grading logic, and store actions are ready for Plan 02 to wire into UI components
- `useChallengeStore` provides all state and actions the challenge UI layer needs without any design decisions embedded in the data layer
- Seed challenges have realistic IB prompts, labeled grid headers, and verified answers — ready for end-to-end testing as soon as the UI renders them

---
*Phase: 02-challenge-loop*
*Completed: 2026-02-23*
