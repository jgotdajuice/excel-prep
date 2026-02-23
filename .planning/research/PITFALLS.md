# Pitfalls Research

**Domain:** Interactive Excel interview prep web app — Vite/React/Handsontable SPA
**Researched:** 2026-02-23 (updated; original 2026-02-22)
**Confidence:** HIGH (Vercel SPA routing, HOT CSS specificity, Tailwind 4 preflight); MEDIUM (focus trap behavior, HOT v16 DOM change height impact, formula grading); LOW noted per finding

---

## v1.1 Milestone Pitfalls (Visual Polish + Vercel Deployment)

These pitfalls are specific to adding visual redesign, UX improvements, and Vercel deployment to the existing working prototype. They are distinct from the original domain pitfalls (formula grading, content scope, etc.) which are preserved below.

---

### Pitfall P1: Vercel 404 on Direct Route Access (SPA Routing)

**What goes wrong:**
Navigating directly to `/challenge`, `/drill`, `/progress`, or `/shortcuts` — or refreshing any of these routes — returns Vercel's own 404 page. React Router handles routing client-side, but Vercel is a static host and looks for a file at that path. No file exists. The problem does not appear in `vite dev` or `vite preview` and is invisible until after deployment.

**Why it happens:**
Vercel serves files from `dist/`. `/challenge` has no matching file, so Vercel 404s before React loads. BrowserRouter-based SPAs must tell Vercel to rewrite all non-asset paths to `index.html`.

