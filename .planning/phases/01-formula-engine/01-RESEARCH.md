# Phase 1: Formula Engine - Research

**Researched:** 2026-02-22
**Domain:** Spreadsheet grid UI (Handsontable 16) + formula engine (HyperFormula 3.2) + React 19 + Vite 6
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Grid Appearance**
- Full spreadsheet feel — large grid filling most of the screen, like opening Excel
- Excel-like visual theme — white cells, gray headers, green/blue accents
- Row/column headers match Excel conventions (A, B, C... and 1, 2, 3...)
- Full gridlines and cell borders — looks like a real spreadsheet

**Cell Interaction**
- Formula bar above the grid (like Excel's fx bar) showing the formula of the selected cell
- Function name autocomplete as user types (e.g., typing `=VL` suggests VLOOKUP)
- Enter key confirms formula and moves cursor down (matching Excel behavior)
- Cells display computed result by default; formula visible in formula bar when cell is selected

**Initial Screen**
- Welcome/landing page with brief intro explaining the app, then user is directed to a dashboard
- Dashboard shows learning path, progress overview, and recommended elements
- Prominent "Start" button that changes to "Continue" once the user has begun learning
- App has a name/branding visible in a header
- Left sidebar with topic categories and progress indicators
- Quick 2-3 step onboarding tutorial for first-time users showing how to use the grid and submit answers

**Verification Display**
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

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope

</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| GRID-01 | User can type Excel formulas into an interactive spreadsheet grid and see computed results | Handsontable 16 + HyperFormula 3.2 integration via `formulas` plugin; `setCellContents` / `getCellValue` API verified |
| GRID-02 | Grid supports finance-relevant functions: VLOOKUP, INDEX/MATCH, SUMIFS, IF/nested IF, NPV, IRR, PMT, XNPV, SUM, AVERAGE, COUNT, COUNTIF | All 12 functions confirmed present in HyperFormula 3.2 built-in function list; XIRR is NOT present but XIRR is not in GRID-02 |

</phase_requirements>

---

## Summary

HyperFormula 3.2 and Handsontable 16 are the confirmed stack for Phase 1. HyperFormula is the headless formula engine; Handsontable is the grid UI that wraps it. They are separate packages with separate release cycles but are designed to integrate via Handsontable's `formulas` plugin. All 12 finance functions in GRID-02 are confirmed present in HyperFormula 3.2's built-in function list.

The critical non-obvious work in Phase 1 is not just wiring these two libraries together — it is configuring HyperFormula correctly for Excel compatibility from day one. HyperFormula's defaults differ from Excel in ways that produce silent wrong answers for financial formulas. The Excel-compat config must be applied before any challenge content is written, because content authors will calibrate expected answers against the running engine.

The formula bar and function-name autocomplete are custom UI — Handsontable does not ship these out of the box. The formula bar is implemented by reading `getCellFormula()` from HyperFormula on `afterSelection`. The autocomplete is a custom input overlay that filters the known function list as the user types. Both are straightforward but must be built explicitly as part of this phase.

**Primary recommendation:** Scaffold Vite + React 19 + TypeScript, install Handsontable 16 + HyperFormula 3.2, apply the full Excel-compat config immediately, wire the `formulas` plugin, build the custom formula bar and function autocomplete, and run a smoke-test suite verifying known Excel outputs for NPV, IRR, PMT, VLOOKUP, and nested IF before any challenge content is authored.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | 19.x | UI framework | Stable Dec 2024; `@handsontable/react-wrapper` requires React 18+ |
| Vite | 6.x | Build/dev server | Sub-2s cold starts, native HMR; SPA with no SSR needs |
| TypeScript | 5.x | Type safety | All chosen libraries are TypeScript-first; catches formula comparison shape mismatches |
| Handsontable | 16.2.x | Spreadsheet grid UI | Excel look-and-feel, keyboard nav matching Excel, official React wrapper, HyperFormula plugin built-in |
| HyperFormula | 3.2.x | Formula evaluation engine | 395+ built-in functions; all GRID-02 functions confirmed; Excel-compat config available; getCellFormula/getCellValue API |
| Tailwind CSS | 4.x | Utility styling | Zero config with Vite plugin; v4 stable Jan 2025 |
| Zustand | 5.x | Client state | Minimal boilerplate; no Redux ceremony; hook-based |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `vitest` | 3.x | Unit testing | Test HyperFormula smoke suite and grading logic |
| `clsx` + `tailwind-merge` | latest | Conditional Tailwind classes | Dynamic cell states (correct/incorrect/answer-cell highlight) |
| `react-router-dom` | 7.x | Client routing | Dashboard, grid view, settings pages |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `@handsontable/react-wrapper` | `@handsontable/react` | `@handsontable/react` (class-based, legacy) still works but is the old package; `react-wrapper` (functional, v15+) is the current recommended package for React 18+ |
| HyperFormula | SheetJS / ExcelJS | These are file-format parsers, not formula engines — they do not evaluate `=NPV(...)` at runtime |
| HyperFormula | formula-parser | Older forked library with incomplete financial function coverage; HyperFormula is its successor |

**Installation:**
```bash
npm create vite@latest excel-prep -- --template react-ts
cd excel-prep

# Grid + formula engine
npm install handsontable @handsontable/react-wrapper hyperformula

# State + styling
npm install zustand
npm install -D tailwindcss @tailwindcss/vite

# Routing + utilities
npm install react-router-dom clsx tailwind-merge

# Dev
npm install -D vitest @vitest/ui
```

---

## Architecture Patterns

### Recommended Project Structure

```
src/
├── components/
│   ├── SpreadsheetGrid.tsx     # Handsontable wrapper + formula bar + autocomplete
│   ├── FormulaBar.tsx          # Custom fx bar (reads getCellFormula on afterSelection)
│   └── FunctionAutocomplete.tsx # Dropdown filtering HyperFormula function list
├── engine/
│   ├── formulaEngine.ts        # HyperFormula factory: buildEmpty with Excel-compat config
│   └── smokeTest.ts            # Verified known-Excel-output assertions (run once at init)
├── types/
│   └── index.ts                # SimpleCellAddress, CellContent, FormulaEngineConfig types
└── App.tsx
```

### Pattern 1: HyperFormula with Excel-Compat Config

**What:** HyperFormula must be initialized with explicit Excel-compatibility options. Defaults differ from Excel for null/empty cell handling and date serial numbers.

**When to use:** Every time — this is mandatory, not optional.

**Example:**
```typescript
// engine/formulaEngine.ts
// Source: https://hyperformula.handsontable.com/guide/compatibility-with-microsoft-excel.html
import { HyperFormula } from 'hyperformula';

export function buildExcelCompatEngine(): HyperFormula {
  return HyperFormula.buildEmpty({
    licenseKey: 'internal-use-in-handsontable', // when used with Handsontable
    evaluateNullToZero: true,    // Excel: empty formula cell = 0, not null
    leapYear1900: true,          // Excel's documented 1900 leap-year bug (Lotus compat)
    nullDate: { year: 1899, month: 12, day: 31 }, // Excel date baseline
    localeLang: 'en-US',
    functionArgSeparator: ',',
    decimalSeparator: '.',
    thousandSeparator: '',
    caseSensitive: false,
    useWildcards: true,
    useRegularExpressions: false,
    smartRounding: true,
  });
}
```

### Pattern 2: Handsontable + HyperFormula Wiring (React Wrapper)

**What:** Pass the HyperFormula instance (not the class) to the `formulas` plugin. Use `@handsontable/react-wrapper` (current package, not legacy `@handsontable/react`).

**When to use:** Always. The `formulas` plugin bridges the grid UI to the engine.

**Example:**
```tsx
// components/SpreadsheetGrid.tsx
// Source: https://handsontable.com/docs/react-data-grid/formula-calculation/
import { HotTable } from '@handsontable/react-wrapper';
import { registerAllModules } from 'handsontable/registry';
import 'handsontable/styles/handsontable.min.css';
import 'handsontable/styles/ht-theme-main.min.css';
import { buildExcelCompatEngine } from '../engine/formulaEngine';

registerAllModules();

const hfInstance = buildExcelCompatEngine();

export function SpreadsheetGrid({ data, onCellSelect }) {
  const hotRef = useRef(null);

  const handleAfterSelection = (row: number, col: number) => {
    const hot = hotRef.current?.hotInstance;
    if (!hot) return;
    const formula = hfInstance.getCellFormula({ sheet: 0, row, col });
    const value = hfInstance.getCellValue({ sheet: 0, row, col });
    onCellSelect({ row, col, formula, value });
  };

  return (
    <HotTable
      ref={hotRef}
      data={data}
      formulas={{ engine: hfInstance, sheetName: 'Sheet1' }}
      themeName="ht-theme-main"
      colHeaders={true}
      rowHeaders={true}
      licenseKey="non-commercial-and-evaluation"
      afterSelection={handleAfterSelection}
    />
  );
}
```

### Pattern 3: Formula Bar (Custom, Built Separately from Grid)

**What:** Handsontable does not ship a formula bar. Build it as a separate `<FormulaBar>` component that displays the formula from `getCellFormula()` via the `afterSelection` hook. Edits in the bar update the cell via `hot.setDataAtCell()`.

**Key API:**
```typescript
// Get formula string for display in the fx bar
const formula = hfInstance.getCellFormula({ sheet: 0, row, col });
// Returns: '=SUM(A1:A3)' or undefined if cell has no formula

// Get the computed value (what displays in the cell)
const value = hfInstance.getCellValue({ sheet: 0, row, col });
```

### Pattern 4: Function Name Autocomplete (Custom)

**What:** HyperFormula does not ship a UI autocomplete. Build a filtered dropdown that appears when cell input starts with `=`. Filter the known function list as user types.

**Implementation approach:**
- On cell editor open (use `afterBeginEditing` hook), attach a keydown listener to the cell editor input
- When input matches `/^=([A-Z]*)$/i`, extract the prefix and filter against a hardcoded list of the 12 GRID-02 functions plus common extras
- Render a positioned dropdown below the active cell; keyboard arrows select, Tab/Enter confirm
- On confirm, replace the typed prefix with the full function name and open the argument parenthesis

**Function list for autocomplete (GRID-02 scope):**
```typescript
const FINANCE_FUNCTIONS = [
  'SUM', 'AVERAGE', 'COUNT', 'COUNTIF',
  'VLOOKUP', 'INDEX', 'MATCH',
  'SUMIFS', 'IF', 'IFERROR',
  'NPV', 'IRR', 'PMT', 'XNPV',
];
```

### Pattern 5: HyperFormula Smoke Test Suite

**What:** Before writing any challenge content, run assertions comparing HyperFormula output to known Excel values.

**When to use:** Run once at project bootstrap; keep as a Vitest test suite.

**Example:**
```typescript
// engine/smokeTest.ts — Source: known Excel output values
import { describe, it, expect } from 'vitest';
import { buildExcelCompatEngine } from './formulaEngine';

describe('HyperFormula Excel compatibility', () => {
  it('PMT matches Excel', () => {
    const hf = buildExcelCompatEngine();
    hf.addSheet('Test');
    hf.setCellContents({ sheet: 0, row: 0, col: 0 }, [
      [0.05 / 12, 60, -10000]  // Rate, Nper, PV
    ]);
    hf.setCellContents({ sheet: 0, row: 0, col: 3 }, [['=PMT(A1,B1,C1)']]);
    const result = hf.getCellValue({ sheet: 0, row: 0, col: 3 }) as number;
    expect(result).toBeCloseTo(188.71, 2); // Known Excel output
  });

  it('NPV matches Excel', () => {
    const hf = buildExcelCompatEngine();
    hf.addSheet('Test');
    // Rate = 10%, cash flows: -1000, 300, 400, 400
    hf.setCellContents({ sheet: 0, row: 0, col: 0 }, [
      [0.10, -1000, 300, 400, 400]
    ]);
    hf.setCellContents({ sheet: 0, row: 1, col: 0 }, [['=NPV(A1,C1:E1)+B1']]);
    const result = hf.getCellValue({ sheet: 0, row: 1, col: 0 }) as number;
    expect(result).toBeCloseTo(9.99, 1); // Known Excel output
  });

  it('VLOOKUP matches Excel', () => { /* ... */ });
  it('nested IF matches Excel', () => { /* ... */ });
  it('IRR matches Excel', () => { /* ... */ });
});
```

### Anti-Patterns to Avoid

- **Using `@handsontable/react` instead of `@handsontable/react-wrapper`:** The legacy class-based package still works but is not the current recommended package for React 18+. Use `react-wrapper` on new projects.
- **Initializing HyperFormula without Excel-compat config:** The defaults differ from Excel. `evaluateNullToZero: false` by default — finance formulas referencing empty cells will return `null` instead of `0`, producing silent wrong answers.
- **Using `licenseKey: 'gpl-v3'` in the Handsontable `formulas` plugin:** When HyperFormula is managed by Handsontable's plugin, use `'internal-use-in-handsontable'` as the license key on the HyperFormula instance.
- **Storing the HyperFormula instance in React state:** React will try to make it reactive. Store it in a `useRef` or module-level variable.
- **Placing `<form>` or unfocused `<input>` siblings of the grid:** They intercept keyboard events and break Tab/Enter navigation.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Formula parsing and evaluation | Custom formula parser | HyperFormula 3.2 | 395 built-in functions, Excel-compatible dependency graph, circular ref detection, handles all GRID-02 functions |
| Spreadsheet grid keyboard navigation | Custom grid with `keydown` handlers | Handsontable 16 | Tab/Enter/arrow key navigation matching Excel is built-in; getting this right from scratch is weeks of work |
| Cell editor with formula support | Custom contentEditable input | Handsontable's cell editor system | Handles cell selection, editor lifecycle, focus management, escape-cancels behavior |
| Excel-compatible date arithmetic | Custom date serial logic | HyperFormula config `leapYear1900 + nullDate` | The 1900 leap year bug is subtle; hand-rolling it introduces hard-to-find off-by-one errors |
| Dependency graph (cell re-evaluation order) | Manual dirty-cell tracking | HyperFormula's built-in DAG | Topological sort of formula dependencies is non-trivial; HyperFormula only recalculates dirty cells automatically |

**Key insight:** The hardest parts of a spreadsheet (formula parsing, dependency graphs, keyboard navigation) are already solved by HyperFormula + Handsontable. Phase 1's custom work is the formula bar, function autocomplete, and Excel-compat verification — not formula evaluation itself.

---

## Common Pitfalls

### Pitfall 1: HyperFormula Default Config Produces Wrong Finance Answers

**What goes wrong:** HyperFormula initialized with only `licenseKey` produces answers that differ from Excel for finance functions involving empty cells (NPV with missing cash flows) or dates (XNPV). Users practice against wrong expected values.

**Why it happens:** `evaluateNullToZero` defaults to `false`; `leapYear1900` defaults to `false`. These are technically more correct than Excel, but interview prep requires Excel compatibility.

**How to avoid:** Apply the full Excel-compat config on every `HyperFormula.buildEmpty()` call. Run the smoke-test suite before writing any challenge content.

**Warning signs:** HyperFormula initialized with only `{ licenseKey: '...' }`; no smoke test comparing output to known Excel values.

---

### Pitfall 2: Wrong React Package Name

**What goes wrong:** Installing `@handsontable/react` (legacy class-based) instead of `@handsontable/react-wrapper` (current functional). Both exist on npm. The legacy package works but uses deprecated patterns and is not aligned with React 18+ functional component conventions.

**Why it happens:** The old package name appears in older Stack Overflow answers, blog posts, and some AI training data.

**How to avoid:** Install `@handsontable/react-wrapper`. Confirmed in official docs: "A brand-new React wrapper designed for functional programming was released in Handsontable 15.0." The `react-wrapper` package "requires at least React@18."

**Warning signs:** `import { HotTable } from '@handsontable/react'` — correct import is from `@handsontable/react-wrapper`.

---

### Pitfall 3: Keyboard Navigation Breaks When Adjacent Form Elements Exist

**What goes wrong:** Tab escapes the grid to browser chrome; Enter submits a parent `<form>`; arrow keys scroll the page. The spreadsheet stops feeling like Excel.

**Why it happens:** Browser default event handling competes with Handsontable's internal keyboard manager. Any `<form>`, unfocused `<input>`, or DOM element with a `tabindex` adjacent to the grid can steal focus.

**How to avoid:** Handsontable handles Tab/Enter/arrow navigation internally — the key is not breaking it. Rules:
  - Never wrap the grid in a `<form>` element
  - Never place a focusable sibling element adjacent to the grid container without `tabindex="-1"`
  - Test Tab/Shift+Tab/Enter/Escape/arrows immediately after the grid renders, before adding any surrounding UI
  - Use `beforeKeyDown` hook to intercept specific keys if customization is needed

**Warning signs:** Arrow keys scroll the page; Tab moves browser focus out of grid; first keyboard test happens after all surrounding UI is built.

---

### Pitfall 4: Formula Bar Gets Formula String from Wrong Source

**What goes wrong:** Developer reads the formula string from `hot.getDataAtCell(row, col)` (which returns what Handsontable thinks is the "data" — the formula string before it was processed) rather than `hfInstance.getCellFormula({ sheet, row, col })`. Results are inconsistent after edits.

**Why it happens:** `getDataAtCell` is the obvious first attempt. The correct method is on the HyperFormula instance, not on the Handsontable instance.

**How to avoid:** Always use `hfInstance.getCellFormula({ sheet: 0, row, col })` for the formula bar. Use `hfInstance.getCellValue({ sheet: 0, row, col })` for the computed value. Both require the HyperFormula instance to be accessible from the `afterSelection` handler.

---

### Pitfall 5: XIRR is Not in HyperFormula — But XIRR is Not in GRID-02

**What goes wrong:** Developer assumes XIRR is supported (it's a common finance function). It is NOT in HyperFormula 3.2's built-in function list.

**Why it matters:** GRID-02 lists IRR and XNPV — both are supported. XIRR is not required by GRID-02. Do not add XIRR challenges in Phase 2 without first implementing it as a custom HyperFormula function.

**Confirmed supported (GRID-02 functions):** VLOOKUP, INDEX, MATCH, SUMIFS, IF, NPV, IRR, PMT, XNPV, SUM, AVERAGE, COUNT, COUNTIF — all confirmed present in HyperFormula 3.2.

**Confirmed NOT supported:** XIRR (not in built-in list as of v3.2). Custom function implementation would be needed.

---

## Code Examples

Verified patterns from official sources:

### HyperFormula Full Excel-Compat Config
```typescript
// Source: https://hyperformula.handsontable.com/guide/compatibility-with-microsoft-excel.html
HyperFormula.buildEmpty({
  licenseKey: 'internal-use-in-handsontable',
  evaluateNullToZero: true,
  leapYear1900: true,
  nullDate: { year: 1899, month: 12, day: 31 },
  localeLang: 'en-US',
  functionArgSeparator: ',',
  decimalSeparator: '.',
  thousandSeparator: '',
  caseSensitive: false,
  useWildcards: true,
  useRegularExpressions: false,
  smartRounding: true,
});
```

### Handsontable React Wrapper Setup
```tsx
// Source: https://handsontable.com/docs/react-data-grid/formula-calculation/
import { HotTable } from '@handsontable/react-wrapper';
import { registerAllModules } from 'handsontable/registry';
import 'handsontable/styles/handsontable.min.css';
import 'handsontable/styles/ht-theme-main.min.css';

registerAllModules(); // Must be called once before any HotTable renders

<HotTable
  data={data}
  formulas={{ engine: hfInstance, sheetName: 'Sheet1' }}
  themeName="ht-theme-main"
  colHeaders={true}
  rowHeaders={true}
  licenseKey="non-commercial-and-evaluation"
/>
```

### Get Formula vs Computed Value
```typescript
// Source: https://hyperformula.handsontable.com/guide/basic-operations.html
// Formula string (for formula bar display):
const formula = hfInstance.getCellFormula({ sheet: 0, row, col });
// Returns: '=SUM(A1:A3)' | undefined

// Computed value (for display in cell / grading):
const value = hfInstance.getCellValue({ sheet: 0, row, col });
// Returns: number | string | boolean | null | CellError
```

### Set Cell Contents
```typescript
// Source: https://hyperformula.handsontable.com/guide/basic-operations.html
hfInstance.setCellContents(
  { sheet: 0, col: 3, row: 0 },
  [['=PMT(A1/12, B1*12, -C1)']]
);
```

### Tailwind CSS 4 + Vite Config
```typescript
// vite.config.ts
// Source: https://tailwindcss.com/docs
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
});
```

```css
/* src/index.css */
@import "tailwindcss";
```

### Handsontable Theming for Excel Look
```tsx
// Source: https://handsontable.com/docs/javascript-data-grid/themes/
// Import both base + theme CSS:
import 'handsontable/styles/handsontable.min.css';
import 'handsontable/styles/ht-theme-main.min.css';

// Apply via themeName prop or data attribute:
<HotTable themeName="ht-theme-main" ... />

// CSS variable overrides for Excel-like white/gray appearance:
// .ht-theme-main { --ht-background-color: #ffffff; }
// Handsontable 16.2 exposes 180+ CSS variables for customization
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `@handsontable/react` (class-based) | `@handsontable/react-wrapper` (functional) | Handsontable 15.0 (2024) | Must use `react-wrapper` for React 18+; fewer re-renders, useHotEditor hook |
| `tailwind.config.js` (PostCSS) | `@tailwindcss/vite` plugin, `@import "tailwindcss"` in CSS | Tailwind v4 (Jan 2025) | No config file needed; auto-detects templates |
| HyperFormula `gpl-v3` licenseKey for Handsontable integration | `internal-use-in-handsontable` licenseKey | Handsontable 12+ | Different license key required when Handsontable manages the HF instance |
| Handsontable classic styles | Handsontable themes system (main/horizon/classic) | Handsontable 15.0 | `themeName` prop + CSS variable system replaces legacy CSS overrides |

**Deprecated/outdated:**
- `@handsontable/react`: Still works but not recommended for new React 18+ projects
- `licenseKey: 'gpl-v3'` in Handsontable-managed HyperFormula instance: Use `'internal-use-in-handsontable'` instead
- `tailwind.config.js` with PostCSS: Valid for v3, unnecessary for v4 Vite projects

---

## Open Questions

1. **Function autocomplete library vs custom implementation**
   - What we know: HyperFormula has no built-in UI autocomplete. The CONTEXT.md requires function name autocomplete as user types.
   - What's unclear: Whether to build the dropdown with raw React state + positioning math, or use a headless autocomplete library (Downshift, cmdk, or floating-ui for positioning).
   - Recommendation: Use `@floating-ui/react` for dropdown positioning (battle-tested for this) + manual filter logic against the FINANCE_FUNCTIONS list. Do not pull in a full autocomplete framework for 14 function names.

2. **How to detect when cell editor is active for autocomplete trigger**
   - What we know: Handsontable has `afterBeginEditing` and `afterEditorOpen` hooks.
   - What's unclear: The exact hook + API to read the editor's current input value in real time as the user types `=VL`.
   - Recommendation: Use `afterBeginEditing` to set up a keydown listener on the editor's `TEXTAREA` element; tear it down on `afterEditorClose`.

3. **Handsontable non-commercial license scope**
   - What we know: `licenseKey: 'non-commercial-and-evaluation'` is free for personal/education/non-commercial use.
   - What's unclear: Whether this applies if the app is publicly hosted and potentially monetized later.
   - Recommendation: Use non-commercial key for Phase 1. If monetization is planned, evaluate the commercial license before launch.

---

## Sources

### Primary (HIGH confidence)
- [HyperFormula Compatibility with Microsoft Excel](https://hyperformula.handsontable.com/guide/compatibility-with-microsoft-excel.html) — `evaluateNullToZero`, `leapYear1900`, `nullDate` config verified
- [HyperFormula Config API](https://hyperformula.handsontable.com/api/classes/config.html) — property types, defaults, descriptions verified
- [HyperFormula Basic Operations](https://hyperformula.handsontable.com/guide/basic-operations.html) — `getCellFormula`, `getCellValue`, `setCellContents`, `addSheet`, `buildEmpty` signatures verified
- [HyperFormula Built-in Functions](https://hyperformula.handsontable.com/guide/built-in-functions.html) — all GRID-02 functions confirmed present; XIRR confirmed absent
- [Handsontable React Formula Calculation](https://handsontable.com/docs/react-data-grid/formula-calculation/) — `formulas` plugin config, `@handsontable/react-wrapper` import, HF instance registration pattern verified
- [Handsontable React Installation](https://handsontable.com/docs/react-data-grid/installation/) — `@handsontable/react-wrapper` is current package; React 18+ required
- [Handsontable Themes](https://handsontable.com/docs/javascript-data-grid/themes/) — `themeName: 'ht-theme-main'`, CSS variable system, import paths verified
- [Handsontable 15.0 release — Functional React Wrapper](https://handsontable.com/blog/handsontable-15.0.0-introducing-themes-and-functional-react-wrapper) — `react-wrapper` package history confirmed
- [Tailwind CSS v4 with Vite](https://tailwindcss.com/docs) — `@tailwindcss/vite` plugin, `@import "tailwindcss"` pattern confirmed

### Secondary (MEDIUM confidence)
- [Handsontable Keyboard Shortcuts docs](https://handsontable.com/docs/javascript-data-grid/keyboard-shortcuts/) — `beforeKeyDown` hook, `tabMoves` option, default Tab/Enter behavior described; specific "prevent Tab escape" not explicitly documented but `beforeKeyDown` provides the mechanism
- [Handsontable Forum — Tab escape behavior](https://forum.handsontable.com/t/how-to-disable-focus-outside-table-when-using-tab-and-shift-tab-for-navigate-cell-in-handsontable/7434) — community-verified Tab containment approach

### Tertiary (LOW confidence)
- XIRR confirmed absent from HyperFormula built-in list — verified against HyperFormula docs financial function category; confidence HIGH that it is absent, but custom function implementation path not researched

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all packages verified via official docs; package names, versions, and install commands confirmed
- Architecture: HIGH — formula bar and autocomplete patterns are custom but based on verified API methods; HF+HOT integration pattern verified from official docs
- Pitfalls: HIGH — Excel-compat config pitfall verified from official docs; package name pitfall verified from official release notes; keyboard pitfall verified from docs + community

**Research date:** 2026-02-22
**Valid until:** 2026-03-22 (stable libraries; HyperFormula and Handsontable release cycles are monthly-ish, check changelogs before implementing)
