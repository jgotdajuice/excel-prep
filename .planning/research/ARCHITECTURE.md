# Architecture Research

**Domain:** React SPA visual redesign + Vercel deployment (v1.1 milestone)
**Researched:** 2026-02-23
**Confidence:** HIGH

## Standard Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Browser (Vite SPA)                       │
├────────────────────────────────┬────────────────────────────┤
│         Pages Layer            │      Shared Shell           │
│  ┌──────────┐  ┌──────────┐   │  ┌──────────────────────┐  │
│  │ Welcome  │  │Challenge │   │  │     AppShell          │  │
│  │  Page    │  │  Page    │   │  │  (header + sidebar)   │  │
│  └──────────┘  └──────────┘   │  └──────────────────────┘  │
│  ┌──────────┐  ┌──────────┐   │                            │
│  │  Drill   │  │Shortcuts │   │  ┌──────────────────────┐  │
│  │  Page    │  │  Page    │   │  │   Design Tokens       │  │
│  └──────────┘  └──────────┘   │  │   (index.css @theme)  │  │
│  ┌──────────┐                 │  └──────────────────────┘  │
│  │Progress  │                 │                            │
│  │  Page    │                 │                            │
│  └──────────┘                 │                            │
├────────────────────────────────┴────────────────────────────┤
│                   Component Layer                            │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │AppShell  │  │Spreadsh. │  │RightPanel│  │ChalList  │   │
│  │(inline)  │  │Grid      │  │(CSS cls) │  │(CSS cls) │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
├─────────────────────────────────────────────────────────────┤
│                     State Layer (Zustand)                    │
│  ┌──────────────┐  ┌───────────────┐  ┌─────────────────┐  │
│  │challengeStore│  │  drillStore   │  │  shortcutStore  │  │
│  └──────────────┘  └───────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Current Styling |
|-----------|----------------|-----------------|
| `AppShell` | Header + sidebar nav frame | 100% inline styles |
| `WelcomePage` | Landing / CTA screen | 100% inline styles |
| `ChallengePage` | Orchestrates spreadsheet + panels | CSS class names from index.css |
| `DrillPage` | Rapid-fire drill (idle/active/review) | 100% inline styles, dark bg |
| `ShortcutsPage` | Wrapper for shortcut sub-components | Inline styles |
| `ShortcutSetup` | Drill config UI | 100% inline styles |
| `ProgressPage` | Stats + accuracy bars | 100% inline styles |
| `RightPanel` | Challenge prompt + feedback | CSS classes from index.css |
| `ChallengeList` | Sidebar list of challenges | CSS classes from index.css |
| `TierTabs` | Beginner/Intermediate/Advanced tabs | CSS classes from index.css |
| `CompletionScreen` | End-of-tier celebration | CSS classes from index.css |

## Current Styling Audit

### Split Between Two Systems

The codebase has two parallel styling systems that need to be reconciled during the redesign.

**System A — CSS class names in `src/index.css`** (used by ChallengePage and its sub-components):
- `.challenge-page`, `.challenge-sidebar`, `.challenge-grid-area`
- `.tier-tab`, `.tier-tab--active`, `.tier-tab--locked`
- `.challenge-list`, `.challenge-list-item`
- `.right-panel`, `.feedback-correct`, `.feedback-incorrect`
- `.btn`, `.btn-next`, `.btn-skip`, `.btn-hint`, `.btn-retry`
- `.completion-screen`, `.completion-card`, `.completion-stat-value`

**System B — Inline `style={{}}` props** (used by all other pages/components):
- `AppShell` — entire header and sidebar
- `WelcomePage` — entire page and all buttons
- `DrillPage` — entire page in all three phases (idle, active, review)
- `ProgressPage` — entire page, stat cards, accuracy bars
- `ShortcutsPage` / `ShortcutSetup` — container and all form controls

**Color tokens already in use** (hardcoded, not centralized):
- `#1a6b3c` — Excel green primary (buttons, active states, progress bars)
- `#1a3a2a` — Excel green dark (headings, sidebar header, active nav)
- `#f0f4f8` / `#f9fafb` — Page background grays
- `#e8f5ee` — Light green tint (correct feedback, active list item)
- `#111827` — Dark card background (DrillPage only)

## Recommended Project Structure

