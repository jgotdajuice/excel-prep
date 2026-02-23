# Phase 2: Challenge Loop - Research

**Researched:** 2026-02-22
**Domain:** Challenge UI (React + Handsontable + HyperFormula), grading engine, state management (Zustand)
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Challenge Presentation**
- Right panel for challenge prompt text (scenario description, instructions)
- Seed data in grid is locked (read-only) — user can only edit answer cell(s)
- Answer cell(s) marked with highlighted border (colored outline)
- Multiple answer cells possible per challenge — some challenges require helper formulas across 2-3 cells
- Progressive hints — no hint by default, "Show hint" button reveals the function name
- Enter key auto-submits the answer (no Submit button)
- Show full grid first when challenge loads — no auto-focus on answer cell
- Grid labels in header rows/columns describe the data — no separate legend in the prompt panel
- Adaptive grid sizing — grid resizes to fit the challenge data, no extra empty rows/columns
- Optional informational timer — visible but no penalty, purely tracks time spent
- Reset button to clear answer cell(s) and start the challenge fresh
- For multi-cell challenges: prompt user to fill all answer cells before grading ("Fill all answer cells before submitting")

**Grading Feedback**
- Correct answer: green checkmark + "Correct!" — simple and minimal
- Wrong value (valid formula, incorrect result): "Expected: $X — Got: $Y" with both values shown
- Formula syntax error: Excel error code in the cell (#VALUE!, #REF!, #N/A) — no plain English translation
- Answer cell color changes after grading — green border for correct, red for incorrect
- Grid locks (read-only) after grading — user must click Retry or Next to continue
- Grading triggers on Enter only — clicking away from the answer cell does NOT trigger grading
- Multi-cell challenges: each cell graded independently as user presses Enter in it (per-cell feedback)
- Allow retry — "Try Again" button resets answer cell(s) for another attempt

**Explanation Display**
- Expandable "See explanation" section — always starts collapsed (even on incorrect answers)
- Always shows the correct formula, whether the user got it right or wrong
- Include interview pro tips when applicable (e.g., "In interviews, always use NPV+initial_outlay pattern")
- Explanation detail level at Claude's discretion based on function complexity

**Challenge Navigation**
- "Next Challenge" button in the right panel after grading
- "Skip" button available — skipped challenges do NOT count toward learning path progress
- Allow going back to previously completed challenges
- Challenge counter + progress bar: "3/10" plus visual fill bar
- Completion screen: brief celebration animation + summary (correct count, time spent, missed questions), then option to continue or return to dashboard
- Visible challenge list showing all challenges in current set with status icons: bullet (not attempted), checkmark (correct), X (incorrect)
- User can click any challenge in the list to jump to it

### Claude's Discretion
- Narrative depth per challenge prompt (brief vs scenario-based)
- Challenge metadata display (function category, difficulty tags)
- Grading result placement (in right panel, overlay, or below grid)
- Numeric comparison tolerance for floating point values
- Challenge data realism (simplified teaching numbers vs real-world scale)
- Challenge list placement (left sidebar vs top of right panel)
- Exact celebration animation on completion

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| GRID-03 | User's formula is graded by comparing computed output value against expected result (not string matching) | `hfInstance.getCellValue()` returns `CellValue = NoErrorCellValue \| DetailedCellError`; numeric comparison uses tolerance; `instanceof DetailedCellError` distinguishes error from valid value |
| GRID-04 | User sees clear error feedback distinguishing "wrong value" from "formula syntax error" | `DetailedCellError.type` (ErrorType enum) + `DetailedCellError.value` (Excel error string like "#VALUE!") distinguish parse vs evaluation errors; `DetailedCellError.type === ErrorType.NAME` = parse error |
| LEARN-01 | User can complete challenge-based tasks with finance-scenario prompts | Challenge data type defines `prompt`, `seedData: RawCellContent[][]`, `answerCells: {row,col}[]`, `expectedValues`; Handsontable `cells` callback marks seed cells `readOnly: true` |
| LEARN-03 | User sees an explanation after each question showing why the answer works | Explanation in right panel — conditionally visible after grading; expandable `<details>` or controlled accordion component |
| LEARN-04 | All challenges use finance/IB/accounting scenario framing rather than generic examples | Challenge data authoring convention; enforced by content structure type |
</phase_requirements>

---

## Summary

Phase 2 builds on the existing HyperFormula + Handsontable stack from Phase 1 — no new core dependencies are needed. The challenge loop has four interlocking parts: (1) a challenge data schema defining seed data, answer cell coordinates, and expected values; (2) the SpreadsheetGrid adapted to accept external data and lock seed cells; (3) a grading engine that compares `getCellValue()` output against expected values; and (4) a right-panel challenge UI showing prompt, hints, feedback, explanation, and navigation.

The key technical discoveries for planning are: `getCellValue()` returns `CellValue = NoErrorCellValue | DetailedCellError` — error detection is `instanceof DetailedCellError`, not a string check. The `DetailedCellError.value` property contains the Excel error string (`"#VALUE!"`, `"#REF!"` etc.) which is the exact display string the design calls for. Seed cell read-only is applied via the Handsontable `cells` callback returning `{ readOnly: true }` — this is the highest-priority config layer. Answer cell visual distinction (colored border) is applied via a function-based cell renderer that inspects `row, col` against the challenge's `answerCells` list. Grid locking after grading is done by triggering a state update that causes the `cells` callback to return `readOnly: true` for all cells.

Grading on Enter (not on blur) requires `beforeKeyDown` hook to intercept Enter while the active cell is an answer cell, then triggering grading. The `afterChange` hook with `source === 'edit'` fires after the value commits, which is a cleaner hook to trigger grading from.

**Primary recommendation:** Define the `Challenge` TypeScript type first, then wire SpreadsheetGrid to accept challenge prop, implement the grading function as a pure function, build the right panel as a sibling component, and connect everything through a Zustand `useChallengeStore`.

---

## Standard Stack

### Core (all already installed — no new packages needed)

| Library | Version | Purpose | Why |
|---------|---------|---------|-----|
| HyperFormula | 3.2.x | Formula evaluation + error detection | `getCellValue` returns `DetailedCellError` for formula errors; `CellValueType.ERROR` for type check |
| Handsontable | 16.2.x | Grid: seed cell locking, answer cell highlighting, keyboard hooks | `cells` callback + `beforeKeyDown` hook + function renderer |
| Zustand | 5.x | Challenge state (current challenge, grade result, timer) | Already installed; simple hook-based state |
| React | 19.x | Right panel UI, explanation accordion | Already installed |
| TypeScript | 5.x | Challenge schema type, grading function types | Already installed |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `clsx` + `tailwind-merge` | latest | Conditional classes for answer cell states | Already installed; use for correct/incorrect/unattempted cell border colors |
| Tailwind CSS 4 | 4.x | Right panel layout, progress bar, challenge list | Already installed |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `cells` callback for read-only | `hot.updateSettings({ readOnly: true })` | `updateSettings` locks the whole grid; `cells` callback locks per-cell — need per-cell to keep answer cells editable while seed cells are locked |
| Function-based renderer for answer cell highlight | `className` cell meta + CSS | Both work; function renderer (`td.style`) is more explicit and doesn't depend on CSS specificity battles with Handsontable theme |
| Zustand for challenge state | React `useState` lifted to page | Zustand avoids prop drilling from `ChallengePage` → `SpreadsheetGrid` → `RightPanel`; component tree depth justifies it |

**No new packages needed.** All required capabilities are in the existing stack.

---

## Architecture Patterns

### Recommended Project Structure

```
src/
├── components/
│   ├── SpreadsheetGrid.tsx         # EXTEND: add challenge prop, cells callback, beforeKeyDown
│   ├── FormulaBar.tsx              # Unchanged
│   ├── FunctionAutocomplete.tsx    # Unchanged
│   ├── AppShell.tsx                # EXTEND: two-column layout when in challenge mode
│   ├── RightPanel.tsx              # NEW: prompt, hint, feedback, explanation, navigation
│   ├── ChallengeList.tsx           # NEW: scrollable list of challenges with status icons
│   └── CompletionScreen.tsx        # NEW: celebration + summary
├── engine/
│   ├── formulaEngine.ts            # Unchanged
│   ├── formulaEngine.test.ts       # Unchanged
│   └── grader.ts                   # NEW: grade(answerValue, expected, tolerance) → GradeResult
├── store/
│   └── challengeStore.ts           # NEW: Zustand store for active challenge + grade state
├── data/
│   └── challenges/
│       └── index.ts                # NEW: placeholder challenge array (2-3 seed challenges for Phase 2)
├── types/
│   └── index.ts                    # EXTEND: add Challenge, GradeResult, ChallengeStatus types
└── pages/
    ├── WelcomePage.tsx             # Unchanged
    └── ChallengePage.tsx           # NEW: orchestrates SpreadsheetGrid + RightPanel
```

### Pattern 1: Challenge Data Schema

**What:** A typed schema that defines all the information for one challenge. Phase 2 uses 2-3 seed challenges inline — full content library comes in Phase 3.

**Example:**
```typescript
// src/types/index.ts — add to existing types

export interface AnswerCell {
  row: number;
  col: number;
  expectedValue: number | string | boolean;
  /** tolerance for numeric comparison, default 0.01 */
  tolerance?: number;
}

export interface Challenge {
  id: string;
  title: string;
  /** Finance scenario prompt shown in right panel */
  prompt: string;
  /** Function name revealed by "Show hint" button */
  hintFunction: string;
  /** Correct formula string shown in explanation */
  correctFormula: string;
  /** Explanation text (may include interview tips) */
  explanation: string;
  /** 2D array of seed data — same format as HyperFormula RawCellContent[][] */
  seedData: (string | number | boolean | null)[][];
  /** Answer cells that the user edits */
  answerCells: AnswerCell[];
}

export type ChallengeStatus = 'unattempted' | 'correct' | 'incorrect' | 'skipped';

export interface GradeResult {
  status: 'correct' | 'incorrect' | 'error';
  /** For incorrect: the computed value */
  gotValue?: number | string | boolean;
  /** For incorrect: the expected value */
  expectedValue?: number | string | boolean;
  /** For error: the Excel error string, e.g. '#VALUE!' */
  errorCode?: string;
}
```

### Pattern 2: Seed Cell Locking + Answer Cell Highlighting (Handsontable)

**What:** Use the `cells` callback (highest-priority config) to make seed cells read-only. Use a registered function renderer to apply answer cell border styling.

**Verified source:** https://handsontable.com/docs/javascript-data-grid/disabled-cells/ — `cells(row, col)` returns `{ readOnly: true }`. Read-only cells get CSS class `htDimmed`. Copy works; paste and edit do not.

```typescript
// In SpreadsheetGrid, computed from challenge prop:

const answerCellSet = new Set(
  challenge.answerCells.map(({ row, col }) => `${row}:${col}`)
);

// cells callback — runs per cell during render
const cellsCallback = (row: number, col: number) => {
  const key = `${row}:${col}`;
  if (answerCellSet.has(key)) {
    return {}; // Editable — answer cell
  }
  return { readOnly: true }; // Seed cell — locked
};

// After grading: lock all cells
const cellsCallbackLocked = (_row: number, _col: number) => ({ readOnly: true });

// Function-based renderer for answer cell border
function answerCellRenderer(
  instance: Handsontable,
  td: HTMLTableCellElement,
  row: number,
  col: number,
  _prop: unknown,
  value: unknown,
  cellProperties: Handsontable.CellProperties
) {
  // Call default text renderer first
  Handsontable.renderers.TextRenderer.call(this, instance, td, row, col, _prop, value, cellProperties);

  const key = `${row}:${col}`;
  if (answerCellSet.has(key)) {
    const status = getAnswerCellStatus(row, col); // 'unattempted' | 'correct' | 'incorrect'
    if (status === 'correct') {
      td.style.outline = '2px solid #1a6b3c';
    } else if (status === 'incorrect') {
      td.style.outline = '2px solid #c0392b';
    } else {
      td.style.outline = '2px solid #0066cc'; // Blue outline = answer cell
    }
  }
  return td;
}
```

### Pattern 3: Error Detection for Grading (HyperFormula)

**What:** `getCellValue()` returns `CellValue = number | string | boolean | null | DetailedCellError`. Use `instanceof DetailedCellError` to detect formula errors.

**Verified from typings:** `/Users/jam/excel-prep/node_modules/hyperformula/typings/CellValue.d.ts` — confirmed.

```typescript
// src/engine/grader.ts
import { DetailedCellError } from 'hyperformula';
import type { AnswerCell, GradeResult } from '../types';

export function gradeCell(
  cellValue: unknown, // CellValue from getCellValue()
  answerCell: AnswerCell,
): GradeResult {
  // Formula syntax/evaluation error
  if (cellValue instanceof DetailedCellError) {
    return {
      status: 'error',
      errorCode: cellValue.value, // e.g. '#VALUE!', '#NAME?', '#REF!'
    };
  }

  const expected = answerCell.expectedValue;
  const tolerance = answerCell.tolerance ?? 0.01;

  // Numeric comparison with tolerance
  if (typeof expected === 'number' && typeof cellValue === 'number') {
    const isCorrect = Math.abs(cellValue - expected) <= tolerance;
    return isCorrect
      ? { status: 'correct' }
      : { status: 'incorrect', gotValue: cellValue, expectedValue: expected };
  }

  // String/boolean exact comparison
  const isCorrect = cellValue === expected;
  return isCorrect
    ? { status: 'correct' }
    : { status: 'incorrect', gotValue: cellValue as string | boolean, expectedValue: expected };
}
```

**ErrorType enum values** (from typings — confirmed):
- `ErrorType.NAME` = unknown function name (`#NAME?`) — user typed `=VLOKUP(`
- `ErrorType.VALUE` = wrong argument type (`#VALUE!`)
- `ErrorType.REF` = invalid cell reference (`#REF!`)
- `ErrorType.NA` = lookup not found (`#N/A`)
- `ErrorType.NUM` = invalid number (`#NUM!`)
- `ErrorType.DIV_BY_ZERO` = divide by zero (`#DIV/0!`)
- `ErrorType.CYCLE` = circular reference (`#CYCLE!`)
- `ErrorType.ERROR` = generic error (`#ERROR!`)

**The `DetailedCellError.value` string IS the Excel error code** to display in the cell — this is exactly what the design calls for (show Excel error codes verbatim, no translation).

### Pattern 4: Grading on Enter (Handsontable beforeKeyDown)

**What:** Grade only when the user presses Enter while in an answer cell. Do NOT grade on blur.

**Source:** https://handsontable.com/docs/javascript-data-grid/events-and-hooks/ — `beforeKeyDown` receives the keyboard event; `e.stopImmediatePropagation()` can block default behavior.

**Implementation:**

The cleanest approach is the `afterChange` hook with `source === 'edit'`:

```typescript
afterChange={(changes, source) => {
  if (source !== 'edit' || !changes) return;
  for (const [row, col, , newValue] of changes) {
    const key = `${row}:${col}`;
    if (answerCellSet.has(key)) {
      triggerGrading(row, col);
    }
  }
}}
```

`afterChange` fires after the value is committed and HyperFormula has re-evaluated — so `getCellValue()` will return the computed result. `source === 'edit'` means the user made the change manually (not from `loadData` or programmatic `setDataAtCell`).

**Note:** `afterChange` with `source === 'edit'` fires on Enter key commit, Tab commit, and click-away commit. To restrict to Enter-only: use `beforeKeyDown` to set a flag when Enter is pressed on an answer cell, then check that flag in `afterChange`. However, the CONTEXT.md says "grading triggers on Enter only — clicking away does NOT trigger grading", so this flag pattern is required.

```typescript
// Flag pattern for Enter-only grading:
const enterPressedRef = useRef(false);

// beforeKeyDown hook
beforeKeyDown={(e) => {
  if (e.key === 'Enter') {
    const selected = hotRef.current?.hotInstance?.getSelectedLast();
    if (selected) {
      const [row, col] = selected;
      if (answerCellSet.has(`${row}:${col}`)) {
        enterPressedRef.current = true;
      }
    }
  } else {
    enterPressedRef.current = false;
  }
}}

// afterChange hook
afterChange={(changes, source) => {
  if (source !== 'edit' || !changes || !enterPressedRef.current) return;
  enterPressedRef.current = false;
  for (const [row, col] of changes) {
    if (answerCellSet.has(`${row}:${col}`)) {
      triggerGrading(row, col);
    }
  }
}}
```

### Pattern 5: Loading Seed Data into Grid

**What:** Replace the grid's data when a new challenge loads. Use Handsontable's `data` prop driven by React state, or `hot.loadData()` imperatively.

The cleanest approach for React: pass `seedData` as the `data` prop on `HotTable`. When challenge changes, the `data` prop changes and Handsontable re-renders.

**Critical:** When loading seed data, the grid fires `afterChange` with `source === 'loadData'`. The grading hook must ignore this source (it already checks `source === 'edit'`).

```typescript
// Resize grid to fit challenge data
<HotTable
  data={challenge.seedData}
  minRows={challenge.seedData.length}
  minCols={Math.max(...challenge.seedData.map(r => r.length))}
  // ... other props
/>
```

**Note:** Passing `data` as a prop to HotTable means Handsontable owns the data array. For challenge mode, seed cells are read-only anyway (cells callback), so mutation concerns are limited to answer cells. Track answer cell values in Zustand store, not in HF directly.

### Pattern 6: Zustand Challenge Store

**What:** Central state for the challenge session. Keeps the component tree clean.

```typescript
// src/store/challengeStore.ts
import { create } from 'zustand';
import type { Challenge, ChallengeStatus, GradeResult } from '../types';

interface CellGrade {
  row: number;
  col: number;
  result: GradeResult;
}

interface ChallengeStore {
  challenges: Challenge[];
  currentIndex: number;
  statuses: ChallengeStatus[];        // per challenge
  cellGrades: CellGrade[];            // grades for current challenge's answer cells
  hintVisible: boolean;
  explanationVisible: boolean;
  isLocked: boolean;                  // grid locked after grading
  startTime: number | null;           // timestamp for timer
  elapsedSeconds: number;

  setChallenge: (index: number) => void;
  gradeCell: (row: number, col: number, value: unknown) => void;
  showHint: () => void;
  toggleExplanation: () => void;
  retry: () => void;
  skip: () => void;
  nextChallenge: () => void;
}

export const useChallengeStore = create<ChallengeStore>((set, get) => ({
  // ... implementation
}));
```

### Pattern 7: Adaptive Grid Sizing

**What:** Grid dimensions match the challenge seed data — no extra empty rows/columns beyond data bounds.

```typescript
// Compute from challenge.seedData
const numRows = challenge.seedData.length;
const numCols = Math.max(...challenge.seedData.map(row => row.length));

<HotTable
  data={challenge.seedData}
  minRows={numRows}
  maxRows={numRows}
  minCols={numCols}
  maxCols={numCols}
  // Remove stretchH="all" to prevent extra cols
/>
```

**Limitation:** Handsontable may still show scrollbars or padding columns. Setting `maxRows` and `maxCols` constrains the grid to exactly the data size.

### Anti-Patterns to Avoid

- **Grading by formula string comparison:** Do not compare `getCellFormula()` strings. Grade by `getCellValue()` output — the requirement is result equality, not formula equality.
- **Using `readOnly: true` on the HotTable root prop:** This locks the entire grid, including answer cells. Use `cells` callback for per-cell locking.
- **Storing HyperFormula instance in React state:** React will proxy it. Keep as module-level variable or `useRef` (already established in Phase 1 architecture).
- **Reading cell value before `afterChange` fires:** HyperFormula recalculates synchronously on data change, but only after Handsontable commits the edit. Never read the value in `beforeChange` — the new value hasn't been applied yet.
- **Triggering grading on `source === 'loadData'`:** When a new challenge loads, `afterChange` fires with `source === 'loadData'`. Always guard: `if (source !== 'edit') return`.
- **Floating point exact equality:** `0.1 + 0.2 !== 0.3` in JavaScript. Always use tolerance (`Math.abs(got - expected) <= 0.01`) for numeric grading.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Formula error detection | String parsing of cell display value | `instanceof DetailedCellError` on `getCellValue()` return | `DetailedCellError.value` is the exact Excel error string; no string parsing needed |
| Seed cell locking | Custom DOM event interceptors | Handsontable `cells` callback returning `{ readOnly: true }` | Handles keyboard, paste, drag-fill — all blocked automatically |
| Answer cell visual highlight | Custom CSS injection | Function-based renderer on `td.style.outline` | Renderer runs per cell on every render; no manual DOM sync needed |
| Timer | setInterval with complex state | `Date.now()` diff on `startTime` stored in Zustand | requestAnimationFrame or 1s interval ticking `elapsedSeconds` is enough |
| Celebration animation | Custom canvas or WebGL | CSS animation or a simple `animate-bounce` Tailwind class + confetti | Tailwind CSS 4 has `@keyframes` support; for confetti consider `canvas-confetti` (tiny, no framework) |

**Key insight:** The grading logic is a pure function — no library needed. The complexity is in correctly reading `getCellValue()` and classifying the `DetailedCellError` type.

---

## Common Pitfalls

### Pitfall 1: afterChange Source Confusion

**What goes wrong:** Grading triggers when challenge loads (source = 'loadData') or when seed cells are cleared during retry (source = 'setDataAtCell'), causing false grade results.

**Why it happens:** `afterChange` fires for all data changes, not just user edits.

**How to avoid:** Always check `source === 'edit'` before grading. Also check `enterPressedRef.current === true` to enforce Enter-only trigger. Reset the flag in all non-Enter keydown branches.

**Warning signs:** Grade panel appears immediately when a challenge loads; retry shows grade result without user action.

---

### Pitfall 2: getCellValue Returns Stale Value

**What goes wrong:** Grading reads the cell value before HyperFormula has re-evaluated, returning `null` or the previous value.

**Why it happens:** Reading value in `beforeChange` or in the `afterSelection` handler (which fires during editing, not after commit).

**How to avoid:** Read `getCellValue()` only inside `afterChange` (after the hook fires) or after calling `hfInstance.setCellContents()` imperatively. HyperFormula re-evaluates synchronously on data change, so the value is current by the time `afterChange` fires in Handsontable.

**Warning signs:** Grader always returns "incorrect" even for correct formulas; value logs as `null`.

---

### Pitfall 3: Answer Cell readOnly State Not Updating After Grading

**What goes wrong:** After grading, grid should lock (all cells read-only). The `cells` callback references stale closure over the pre-grading `isLocked` state.

**Why it happens:** React closures in Handsontable prop callbacks capture state at render time. If `cells` is defined inline without re-creating on state change, it won't reflect updated `isLocked`.

**How to avoid:** Either (a) pass `isLocked` as a prop that triggers `HotTable` re-render with new `cells` callback, or (b) use `hot.updateSettings({ cells: newCellsCallback })` imperatively in a `useEffect` when `isLocked` changes.

**Warning signs:** User can still type in answer cells after the grid should be locked.

---

### Pitfall 4: Floating Point Grading Rejects Correct Finance Formulas

**What goes wrong:** User types `=PMT(0.05/12, 60, -10000)` and gets 188.71475... but expected is 188.71 — grader rejects as incorrect.

**Why it happens:** Exact numeric equality fails for repeating decimals produced by finance functions.

**How to avoid:** Always grade numeric answers with tolerance. Default tolerance of `0.01` (2 decimal places) is appropriate for most finance scenarios. Store `tolerance` per `AnswerCell` in the Challenge type to allow per-challenge override (e.g., IRR answer needs `tolerance: 0.0001` for percentage accuracy).

**Warning signs:** Finance functions (PMT, IRR, NPV, XNPV) never grade as correct.

---

### Pitfall 5: Multi-Cell Challenge Partial Grading UX Confusion

**What goes wrong:** User fills cell 1 of 3 (presses Enter), sees grading feedback, then fills cell 2 — but cell 1's grade result is overwritten, or the user thinks they need to fill all cells before anything happens.

**Why it happens:** Per-cell grading fires on each Enter press; state management doesn't clearly distinguish "partially complete" vs "fully graded."

**How to avoid:** Implement per-cell `cellGrades` array in Zustand. Show cell-level feedback (border color) immediately on each Enter. Show the "wrong value" / "correct" panel only when all answer cells have been attempted. Show "Fill all answer cells first" hint in right panel until all cells have at least one grade result.

**Warning signs:** Right panel shows confusing feedback mid-challenge on multi-cell challenges.

---

## Code Examples

### Error Detection — Verified from Typings

```typescript
// Source: /node_modules/hyperformula/typings/CellValue.d.ts
// CellValue = number | string | boolean | null | DetailedCellError

import { DetailedCellError } from 'hyperformula';

const cellValue = hfInstance.getCellValue({ sheet: 0, row, col });

if (cellValue instanceof DetailedCellError) {
  // Formula error: cellValue.value is the Excel error string
  // e.g. '#VALUE!', '#NAME?', '#REF!', '#N/A', '#NUM!', '#DIV/0!'
  console.log(cellValue.value);    // '#VALUE!'
  console.log(cellValue.type);     // ErrorType.VALUE (enum)
  console.log(cellValue.message);  // Human-readable message from HyperFormula
} else {
  // Valid value: number | string | boolean | null
}
```

### Seed Cell Read-Only — Verified from Official Docs

```typescript
// Source: https://handsontable.com/docs/javascript-data-grid/disabled-cells/
// cells callback is highest-priority config layer

<HotTable
  cells={(row, col) => {
    if (answerCellSet.has(`${row}:${col}`)) {
      return {}; // Answer cell — editable
    }
    return { readOnly: true }; // Seed cell — locked, gets htDimmed CSS class
  }}
/>
```

### Answer Cell Border Highlight — Verified from Official Docs

```typescript
// Source: https://handsontable.com/docs/react-data-grid/cell-renderer/
// Function-based renderer — manipulates the td DOM element directly

import Handsontable from 'handsontable';

function answerCellRenderer(
  this: unknown,
  instance: Handsontable,
  td: HTMLTableCellElement,
  row: number,
  col: number,
  prop: string | number,
  value: unknown,
  cellProperties: Handsontable.CellProperties
) {
  Handsontable.renderers.TextRenderer.call(
    this, instance, td, row, col, prop, value, cellProperties
  );
  td.style.outline = '2px solid #0066cc';  // answer cell: blue
  td.style.outlineOffset = '-2px';
  return td;
}

Handsontable.renderers.registerRenderer('answerCell', answerCellRenderer);
```

### Numeric Tolerance Grading

```typescript
// src/engine/grader.ts — pure function, no library needed
import { DetailedCellError } from 'hyperformula';
import type { AnswerCell, GradeResult } from '../types';

export function gradeCell(
  cellValue: unknown,
  answerCell: AnswerCell,
): GradeResult {
  if (cellValue instanceof DetailedCellError) {
    return { status: 'error', errorCode: cellValue.value };
  }

  const { expectedValue, tolerance = 0.01 } = answerCell;

  if (typeof expectedValue === 'number' && typeof cellValue === 'number') {
    return Math.abs(cellValue - expectedValue) <= tolerance
      ? { status: 'correct' }
      : { status: 'incorrect', gotValue: cellValue, expectedValue };
  }

  return cellValue === expectedValue
    ? { status: 'correct' }
    : { status: 'incorrect', gotValue: cellValue as string | boolean, expectedValue };
}
```

### Zustand Store Create Pattern — Verified from Typings

```typescript
// Source: /node_modules/zustand/react.d.ts
// Zustand 5 — create<T>(initializer) returns UseBoundStore

import { create } from 'zustand';

interface ChallengeStore {
  currentIndex: number;
  isLocked: boolean;
  setCurrentIndex: (idx: number) => void;
  lock: () => void;
  unlock: () => void;
}

export const useChallengeStore = create<ChallengeStore>((set) => ({
  currentIndex: 0,
  isLocked: false,
  setCurrentIndex: (idx) => set({ currentIndex: idx, isLocked: false }),
  lock: () => set({ isLocked: true }),
  unlock: () => set({ isLocked: false }),
}));

// Usage in component:
const { currentIndex, isLocked, lock } = useChallengeStore();
```

### Loading Seed Data — buildFromArray vs setCellContents

**`HyperFormula.buildFromArray`** creates a new engine instance pre-populated with data. Since Phase 1 uses a module-level `hfInstance` shared with Handsontable, switching challenges requires updating existing data, not rebuilding the engine.

Use `setCellContents` on the existing `hfInstance`:

```typescript
// Clear old sheet and load new seed data
hfInstance.setCellContents(
  { sheet: 0, row: 0, col: 0 },
  challenge.seedData  // RawCellContent[][] — string | number | boolean | null
);
```

Then call `hot.loadData(challenge.seedData)` to sync Handsontable's display. Both must be called — HyperFormula and Handsontable maintain separate data stores and must be kept in sync.

---

## State of the Art

| Old Approach | Current Approach | Impact |
|--------------|------------------|--------|
| Grading by formula string match | Grade by `getCellValue()` result | The requirement — allows multiple valid formulas to all pass |
| Global `readOnly: true` on HotTable | `cells` callback returning `readOnly` per-cell | Enables seed-locked + answer-editable grid in one table |
| `CellError` from internal API | `DetailedCellError` from public `getCellValue()` | `DetailedCellError.value` is the display string; `type` is the ErrorType enum |

---

## Open Questions

1. **Handsontable `data` prop mutability on challenge switch**
   - What we know: HotTable accepts a `data` prop. When the prop changes, Handsontable calls `loadData` internally.
   - What's unclear: Whether passing a new array reference as `data` prop reliably triggers a full re-render and fires `afterChange` with `source === 'loadData'` (so the grading guard works).
   - Recommendation: Test this during implementation. Fallback: use `hot.loadData(newData)` imperatively in a `useEffect` keyed to `challenge.id` to guarantee deterministic reload.

2. **HyperFormula data sync with Handsontable on challenge switch**
   - What we know: Both HyperFormula and Handsontable have separate data stores. Phase 1 wires them via the `formulas` plugin, which syncs changes through `afterChange`.
   - What's unclear: Whether `hot.loadData()` automatically syncs to HyperFormula through the plugin, or whether `hfInstance.setCellContents()` must be called separately.
   - Recommendation: Test empirically. The `formulas` plugin intercepts Handsontable data changes and applies them to HyperFormula — `hot.loadData()` likely triggers this sync. Verify with a console log of `hfInstance.getCellValue()` after `loadData`.

3. **Confetti library selection**
   - What we know: Completion screen needs "brief celebration animation" (Claude's discretion on exact implementation).
   - What's unclear: Whether to use `canvas-confetti` (4KB gzip, zero dependencies), pure CSS animation, or Tailwind keyframes.
   - Recommendation: `canvas-confetti` is the standard for this pattern — tiny, no framework, fires once. Import as `import confetti from 'canvas-confetti'`. If adding a dependency feels heavy for a "brief animation", use a CSS `@keyframes` scale/fade on a checkmark icon instead. Either is acceptable.

4. **Floating point tolerance default**
   - What we know: PMT, IRR, XNPV produce irrational repeating decimals. Tolerance of 0.01 passes most finance checks.
   - What's unclear: Whether IRR/XIRR percentage answers need tighter tolerance (e.g., 0.0001 for 4 decimal places in a percentage).
   - Recommendation: Set per-challenge `tolerance` in `AnswerCell`. Default to `0.01`. For IRR challenges where expected = `0.0970`, set `tolerance: 0.0005`.

---

## Sources

### Primary (HIGH confidence)

- `/Users/jam/excel-prep/node_modules/hyperformula/typings/CellValue.d.ts` — `CellValue = NoErrorCellValue | DetailedCellError`; `DetailedCellError.value: string` (Excel error code); `DetailedCellError.type: ErrorType`
- `/Users/jam/excel-prep/node_modules/hyperformula/typings/Cell.d.ts` — `ErrorType` enum (DIV_BY_ZERO, NAME, VALUE, NUM, NA, CYCLE, REF, SPILL, LIC, ERROR); `CellValueType` enum with ERROR member
- `/Users/jam/excel-prep/node_modules/hyperformula/typings/HyperFormula.d.ts` — `getCellValue(SimpleCellAddress): CellValue`; `calculateFormula(formulaString, sheetId): CellValue`; `buildFromArray` static factory
- `/Users/jam/excel-prep/node_modules/zustand/react.d.ts` — `create<T>(initializer): UseBoundStore` pattern verified
- Official Handsontable docs (https://handsontable.com/docs/javascript-data-grid/disabled-cells/) — `cells(row, col)` callback returning `{ readOnly: true }`; `htDimmed` CSS class; copy works, paste blocked
- Official Handsontable docs (https://handsontable.com/docs/react-data-grid/cell-renderer/) — function-based renderer signature `(instance, td, row, col, prop, value, cellProperties)`; `registerRenderer` pattern
- Official Handsontable docs (https://handsontable.com/docs/react-data-grid/configuration-options/) — `cells` callback is highest-priority config layer; overwrites all other options
- Official Handsontable docs (https://handsontable.com/docs/javascript-data-grid/events-and-hooks/) — `afterChange` source parameter values ('edit', 'loadData', 'auto'); `beforeKeyDown` intercept pattern

### Secondary (MEDIUM confidence)

- HyperFormula errors type guide (https://hyperformula.handsontable.com/guide/types-of-errors.html) — 9 error types confirmed: DIV_BY_ZERO, N/A, NAME, NUM, REF, VALUE, CYCLE, ERROR, LIC

### Tertiary (LOW confidence)

- HotTable `data` prop reactivity on challenge switch — behavior inferred from React wrapper documentation; requires empirical verification during implementation
- HyperFormula + Handsontable data sync on `hot.loadData()` — assumed to sync via `formulas` plugin; requires verification

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all Phase 1 packages; no new dependencies needed; confirmed from installed package typings
- Architecture: HIGH — Challenge type, grader function, cells callback, renderer patterns all verified against official APIs and local typings
- Grading engine: HIGH — `instanceof DetailedCellError` verified from typings; `DetailedCellError.value` = Excel error string confirmed
- Pitfalls: HIGH — afterChange source, floating point, stale closure are verified gotchas from official docs and TypeScript type analysis
- Data sync on challenge switch: LOW — two open questions; requires empirical testing

**Research date:** 2026-02-22
**Valid until:** 2026-03-22 (stable libraries; verify if Handsontable or HyperFormula minor releases land before implementation)
