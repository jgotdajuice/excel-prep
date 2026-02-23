# Architecture Research

**Domain:** Interactive spreadsheet-based learning platform (Excel interview prep)
**Researched:** 2026-02-22
**Confidence:** MEDIUM — Core patterns verified via official docs; grading validation approach inferred from analogous systems

## Standard Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                        PRESENTATION LAYER                            │
├──────────────────┬──────────────────┬──────────────────────────────┤
│  Spreadsheet UI  │  Challenge Panel  │  Progress / Session UI        │
│  (Grid + Input)  │  (Prompt, Hint,   │  (Score, Streak, Next Topic)  │
│                  │   Submit, Result) │                               │
└────────┬─────────┴────────┬─────────┴──────────────┬───────────────┘
         │                  │                          │
┌────────▼──────────────────▼──────────────────────────▼───────────────┐
│                        LOGIC / ENGINE LAYER                           │
├──────────────────┬──────────────────┬──────────────────────────────┤
│  Formula Engine  │  Challenge Engine │  Progress Engine              │
│  (HyperFormula)  │  (State Machine)  │  (Score, Mastery, Weak Areas) │
└────────┬─────────┴────────┬─────────┴──────────────┬───────────────┘
         │                  │                          │
┌────────▼──────────────────▼──────────────────────────▼───────────────┐
│                        DATA / PERSISTENCE LAYER                       │
├──────────────────┬──────────────────┬──────────────────────────────┤
│  Content Library │  Session State   │  Progress Store               │
│  (static JSON)   │  (in-memory/React│  (localStorage)              │
│                  │   state)         │                               │
└──────────────────┴──────────────────┴──────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| Spreadsheet Grid | Renders editable cells, captures user keystrokes, displays formula results in real time | Handsontable (React wrapper) with HyperFormula plugin enabled |
| Formula Engine | Parses Excel-style formulas, builds dependency graph, evaluates cells, exposes getCellValue() API | HyperFormula (headless, decoupled from UI) |
| Challenge Panel | Shows prompt, hint, submit button, and post-submission explanation | React component, reads from Challenge Engine state |
| Challenge Engine | State machine managing question lifecycle: idle → active → submitted → graded → next | Custom React state / useReducer |
| Grader | Compares user formula output to expected output; checks numeric equality or formula-string match | Thin service function called on submit |
| Content Library | Stores all challenges and drills as structured data (question, seed data, expected output, explanation) | Static JSON files bundled at build time |
| Progress Engine | Tracks attempts, scores, mastery per function/topic, surfaces weak areas | Pure functions operating on Progress Store |
| Progress Store | Persists progress across sessions | localStorage (no backend needed for MVP) |
| Session State | Holds current challenge, user answers, UI state during one session | React component state or Context |

---

## Recommended Project Structure

```
src/
├── components/
│   ├── SpreadsheetGrid.tsx     # Handsontable wrapper, formula engine init
│   ├── ChallengePanel.tsx      # Prompt, hint, submit, explanation
│   ├── ProgressDashboard.tsx   # Score, weak areas, session summary
│   └── DrillMode.tsx           # Rapid-fire multiple-choice / short-answer variant
├── engine/
│   ├── formulaEngine.ts        # HyperFormula singleton factory and helpers
│   ├── grader.ts               # Answer validation logic
│   └── challengeEngine.ts      # State machine for question lifecycle
├── progress/
│   ├── progressEngine.ts       # Score computation, mastery, weak-area detection
│   └── progressStore.ts        # localStorage read/write helpers
├── content/
│   ├── challenges/             # One JSON file per topic or per function
│   │   ├── vlookup.json
│   │   ├── index-match.json
│   │   ├── sumifs.json
│   │   ├── npv-irr.json
│   │   └── ...
│   ├── drills/                 # Rapid-fire question sets
│   │   └── formula-recognition.json
│   └── curriculum.json         # Ordered learning path (topic → challenge IDs)
├── types/
│   └── index.ts                # Shared TypeScript interfaces
└── App.tsx                     # Route: /drill, /challenge/:id, /progress
```

### Structure Rationale

