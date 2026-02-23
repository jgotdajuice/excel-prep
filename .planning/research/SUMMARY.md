# Project Research Summary

**Project:** excel-prep — Interactive Excel Finance Interview Prep App
**Domain:** Spreadsheet-based interactive learning platform (finance / investment banking)
**Researched:** 2026-02-22
**Confidence:** MEDIUM-HIGH (core stack HIGH; features and architecture MEDIUM; pitfalls MEDIUM)

## Executive Summary

This is a client-side SPA that teaches Excel skills for finance interviews through interactive formula challenges. The recommended build is React 19 + Vite 6 + TypeScript 5 with Handsontable (spreadsheet grid) and HyperFormula (formula engine) as the core technical bets. Everything runs in the browser with no backend required for MVP — progress persists to localStorage. The product sits in a clear market gap: no existing tool combines in-browser interactive practice, finance-specific scenario framing, and IB keyboard shortcut drills in a single focused tool.

The central technical challenge is formula validation. The correct approach is result-based grading — run the user's formula through HyperFormula and compare the computed output to the expected value, not the formula string. This must be built first, configured correctly (Excel-compatibility flags set from day one), and verified against known Excel outputs before any challenge content is written. Getting this wrong destroys user trust and is expensive to recover from.

The two biggest risks are technical misconfiguration (HyperFormula defaulting to non-Excel behavior for finance functions) and content scope creep (building shallow coverage of 30+ functions instead of deep coverage of the 10 that appear in 80% of finance interviews). Both risks must be addressed in Phase 1 before challenge content is built. The good news: this is a well-bounded problem with clearly defined technology choices, a clear MVP feature set, and established architecture patterns — the main execution risk is discipline, not discovery.

---

## Key Findings

### Recommended Stack

The stack is a pure frontend SPA with no server infrastructure for MVP. React 19 + Vite 6 + TypeScript 5 provides the application shell. Handsontable 16.2 with its HyperFormula 3.2 plugin integration handles the spreadsheet grid and formula evaluation. Zustand 5 manages global state (current challenge, drill progress, user scores). Tailwind CSS 4 handles styling. All progress persists to localStorage — no backend, no database, no auth.

**Core technologies:**
- **React 19 + Vite 6:** UI framework and build tool — fastest DX for a SPA; no SSR needed
- **TypeScript 5:** Type safety for formula validation logic and state shapes — catches errors that are painful to debug in this domain
- **Handsontable 16.2:** Spreadsheet grid with Excel-like keyboard UX — the only library with React wrapper, 400+ formula support via HyperFormula plugin, and non-commercial free license
- **HyperFormula 3.2:** Headless formula engine — evaluates user formula strings to computed values, 398 built-in functions covering every finance interview function (NPV, IRR, PMT, VLOOKUP, INDEX/MATCH, SUMIFS, XNPV)
- **Zustand 5:** Client state — minimal boilerplate, hook-based, no Redux ceremony
- **Tailwind CSS 4:** Styling — zero config, fastest builds, sufficient for a laptop-only SPA
- **localStorage:** Progress persistence — sufficient for single-user, single-device use case; no server needed

Key alternatives rejected: Luckysheet (abandoned), FortuneSheet (pre-stable API), Next.js (no SSR needed), Redux (overkill), IndexedDB (unnecessary complexity over localStorage).

### Expected Features

The product must nail a focused MVP before adding complexity. The feature dependency graph is clear: the formula input grid must exist before anything else — drills, feedback, scoring, weak area tracking all sit on top of it.

**Must have (v1 — table stakes):**
- Interactive formula input with Excel-compatible evaluation (type formula, get right/wrong + computed result)
- Finance-specific question bank: minimum 40 challenges across VLOOKUP, INDEX/MATCH, SUMIFS, nested IF, IFERROR, NPV, IRR, PMT (tier-1 functions only)
- Finance-scenario framing on every question (not generic employee/sales tables — actual DCF/LBO/P&L context)
- Immediate feedback: correct/incorrect + explanation of why the formula works
- Structured 3-tier learning path: Beginner / Intermediate / Advanced, walked in sequence
- Session progress counter (question N of M)
- Keyboard shortcut drill module: finance IB shortcuts, keypress recognition

**Should have (v1.x — after core loop validated):**
- Weak area surfacing — track first-attempt accuracy per function tag, surface weakest areas first
- Daily streak counter — local state, trivial complexity, meaningful for 1-2 week prep window
- "Why this formula wins" comparative explanations — editorial upgrade over basic correct/wrong
- Finance vocabulary sidebar — static content, no backend