```
src/
├── index.css                       # MODIFIED: Add @theme tokens; remove CSS classes
│                                   #   as components migrate; keep Handsontable overrides
├── components/
│   ├── AppShell.tsx                # MODIFIED: Convert inline → Tailwind
│   ├── ui/                         # NEW: Shared primitive components
│   │   ├── Button.tsx              # Primary/secondary/ghost/danger variants
│   │   ├── Card.tsx                # White surface with optional border/shadow
│   │   └── StatCard.tsx            # Metric display (value + label)
│   ├── ChallengeList.tsx           # MODIFIED: CSS classes → Tailwind
│   ├── TierTabs.tsx                # MODIFIED: CSS classes → Tailwind
│   ├── RightPanel.tsx              # MODIFIED: CSS classes → Tailwind
│   └── CompletionScreen.tsx        # MODIFIED: CSS classes → Tailwind
├── pages/
│   ├── WelcomePage.tsx             # MODIFIED: Inline → Tailwind, use Button
│   ├── DrillPage.tsx               # MODIFIED: Inline → Tailwind (keep dark card)
│   ├── ProgressPage.tsx            # MODIFIED: Inline → Tailwind, keep dynamic widths
│   ├── ShortcutsPage.tsx           # MODIFIED: Inline → Tailwind wrapper
│   └── ChallengePage.tsx           # MINOR: Trim now-redundant class names
├── components/shortcuts/
│   └── ShortcutSetup.tsx           # MODIFIED: Inline → Tailwind, use Button
└── ...
vercel.json                         # NEW: SPA routing fallback
```

### Structure Rationale

- **`ui/` folder:** Shared primitives (`Button`, `Card`, `StatCard`) eliminate re-implementing the same visual pattern inline across multiple pages. New files — no existing component deleted.
- **No `styles/` folder:** All design tokens live in `index.css` via Tailwind v4's `@theme`. No need for CSS modules or a separate token file.
- **Pages modified, not replaced:** Logic, state wiring, and store connections stay intact. Only JSX markup changes from `style={{}}` to `className`.

## Architectural Patterns

### Pattern 1: Tailwind v4 `@theme` for Design Tokens

**What:** Define the project's color palette once in `index.css` using the `@theme` directive. Tailwind v4 converts these into CSS custom properties AND generates utility classes automatically.

**When to use:** Any value that needs to appear in utility classes (`bg-`, `text-`, `border-`). Do NOT use `@theme` for one-off layout values (a specific pixel offset used only once — keep those inline or in a custom class).

**Trade-offs:** Single source of truth for colors; eliminates scattered hardcoded hex values across 10+ files. Requires Tailwind v4 — already installed via `@tailwindcss/vite`.

**Example:**
```css
/* src/index.css */
@import "tailwindcss";

@theme {
  --color-brand:       #1a6b3c;  /* Excel green — primary actions */
  --color-brand-dark:  #1a3a2a;  /* Excel dark green — headings, nav */
  --color-brand-light: #e8f5ee;  /* Light green tint — active states */
  --color-surface:     #ffffff;  /* Card / panel background */
  --color-base:        #f9fafb;  /* Page background */
  --color-border:      #e5e7eb;  /* Default border */
  --color-muted:       #6b7280;  /* Subdued text */
}
```