**How to avoid:**
Add `vercel.json` to project root before the first deploy:
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```
Use `(.*)` form, not `/:path*` — the former is more reliable for all nested paths. Test by opening the Vercel preview URL and refreshing on a non-root route.

**Warning signs:**
- Works in `vite dev` and `vite preview` with no issues
- After Vercel deploy: Vercel's own 404 page ("404: NOT_FOUND") appears on refresh
- Any deep-linked URL shared with someone else 404s for them

**Phase to address:** Deployment phase — add `vercel.json` as the first committed file when setting up deployment, before any other deploy work.

---

### Pitfall P2: Tailwind 4 Preflight Flattening Handsontable's Base Styles

**What goes wrong:**
Tailwind 4's preflight resets `border`, `margin`, `padding`, and `box-sizing` globally on all HTML elements, including `<table>`, `<td>`, `<th>`, and `<button>`. Handsontable renders real instances of these elements inside its grid. After Tailwind's preflight fires, HOT's own theme CSS must fight the reset — and some styles lose silently: cell borders disappear, cell padding collapses, and context menu buttons lose their button appearance.

**Why it happens:**
Tailwind 4 injects preflight into the cascade at the `base` layer. HOT's CSS has no `@layer` declaration, so its specificity is determined purely by cascade order. Preflight is intentionally broad and hits real HTML elements, not HOT-specific class names.

**How to avoid:**
The project already has `.hot-container` wrappers in `index.css`. After adding Tailwind theming, add targeted CSS repair for HOT's container scope:
```css
/* In index.css, after @import "tailwindcss" */
.hot-container td,
.hot-container th,
.hot-container table {
  box-sizing: content-box; /* HOT expects content-box, not border-box */
}
```
Alternatively, import Tailwind without preflight (v4 method):
```css
/* Replace @import "tailwindcss" with: */
@import "tailwindcss/theme.css" layer(theme);
@import "tailwindcss/utilities.css" layer(utilities);
```
This removes Tailwind's normalize entirely, leaving HOT unaffected. The tradeoff is losing cross-browser normalization for the app's own elements.

**Warning signs:**
- Grid cell borders become inconsistent or disappear after adding Tailwind theme CSS
- Cell padding looks wrong (too tight or collapsed to zero)
- Right-click context menu buttons lose their visual form
- DevTools show `.hot-container td { padding: 0 }` from a Tailwind rule winning over HOT's rule

**Phase to address:** Visual redesign phase — verify HOT grid renders identically before and after any global CSS addition. Make this the first check before writing any new styles.

---

### Pitfall P3: HOT Inline Styles Override CSS Variables and Cannot Be Themed

**What goes wrong:**
Handsontable applies many styles as inline `style` attributes directly on `<td>` elements via JavaScript — not as class-based rules. CSS variable overrides on `.ht-theme-main` work for HOT's own rule-based styles, but cannot override `element.style.backgroundColor` set inline. The `answerCell` custom renderer in this project already sets `td.style.outline` directly — this is correct but means those states cannot be changed via CSS variables or class selectors.

**Why it happens:**
HOT uses inline styles for performance-critical operations (selection highlight, read-only state, active cell border). These have specificity of 1-0-0-0, beating any class or variable override. The theme system controls HOT's CSS rules only.

**How to avoid:**
- Keep using `td.style.*` in the `answerCell` renderer for per-cell visual state (correct/incorrect feedback) — this is intentional and correct
- Do NOT attempt to change those states via CSS variables or new class selectors — it will appear to work in some cell states but fail silently in others
- HOT's selection highlight (`--ht-selection-background`, `--ht-selection-border-color`) IS CSS-variable controlled — safe to customize via the existing block in `index.css`
- For any new cell visual state introduced during redesign, check HOT's DevTools first: if the style shows as `element.style { }`, it must be changed in the renderer, not in CSS

**Warning signs:**
- Added CSS rule appears in DevTools "Styles" panel but is struck through (overridden by inline style)
- Style applies on first render but reverts after HOT re-renders the cell (e.g., on selection)
- Behavior differs between normal cells and answer cells

**Phase to address:** Visual redesign phase — audit which cell visual states are CSS-variable controlled vs. inline-style controlled before writing any new theme CSS.

---

### Pitfall P4: HOT v16 DOM Wrapper Breaking Height Inheritance After Layout Refactor

**What goes wrong:**
Handsontable 16.0 (September 2025; this project uses `^16.2.0`) changed DOM mounting: the container `<div>` is now a mounting point, and HOT injects its own root `<div>` inside it. A known auto-resize regression was introduced — the `.handsontable` root no longer fills its parent without explicit CSS. The project already patches this with `index.css` rules for `.hot-container > div`, `.hot-container .ht-root-wrapper`, and `.hot-container .ht-grid`. Any redesign that adds new wrapper elements around `.hot-container` can break this height chain and make the grid collapse.

**Why it happens:**
Flex/grid height propagation requires every ancestor to have explicit height or `flex: 1`. Adding a new wrapper `<div>` during redesign (e.g., for a card border, shadow, or panel) without passing height through breaks the chain. The grid collapses to 0px or to HOT's internal default of ~150px.

**How to avoid:**
- Before adding any wrapper around the grid area, confirm it includes `display: flex; flex-direction: column; flex: 1; overflow: hidden` — never `height: auto`
- After any layout change near the grid, resize the browser window to verify the grid fills its space and does not collapse
- Verify the `.hot-container > div` selector in `index.css` still matches the actual DOM structure after any refactor
- Do a hard reload (not just a hot-module reload) when testing height, as React fast refresh can hide collapse bugs

**Warning signs:**
- Grid shows as 0px tall or ~150px (HOT's internal default)
- Grid looks correct on first load but collapses after navigating away and returning
- Browser resize corrects the height but initial render is wrong
- The grid renders correctly in dev mode but collapses in production build

**Phase to address:** Visual redesign phase — check grid height as an acceptance criterion for every layout change that touches anything between `#root` and `.hot-container`.

---

### Pitfall P5: Onboarding Overlay Stealing Focus from Handsontable Permanently

**What goes wrong:**
When a welcome/onboarding modal is dismissed, if focus is not explicitly returned to a grid cell, the browser leaves focus in a detached node or drops it to `document.body`. HOT's keyboard handling stops working: the user clicks a cell, it appears selected, but typing does nothing. HOT uses `keydown` events on its own managed element — if focus is not inside HOT's managed scope, events are not received.

**Why it happens:**
An overlay component traps focus while open (correct behavior). On close, most implementations either let focus go to `body` or return it to the element that opened the overlay. Neither is inside HOT's grid — HOT's focus model is internal and must be re-engaged explicitly.

**How to avoid:**
- On overlay dismiss, call `hotRef.current?.hotInstance?.selectCell(0, 0)` (or the first unanswered challenge cell)
- If using a focus-trap library, confirm `returnFocusOnDeactivate` is set AND the return target is a specific HOT cell, not just the container `div`
- Never use `autoFocus` on overlay inputs without a matching `onClose` focus-return handler
- Test keyboard behavior as the first action after closing the overlay: type `=SUM(` and confirm the formula bar updates and cell value changes

