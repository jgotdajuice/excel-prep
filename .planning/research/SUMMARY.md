# Project Research Summary

**Project:** excel-prep -- Interactive Excel Finance Interview Prep App
**Domain:** Visual polish, UX improvements, and Vercel deployment for an existing React/Vite SPA (v1.1 milestone)
**Researched:** 2026-02-23
**Confidence:** HIGH

## Executive Summary

ExcelPrep v1.0 is a functional prototype with a complete feature set -- 60+ challenges, formula grading, drill mode, progress tracking, keyboard shortcuts. The v1.1 milestone is a visual and deployment polish pass, not a feature build. The work is well-scoped: establish a CSS design token system (Tailwind v4 `@theme`), unify all pages to a coherent white+green light theme, improve drill question readability with structured text formatting, add onboarding copy, ship to Vercel. The only new npm dependency is `@fontsource-variable/inter` for self-hosted typography. No new frameworks, no new state management, no architectural changes to stores or engines.

The recommended approach is tokens-first: define 6-8 color and typography tokens in `index.css` via Tailwind v4's `@theme` directive, then convert components from scattered inline styles and CSS classes to Tailwind utilities consuming those tokens. Convert the shared shell (`AppShell`) first so all pages inherit the new frame, then work through pages individually. Create 3 small shared UI primitives (`Button`, `Card`, `StatCard`) to replace 15+ inconsistent button/card implementations. The DrillPage dark theme (#111827 background) must be removed to unify the visual language. Vercel deployment requires only a 5-line `vercel.json` with an SPA rewrite rule.

The primary risk is CSS conflicts between Tailwind 4's preflight reset and Handsontable's internal DOM styling. Tailwind preflight resets `border`, `padding`, and `box-sizing` on `<table>`, `<td>`, `<th>` elements -- all of which Handsontable renders. This can silently break grid cell borders and padding. The mitigation is straightforward (scoped CSS repair rules on `.hot-container`) but must be verified as the first step after any global CSS addition. A secondary risk is HOT's v16 DOM wrapper height collapse: any new wrapper `<div>` around the grid that lacks explicit flex/height propagation will cause the grid to render at 0px or 150px. Both risks have clear recovery paths but require explicit acceptance criteria on every layout change near the grid.

---

## Key Findings

### Recommended Stack

No major stack changes for v1.1. The existing React 19 + Vite 7 + TypeScript 5 + Handsontable 16.2 + HyperFormula 3.2 + Zustand 5 + Tailwind CSS 4 stack is unchanged. See STACK.md for full details.

**New additions (v1.1 only):**
- **`@fontsource-variable/inter`:** Self-hosted variable font -- eliminates Google Fonts CDN dependency, removes 100-300ms DNS/SSL cold-load penalty, GDPR-clean, ~60KB for all weights
- **Tailwind v4 `@theme` block in `index.css`:** Replaces scattered hardcoded hex values with named design tokens that auto-generate utility classes (`bg-brand`, `text-muted`, etc.) -- this is the v4 CSS-first approach, NOT `tailwind.config.js`
- **`vercel.json`:** SPA rewrite rule (5 lines) -- required for React Router routes to work on Vercel's static hosting

**Explicitly rejected:**
- Framer Motion / Motion for React (34KB for hover effects that CSS handles in 0KB)
- `tailwindcss-motion` plugin (confirmed Tailwind v4 incompatibility -- open GitHub issues)
- `@tailwindcss/typography` prose plugin (conflicts with Handsontable grid context)
- Any charting/data viz library (not in scope)
- `tailwind.config.js` (v3 pattern -- Tailwind v4 with `@tailwindcss/vite` ignores JS config)

### Expected Features

Feature research was grounded in direct codebase inspection of v1.0. The core problem is visual inconsistency -- 15+ hardcoded hex values, arbitrary font sizes, a dark-themed DrillPage clashing with light everything else, wall-of-text challenge prompts, and a browser tab showing "excel-prep-scaffold". See FEATURES.md for the full landscape and prioritization matrix.

**Must have (P1 -- ship in v1.1):**
- CSS color token system (6-8 named tokens replacing 15+ scattered hex values)
- Unified light theme (remove DrillPage dark background)
- Structured challenge prompt formatting (scenario / data block / task sections)
- Typography scale (consistent size/weight tokens across all pages)
- WelcomePage "how it works" section (3 static bullets for first-time users)
- Answer feedback animation (green scale-up for correct, red shake for wrong)
- Page title ("ExcelPrep") and favicon (replace Vite defaults)
- `vercel.json` SPA routing (deploy blocker)

