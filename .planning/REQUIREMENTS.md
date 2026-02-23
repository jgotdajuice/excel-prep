# Requirements: Excel Interview Prep

**Defined:** 2026-02-22
**Core Value:** A beginner can rapidly learn the Excel functions and patterns that finance interviews test, through active practice rather than passive reading.

## v1 Requirements

### Spreadsheet Engine

- [ ] **GRID-01**: User can type Excel formulas into an interactive spreadsheet grid and see computed results
- [x] **GRID-02**: Grid supports finance-relevant functions: VLOOKUP, INDEX/MATCH, SUMIFS, IF/nested IF, NPV, IRR, PMT, XNPV, SUM, AVERAGE, COUNT, COUNTIF
- [ ] **GRID-03**: User's formula is graded by comparing computed output value against expected result (not string matching)
- [ ] **GRID-04**: User sees clear error feedback distinguishing "wrong value" from "formula syntax error"

### Learning System

- [ ] **LEARN-01**: User can complete challenge-based tasks with finance-scenario prompts (e.g., "Calculate the IRR of this investment...")
- [ ] **LEARN-02**: User can do rapid-fire formula drills (scenario presented → user writes the correct formula)
- [ ] **LEARN-03**: User sees an explanation after each question showing why the answer works and how the formula operates
- [ ] **LEARN-04**: All challenges use finance/IB/accounting scenario framing rather than generic examples
- [ ] **LEARN-05**: User can follow a structured learning path from beginner to interview-ready
- [ ] **LEARN-06**: Drill queue surfaces frequently-missed formulas more often (weighted-random)

### Progress Tracking

- [ ] **PROG-01**: User's completed challenges and scores persist across browser sessions
- [ ] **PROG-02**: User can see weak areas tagged by function/concept with accuracy rates per topic
- [ ] **PROG-03**: User receives suggested next topics based on their performance and gaps

### Keyboard Shortcuts

- [ ] **KEYS-01**: User can practice Excel keyboard shortcuts through interactive drills
- [ ] **KEYS-02**: Shortcut drills cover finance-workflow-relevant shortcuts (navigation, formatting, formula entry)

## v2 Requirements

### Learning Enhancements

- **LEARN-V2-01**: Full mini-model builders (build a complete DCF or LBO step by step)
- **LEARN-V2-02**: Timed challenge mode simulating interview pressure
- **LEARN-V2-03**: Formula equivalence grading (accept multiple valid formula approaches)

### Content

- **CONT-V2-01**: Advanced function coverage (XIRR, OFFSET, INDIRECT, array formulas)
- **CONT-V2-02**: Industry-specific question banks (PE, hedge fund, corporate finance)

## Out of Scope

| Feature | Reason |
|---------|--------|
| Video lectures | Passive learning; slower than active practice for interview prep |
| Mobile optimization | Spreadsheet grids don't work on mobile; user confirmed laptop only |
| VBA/macros | Finance interviews focus on formulas and functions |
| Social/leaderboard | Solo study tool; zero network effect benefit |
| Full LBO/DCF model builder | Weeks of engineering; defer to v2 as mini-model builders |
| Backend/database | localStorage sufficient for single-user progress tracking |
| OAuth/accounts | Solo user on one machine; no auth needed |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| GRID-01 | Phase 1 | Pending |
| GRID-02 | Phase 1 | Complete (01-01) |
| GRID-03 | Phase 2 | Pending |
| GRID-04 | Phase 2 | Pending |
| LEARN-01 | Phase 2 | Pending |
| LEARN-02 | Phase 3 | Pending |
| LEARN-03 | Phase 2 | Pending |
| LEARN-04 | Phase 2 | Pending |
| LEARN-05 | Phase 3 | Pending |
| LEARN-06 | Phase 5 | Pending |
| PROG-01 | Phase 5 | Pending |
| PROG-02 | Phase 5 | Pending |
| PROG-03 | Phase 5 | Pending |
| KEYS-01 | Phase 4 | Pending |
| KEYS-02 | Phase 4 | Pending |

**Coverage:**
- v1 requirements: 15 total
- Mapped to phases: 15
- Unmapped: 0 ✓

---
*Requirements defined: 2026-02-22*
*Last updated: 2026-02-22 after roadmap creation — all requirements mapped*