- **engine/:** Separating formula evaluation, grading, and challenge state from React keeps logic testable and replaceable without touching UI.
- **content/:** Static JSON avoids a database for MVP. Adding a backend later is a drop-in replacement — just change the fetch call.
- **progress/:** Isolated module makes it easy to swap localStorage for a server later when cross-session persistence across devices is needed.

---

## Architectural Patterns

### Pattern 1: Headless Formula Engine + Thin UI Wrapper

**What:** HyperFormula is initialized as a singleton instance separate from the grid component. The grid (Handsontable) is given the HyperFormula instance via its `formulas` plugin config. The Grader calls `getCellValue()` directly on the same HyperFormula instance to read results — no DOM scraping.

**When to use:** Always. This is the standard HyperFormula integration pattern per official docs.

**Trade-offs:** Handsontable's `formulas` plugin uses HyperFormula internally, so both share the same engine instance. Be careful when multiple grids try to share one engine — keep one HyperFormula instance per challenge context.

**Example:**
```typescript
// engine/formulaEngine.ts
import HyperFormula from 'hyperformula';

let hfInstance: HyperFormula | null = null;

export function getFormulaEngine(): HyperFormula {
  if (!hfInstance) {
    hfInstance = HyperFormula.buildEmpty({ licenseKey: 'gpl-v3' });
  }
  return hfInstance;
}

export function resetFormulaEngine(): void {
  hfInstance = null;
}
```

```tsx
// components/SpreadsheetGrid.tsx
import { HotTable } from '@handsontable/react';
import { getFormulaEngine } from '../engine/formulaEngine';

<HotTable
  formulas={{ engine: getFormulaEngine(), sheetName: 'Sheet1' }}
  data={challengeSeedData}
  ...
/>
```

---

### Pattern 2: Output-Based Grading (Not Formula-String Matching)

**What:** Do not compare the user's formula string to the expected formula string. Instead, run the user's formula through HyperFormula and compare the computed output value to the expected output value.

**When to use:** Always for numeric/financial results. Formula-string matching fails on equivalent alternatives (e.g., `=A1+A2` vs `=SUM(A1:A2)` — both correct, both should pass).

**Trade-offs:** Output comparison is permissive (any correct formula passes) but does not teach canonical function usage. Supplement with explanations showing the preferred formula, not grading on it.

**Example:**
```typescript
// engine/grader.ts
export function grade(
  hf: HyperFormula,
  sheetId: number,
  userCellAddress: { row: number; col: number },
  expectedValue: number | string,
  tolerance = 0.001
): boolean {
  const actual = hf.getCellValue({ sheet: sheetId, row: userCellAddress.row, col: userCellAddress.col });
  if (typeof expectedValue === 'number' && typeof actual === 'number') {
    return Math.abs(actual - expectedValue) <= tolerance;
  }
  return actual === expectedValue;
}
```

---

### Pattern 3: Challenge State Machine

**What:** The challenge lifecycle is a finite state machine: `idle → active → submitted → result → (next | retry)`. Each state determines what UI is shown and what actions are allowed. Using `useReducer` in React is the idiomatic way to implement this.

**When to use:** Any time a UI flow has discrete stages where only certain actions are valid. Prevents "user submits while already submitted" bugs.

**Trade-offs:** Slightly more code than ad-hoc boolean flags, but dramatically easier to reason about and extend.

**Example:**
```typescript
type ChallengeState =
  | { status: 'idle' }
  | { status: 'active'; challenge: Challenge }
  | { status: 'submitted'; challenge: Challenge; userInput: string }
  | { status: 'result'; challenge: Challenge; passed: boolean };

type ChallengeAction =
  | { type: 'START'; challenge: Challenge }
  | { type: 'SUBMIT'; userInput: string }
  | { type: 'GRADE'; passed: boolean }
  | { type: 'NEXT' };
```

---

### Pattern 4: Static JSON Content Library

**What:** All challenges, drills, and curriculum ordering live in static JSON files bundled at build time. Each challenge defines: `id`, `title`, `targetFunction`, `seedData` (initial grid values), `prompt`, `hint`, `expectedOutput`, `explanation`, `difficulty`.

