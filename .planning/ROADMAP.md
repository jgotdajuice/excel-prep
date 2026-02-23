# Roadmap: Excel Interview Prep

## Overview

Build a client-side SPA that teaches Excel functions for finance interviews through active practice. The work flows from engine to experience to content to progress: first prove the formula evaluation is correct, then build the challenge loop that teaches through it, then fill the content library, then add the keyboard shortcut module, then surface what the user has learned and where they need work. Each phase delivers a coherent capability that the next phase builds on.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Formula Engine** - Interactive spreadsheet grid wired to a verified, Excel-compatible formula engine (completed 2026-02-23)
- [x] **Phase 2: Challenge Loop** - Single end-to-end challenge flow: grid renders, user enters formula, grader grades it, explanation appears (completed 2026-02-23)
- [ ] **Phase 3: Content Library** - Finance-framed question bank and structured beginner-to-interview-ready learning path
- [ ] **Phase 4: Keyboard Shortcuts** - Independent drill module for finance/IB keyboard shortcuts with keypress capture
- [ ] **Phase 5: Progress and Weak Areas** - Session persistence, per-function accuracy tracking, weighted drill queue, next-topic suggestions

## Phase Details

### Phase 1: Formula Engine
**Goal**: Users can type Excel formulas into a working spreadsheet grid and see computed results — with an engine verified to match Excel behavior for finance functions
**Depends on**: Nothing (first phase)
**Requirements**: GRID-01, GRID-02
**Success Criteria** (what must be TRUE):
  1. User can click a cell, type a formula (e.g., `=SUM(A1:A3)`), and see the computed result displayed in that cell
  2. All 12 finance-relevant functions (VLOOKUP, INDEX/MATCH, SUMIFS, IF/nested IF, NPV, IRR, PMT, XNPV, SUM, AVERAGE, COUNT, COUNTIF) evaluate correctly in the grid
  3. HyperFormula produces outputs matching known Excel values for NPV, IRR, PMT, VLOOKUP, and nested IF before any challenge content is written
  4. Grid keyboard navigation (Tab between cells, Enter to confirm, arrow keys) works without triggering browser defaults
**Plans:** 2/2 plans complete
Plans:
- [x] 01-01-PLAN.md — Project scaffold, HyperFormula engine factory, Excel-compat smoke tests (TDD)
- [x] 01-02-PLAN.md — Spreadsheet grid UI, formula bar, function autocomplete, app shell

### Phase 2: Challenge Loop
**Goal**: Users can complete a finance-scenario challenge from start to finish — the grid loads with seed data, they enter a formula, they get graded on the computed result, and they see an explanation of why the answer works
**Depends on**: Phase 1
**Requirements**: GRID-03, GRID-04, LEARN-01, LEARN-03, LEARN-04
**Success Criteria** (what must be TRUE):
  1. User is presented with a finance-scenario prompt (not a generic example) and a pre-populated grid with relevant seed data
  2. After submitting a formula, user sees whether their computed output matches the expected value — graded by result value, not formula string
  3. User sees distinct, clear feedback for "wrong value" versus "formula syntax error" (not a generic error message)
  4. After every submission (correct or incorrect), user sees an explanation of how the formula works and why it produces the expected result
  5. User can move to the next challenge after seeing their result
**Plans:** 3/3 plans complete
Plans:
- [x] 02-01-PLAN.md — Challenge types, grading engine (TDD), Zustand store, seed challenge data
- [x] 02-02-PLAN.md — SpreadsheetGrid challenge mode, ChallengePage, RightPanel, ChallengeList, CompletionScreen, routing
- [x] 02-03-PLAN.md — Human verification of end-to-end challenge flow (4 bugs found & fixed)

### Phase 3: Content Library
**Goal**: Users have a full set of finance interview formulas to practice — organized from beginner to interview-ready — plus a rapid-fire drill mode for recognition practice
**Depends on**: Phase 2
**Requirements**: LEARN-02, LEARN-05
**Success Criteria** (what must be TRUE):
  1. User can launch a rapid-fire drill session where a scenario is presented and they write (or select) the correct formula in quick succession without the full challenge grid flow
  2. User sees a structured learning path with at least three tiers (beginner, intermediate, advanced) and can follow it in sequence
  3. The content library covers at minimum the 10 tier-1 finance interview functions with at least 4 challenges per function, all using finance/IB/accounting scenario framing
  4. User cannot advance to intermediate tier challenges without demonstrating readiness on beginner-tier content
**Plans:** 1/4 plans executed
Plans:
- [ ] 03-01-PLAN.md — Type extensions (Tier, drill fields, DrillQuestion), 60+ challenge content across 3 tier files, engine verification tests
- [ ] 03-02-PLAN.md — TierTabs component, challengeStore tier state + gating logic, ChallengePage + ChallengeList tier integration
- [ ] 03-03-PLAN.md — drillStore state machine, DrillPage at /drill, drill components (question/feedback/review), sidebar nav links
- [ ] 03-04-PLAN.md — Human verification of tiered challenges, gating, and drill mode

### Phase 4: Keyboard Shortcuts
**Goal**: Users can drill the finance/IB keyboard shortcuts that interviewers expect through an interactive keypress-recognition module
**Depends on**: Phase 1 (project structure; otherwise architecturally independent)
**Requirements**: KEYS-01, KEYS-02
**Success Criteria** (what must be TRUE):
  1. User can enter a dedicated keyboard shortcut drill mode separate from the formula challenge flow
  2. User is shown a shortcut action and must press the correct key combination — the app detects the actual keypress
  3. Shortcut drills cover finance-workflow-relevant shortcuts (formula entry, navigation, selection, formatting) drawn from IB Excel practice
  4. Browser-conflicting shortcuts (Ctrl+W, Ctrl+T, Ctrl+N) are either avoided or handled gracefully with clear guidance to the user
**Plans:** 1/2 plans executed
Plans:
- [ ] 04-01-PLAN.md — Shortcut types, IB shortcut dataset (~30 shortcuts), drill session Zustand store
- [ ] 04-02-PLAN.md — Drill UI components (setup, drill, feedback, summary), /shortcuts route, sidebar NavLink upgrade

### Phase 5: Progress and Weak Areas
**Goal**: Users can see what they know, what they are weak at, and what to practice next — with progress persisting across browser sessions
**Depends on**: Phase 3 (requires accumulated attempt data from completed challenges and drills)
**Requirements**: PROG-01, PROG-02, PROG-03, LEARN-06
**Success Criteria** (what must be TRUE):
  1. User's completed challenges and scores are preserved when they close the browser and return in a new session
  2. User can view a progress dashboard showing their accuracy rate broken down by function/concept (e.g., "VLOOKUP: 60%, nested IF: 40%")
  3. User receives a specific suggested next topic based on their weakest areas, not a generic recommendation
  4. In drill mode, formulas the user has frequently missed appear more often than formulas they have answered correctly (weighted-random queue)
**Plans**: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Formula Engine | 2/2 | Complete    | 2026-02-23 |
| 2. Challenge Loop | 3/3 | Complete | 2026-02-23 |
| 3. Content Library | 1/4 | In Progress|  |
| 4. Keyboard Shortcuts | 1/2 | In Progress|  |
| 5. Progress and Weak Areas | 0/TBD | Not started | - |
