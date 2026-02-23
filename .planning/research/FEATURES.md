# Feature Research

**Domain:** Excel interview prep / finance interactive learning web app
**Researched:** 2026-02-22
**Confidence:** MEDIUM — core feature landscape well-established; specific implementation patterns informed by analogous platforms (ExcelExercises, Sheetzoom, CFI, Duolingo), verified by multiple sources.

---

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist. Missing these = product feels incomplete.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Interactive formula input with validation | Primary value prop — users type a formula and get right/wrong feedback | HIGH | Requires an in-browser spreadsheet grid or formula input field that evaluates Excel-compatible syntax. Handsontable and Jspreadsheet are the standard JS libraries for this. Without this, the product is just flashcards. |
| Immediate feedback on answer (right/wrong + explanation) | Every drill-based learning platform from Duolingo to Codewars does this — absence feels broken | LOW | Show the correct formula, explain why it works, and show what the output evaluates to. Explanation quality is what differentiates here, not the mechanic itself. |
| Finance-specific function coverage | The user's entire purpose — if VLOOKUP, INDEX/MATCH, SUMIFS, NPV, IRR, PMT aren't present, the product doesn't address the interview | MEDIUM | Must cover: VLOOKUP/HLOOKUP, INDEX/MATCH/XLOOKUP, SUMIFS/COUNTIFS/AVERAGEIFS, IF/nested IF/IFS, NPV, IRR, PMT, PV, basic financial ratio formulas, IFERROR/ISERROR |
| Difficulty tiers | Finance interview prep has a clear 3-tier structure (basic → intermediate → advanced) used by all competitors | LOW | Basic = SUM/IF/VLOOKUP; Intermediate = nested IF, SUMIFS, INDEX/MATCH; Advanced = NPV/IRR/PMT, multi-function combinations for modeling |
| Structured learning path | Users arriving as beginners need a curriculum, not a random question bank | MEDIUM | Must define start-to-interview-ready path. Competitors like CFI and BIWS all have sequenced curricula. No path = user doesn't know where to start. |
| Session progress within a drill set | Users expect to see "Question 3 of 10" or similar — absence creates anxiety and abandonment | LOW | Simple counter in UI. Trivial to implement. |
| Explanation after each question | Expected by anyone who's used Duolingo, Khan Academy, or any quiz platform | LOW | Minimum: show the correct formula and what output it produces. Better: explain the "why" (e.g., why INDEX/MATCH is better than VLOOKUP for this case). |
| Keyboard shortcut drills | Investment banks literally take mice away from analysts — shortcut speed is tested | MEDIUM | ExcelExercises.com already has a shortcut lesson module. Finance-specific shortcuts: Alt+=, Ctrl+Shift+L, F2, Ctrl+[, Ctrl+]. Flash-card style recognition drill is the minimum. |

---

### Differentiators (Competitive Advantage)