**When to use:** MVP and beyond. A database is not needed until content is user-generated or dynamically personalized.

**Trade-offs:** Fast to load, zero infrastructure. Downside: content changes require a redeploy. Acceptable for a focused, finite content library.

**Example schema:**
```json
{
  "id": "vlookup-basic-01",
  "targetFunction": "VLOOKUP",
  "difficulty": 1,
  "prompt": "In cell D2, write a VLOOKUP formula to find the revenue for the ticker in B2 using the lookup table in columns F:G.",
  "hint": "VLOOKUP(lookup_value, table_array, col_index_num, [range_lookup])",
  "seedData": [
    ["Ticker", "B2", "=B2", "Revenue"],
    ...
  ],
  "expectedOutput": 4200000,
  "answerCell": { "row": 1, "col": 3 },
  "explanation": "=VLOOKUP(B2, F:G, 2, FALSE) looks up B2 in the first column of F:G and returns the value in column 2."
}
```

---

## Data Flow

### Challenge Flow (Primary)

```
User opens challenge
    ↓
Content Library (JSON) → Challenge Engine: load challenge + seed data
    ↓
Formula Engine (HyperFormula): initialized with seed data
    ↓
Spreadsheet Grid: renders pre-populated grid, user types formula in answer cell
    ↓
User clicks Submit
    ↓
Challenge Engine: SUBMIT action → transitions to 'submitted'
    ↓
Grader: reads cell value from HyperFormula → compares to expectedOutput
    ↓
Challenge Engine: GRADE action → transitions to 'result' (passed/failed)
    ↓
Challenge Panel: shows explanation
    ↓
Progress Engine: records attempt result (function, difficulty, pass/fail)
    ↓
Progress Store: persists to localStorage
    ↓
User clicks Next → Challenge Engine: NEXT → loads next challenge
```

### Drill Flow (Secondary)

```
User opens drill mode
    ↓
Content Library (drills JSON): loads question set
    ↓
DrillMode component: shows prompt (no full grid — multiple choice or short answer)
    ↓
User selects/types answer
    ↓
Grader: exact string match or option index match
    ↓
Progress Engine: record result
    ↓
Next question (auto-advance after brief feedback delay)
```

### Progress Read Flow

```
App mount
    ↓
Progress Store: read from localStorage
    ↓
Progress Engine: compute mastery per function, weak areas
    ↓
Progress Dashboard: render score ring, weak topic list, recommended next challenge
```

### State Management

```
React component tree
    ↓
ChallengeEngine (useReducer) — owns current challenge state
    ↓
SpreadsheetGrid (local state) — owns grid display
    ↓
ProgressEngine (pure functions, no React state) — operates on Progress Store
    ↓
localStorage ← progressStore.save() called after each graded attempt
```

---

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 0-1k users | Single-page app, localStorage, static JSON content — no backend needed |
| 1k-10k users | Add a thin backend to persist progress server-side; content still static JSON or a lightweight CMS |
| 10k+ users | CDN for static assets, backend progress API with a database (SQLite → Postgres), optional user accounts |

### Scaling Priorities

1. **First bottleneck:** Cross-device progress sync. localStorage is device-local. When users ask for this, add a backend progress endpoint. The Progress Store module is the only thing that changes.
2. **Second bottleneck:** Content authoring. Editing JSON files doesn't scale with a large content team. Move content to a headless CMS or simple admin UI backed by a database.

---

## Anti-Patterns

### Anti-Pattern 1: Formula String Comparison for Grading

**What people do:** Check if the user typed `=VLOOKUP(B2,F:G,2,FALSE)` exactly.
**Why it's wrong:** Multiple formula strings produce identical correct outputs. Rejects valid alternatives, frustrates users, creates content maintenance burden defining every acceptable variant.
**Do this instead:** Use HyperFormula to evaluate both the user's formula and the expected output value, then compare numeric results with a tolerance.

---

### Anti-Pattern 2: Full Spreadsheet for Drills