**Warning signs:**
- After closing the onboarding overlay, clicking a cell works (visual selection) but pressing keys does nothing
- Chrome DevTools `focus` event log shows focus going to `body` on overlay close
- HOT's formula bar stops showing cell content after overlay interaction

**Phase to address:** UX/onboarding phase — add "close overlay then type in cell with keyboard" as an explicit acceptance criterion for any overlay component.

---

### Pitfall P6: Tailwind 4 `@theme` Token Naming Collision with HOT CSS Variables

**What goes wrong:**
Tailwind 4 replaces `tailwind.config.js` with a CSS-first `@theme` directive that defines design tokens as CSS custom properties (e.g., `--color-primary: #1a6b3c`). HOT also uses CSS custom properties for its theme system (e.g., `--ht-cell-background`). If tokens are named without discipline — particularly in the `--color-*` or `--background-*` namespace — a Tailwind token can accidentally clobber a HOT variable or vice versa, depending on CSS cascade order.

**Why it happens:**
Both systems use the same CSS custom property mechanism. HOT's variables are all prefixed `--ht-*` which provides natural isolation, but Tailwind's generated CSS properties (particularly for color) use generic names that can bleed into adjacent components.

**How to avoid:**
- Keep all HOT variable overrides in `.ht-theme-main { }` scope — they are already there in `index.css`
- Prefix all custom design tokens with `--app-*` or `--brand-*` (e.g., `--app-green: #1a6b3c`) rather than `--color-green` to avoid collision with Tailwind's own generated color variables
- Define all `@theme` tokens at the top of `index.css` before HOT variable overrides so cascade order is predictable
- After adding any new `@theme` tokens, inspect `--ht-*` variables in DevTools to confirm they are unchanged

**Warning signs:**
- A design token change unexpectedly changes HOT's selection color or cell background
- HOT's CSS variable overrides appear correct in isolation but lose their value at runtime
- Browser DevTools computed styles show a `--ht-*` variable resolving to an unexpected value

**Phase to address:** Visual redesign phase (theme setup) — establish naming conventions before writing any `@theme` tokens.

---

## Original Domain Pitfalls (v1.0 — Core Functionality)

These pitfalls apply to the formula grading engine, challenge content, and progress system. They remain relevant for v1.1 since changes to challenge rendering and UI flow must not regress these behaviors.

---

### Pitfall 1: Grading Formulas by String Comparison Instead of Result Equivalence

**What goes wrong:**
The app evaluates a user's formula by checking whether their input string matches the expected answer string (`=VLOOKUP(A2,$D:$E,2,0)` vs `=VLOOKUP(A2,D:E,2,FALSE)`). Correct answers get marked wrong because string matching rejects valid syntactic variants. Users get frustrated, trust the tool less, and stop practicing.

**Why it happens:**
String comparison is the obvious first implementation. Developers treat the formula like a quiz answer: "is this the correct string?" instead of "does this produce the correct result?" The distinction only becomes painful once real users encounter it.

**How to avoid:**
Grade by executing the user's formula in HyperFormula and comparing the computed result to the expected result value. If `=VLOOKUP(A2,D:E,2,FALSE)` and `=VLOOKUP(A2,$D:$E,2,0)` both return `"Goldman Sachs"`, both are correct. Reserve string-matching only for challenges that explicitly test syntax knowledge (e.g., "type the exact function name"). Implement this in Phase 1 (grid + formula engine) before writing a single challenge.

**Warning signs:**
- First draft of grading logic uses `===` or `includes()` on the raw formula string
- Test challenges only have one plausible answer string
- No test cases covering `TRUE`/`FALSE` vs `1`/`0`, absolute vs relative references, or equivalent argument orderings

**Phase to address:** Phase 1 — Spreadsheet Grid and Formula Engine (before challenge content is written)

---

### Pitfall 2: HyperFormula Misconfiguration Produces Silent Excel-Incompatible Results