Features that set the product apart. Not required, but valued.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Finance-scenario framing for every question | Every competitor uses generic data (sales tables, employee lists). Finance-specific scenarios (DCF input cells, P&L model, three-statement linkage) build mental models that transfer to actual interviews | MEDIUM | E.g., "You're building an LBO model. Revenue is in B3, EBITDA margin in B4. Write a formula to calculate EBITDA." Context creates retention. No extra tech complexity — just content work. |
| Challenge mode: build a mini model (not just a single formula) | Single-formula drills are table stakes. Competitors stop there. An end-to-end "build this DCF from scratch" challenge tests integration — the actual skill interviewers probe | HIGH | Requires a multi-cell spreadsheet grid, a reference solution, and cell-by-cell or formula-by-formula validation. Significant complexity. Worth deferring to v1.x. |
| Weak area surfacing (automatic) | Progress tracking that identifies which functions the user keeps getting wrong and surfaces them first | MEDIUM | Simple version: count wrong answers per formula tag, sort by error rate, weight toward those in drill queue. Does not require full spaced repetition algorithm — weighted random is good enough for a 1-2 week prep window. |
| Session streak and daily goal | Duolingo data: 7-day streak users are 3.6x more likely to stay engaged. For a user with a 1-2 week interview deadline, a daily streak is directly motivational | LOW | Streak counter + "you've hit your goal today" state. LocalStorage is sufficient — no backend needed for MVP. |
| "Why this formula wins" explanations | Most explanations just show the correct answer. A comparison-style explanation ("VLOOKUP fails when columns are reordered; INDEX/MATCH doesn't — here's why that matters in a real model") is rare and high value | LOW | Pure content quality. Zero tech complexity over a basic explanation. The differentiator is editorial investment, not engineering. |
| IB keyboard shortcuts as a dedicated module | ExcelExercises has shortcuts but no finance context. WST publishes a shortcut cheat sheet. No one drills shortcuts specifically for IB workflows (e.g., Alt+A+T for AutoFilter, Ctrl+Shift+End for range selection) | MEDIUM | Requires a keypress-capture mechanism in browser. Feasibility note: browsers intercept some shortcuts (Ctrl+W closes tab). Must design around browser conflicts. |
| Finance vocabulary quick-reference sidebar | Users drilling NPV need to know what discount rate and terminal value mean — in-context definitions reduce tab-switching to Google | LOW | Static content panel. No backend. High value for beginners. |
| Simulated Excel feel (formula bar, cell reference highlighting) | ExcelExercises uses an actual in-browser Excel simulator. Muscle memory built in a visually different environment transfers poorly. Matching Excel's visual language (A1 notation, formula bar, colored cell references) improves transfer | HIGH | Significant frontend work. A full grid implementation (Handsontable, Jspreadsheet, or custom canvas) is the hardest single piece of the product. Worth investing in for core drills; can start minimal. |

---

### Anti-Features (Deliberately NOT Build)

| Anti-Feature | Why Requested | Why Avoid | Alternative |
|--------------|---------------|-----------|-------------|
| Video lecture content | "Explain the concept first, then drill" feels complete | Passive video is the least effective learning method for skill retention. Users in a 1-2 week crunch can't afford to watch 20-minute lectures. CFI's video-based courses are slower to internalize than active recall. | Brief text explanation + immediate practice. Reveal explanation after the question, not before. |
| Full LBO / DCF model builder at launch | Looks impressive; interviews test full models | A complete model builder requires weeks of engineering (formula dependency graph, step validation, branching instructions). It ships late and buggy. | Single-formula drills first. A 5-step mini model challenge (v1.x) is the right size — not a 50-cell LBO. |
| Social / leaderboard features | Gamification looks good on a pitch deck | A solo study tool for a specific interview in 1-2 weeks has zero network effect. Building leaderboards adds auth complexity, backend, and social dynamics without any value for the actual user. | Daily streak (local state) achieves the motivational goal without the social infrastructure. |
| VBA / macro content | "Complete Excel coverage" sounds thorough | Interviews don't test VBA for analyst roles. Including it dilutes the focused value prop and increases content scope massively. | Explicit out-of-scope callout so users know it was a deliberate choice, not an oversight. |
| Mobile optimization | Accessibility | Finance interviews are done on laptops. The embedded spreadsheet grid is inherently unusable on mobile. Building a mobile-responsive version costs engineering time with no payoff for this user. | Laptop-first. A "best viewed on desktop" notice is sufficient. |
| Gamification badges / achievements system | Fun, engaging | A full badge/achievement system requires a content taxonomy, backend state, badge design assets, and copy. It's 2+ weeks of scope for marginal retention benefit in a 1-2 week product window. | Streak counter + score per drill set captures 80% of the motivational value at 10% of the complexity. |
| AI-generated personalized curriculum | "Adaptive learning" sounds premium | Personalized curriculum generation requires enough user history to be meaningful. A beginner in week 1 doesn't have enough signal. The added complexity (LLM calls, state management, fallback logic) delays shipping core drills. | A fixed but sensibly ordered curriculum (Beginner → Intermediate → Advanced) plus weak-area queue surfacing is sufficient for the actual use case. |
| PDF certificate of completion | Looks professional | Zero value in finance interviews — no hiring manager cares. Adds backend complexity (PDF generation, user auth, email). | Skip entirely. |