**What people do:** Load a full Handsontable grid for rapid-fire flashcard-style questions.
**Why it's wrong:** Drills are about formula recognition and recall speed. A full grid is slow to render and adds interaction friction where none is needed.
**Do this instead:** Use a lightweight component (simple DOM + React) for drill mode. Reserve the full grid for challenge mode where hands-on construction is the point.

---

### Anti-Pattern 3: One HyperFormula Instance Shared Across Challenges

**What people do:** Create one global HyperFormula instance, reuse it as challenges change.
**Why it's wrong:** Cell data from a prior challenge leaks into the next. Cross-sheet references produce wrong results. Sheet name collisions cause silent errors.
**Do this instead:** Destroy and recreate the HyperFormula instance when loading a new challenge (or clear all sheets). `resetFormulaEngine()` in the factory handles this.

---

### Anti-Pattern 4: Storing Content in Component State or Global Store

**What people do:** Load all challenge JSON into a Redux/Zustand store on app boot.
**Why it's wrong:** Unnecessary memory usage, slower initial load, adds complexity to the state tree.
**Do this instead:** Import challenge JSON modules at component render time (dynamic import or static import per route). Content is immutable — it doesn't need reactive state.

---

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| None (MVP) | — | No external APIs needed for MVP |
| Backend progress API (future) | REST POST on each graded attempt | Replace progressStore.ts localStorage calls only |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| SpreadsheetGrid ↔ Formula Engine | HyperFormula instance passed via Handsontable `formulas` plugin config | Grid and engine share one HF instance per challenge |
| Challenge Panel ↔ Challenge Engine | React props + dispatch (useReducer) | Panel is pure presentational; all logic in engine |
| Grader ↔ Formula Engine | Direct function call: `grader.grade(hfInstance, ...)` | No events; synchronous read after submit |
| Progress Engine ↔ Progress Store | Function calls: `store.load()` / `store.save()` | No coupling to React state; pure data layer |
| Content Library ↔ Challenge Engine | Static import or dynamic import of JSON | Engine reads challenge data; never writes to content |

---

## Build Order Implications

The dependency graph determines phase order:

```
1. Content Library (JSON schema + seed data)
        ↓ required by
2. Formula Engine (HyperFormula init + helpers)
        ↓ required by
3. Spreadsheet Grid (Handsontable wired to engine)
        ↓ required by
4. Grader (reads from engine after user input)
        ↓ required by
5. Challenge Engine (state machine around grader + grid)
        ↓ required by
6. Challenge Panel UI (renders challenge engine state)
        ↓
7. Progress Engine + Store (records grader output)
        ↓
8. Progress Dashboard UI (reads progress store)
        ↓
9. Drill Mode (simpler alternative flow, shares grader + progress)
        ↓
10. Curriculum / Learning Path (orders challenges using content library)
```

**Implication:** Build the formula engine and a single working challenge (steps 1-6) first. Everything else is additive. A working challenge loop — grid renders, user types formula, grader says pass/fail, explanation shows — is the minimum viable core. Progress tracking, drill mode, and curriculum ordering can be layered on without touching the core.

---

## Sources

- HyperFormula official documentation — formula calculation integration: https://hyperformula.handsontable.com/guide/basic-usage.html
- Handsontable React formula-calculation docs: https://handsontable.com/docs/react-data-grid/formula-calculation/
- Handsontable blog on HyperFormula integration patterns: https://handsontable.com/blog/supercharge-your-web-application-with-excel-like-capabilities-from-hyperformula
- HyperFormula GitHub — headless architecture overview: https://github.com/handsontable/hyperformula
- Handsontable events and hooks (React): https://handsontable.com/docs/react-data-grid/events-and-hooks/
- JavaScript Spreadsheets architecture overview (Medium/Jspreadsheet): https://medium.com/@jspreadsheet/javascript-spreadsheets-guide-building-excel-like-interfaces-for-web-developers-2bb493da8a91
- Spaced repetition / progress tracking with localStorage (LeetCode tracker pattern): https://github.com/javydevx/leetcode-tracker
- State machine pattern for challenge flows: https://gameprogrammingpatterns.com/state.html

---
*Architecture research for: Interactive Excel Interview Prep — spreadsheet learning platform*
*Researched: 2026-02-22*