After this, `bg-brand`, `text-brand-dark`, `border-border` etc. are valid utility classes throughout the entire app. [HIGH confidence — official Tailwind v4 docs](https://tailwindcss.com/docs/theme)

### Pattern 2: Convert Inline Styles — Shell First, Pages Second

**What:** Convert inline `style={{}}` to Tailwind utility classes, starting with the outermost shared component (`AppShell`) then moving to pages. Order matters: do `AppShell` first so all pages inherit the new shell before touching page-specific styling.

**When to use:** Any component participating in the redesign. Components used only inside ChallengePage (System A) are migrated last in a separate phase.

**Trade-offs:** Tailwind utilities are more scannable and purgeable than inline styles. However, for dynamic values computed from state (e.g., `width: widthPct` in `ProgressPage`'s accuracy bars, `color: isUrgent ? '#ef4444' : '#ffffff'` in `DrillPage`), inline styles remain correct — Tailwind cannot generate arbitrary values at runtime.

**Example — converting AppShell header:**
```tsx
// Before (current state)
<header style={{ height: '48px', backgroundColor: '#1a3a2a', display: 'flex',
  alignItems: 'center', padding: '0 16px', flexShrink: 0, boxShadow: '0 1px 4px rgba(0,0,0,0.3)' }}>

// After
<header className="h-12 bg-brand-dark flex items-center px-4 shrink-0 shadow-sm">
```

**Keep inline styles when:**
- Value is computed from JavaScript state at runtime (`widthPct`, `isUrgent`, toggled colors)
- Value is a Handsontable CSS variable override (already in index.css — leave it)
- Value is a one-off that will never be reused and is not a design token

### Pattern 3: Shared Button Primitive

**What:** Extract a `Button` component in `src/components/ui/Button.tsx` that accepts a `variant` prop (`primary | secondary | ghost | danger`). Use it everywhere a clickable button appears.

**When to use:** Immediately as part of foundation step. There are at least 15 distinct button implementations across WelcomePage, DrillPage, ProgressPage, ShortcutSetup, RightPanel, and CompletionScreen — all sharing the same hover/focus pattern but with inconsistent padding and border-radius values.

**Trade-offs:** One file to update when button style changes. The props API adds a small layer of indirection but eliminates the risk of inconsistent button styles across pages.

**Example:**
```tsx
// src/components/ui/Button.tsx
import { clsx } from 'clsx';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

const variantClasses: Record<Variant, string> = {
  primary:   'bg-brand text-white hover:bg-brand-dark',
  secondary: 'bg-brand-light text-brand-dark border border-brand',
  ghost:     'bg-transparent text-muted border border-border hover:bg-base',
  danger:    'bg-red-600 text-white hover:bg-red-700',
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

export function Button({ variant = 'primary', className, ...props }: ButtonProps) {
  return (
    <button
      className={clsx(
        'px-4 py-2 text-sm font-semibold rounded-md transition-colors cursor-pointer',
        variantClasses[variant],
        className
      )}
      {...props}
    />
  );
}
```

Note: `clsx` is already in `package.json` (`^2.1.1`) and `tailwind-merge` is also available for conflict resolution.

### Pattern 4: Vercel SPA Routing via `vercel.json` Rewrite

**What:** A single `vercel.json` at the project root that rewrites all paths to `index.html`, letting React Router handle routing client-side.

**When to use:** Required for any Vite SPA deployed to Vercel that uses client-side routing (React Router). Without it, direct navigation to `/challenge` or `/progress` returns a Vercel 404 because no static file exists at those paths.

**Trade-offs:** Zero overhead. Vercel serves actual static files (JS/CSS in `dist/assets/`) before the rewrite rule fires. The rewrite only activates for path-only requests.

**Example:**
```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

[HIGH confidence — Vercel official docs](https://vercel.com/docs/rewrites) + community confirmation.

## Data Flow

### Styling Data Flow (new for v1.1)

```
src/index.css (@theme tokens)
    ↓ Tailwind v4 processes at build time
CSS custom properties (--color-brand: #1a6b3c)
  + utility classes (bg-brand, text-brand-dark, etc.)
    ↓
Component className props
    ↓
Browser computed styles
```

```
JavaScript state (isUrgent, widthPct, activeColor)
    ↓ Runtime evaluation only
Inline style={{}} (dynamic, runtime-computed values)
    ↓
Browser computed styles
```

### Application State Flow (unchanged)

```
User Action (click/type/keypress)
    ↓
Page component (WelcomePage, DrillPage, etc.)
    ↓
Zustand store action (startSession, submitAnswer, gradeCellAction)
    ↓
Store state update
    ↓
React re-render → component reads new state via selector
```

The redesign does not touch stores, selectors, engines, or data files. Only JSX markup and className/style attributes change.

### Key Data Flows

1. **Theme token to utility class:** `@theme { --color-brand: #1a6b3c }` at CSS build time → `bg-brand` available in all component className props
2. **Dynamic style:** `accuracy * 100 + '%'` stays as `style={{ width: widthPct }}` — Tailwind cannot generate arbitrary runtime values

## Build Order for Redesign

Follow this sequence to maintain visual consistency and avoid regressions:

**Phase 1 — Foundation (non-breaking, do first)**

1. Add `@theme` token block to `src/index.css` — non-breaking, just adds CSS variables
2. Create `vercel.json` at project root
3. Update `<title>` in `index.html` from "excel-prep-scaffold" to "ExcelPrep"
4. Create `src/components/ui/Button.tsx` — new file, nothing uses it yet
5. Create `src/components/ui/Card.tsx` — new file, nothing uses it yet
6. Create `src/components/ui/StatCard.tsx` — new file, nothing uses it yet

**Phase 2 — Shell (all pages immediately inherit the new frame)**

7. Restyle `AppShell.tsx` — header background, sidebar, nav link styles, active indicator
8. Verify all 5 routes still render correctly with the new shell

**Phase 3 — Pages (one at a time, test each before moving on)**

9. `WelcomePage.tsx` — hero card, headline, CTA buttons (use new `Button` component)
10. `ProgressPage.tsx` — stat cards (use `Card`/`StatCard`), accuracy bars (keep inline width)
11. `ShortcutsPage.tsx` wrapper + `ShortcutSetup.tsx` — form controls and buttons
12. `DrillPage.tsx` — keep dark card aesthetic but use brand token colors where possible

**Phase 4 — Challenge sub-components (migrate CSS class system)**

13. `ChallengeList.tsx` — convert class names to Tailwind utilities
14. `TierTabs.tsx` — convert class names to Tailwind utilities
15. `RightPanel.tsx` — convert class names to Tailwind utilities
16. `CompletionScreen.tsx` — convert class names to Tailwind utilities
17. After each component: remove its CSS class definitions from `index.css`
18. Keep Handsontable CSS variable block in `index.css` permanently — do not remove

## Files Modified vs Created

| File | Action | Scope of Change |
|------|--------|-----------------|
| `src/index.css` | MODIFY | Add `@theme` block; remove CSS classes progressively as components migrate; Handsontable overrides stay |
| `index.html` | MODIFY | `<title>` tag only |
| `src/components/AppShell.tsx` | MODIFY | Replace all `style={{}}` with Tailwind className |
| `src/pages/WelcomePage.tsx` | MODIFY | Replace all `style={{}}`, use `Button` component |
| `src/pages/ProgressPage.tsx` | MODIFY | Replace layout/card `style={{}}`, keep dynamic width as inline |
| `src/pages/DrillPage.tsx` | MODIFY | Replace `style={{}}`, keep dark-card aesthetic via tokens |
| `src/pages/ShortcutsPage.tsx` | MODIFY | Replace `style={{}}` wrapper |
| `src/components/shortcuts/ShortcutSetup.tsx` | MODIFY | Replace `style={{}}`, use `Button` |
| `src/components/ChallengeList.tsx` | MODIFY | CSS class names → Tailwind utility classes |
| `src/components/TierTabs.tsx` | MODIFY | CSS class names → Tailwind utility classes |
| `src/components/RightPanel.tsx` | MODIFY | CSS class names → Tailwind utility classes |
| `src/components/CompletionScreen.tsx` | MODIFY | CSS class names → Tailwind utility classes |
| `src/components/ui/Button.tsx` | CREATE | New shared primitive |
| `src/components/ui/Card.tsx` | CREATE | New shared primitive |
| `src/components/ui/StatCard.tsx` | CREATE | New shared primitive |
| `vercel.json` | CREATE | SPA routing fallback |

## Vercel Deployment Configuration

### vercel.json (required)

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

Placement: project root (`/Users/jam/excel-prep/vercel.json`), same level as `package.json`.

The rule catches all paths that don't resolve to a static file. Vercel always serves actual files in `dist/` first (JS bundles, CSS, SVG), so assets are never affected by the rewrite.

### vite.config.ts (no changes needed)

The current config is complete for Vercel:

```ts
export default defineConfig({
  plugins: [react(), tailwindcss()],
});
```

Vite outputs to `dist/` by default. Vercel auto-detects Vite projects and sets output directory to `dist`. No `base` path configuration is required.

### Vercel auto-detected settings

- Build command: `npm run build` (runs `tsc -b && vite build`)
- Output directory: `dist`
- Install command: `npm install`
- Framework preset: Vite

No Vercel dashboard configuration is required beyond importing the repo. The `vercel.json` handles the only non-default behavior.

## Anti-Patterns

### Anti-Pattern 1: Converting Dynamic Values to Tailwind Utility Classes

**What people do:** Replace `style={{ width: widthPct }}` with `` className={`w-[${widthPct}]`} `` (Tailwind arbitrary value syntax in a template literal).

**Why it's wrong:** Tailwind's JIT scanner reads static source files at build time. Template literals that compute class names are not scannable — the generated class (e.g., `w-[73%]`) never appears in the output CSS. The element renders with zero width and no error is thrown.

**Do this instead:** Keep `style={{ width: widthPct }}` for all runtime-computed dimension values. Use `className` only for values that are fully static or toggle between a known finite set of pre-defined classes.

### Anti-Pattern 2: Removing CSS Classes Before Migrating Their Consumers

**What people do:** Delete `.challenge-list-item` from `index.css` before updating `ChallengeList.tsx`.

**Why it's wrong:** The component still has `className="challenge-list-item"` — removing the CSS definition silently breaks the styling with no TypeScript or build error.

**Do this instead:** Update the component JSX first. Verify it renders correctly. Then remove the corresponding CSS class definition. One component at a time.

### Anti-Pattern 3: Creating a tailwind.config.js File

**What people do:** Add a `tailwind.config.js` to extend the theme, as was standard in Tailwind v3.

**Why it's wrong:** This project uses Tailwind v4 with the Vite plugin (`@tailwindcss/vite`). Tailwind v4 uses CSS-first configuration via `@theme`. Creating a JS config file is not supported by the Vite plugin and may cause unpredictable behavior.

**Do this instead:** All theme customization goes in `src/index.css` under the `@theme` directive. No JS config file.

### Anti-Pattern 4: Using Tailwind for Handsontable CSS Variable Overrides

**What people do:** Move the `--ht-*` CSS variable overrides out of `index.css` into inline styles or component-level Tailwind classes.

**Why it's wrong:** Handsontable reads these variables scoped to its `.ht-theme-main` class selector. They must be defined in global CSS on that specific selector. Tailwind utilities and inline styles on the React wrapper `<div>` do not reach Handsontable's internal shadow-DOM-equivalent structure.

**Do this instead:** Leave the entire Handsontable CSS block in `index.css` unchanged. It is not part of the redesign scope.

## Integration Points

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| Pages ↔ AppShell | `children` prop | Shell redesign is transparent to pages — no prop API changes |
| Pages ↔ Stores | Zustand hooks (`useChallengeStore`, etc.) | Unchanged by redesign |
| Components ↔ index.css | className strings | CSS class definitions removed only after consuming component migrates to Tailwind |
| DrillPage ↔ DrillQuestion/Feedback sub-components | Props | DrillPage outer wrapper styling changes; sub-component props unchanged |
| SpreadsheetGrid ↔ Handsontable | CSS variables in index.css | Immutable — do not touch |
| ui/Button ↔ consumers | `variant` + native button props via spread | Drop-in replacement for existing `<button>` elements |

### What Does NOT Change

- All Zustand stores (`challengeStore`, `drillStore`, `shortcutStore`, `safeStorage`)
- All data files (`data/challenges/`, `data/shortcuts/`)
- The formula engine (`engine/formulaEngine.ts`, `engine/grader.ts`)
- The `SpreadsheetGrid` component (Handsontable integration)
- The `FormulaBar`, `FunctionAutocomplete` components
- Routing structure in `App.tsx` (routes, paths, nesting)
- Progress selectors (`store/progressSelectors.ts`)
- TypeScript types (`types/index.ts`)
- All tests in `*.test.ts` files

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| Current (solo tool) | All patterns above — appropriate, no overengineering |
| Multiple themes | Use `@theme inline` referencing `:root` variables for runtime theme switching |
| Component library growth | Extract `ui/` into a Storybook-backed package if shared across multiple apps |

### Scaling Priorities

1. **First bottleneck:** Visual inconsistency between pages. The redesign eliminates this by establishing centralized tokens and shared primitives before touching any page.
2. **Second bottleneck:** Handsontable bundle size (~800KB gzipped). Not a redesign concern — already handled by existing bundling setup.

## Sources

- [Tailwind CSS v4 Theme Variables — official docs](https://tailwindcss.com/docs/theme) — HIGH confidence
- [Tailwind CSS v4.0 release announcement](https://tailwindcss.com/blog/tailwindcss-v4) — HIGH confidence
- [Vercel Rewrites — official docs](https://vercel.com/docs/rewrites) — HIGH confidence
- [Vercel Community: SPA 404 on route refresh](https://community.vercel.com/t/rewrite-to-index-html-ignored-for-react-vite-spa-404-on-routes/8412) — MEDIUM confidence, community verified against official docs

---
*Architecture research for: React SPA visual redesign + Vercel deployment (ExcelPrep v1.1)*
*Researched: 2026-02-23*