---

## Feature Dependencies

```
[Interactive formula input grid]
    └──required by──> [Finance-specific formula drills]
                          └──required by──> [Difficulty tiers]
                          └──required by──> [Weak area surfacing]

[Answer feedback (right/wrong)]
    └──required by──> [Explanation after each question]
    └──required by──> [Session progress counter]

[Per-formula tagging]
    └──required by──> [Weak area surfacing]
    └──required by──> [Structured learning path]

[Session state (local)]
    └──required by──> [Session progress counter]
    └──required by──> [Streak counter]
    └──required by──> [Weak area surfacing]

[Multi-cell spreadsheet grid]
    └──required by──> [Challenge mode: mini model build]
    └──enhances──> [Finance-scenario framing]

[Keyboard shortcut drill module]
    ──independent of──> [Formula drills] (separate mechanic, can build in parallel)
```

### Dependency Notes

- **Formula input grid required before anything else:** The embedded spreadsheet or formula input is the technical foundation. Everything else — drills, feedback, scoring, weak areas — sits on top of it. Build this first or nothing else works.
- **Tagging (formula → category) unlocks weak area surfacing:** Each question must be tagged with the function(s) it tests (e.g., `SUMIFS`, `NPV`). Without this metadata, you can't track which areas the user struggles with. Tagging is a content/data decision, not a build, but it must happen before weak area tracking.
- **Session state is prerequisite for streak + weak areas:** Both features read from stored history. LocalStorage covers MVP; no backend needed.
- **Mini model challenge requires full grid, not just input field:** A single formula input field (text box) is sufficient for formula drills. A multi-step model challenge needs a real spreadsheet grid with multiple cells, formula dependency evaluation, and cell-by-cell validation. These are different build scopes.
- **Keyboard shortcut drills conflict with browser shortcuts:** Ctrl+W, Ctrl+T, Ctrl+N are claimed by browsers. Must design around these — either avoid them or open app in a dedicated window with custom shortcut capture logic.

---

## MVP Definition

### Launch With (v1)

Minimum viable product — what's needed to validate the core learning loop before adding complexity.

- [ ] Formula input field with Excel-compatible evaluation — type a formula, get evaluated output with right/wrong judgment
- [ ] Finance-specific question bank: VLOOKUP, INDEX/MATCH, SUMIFS, nested IF, IFERROR, NPV, IRR, PMT (minimum 40 questions across Beginner/Intermediate/Advanced)
- [ ] Finance-scenario framing on every question (not generic data tables)
- [ ] Immediate feedback: correct/incorrect + explanation of why the answer works
- [ ] Structured learning path: three tiers (Beginner / Intermediate / Advanced) the user walks through in order
- [ ] Session progress counter (question N of M)
- [ ] Keyboard shortcut drills as a dedicated section (keypress recognition, finance IB shortcuts)

### Add After Validation (v1.x)

Add once core loop is confirmed working and user has used the product for at least one practice session.

- [ ] Weak area surfacing — track wrong answers per formula tag, surface weakest areas first in drill queue
- [ ] Daily streak counter — local state, motivational, trivial to add
- [ ] "Why this formula wins" comparative explanations — editorial upgrade, no new tech
- [ ] Finance vocabulary sidebar — static content, no backend

### Future Consideration (v2+)

Defer until product-market fit is established or post-interview feedback validates demand.

- [ ] Challenge mode: end-to-end mini model build (5-step DCF or 3-statement linkage) — high complexity, high value, but requires full grid implementation
- [ ] Full simulated Excel grid with formula bar and cell reference highlighting — large frontend investment, high fidelity benefit
- [ ] Spaced repetition algorithm — overkill for 1-2 week prep window; useful if product evolves into longer-term learning tool