**Defer (v2+):**
- Mini model challenge (5-step DCF / 3-statement build) — requires full multi-cell grid with cell-by-cell validation; HIGH complexity
- Full Excel simulator (formula bar, cell reference color highlighting) — large frontend investment
- Spaced repetition algorithm — overkill for the 1-2 week interview prep use case

**Anti-features — deliberately out of scope:** video lectures, social/leaderboard features, VBA content, mobile optimization, badge/achievement systems, AI-generated curriculum, PDF certificates.

**Competitive gap:** ExcelExercises.com is the closest technically but has zero finance content. BIWS/CFI have finance content but are video-heavy and cost $500+/year. This product's combination of in-browser interactive practice + finance scenarios + IB keyboard shortcuts at no cost is unoccupied.

### Architecture Approach

The architecture is a three-layer SPA: Presentation (React components), Logic/Engine (formula engine, challenge state machine, progress engine), and Data/Persistence (static JSON content, in-memory session state, localStorage). All layers are strictly separated — the formula engine and grader are pure TypeScript functions with no React dependency, making them independently testable and replaceable.

**Major components:**
1. **Formula Engine (HyperFormula singleton)** — evaluates user formula strings, returns computed values; must be reset between challenges to prevent cross-challenge data leakage
2. **Spreadsheet Grid (Handsontable + HyperFormula plugin)** — renders editable cells, handles keyboard navigation, displays formula results in real time
3. **Grader** — thin synchronous function that calls `hf.getCellValue()` after user submits, compares to `expectedOutput` with numeric tolerance; output-based not string-based
4. **Challenge Engine (useReducer state machine)** — manages lifecycle: idle → active → submitted → result → next; prevents invalid state transitions
5. **Content Library (static JSON files)** — challenges, drills, curriculum ordering; schema includes `id`, `targetFunction`, `seedData`, `prompt`, `hint`, `expectedOutput`, `answerCell`, `explanation`, `difficulty`
6. **Progress Engine + Progress Store** — pure functions computing mastery/weak areas from attempt records; persisted to localStorage with versioned schema
7. **Drill Mode** — lightweight component for rapid-fire question sets; does NOT use full Handsontable grid (overkill for recognition drills)

**Build order dictated by dependencies:** Content Library → Formula Engine → Spreadsheet Grid → Grader → Challenge Engine → Challenge Panel UI → Progress Engine + Store → Drill Mode → Curriculum/Learning Path. A single working challenge loop is the minimum viable core.

### Critical Pitfalls

1. **Formula string comparison for grading** — Using `===` on formula strings rejects semantically correct answers (`=VLOOKUP(A2,D:E,2,FALSE)` vs `=VLOOKUP(A2,$D:$E,2,0)`). Use HyperFormula result-value comparison from Phase 1. Never acceptable to ship string matching. Recovery is a full audit of all challenge content.

2. **HyperFormula misconfiguration** — Default HyperFormula config does NOT match Excel behavior (empty cells return `null` not `0`; leap year 1900 bug not replicated; date serials differ). Finance interview prep calibrated against wrong outputs is the worst possible outcome. Fix: initialize with `evaluateNullToZero: true` and `leapYear1900: true` on day one; verify against known Excel outputs for all 10 tier-1 functions before writing challenges.

3. **Keyboard navigation conflicts** — Browser defaults (Tab exits grid, Enter submits parent form, arrows scroll page) break the Excel-like UX. Handsontable handles most of this internally, but custom inputs adjacent to the grid break the focus trap. Test all keyboard paths before adding any surrounding UI.

4. **Content scope creep** — Building shallow coverage of 25+ functions instead of deep coverage of the 10 that matter. Prevention: freeze the tier-1 function list in Phase 1 (VLOOKUP, INDEX/MATCH, SUMIFS, IF/nested IF, IFERROR, NPV, IRR, PMT, OFFSET, XLOOKUP), build 5+ challenges per function, gate tier-2 behind 80% pass rate on tier-1.

5. **Progress tracking schema too flat** — Storing only a `Set` of completed challenge IDs makes it impossible to derive weak areas. Design the attempt record schema before writing the first challenge: `{ challengeId, functionTags, difficulty, attemptedAt, firstAttemptCorrect, attemptsBeforeCorrect }`. Version the schema (`v: 1`) for future migration.

---

## Implications for Roadmap

The dependency graph from ARCHITECTURE.md gives a clear build order. All three "critical" pitfalls must be prevented in Phase 1 before challenge content is written. The architecture separates cleanly into: foundation (engine + grid), core loop (single challenge end-to-end), content (question bank), and enhancements (progress tracking, drill mode, curriculum).

### Phase 1: Foundation — Formula Engine and Grid