**Should have (P2 -- stretch if time allows):**
- Returning-user mini-stats on WelcomePage (reads existing Zustand stores)
- Formula chip styling in prompts (extend existing `.correct-formula` pattern)

**Defer (v2+):**
- Spaced repetition, mini model challenges, mobile layout, dark mode toggle, interactive product tour, analytics

### Architecture Approach

The redesign is a styling-layer migration, not an architectural change. No stores, data files, engines, routes, or type definitions change. The codebase currently has two parallel styling systems: CSS class names in `index.css` (ChallengePage sub-components) and inline `style={{}}` props (everything else). Both converge to Tailwind utilities consuming centralized `@theme` tokens. See ARCHITECTURE.md for the full component audit, data flow diagrams, and build order.

**Major components and their migration scope:**
1. **`index.css` @theme block** -- single source of truth for all design tokens; generates both CSS variables and Tailwind utility classes
2. **`AppShell.tsx`** -- convert from 100% inline styles to Tailwind; all pages immediately inherit the new frame
3. **`ui/Button.tsx`, `ui/Card.tsx`, `ui/StatCard.tsx`** -- new shared primitives replacing 15+ inconsistent implementations
4. **Page components (Welcome, Drill, Progress, Shortcuts)** -- convert inline styles to Tailwind utilities
5. **Challenge sub-components (ChallengeList, TierTabs, RightPanel, CompletionScreen)** -- migrate CSS class names to Tailwind; remove old class definitions from `index.css` after each migration

**Immutable (do not touch during redesign):**
- All Zustand stores and selectors
- All data files in `/src/data/`
- Formula engine and grader
- SpreadsheetGrid component (Handsontable integration)
- Handsontable CSS variable overrides in `index.css` (scoped to `.ht-theme-main`)
- Routing structure in `App.tsx`

### Critical Pitfalls

Top 5 pitfalls specific to v1.1, ranked by likelihood and recovery cost. See PITFALLS.md for the full set (11 pitfalls total, including v1.0 domain pitfalls that remain relevant).

1. **Tailwind 4 preflight flattening Handsontable base styles** -- Preflight resets `border`, `padding`, `box-sizing` on `<td>`, `<th>`, `<table>`. HOT renders real instances of these elements. Fix: add scoped CSS repair rules (`.hot-container td { box-sizing: content-box }`) OR import Tailwind without preflight. Verify HOT grid cell borders and padding after every global CSS change.

2. **Vercel 404 on direct route access** -- Without `vercel.json` SPA rewrites, every non-root URL 404s. Invisible during local dev (`vite dev` handles it). Fix: add `vercel.json` with `"rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]` before the first deploy.

3. **HOT v16 DOM wrapper breaking height inheritance** -- Handsontable 16 injects its own root `<div>` inside the container. Adding any wrapper `<div>` around `.hot-container` without explicit `flex: 1; overflow: hidden` breaks the height chain. Grid collapses to 0px or 150px. Fix: verify grid fills its space after every layout change near the grid area. Hard reload, not just HMR.

4. **Tailwind `@theme` token naming collision with HOT CSS variables** -- Both use CSS custom properties. HOT variables are `--ht-*` prefixed (safe). App tokens should use `--color-brand-*` or `--color-surface-*` namespaces to avoid collision. Define `@theme` tokens before HOT overrides in `index.css` for predictable cascade order.

5. **Onboarding overlay stealing focus from Handsontable** -- If a welcome overlay is dismissed without explicitly returning focus to the grid, HOT keyboard handling stops. Fix: call `hotRef.current?.hotInstance?.selectCell(0, 0)` on overlay dismiss. Test by typing `=SUM(` immediately after closing any overlay.

---

## Implications for Roadmap

The dependency graph is clear and linear: tokens must exist before components can consume them; the shell must be restyled before pages; pages before Challenge sub-components; deployment config before actual deployment. Feature research confirms the CSS token system is the critical gate for all visual work.

### Phase 1: Foundation -- Tokens, Primitives, and Deploy Config

**Rationale:** Non-breaking additions that establish the design system and deployment capability. Nothing visual changes yet -- this is pure setup. Everything in subsequent phases depends on tokens existing.
**Delivers:** `@theme` token block in `index.css`; `vercel.json` SPA rewrite; updated page title and favicon in `index.html`; `Button`, `Card`, `StatCard` shared components (created but not yet consumed); Inter font installed and configured.
**Addresses:** vercel.json (P1 deploy blocker), page title/favicon (P1 credibility), CSS token system (P1 gate)
**Avoids:** P6 (token naming collision with HOT) -- establish naming conventions here before any tokens are written. P1 (Vercel 404) -- ship vercel.json as the first committed file.

