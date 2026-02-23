# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-22)

**Core value:** A beginner can rapidly learn the Excel functions and patterns that finance interviews test, through active practice rather than passive reading.
**Current focus:** Phase 1 — Formula Engine (complete)

## Current Position

Phase: 1 of 5 (Formula Engine)
Plan: 2 of 2 in current phase
Status: Phase 1 complete
Last activity: 2026-02-23 — Plan 01-02 complete (grid UI: SpreadsheetGrid, FormulaBar, FunctionAutocomplete, AppShell, WelcomePage, routing)

Progress: [██░░░░░░░░] 20%

## Performance Metrics

**Velocity:**
- Total plans completed: 2
- Average duration: 5 min
- Total execution time: 0.17 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01-formula-engine | 2 | 10 min | 5 min |

**Recent Trend:**
- Last 5 plans: 6 min, 4 min
- Trend: Faster

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

### Pending Todos

None.

### Blockers/Concerns

- [Phase 1 RESOLVED]: HyperFormula Excel compatibility verified — all 12 GRID-02 functions pass smoke tests
- [Phase 1 RESOLVED]: Grid UI complete — Handsontable wired to HyperFormula, formula bar, autocomplete, routing all working
- [Phase 4]: Browser shortcut interception scope is not fully resolved — spike needed to confirm which IB shortcuts are safely capturable without browser conflicts
- [Phase 3]: Tier-1 function list should be validated against a finance professional's input before content build starts

## Session Continuity

Last session: 2026-02-22
Stopped at: Phase 2 context gathered
Resume file: .planning/phases/02-challenge-loop/02-CONTEXT.md