**What goes wrong:**
HyperFormula ships with defaults that do NOT match Excel behavior. Without explicit configuration, formulas that return empty evaluate differently from Excel (HyperFormula returns `null`; Excel returns `0`). Date serial numbers are off because `leapYear1900` defaults to `false`. Finance functions like `NPV`, `IRR`, `PMT` may return subtly wrong values in edge cases. Users doing finance interview prep will practice against wrong answers — the worst possible outcome.

**Why it happens:**
HyperFormula's defaults are technically more correct than Excel, but Excel behavior is what interview candidates must match. Developers initialize HyperFormula with no options and it "works," so the misconfiguration is invisible until a specific formula exposes it.

**How to avoid:**
Initialize HyperFormula with Excel-compatibility flags from day one:
```js
HyperFormula.buildEmpty({
  licenseKey: 'gpl-v3',
  evaluateNullToZero: true,   // matches Excel empty-formula behavior
  leapYear1900: true,          // matches Excel's documented 1900 bug
  // locale/separator settings to match en-US Excel
})
```
Write a smoke-test suite of known Excel outputs (NPV, IRR, PMT, VLOOKUP, IF with nested logic) and assert HyperFormula produces identical results before using the engine in any challenge.

**Warning signs:**
- HyperFormula initialized with only `licenseKey`
- No test comparing HyperFormula output to a known Excel result for each finance function covered
- Date-based challenges produce results off by one day

**Phase to address:** Phase 1 — Spreadsheet Grid and Formula Engine

---

### Pitfall 3: Keyboard Navigation Conflicts Break Spreadsheet Feel

**What goes wrong:**
Tab, Enter, Escape, and arrow keys in a browser have default behaviors (Tab moves DOM focus, Escape dismisses things). A spreadsheet must intercept these to navigate cells. If not handled correctly, pressing Tab in a cell editor jumps focus out of the grid entirely, Enter submits a parent form, and arrow keys scroll the page instead of moving between cells. The result feels nothing like Excel and breaks the core learning loop.

**Why it happens:**
Browser keyboard defaults are hostile to spreadsheet UX. Libraries like Handsontable handle this internally, but only when their component is correctly mounted and focused. Custom cell editors or additional input fields placed inside or adjacent to the grid often break the focus trap.

**How to avoid:**
- Use Handsontable (or equivalent mature library) rather than building keyboard navigation from scratch
- Do not place any `<form>` or `<input>` elements that are siblings of the grid — they compete for keyboard events
- Test Tab, Shift+Tab, Enter, Escape, and all four arrow keys on first grid implementation, before adding any challenge UI around it
- Never rely on `keydown` on `document` — bind handlers to the grid container and use `stopPropagation` deliberately

**Warning signs:**
- Tab key exits the grid to the browser's next focusable element
- Arrow keys scroll the page when a cell is selected but not in edit mode
- Pressing Enter in the formula bar navigates the browser (a parent form exists)
- First keyboard test is done after challenge UI is already layered on top of the grid

**Phase to address:** Phase 1 — Spreadsheet Grid and Formula Engine (keyboard test before any surrounding UI is built)

---

### Pitfall 4: Overcrowded Challenge Scope — Teaching Everything, Drilling Nothing

**What goes wrong:**
The challenge system tries to cover 30+ finance functions across multiple difficulty levels, scenario types, and financial domains (IB, FP&A, accounting). Content creation becomes the bottleneck. The learning path is shallow across many topics instead of deep on the 10 functions that actually appear in 80% of finance interviews. A user who finishes the tool is still not interview-ready on the functions that matter most.

**Why it happens:**
The full list of relevant Excel functions is long. Developers (and subject matter experts) want to be comprehensive. Scope creep in content is harder to notice than scope creep in features — it looks like "adding more value."

**How to avoid:**
Define the canonical priority-ranked function list in Phase 1 and freeze it. Based on finance interview content research, the tier-1 list should be: `VLOOKUP`, `INDEX/MATCH`, `SUMIFS`, `IF` (including nested), `IFERROR`, `NPV`, `IRR`, `PMT`, `OFFSET`, `XLOOKUP`. Build 5+ challenges per function at tier-1 before adding any tier-2 function. Gate tier-2 content behind a milestone (e.g., "80% pass rate on tier-1").

**Warning signs:**
- Content spreadsheet has 25+ functions listed before the first challenge is built
- Each function has only 1-2 challenges
- There is no "most important" sorting on the function list
- First usable session covers so many topics it has no clear learning objective