### Phase 2: Shell and Welcome -- First Visual Impact

**Rationale:** AppShell is the outermost shared component -- restyling it immediately updates the frame for all 5 routes. WelcomePage is the landing page and first impression. Together they deliver the most visible impact with the fewest files touched.
**Delivers:** Restyled AppShell (header, sidebar, nav links, active indicator); restyled WelcomePage with "how it works" section, returning-user stats, and new Button components.
**Addresses:** Unified light theme frame (P1), WelcomePage onboarding (P1), returning-user stats (P2 stretch)
**Avoids:** P2 (Tailwind preflight vs HOT) -- verify HOT grid renders identically after AppShell CSS changes.

### Phase 3: Page Restyling -- Drill, Progress, Shortcuts

**Rationale:** With the shell set, restyle the remaining pages that use inline styles. DrillPage is the highest-priority target (dark theme removal is the single largest visual inconsistency). ProgressPage and ShortcutsPage are lower complexity.
**Delivers:** DrillPage unified to light theme with feedback animations; ProgressPage with StatCard components (keep dynamic width as inline style); ShortcutsPage/ShortcutSetup with consistent form controls.
**Addresses:** Unified light theme -- DrillPage (P1), answer feedback animation (P1), typography scale applied across all pages (P1)
**Avoids:** P4 (HOT height collapse) -- DrillPage does not contain HOT but shares layout patterns. P5 (focus trap after overlay) -- test keyboard flow after any overlay/modal additions.

### Phase 4: Challenge Components -- CSS Class Migration and Prompt Formatting

**Rationale:** ChallengePage sub-components use the CSS class system (System A). This is the most delicate migration because it touches components adjacent to Handsontable. RightPanel is where structured prompt formatting lives.
**Delivers:** ChallengeList, TierTabs, RightPanel, CompletionScreen migrated from CSS classes to Tailwind utilities; old CSS class definitions removed from `index.css`; structured prompt formatting (scenario / data block / task) in RightPanel; formula chip styling in prompts.
**Addresses:** Structured challenge prompt formatting (P1 UX problem), formula chip styling (P2 stretch)
**Avoids:** P2 (Tailwind preflight vs HOT) -- most critical in this phase since changes are adjacent to the grid. P3 (HOT inline style override) -- do not attempt to restyle HOT cell states via CSS; use renderer. P4 (HOT height collapse) -- verify grid height after every layout change.

### Phase 5: Deployment and Verification

**Rationale:** All visual work is complete. Deploy to Vercel and verify all routes, all pages, all edge cases in production.
**Delivers:** Live Vercel deployment; all routes verified (no 404); production build clean (`tsc -b && vite build`); full acceptance checklist passed.
**Addresses:** Vercel deployment (P1)
**Avoids:** P1 (Vercel 404) -- already mitigated in Phase 1 with vercel.json, but verify on actual deployed URL.

### Phase Ordering Rationale

- **Tokens before components:** Every component migration references design tokens. Without tokens, each component would use arbitrary values that need to be re-touched later. This is explicitly called out in both FEATURES.md and ARCHITECTURE.md.
- **Shell before pages:** AppShell wraps everything. Converting it first means every page immediately gets the new header/sidebar/nav without per-page work.
- **DrillPage before Challenge components:** DrillPage dark theme removal is the single largest visual inconsistency and uses inline styles (simpler migration). Challenge components use CSS classes adjacent to Handsontable (higher risk).
- **Challenge components last:** Highest risk due to Handsontable adjacency. By this point, the token system and Tailwind patterns are proven across 4 other pages.
- **Deploy last:** Ship verified code, not work-in-progress.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 4 (Challenge Components + Prompt Formatting):** Tailwind/HOT CSS conflict zone. Prompt text parsing depends on actual prompt string patterns -- verify a sample of prompts can be reliably parsed into scenario/data/task sections before committing to the approach.