**Rationale:** Everything else depends on this. Grading logic, keyboard UX, and HyperFormula configuration must be locked before content is written — fixing these after content exists is expensive (all expected values may need recalculation). This is the highest-risk phase technically.
**Delivers:** A working spreadsheet grid wired to HyperFormula; a grader that validates by result value not string; verified Excel-compatibility configuration; keyboard navigation test-passing; decision documented to disable paste-from-Excel in MVP.
**Addresses:** Formula input table stake; simulated Excel feel.
**Avoids:** Pitfalls 1 (string grading), 2 (HyperFormula misconfiguration), 3 (keyboard conflicts), 8 (paste-from-Excel half-support).
**Research flag:** Well-documented patterns (Handsontable + HyperFormula integration is official-docs-covered). Skip research-phase — go straight to implementation.

### Phase 2: Core Learning Loop — Single Challenge End-to-End

**Rationale:** Build the minimum viable loop before scaling content. Prove that: grid renders with seed data, user types a formula, grader grades it, explanation displays, progress records. This is the "spine" of the product.
**Delivers:** Challenge Engine state machine (idle → active → submitted → result → next); Challenge Panel UI; a single working challenge for each of the 3 difficulty tiers; progress schema defined and persisted; session progress counter.
**Addresses:** Immediate feedback table stake; explanation after each question; session progress counter.
**Avoids:** Pitfall 5 (flat progress schema — define schema here before content scales); Pitfall 7 (gamification rewarding speed — surface first-attempt accuracy, not completion count).
**Research flag:** State machine pattern is well-established (useReducer). Progress schema design is product-specific — validate the schema against the weak area surfacing feature requirement before finalizing.

### Phase 3: Content Build — Finance Question Bank

**Rationale:** With the core loop proven, build out the tier-1 content library. Content creation is the primary workload in this phase. All challenges must be verified in HyperFormula before adding to the bank.
**Delivers:** Minimum 40 challenges across 10 tier-1 functions (5+ per function); finance-scenario framing throughout; `curriculum.json` ordering beginner → intermediate → advanced; structured 3-tier learning path; function tags enabling weak area tracking.
**Addresses:** Finance-specific function coverage (table stake); difficulty tiers; structured learning path; finance-scenario framing differentiator.
**Avoids:** Pitfall 4 (scope creep — freeze tier-1 list before this phase starts); Pitfall 6 (HyperFormula IF cycle detection — manually verify each challenge formula).
**Research flag:** Content itself is domain knowledge, not engineering research. No research-phase needed. Validate function priority list against finance interview sources before writing challenges.

### Phase 4: Keyboard Shortcut Module

**Rationale:** This is an independent feature (no grid dependency) that targets a clear market gap. ExcelExercises has shortcuts but no finance context. Can be built in parallel with or after content build — depends on bandwidth.
**Delivers:** Dedicated keyboard shortcut drill section; keypress-capture mechanic for IB-specific shortcuts (Alt+=, Ctrl+Shift+L, F2, Ctrl+[, Ctrl+]); browser conflict handling (avoid Ctrl+W, Ctrl+T, Ctrl+N).
**Addresses:** Keyboard shortcut drills (P1 table stake).
**Avoids:** Pitfall 3 variant — browser shortcut conflicts require deliberate design; test shortcut capture in target browsers before building out the full module.
**Research flag:** Browser shortcut interception is a moderately complex area. May need a targeted research spike on which shortcuts are safely interceptable vs. which require app-to-run-fullscreen guidance.

### Phase 5: Progress Dashboard and Weak Area Surfacing

**Rationale:** Once content exists and attempts are being recorded, surface the data meaningfully. Weak area surfacing is a key differentiator (no competitor does this well) and is the v1.x feature users will notice most.
**Delivers:** Progress Dashboard UI (score ring, weak topic list, recommended next challenge); weak area computation (first-attempt accuracy rate per function tag, sorted); weighted drill queue surfacing weakest areas first; daily streak counter.
**Addresses:** Weak area surfacing (P2); daily streak (P2); progress dashboard.
**Avoids:** Pitfall 5 (must use the versioned schema from Phase 2 — no retrofit needed if schema was designed correctly).
**Research flag:** Standard patterns. localStorage + pure computation. No research-phase needed.

### Phase 6: Explanation Quality and Polish

**Rationale:** The differentiator in explanation quality ("why this formula wins" comparisons) is editorial work, not engineering. This phase upgrades explanation content and adds the finance vocabulary sidebar. No new tech, pure content quality investment.
**Delivers:** "Why this formula wins" comparative explanations for all tier-1 functions; finance vocabulary quick-reference sidebar (static); explanation shown for both correct and incorrect submissions (pitfall prevention).
**Addresses:** Comparative explanation differentiator (P2); finance vocabulary sidebar (P2).
**Research flag:** No research-phase needed. Pure editorial.