**Phase to address:** Phase 1 (content scoping), Phase 2 (challenge content)

---

### Pitfall 5: Progress Tracking That Doesn't Survive Reality (Lost or Meaningless Data)

**What goes wrong:**
Two failure modes exist. First: progress stored only in-memory resets on every page refresh, making session continuity impossible. Second: progress is persisted to localStorage but tracked at the wrong granularity (e.g., "completed VLOOKUP module" rather than "80% first-attempt correct on VLOOKUP exact-match challenges") — so the data cannot surface weak areas or drive a useful "what to study next" recommendation.

**Why it happens:**
In-memory is the easiest first pass. localStorage persistence is added later but the data schema designed for "did they finish it" not "where do they struggle." Retrofitting a meaningful schema onto persisted data after content exists is a moderate rewrite.

**How to avoid:**
Design the progress data schema before writing the first challenge. Minimum schema per attempt:
```json
{
  "challengeId": "vlookup-exact-match-01",
  "functionTags": ["VLOOKUP"],
  "difficulty": "beginner",
  "attemptedAt": "2026-02-22T10:00:00Z",
  "firstAttemptCorrect": true,
  "attemptsBeforeCorrect": 1
}
```
Persist to localStorage on every attempt completion. Derive "weak areas" from `firstAttemptCorrect` rate per `functionTags`. Do this in Phase 2 (progress tracking), not as an afterthought in a later phase.

**Warning signs:**
- Progress data is a simple `Set` of completed challenge IDs
- No timestamp on attempt records (prevents recency-weighted analysis)
- "Weak areas" feature is deferred because the data doesn't support it yet
- Page refresh during a session resets visible progress state

**Phase to address:** Phase 2 — Challenge System and Progress Tracking

---

### Pitfall 6: HyperFormula's Circular Reference Detection Rejects Valid IF Branches

**What goes wrong:**
HyperFormula flags circular references even when only one branch of an `IF` formula would create a cycle, not both. This is documented behavior that differs from Excel. A challenge involving conditional self-reference (uncommon but not impossible in finance modeling) will return `#CYCLE!` in the browser while returning a valid result in Excel.

**How to avoid:**
Do not build challenges involving any self-referential cell patterns, even conditionally guarded ones. Review all challenge formulas in HyperFormula before publishing — if `#CYCLE!` appears where Excel would not, remove or rewrite the challenge. (MEDIUM confidence — based on official HyperFormula known-limitations docs.)

**Phase to address:** Phase 2 — Challenge content review

---

### Pitfall 7: Gamification Mechanics That Reward Speed Over Accuracy

**What goes wrong:**
Points, streaks, or timers that reward completing challenges quickly encourage guessing. Research shows engagement metrics (challenges completed, streak maintained) can be high while actual retention remains low. A user can finish all challenges, feel accomplished, and still fail the Excel portion of their interview.

**How to avoid:**
Tie visible progress indicators to first-attempt accuracy rate, not completion count. Show "X% correct on first try" rather than "X challenges done." If a timer is added for drill mode, make it visible but not a scoring factor — it trains speed awareness without penalizing careful users. (MEDIUM confidence — supported by multiple edtech sources.)

**Phase to address:** Phase 2 — Challenge system design, Phase 3 — Progress display

---

### Pitfall 8: Custom Cell Rendering Breaks Copy-Paste From Real Excel

**What goes wrong:**
If the spreadsheet grid uses custom cell types or non-standard rendering, pasting real Excel content (e.g., a financial model snippet) produces garbage or errors. Users who want to paste their own practice data from a real Excel file cannot.

**How to avoid:**
For MVP scope, disable paste-from-Excel as a supported flow entirely rather than supporting it partially. Set expectations clearly in the UI ("build formulas from scratch in this grid"). Do not invest in clipboard parsing. Avoid the half-broken middle state. (LOW confidence — based on known complexity of Excel clipboard format, not verified against library docs.)

