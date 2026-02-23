# Phase 1: Formula Engine - Context

**Gathered:** 2026-02-22
**Status:** Ready for planning

<domain>
## Phase Boundary

Interactive spreadsheet grid wired to a verified, Excel-compatible formula engine. Users type formulas, see computed results. All 12 finance-relevant functions evaluate correctly. Grid keyboard navigation works without triggering browser defaults.

</domain>

<decisions>
## Implementation Decisions

### Grid Appearance
- Full spreadsheet feel — large grid filling most of the screen, like opening Excel
- Excel-like visual theme — white cells, gray headers, green/blue accents
- Row/column headers match Excel conventions (A, B, C... and 1, 2, 3...)
- Full gridlines and cell borders — looks like a real spreadsheet

### Cell Interaction
- Formula bar above the grid (like Excel's fx bar) showing the formula of the selected cell
- Function name autocomplete as user types (e.g., typing `=VL` suggests VLOOKUP)
- Enter key confirms formula and moves cursor down (matching Excel behavior)
- Cells display computed result by default; formula visible in formula bar when cell is selected

### Initial Screen
- Welcome/landing page with brief intro explaining the app, then user is directed to a dashboard
- Dashboard shows learning path, progress overview, and recommended elements
- Prominent "Start" button that changes to "Continue" once the user has begun learning
- App has a name/branding visible in a header
- Left sidebar with topic categories and progress indicators
- Quick 2-3 step onboarding tutorial for first-time users showing how to use the grid and submit answers

### Verification Display
- Formula result appears in the cell (like normal Excel) PLUS a status panel below/beside showing "Correct!" or "Expected: X, Got: Y"
- Answer cell is visually distinct from pre-populated data (highlighted border or background color)
- Formula errors show Excel-style error in the cell (#VALUE!, #REF!, #N/A) with a friendly plain-English explanation in a tooltip or panel
- Enter key auto-submits the answer — no separate Submit button needed

### Claude's Discretion
- Exact color palette and spacing within the Excel-like theme
- Loading skeleton and transition animations
- Sidebar width and collapsibility
- App name choice
- Onboarding tutorial exact steps and overlay design
- Dashboard layout and which metrics to show

</decisions>

<specifics>
## Specific Ideas

- Grid should feel like actually opening Excel — familiar to anyone who has used it
- The "Start" → "Continue" button transition signals returning users that their progress is saved
- Formula bar + autocomplete together lower the barrier for beginners while building real Excel muscle memory

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 01-formula-engine*
*Context gathered: 2026-02-22*
