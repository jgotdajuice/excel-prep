# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-22)

**Core value:** A beginner can rapidly learn the Excel functions and patterns that finance interviews test, through active practice rather than passive reading.
**Current focus:** Phase 2 complete — next up Phase 3 (Content Library)

## Current Position

Phase: 2 of 5 (Challenge Loop) — COMPLETE
Plan: 3 of 3 in current phase — all plans executed and verified
Status: Phase 2 complete — human verification passed
Last activity: 2026-02-23 — Plan 02-03 complete (human verification: 4 bugs found & fixed, all 5 success criteria pass)

Progress: [██████░░░░] 60%

## Performance Metrics

**Velocity:**
- Total plans completed: 5
- Average duration: 7 min
- Total execution time: 0.58 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01-formula-engine | 2 | 10 min | 5 min |
| 02-challenge-loop | 3 | 32 min | 10.7 min |

**Recent Trend:**
- Last 5 plans: 4 min, 3 min, 4 min, 25 min (human verify + bug fixes)
- Trend: Verification plan was longer due to 4 bug fixes

*Updated after each plan completion*

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- [Init]: Active recall over passive reading — challenge tasks + rapid-fire drills as primary learning method
- [Init]: Finance-specific content only — tier-1 function list: VLOOKUP, INDEX/MATCH, SUMIFS, IF/nested IF, IFERROR, NPV, IRR, PMT, OFFSET, XLOOKUP
- [Init]: No backend — localStorage for progress persistence; no auth needed
- [Init]: Stack — React 19 + Vite 6 + TypeScript 5 + Handsontable 16.2 + HyperFormula 3.2 + Zustand 5 + Tailwind CSS 4
- [01-01]: HyperFormula VLOOKUP requires numeric 0 not boolean FALSE literal for exact match parameter
- [01-01]: NPV(rate,future_cfs)+initial_outlay is the correct Excel pattern; result is engine-verified (-96.17 for test inputs)
- [01-01]: buildExcelCompatEngine() is the single source of truth for HyperFormula config — never call buildEmpty() directly
- [01-01]: XNPV returns 1092.62 for the test date serials — engine output is the reference, not plan estimates
- [01-02]: HotTableRef (not InstanceType<typeof HotTable>) is the correct useRef type — HotTable is ForwardRefExoticComponent not a class
- [01-02]: No afterEditorClose hook in Handsontable 16.x — use afterChange + afterDeselect for cleanup
- [01-02]: App name "ExcelPrep" chosen — consistent across WelcomePage and AppShell header
- [01-02]: Dark green #1a3a2a as primary accent color for Excel-inspired professional look
- [02-01]: DetailedCellError constructor takes CellError (not ErrorType directly) — new DetailedCellError(new CellError(ErrorType.VALUE), '#VALUE!')
- [02-01]: NPV seed challenge tolerance 0.5 to handle formula-path variation while catching wrong answers
- [02-01]: gradeCellAction replaces existing cell grade on re-grade — supports retry flow without stale grade accumulation
- [02-01]: Engine-verified seed challenge expected values: VLOOKUP=105000, NPV=5373.93, nested IF="Medium"
- [02-02]: cells callback return type is CellMeta (not CellProperties) — CellProperties has required runtime fields that HOT fills internally
- [02-02]: hfInstance exported from SpreadsheetGrid — ChallengePage reads computed cell values without duplicating engine construction
- [02-02]: challenge key prop on HotTable forces full remount on challenge switch — ensures HOT reinitializes with new seed data
- [02-02]: Custom renderer receives gradeStatus via CellMeta cast — HOT passes CellMeta to renderer's cellProperties argument
- [02-03]: Refs pattern breaks Handsontable re-render loop — isLockedRef, cellGradesRef, onGradeCellRef, answerCellSetRef keep cells callback stable
- [02-03]: Skip setSelectedCell in challenge mode — FormulaBar hidden, no selection state tracking needed
- [02-03]: .hot-container CSS height propagation needed — HotTable wrapper div doesn't inherit flex parent height without explicit rules
- [02-03]: answerCellSetRef updated every render — cellsCallbackRef reads from ref to avoid stale closure from first render

### Pending Todos

None.

### Blockers/Concerns

- [Phase 1 RESOLVED]: HyperFormula Excel compatibility verified — all 12 GRID-02 functions pass smoke tests
- [Phase 1 RESOLVED]: Grid UI complete — Handsontable wired to HyperFormula, formula bar, autocomplete, routing all working
- [Phase 2 RESOLVED]: Full challenge loop verified end-to-end — all 5 success criteria pass, 4 bugs fixed during verification
- [Phase 4]: Browser shortcut interception scope is not fully resolved — spike needed to confirm which IB shortcuts are safely capturable without browser conflicts
- [Phase 3]: Tier-1 function list should be validated against a finance professional's input before content build starts

## Session Continuity

Last session: 2026-02-23
Stopped at: Phase 2 complete — all plans executed and human-verified
Resume file: Phase 3 — run `/gsd:plan-phase 3` to begin Content Library