**Phase to address:** Phase 1 — Grid setup decisions

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| String-match formula grading | Fast to implement | Rejects semantically correct answers, destroys user trust | Never — implement result-comparison from day one |
| Single hardcoded grid size (e.g., 10x10) | Simpler render setup | Challenges that need more rows/columns require a rewrite | Only in very first proof-of-concept, replace before any real challenges |
| Storing progress as flat `Set` of completed IDs | Trivial to write | Cannot derive weak areas, attempt count, recency; requires schema migration | Never for this app — schema matters from the first attempt stored |
| Inlining challenge data as JS constants | Fast to add challenges | No dynamic loading, bundle grows with every challenge, no CMS workflow | Acceptable for MVP (<50 challenges), refactor before content scales |
| HyperFormula default config (no Excel-compat flags) | Zero setup | Silent numeric discrepancies in finance functions | Never — set `evaluateNullToZero: true` and `leapYear1900: true` on init |
| Style HOT cells with `!important` in global CSS | Quick visual override without touching renderers | Creates an arms race; breaks when HOT updates CSS structure; masks the correct approach (renderer-based styling) | Never — use custom renderers instead |
| Use Tailwind utility classes directly on HOT wrapper elements | Fast iteration on layout | Preflight conflicts compound; hard to debug which layer is winning | Acceptable for layout wrappers (flex, padding outside the grid), never for styles that touch HOT internals |

---

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| HyperFormula + Handsontable | Treating them as one unified library; they are separate packages with their own release cycles | Install and configure both independently; consult HyperFormula's integration-with-handsontable guide explicitly |
| HyperFormula in React | Passing HyperFormula instance directly into reactive state; React may proxy it, breaking the engine | Store outside component state (`useRef` or module-level var) — already correct in this project's `SpreadsheetGrid.tsx` |
| localStorage progress | Writing raw JS objects without `JSON.stringify`/`JSON.parse`; storing data without version key | Always version the stored schema (`v: 1`) so future schema changes can migrate or reset cleanly |
| Handsontable + Tailwind 4 | Apply Tailwind utility classes to `<HotTable>` component directly | Wrap HOT in a `div` with Tailwind classes; never apply Tailwind to HOT's own rendered elements |
| Handsontable + CSS variables | Override `--ht-*` variables at the wrong scope (e.g., on `:root` instead of `.ht-theme-main`) | Scope all `--ht-*` overrides to `.ht-theme-main` selector as already done in `index.css` |
| Handsontable + React Router | HyperFormula singleton persists across route navigation, causing "sheet already exists" errors | Already handled with `useEffect` cleanup on unmount in `SpreadsheetGrid.tsx` — do not remove this during refactoring |
| Vite + Vercel | Assuming dev-server behavior matches Vercel's static hosting | Test with `vite build && vite preview` before claiming deployment-ready; add `vercel.json` before first push |
| Tailwind 4 `@theme` tokens + HOT CSS variables | Both use CSS custom properties — naming them similarly causes confusion | Keep HOT variables prefixed `--ht-*`; keep app design tokens prefixed `--app-*` or `--brand-*` |

---

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Re-evaluating all cells on every keystroke | Lag while typing a formula in larger grids | Use HyperFormula's built-in dependency graph; it recalculates only dirty cells — don't force full sheet recalc manually | Noticeable at ~50+ cells with inter-cell dependencies |
| Storing all attempt history in one localStorage key | Slow JSON parse on page load as history grows | Split storage: config/metadata in one key, attempt log in another keyed by function tag | After ~500 stored attempts |
| Rendering all challenges in the DOM at once | Slow initial load, especially if challenges include grid snapshots | Lazy-load challenge data; only load the active challenge + prefetch next | After ~30 challenges with associated grid state |
| Triggering HOT `render()` call on every CSS class change | Grid flickers on every state update; excessive repaints | Keep `hot.render()` calls in effects that only fire when `cellGrades` or `isLocked` truly change (already correct in current code) | Any new state variable added that inadvertently ends up in `useEffect` deps alongside `hot.render()` |
| Animating the HOT container with CSS transitions | Grid width/height transitions cause HOT to compute layout mid-animation, producing misaligned columns | Never animate the HOT container dimensions; animate sibling/parent panels only | Immediately on first animated resize |