Phases with standard patterns (skip research-phase):
- **Phase 1 (Foundation):** Tailwind `@theme`, vercel.json, Fontsource -- all have official docs with exact syntax. Implement directly.
- **Phase 2 (Shell + Welcome):** Standard inline-to-Tailwind conversion. No novel patterns.
- **Phase 3 (Page Restyling):** Same conversion pattern as Phase 2, applied to more pages.
- **Phase 5 (Deployment):** Vercel auto-detects Vite. One config file. Standard deploy flow.

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Only one new npm dependency (`@fontsource-variable/inter`). Tailwind v4 `@theme` syntax verified against official docs. Vercel config verified against official docs. Animation library rejection supported by confirmed v4 incompatibility (open GitHub issues). |
| Features | HIGH | Feature list derived from direct codebase inspection of v1.0. Problem areas (scattered hex values, dark DrillPage, wall-of-text prompts) are verifiable facts, not assumptions. Competitor analysis cross-referenced against Quizlet, Khan Academy, Duolingo patterns. |
| Architecture | HIGH | Migration path is well-defined: two existing styling systems (inline + CSS classes) converge to one (Tailwind utilities). Component inventory complete. Build order dictated by clear dependencies. No stores, engines, or data structures change. |
| Pitfalls | HIGH (v1.1-specific), MEDIUM (v1.0 domain) | Tailwind/HOT conflict documented in official Handsontable theme docs and community forums. Vercel SPA 404 confirmed in official Vercel KB. HOT v16 height regression confirmed in Handsontable forum. v1.0 pitfalls (formula grading, HyperFormula config) already mitigated in the existing codebase. |

**Overall confidence:** HIGH

### Gaps to Address

- **Prompt string parsing reliability:** Structured prompt formatting assumes prompts follow a consistent pattern (scenario text, bullet-delimited data, task instruction). A sample audit of prompts across all 60+ challenges should confirm this before committing to a generic parser. If patterns vary significantly, per-challenge format hints may be needed in the data files.
- **Tailwind preflight impact on HOT -- exact scope:** The CSS repair approach (`.hot-container td { box-sizing: content-box }`) is well-grounded but the exact set of properties that need repair can only be determined by inspection after Tailwind is integrated. This is a "verify during implementation" gap, not a research gap.
- **Inter font rendering on Windows:** Self-hosted Inter via Fontsource is well-tested on macOS. Rendering on Windows (particularly ClearType hinting) is generally fine for Inter but should be spot-checked if Windows users are in scope.

---

## Sources

### Primary (HIGH confidence)
- [Tailwind CSS v4 Theme Variables -- official docs](https://tailwindcss.com/docs/theme) -- `@theme` syntax, custom color namespaces
- [Tailwind CSS v4.0 release blog](https://tailwindcss.com/blog/tailwindcss-v4) -- CSS-first config, `@theme` replaces `tailwind.config.js`
- [Vercel project configuration docs](https://vercel.com/docs/project-configuration) -- `rewrites` property syntax
- [Vercel Vite deployment guide](https://vercel.com/docs/frameworks/frontend/vite) -- auto-detection of Vite, `dist` output directory
- [Vercel KB: Why is my deployed project giving 404?](https://vercel.com/kb/guide/why-is-my-deployed-project-giving-404) -- SPA routing fix
- [Handsontable: Theme Customization (React)](https://handsontable.com/docs/react-data-grid/theme-customization/) -- CSS variable overrides, `.ht-theme-main` scope
- [Handsontable: Migrating from 15.3 to 16.0](https://handsontable.com/docs/javascript-data-grid/migration-from-15.3-to-16.0/) -- DOM wrapper changes
- [Fontsource -- Inter variable font](https://fontsource.org/fonts/inter/install) -- npm package, import syntax
- [Motion for React -- bundle size docs](https://motion.dev/docs/react-reduce-bundle-size) -- 34KB minimum confirmed

### Secondary (MEDIUM confidence)
- [Handsontable 16 auto-resize broken -- forum report](https://forum.handsontable.com/t/auto-resize-broken-in-version-16/8890) -- height collapse regression
- [tailwindcss-motion GitHub -- Tailwind v4 issue #40](https://github.com/romboHQ/tailwindcss-motion/issues/40) -- v4 compat request, still open
- [tailwindcss-motion GitHub -- typewriter broken on v4 issue #47](https://github.com/romboHQ/tailwindcss-motion/issues/47) -- v4 breakage confirmed
- [Tailwind CSS v4 preflight disable -- GitHub Issue #15723](https://github.com/tailwindlabs/tailwindcss/issues/15723) -- preflight scope control
- [Vercel Community: SPA 404 on route refresh](https://community.vercel.com/t/rewrite-to-index-html-ignored-for-react-vite-spa-404-on-routes/8412) -- community confirmation
- SaaS design trends and typography/color psychology (jetbase.io, medium.com) -- visual design patterns
- Onboarding UX patterns 2025 (appcues.com) -- first-visit orientation approaches
- Competitor feature analysis: Quizlet, Khan Academy, Duolingo -- structured question formatting, feedback animations

### Tertiary (LOW confidence)
- Self-hosting Google Fonts vs CDN performance -- multiple independent sources agree on 100-300ms savings but no controlled benchmark cited

---
*Research completed: 2026-02-23*
*Ready for roadmap: yes*