---

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Formula input + evaluation | HIGH | HIGH | P1 |
| Finance-specific question bank | HIGH | MEDIUM (content work) | P1 |
| Finance-scenario framing | HIGH | LOW (content framing) | P1 |
| Immediate feedback + explanation | HIGH | LOW | P1 |
| Structured learning path (3 tiers) | HIGH | LOW | P1 |
| Session progress counter | MEDIUM | LOW | P1 |
| Keyboard shortcut drills | HIGH | MEDIUM | P1 |
| Weak area surfacing | HIGH | MEDIUM | P2 |
| Daily streak counter | MEDIUM | LOW | P2 |
| Comparative "why it wins" explanations | HIGH | LOW | P2 |
| Finance vocabulary sidebar | MEDIUM | LOW | P2 |
| Mini model challenge (multi-step) | HIGH | HIGH | P3 |
| Full Excel grid simulator | MEDIUM | HIGH | P3 |
| Spaced repetition algorithm | LOW (for 2wk window) | HIGH | P3 |

**Priority key:**
- P1: Must have for launch
- P2: Should have, add when possible
- P3: Nice to have, future consideration

---

## Competitor Feature Analysis

| Feature | ExcelExercises.com | Sheetzoom | CFI / BIWS | Our Approach |
|---------|-------------------|-----------|------------|--------------|
| In-browser formula practice | Yes — Excel simulator | Yes — Excel add-in | No — download Excel files | Yes — embedded grid or input field |
| Finance-specific content | Generic Excel, no finance focus | Generic Excel | Finance-specific but video-heavy | Finance-specific throughout |
| Keyboard shortcut drills | Yes — dedicated module | Not documented | BIWS cheat sheets (PDF) | Yes — dedicated drill module |
| Progress tracking | Score + gamification (XP, levels) | "Intelligent feedback" — details unclear | Course completion % | Weak area tracking + streak |
| Spaced repetition | Not documented | Not documented | No | Lightweight weighted-random (v1.x) |
| Difficulty tiers | Yes — beginner to advanced | Yes — beginner to advanced | Yes — sequenced courses | Yes — 3 tiers |
| Finance scenario framing | No | No | Yes (BIWS) | Yes — every question |
| Explanation quality | Basic | "Intelligent feedback" | High (BIWS) | High — include "why this formula wins" comparisons |
| Model-building challenges | No | No | Yes — full model builds | v1.x mini model challenge |
| Price | Free with some paid | Freemium | $497/yr (BIWS), $99-499/yr (CFI) | Free (personal project) |

**Gap the product fills:** None of the existing tools combine (1) in-browser interactive practice, (2) finance-specific scenario framing, and (3) keyboard shortcut drills in a single focused tool aimed at interview prep. ExcelExercises is the closest technically but has no finance content. BIWS has finance content but is video-heavy and expensive.

---

## Sources

- [ExcelExercises.com — shortcut lessons and dashboard](https://excelexercises.com/shortcut-lessons.html) (MEDIUM confidence — observed features from search results and site structure)
- [Sheetzoom features page](https://www.sheetzoom.com/Features) (MEDIUM confidence — directly fetched)
- [CFI Excel for Finance courses](https://corporatefinanceinstitute.com/topic/excel/) (MEDIUM confidence — multiple corroborating sources)
- [Breaking Into Wall Street — Excel tutorials](https://breakingintowallstreet.com/kb/excel/) (MEDIUM confidence — search results)
- [Wall Street Prep — Excel shortcuts](https://www.wallstreetprep.com/knowledge/excel-shortcuts/) (MEDIUM confidence — search results)
- [Fintest.io — Complete Guide to Excel Skills for Finance Interviews](https://www.fintest.io/magazine/the-complete-guide-to-excel-skills-for-finance-interviews/) (MEDIUM confidence — directly fetched, detailed function list)
- [Duolingo — spaced repetition and streak research](https://blog.duolingo.com/spaced-repetition-for-learning/) (HIGH confidence — official Duolingo research blog)
- [Jobaaj Learnings — Excel case studies in IB interviews](https://www.jobaajlearnings.com/blog/common-excel-case-study-problems-in-ib-interviews) (LOW confidence — single source)
- [Wall Street Training — Advanced Excel Shortcuts PDF](https://www.wallst-training.com/resources/WST_Excel_Shortcuts.pdf) (MEDIUM confidence — industry training firm)

---

*Feature research for: Excel interview prep / finance interactive learning web app*
*Researched: 2026-02-22*