---

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Showing "Wrong" with no explanation | User knows they failed but not why; cannot self-correct; disengages | Always show the correct formula, a plain-English explanation of why it works, and what their formula did differently |
| Drilling functions in alphabetical or random order | No pedagogical progression; beginners hit NPV/IRR before understanding IF | Enforce a learning path: IF → VLOOKUP → INDEX/MATCH → SUMIFS → financial functions (NPV/IRR/PMT). Gate harder challenges until precursor functions reach 70%+ accuracy |
| Wall-of-text challenge prompts rendered with `white-space: pre-wrap` only | Dense scenario text is intimidating; user skips reading it | Parse prompts into semantic sections: scenario context, task instruction, expected output — use structured JSX not raw text |
| Progress bar that only shows session progress (resets on refresh) | Users feel they're not making progress between sessions | Ensure progress bar draws from persisted Zustand store, not local component state |
| Color-only feedback (green/red cell outlines) for correct/incorrect answers | Inaccessible to colorblind users; confusing without instructions | Add icon or text label alongside the color indicator: "Correct" / "Try again" text in the feedback section |
| Onboarding that doesn't explain the keyboard-first nature of HOT | New users try to click-then-type; get confused when Enter doesn't commit | Onboarding must say "Type formula, press Enter to submit" with a visual demo or animation |
| Redesign that changes nav layout without updating keyboard tab order | Power users relying on Tab to navigate between UI sections get disoriented | After redesign, tab through the entire app manually to confirm focus order matches visual order |

---

## "Looks Done But Isn't" Checklist

- [ ] **Vercel deployment:** `vercel.json` rewrite rule present — verify by refreshing `/challenge`, `/drill`, `/progress` directly on the deployed URL
- [ ] **HOT grid height:** After any layout change, confirm grid fills its container by resizing the browser window to a narrow viewport and back; do a hard reload (not hot reload)
- [ ] **Tailwind preflight conflict:** After adding any new global CSS, open HOT grid and verify cell borders, cell padding, and context menu still render correctly
- [ ] **Onboarding dismiss:** After closing the welcome/onboarding overlay, immediately type `=SUM(` with keyboard only — confirm formula bar updates and no keys are silently dropped
- [ ] **HOT CSS variable scope:** All `--ht-*` overrides are scoped to `.ht-theme-main`, not `:root` — verify in DevTools computed styles
- [ ] **HyperFormula cleanup:** Navigate to a challenge, then navigate away and back — confirm no "sheet already exists" console error
- [ ] **Progress persists:** Reload the page mid-challenge-set and confirm completed challenges still show as complete
- [ ] **Production build:** Run `npm run build` without TypeScript errors before claiming deploy-ready (`tsc -b && vite build`)
- [ ] **Formula grading:** Verify semantically equivalent formulas (e.g., `=IF(B2>0,1,0)` vs `=IF(B2>0,TRUE,FALSE)` for a challenge expecting boolean) both grade as correct
- [ ] **HyperFormula config:** Confirm `evaluateNullToZero` and `leapYear1900` are set in the engine initializer
- [ ] **Keyboard navigation in grid:** Tab/Enter/Escape/arrow keys behave like Excel; Tab does NOT escape to browser chrome

---

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Vercel 404 on routes | LOW | Add `vercel.json` with rewrite rule, redeploy (< 5 minutes) |
| Tailwind preflight broke HOT borders | MEDIUM | Add targeted CSS reset rules in `.hot-container` scope; inspect DevTools computed styles on each affected HOT element to identify the exact property being clobbered |
| HOT height collapse after layout refactor | MEDIUM | Trace the flex/height chain from `#root` down to `.hot-container`; add `height: 100%; overflow: hidden` to each new wrapper in the chain |
| Focus not returning to HOT after overlay close | LOW | Add explicit `hotRef.current?.hotInstance?.selectCell(0, 0)` call in the overlay's `onClose` handler |
| Inline style override war with HOT renderers | HIGH | If `!important` overrides have accumulated trying to style HOT cells, stop and rewrite as a custom renderer — there is no recovery other than doing it correctly |
| HyperFormula "sheet already exists" after refactor removed cleanup effect | MEDIUM | Restore the `useEffect` cleanup that calls `hfInstance.removeSheet()` on unmount — this already exists in `SpreadsheetGrid.tsx` and must not be removed |
| String-match grading shipped | HIGH | Audit all challenges to document all valid formula variants; replace string comparison with result-value comparison; re-test every challenge |
| HyperFormula bad config shipped | MEDIUM | Add config flags in one line; re-run smoke tests; identify any challenges whose "correct" answer was calibrated against wrong HyperFormula output and fix expected values |