### Phase Ordering Rationale

- Phases 1-2 are non-negotiable prerequisites — everything else sits on this foundation.
- Phase 3 (content) must come after Phase 2 (loop proven) to avoid writing content calibrated against a broken grader.
- Phase 4 (keyboard module) is architecturally independent and can shift earlier if product priority demands it.
- Phase 5 (progress dashboard) requires accumulated attempt data — can only follow a phase where users are completing challenges.
- Phase 6 is pure content polish — no dependencies beyond the core loop existing.

### Research Flags

Phases needing deeper research during planning:
- **Phase 4 (keyboard shortcuts):** Browser shortcut interception is tricky. Before planning the keyboard module, spike on which IB shortcuts can be captured without browser conflicts and whether a "dedicated window" UX is needed.

Phases with standard patterns (skip research-phase):
- **Phase 1:** HyperFormula + Handsontable integration is official-docs-covered. Implement directly.
- **Phase 2:** Challenge state machine with useReducer is a standard React pattern.
- **Phase 3:** Content creation — domain knowledge, not engineering research.
- **Phase 5:** localStorage + pure computation — no new patterns needed.
- **Phase 6:** Editorial work — no engineering research needed.

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All core choices verified against official docs and version-specific release notes. HyperFormula 3.2 and Handsontable 16.2 compatibility confirmed. Tailwind 4 and React 19 stability confirmed. |
| Features | MEDIUM | Core feature landscape well-established; competitor analysis informed by search results (not all features directly verified). Anti-features are well-reasoned but based on product judgment, not user research. |
| Architecture | MEDIUM | Core patterns (HyperFormula singleton, output-based grading, state machine) verified via official docs. Grading and progress architecture inferred from analogous systems, not sourced from a reference implementation of this exact product type. |
| Pitfalls | MEDIUM | HyperFormula configuration pitfalls verified against official known-limitations docs (HIGH). Keyboard navigation, gamification, and UX pitfalls supported by multiple sources but some training-data informed. |

**Overall confidence:** MEDIUM-HIGH

### Gaps to Address

- **HyperFormula Excel compatibility for edge cases:** The smoke-test suite (NPV, IRR, PMT, VLOOKUP, nested IF) should be the first thing written in Phase 1. Do not assume compatibility — verify with actual Excel outputs before any challenge content is calibrated.
- **Browser shortcut interception scope:** Which IB keyboard shortcuts are safely capturable without conflicting with browser defaults is not fully resolved. Needs a focused spike in Phase 4 planning.
- **Content tier-1 function list validation:** The 10-function tier-1 list is informed by multiple finance interview prep sources but is not uniquely verified. Validate against a finance professional's input before content build starts in Phase 3.
- **Handsontable non-commercial license scope:** Confirmed free for non-commercial/personal use, but verify the license key string and terms before deployment if the product is ever shared publicly.

---

## Sources

### Primary (HIGH confidence)
- HyperFormula official docs — built-in functions, known limitations, Excel compatibility: https://hyperformula.handsontable.com/
- Handsontable React docs — formula-calculation integration, version compatibility: https://handsontable.com/docs/react-data-grid/formula-calculation/
- HyperFormula GitHub — v3.2.0, released 2026-02-19: https://github.com/handsontable/hyperformula
- Tailwind CSS v4.0 release blog — stable Jan 22 2025: https://tailwindcss.com/blog/tailwindcss-v4
- React v19 stable release blog — Dec 2024: https://react.dev/blog/2024/12/05/react-19
- Handsontable software license docs — non-commercial license free for personal/education use: https://handsontable.com/docs/javascript-data-grid/software-license/

### Secondary (MEDIUM confidence)
- ExcelExercises.com — observed feature set for competitive analysis
- Sheetzoom features page — competitor reference
- Fintest.io — Complete Guide to Excel Skills for Finance Interviews — function priority list
- Wall Street Prep / Wall Street Training — Excel shortcuts reference
- CFI / BIWS — curriculum and content approach reference
- NL2Formula paper (arXiv 2402.14853) — formula grading equivalence research
- Handsontable keyboard navigation forum — Tab key focus-trap behavior
- Duolingo research blog — streak and retention data
- Multiple sources on Zustand vs Redux, Vite vs Next.js 2025/2026

### Tertiary (LOW confidence)
- Jobaaj Learnings — Excel case study problems in IB interviews (single source, function priority list corroboration)
- General edtech research on gamification engagement vs. retention gap

---
*Research completed: 2026-02-22*
*Ready for roadmap: yes*