---

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Vercel SPA 404 on route refresh | Deployment setup (first task) | Refresh `/challenge` and `/drill` on deployed URL directly |
| Tailwind preflight vs HOT base styles | Visual redesign (first CSS change) | Inspect HOT grid borders and cell padding in DevTools after adding global theme |
| HOT inline styles override CSS specificity | Visual redesign (before adding cell state styles) | Attempt to override answer cell outline via CSS; confirm renderer approach is used instead |
| HOT v16 DOM wrapper height collapse | Visual redesign (any layout change near grid) | Resize browser window; navigate away and back to HOT routes |
| Onboarding overlay stealing HOT focus | UX/onboarding phase | Close overlay then type formula with keyboard only |
| Tailwind `@theme` naming vs HOT variable names | Visual redesign (theme setup, first day) | Inspect `--ht-*` variables in DevTools after adding any new `@theme` tokens |
| String-match formula grading | Phase 1 — Grid and formula engine | Grading unit tests: semantically equivalent formulas produce "Correct" |
| HyperFormula misconfiguration | Phase 1 — Grid and formula engine | Smoke-test suite: known Excel outputs match HyperFormula output for all 10 tier-1 functions |
| Keyboard navigation conflicts | Phase 1 — Grid and formula engine | Manual test: Tab/Enter/Escape/arrows behave like Excel inside the grid |
| Progress tracking schema | Phase 2 — Challenge system and progress | Schema document written before first challenge stores data; attempt records include function tags and timestamps |
| Gamification rewarding speed over accuracy | Phase 2 — Challenge system design | No timer-based scoring; visible metric is first-attempt accuracy rate |

---

## Sources

**v1.1 Polish & Deploy pitfalls:**
- [Vercel KB: Why is my deployed project giving 404?](https://vercel.com/kb/guide/why-is-my-deployed-project-giving-404) — HIGH confidence
- [Fixing Routing Issues in Vite React App on Vercel — DEV Community](https://dev.to/pwnkdm/fixing-routing-issues-in-vite-react-app-on-vercel-1o49) — HIGH confidence
- [Handsontable: Theme Customization (React)](https://handsontable.com/docs/react-data-grid/theme-customization/) — HIGH confidence
- [Handsontable: Migrating from 15.3 to 16.0](https://handsontable.com/docs/javascript-data-grid/migration-from-15.3-to-16.0/) — HIGH confidence
- [Handsontable 16 auto-resize broken forum report](https://forum.handsontable.com/t/auto-resize-broken-in-version-16/8890) — MEDIUM confidence
- [Tailwind CSS v4 preflight disable — GitHub Issue #15723](https://github.com/tailwindlabs/tailwindcss/issues/15723) — HIGH confidence
- [Tailwind CSS v4 migration guide (DesignRevision)](https://designrevision.com/blog/tailwind-4-migration) — MEDIUM confidence
- [Focus trap accessibility for React modals — DEV Community](https://dev.to/colettewilson/how-i-approach-keyboard-accessibility-for-modals-in-react-152p) — MEDIUM confidence
- [Handsontable CSS styles overwrite forum thread](https://forum.handsontable.com/t/css-styles-overwrite/1889) — MEDIUM confidence
- Project codebase: `/Users/jam/excel-prep/src/index.css`, `/Users/jam/excel-prep/src/components/SpreadsheetGrid.tsx`

**Original domain pitfalls:**
- HyperFormula Known Limitations: https://hyperformula.handsontable.com/guide/known-limitations.html — HIGH confidence
- HyperFormula Compatibility with Microsoft Excel: https://hyperformula.handsontable.com/guide/compatibility-with-microsoft-excel.html — HIGH confidence
- Finance Excel interview function priorities: fintest.io, wallstreetmojo.com, chandoo.org — MEDIUM confidence
- NL2Formula paper (exact match vs. execution result grading): https://arxiv.org/html/2402.14853v1 — MEDIUM confidence

---

*Pitfalls research for: Vite + React + Handsontable SPA — interactive Excel interview prep*
*Researched: 2026-02-23 (updated from 2026-02-22)*
