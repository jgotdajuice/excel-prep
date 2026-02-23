# Stack Research

**Domain:** Interactive spreadsheet-based learning web app (finance interview prep)
**Researched:** 2026-02-23 (updated for v1.1 Polish & Deploy milestone)
**Confidence:** HIGH (Vercel config, Tailwind theming, font hosting), LOW (animation plugin — Tailwind 4 compat unresolved)

---

## Existing Stack (Do Not Re-Research)

React 19, Vite 7, TypeScript 5, Handsontable 16.2, HyperFormula 3.2, Zustand 5, Tailwind CSS 4, React Router 7. All validated in prior research (2026-02-22). Do not revisit.

---

## New Stack Additions for v1.1

The only new capabilities needed are: design tokens for the green & white theme, font hosting, optional micro-animation, and Vercel deployment configuration.

### New Dependencies

| Library | Version | Purpose | Why |
|---------|---------|---------|-----|
| `@fontsource-variable/inter` | latest | Self-hosted variable font | Inter is the standard Modern SaaS typeface; variable package covers all weights in one ~60 KB file; no Google Fonts CDN required, no extra DNS round-trip, no GDPR/privacy leak; import once in `main.tsx` and done |

**No other npm dependencies are needed for the redesign.** CSS-only theming handles the rest.

### What Handles Everything Else

| Capability | Mechanism | Why No New Library |
|-----------|-----------|-------------------|
| Design tokens (green & white) | Tailwind 4 `@theme` block in CSS | v4's `@theme` generates utility classes from CSS variables natively; no token library, no extra config file needed |
| Component-level styling | Existing Tailwind utilities + `clsx`/`tailwind-merge` (already installed) | Already in `package.json` |
| Micro-animations | CSS transitions via Tailwind's `transition-*` and `duration-*` utilities | Sufficient for hover states, tab switches, and feedback reveals without adding a JS animation library |
| Drill text layout | Tailwind typography utilities (`prose` NOT needed — avoid `@tailwindcss/typography` plugin) | Structure drills with explicit grid/flex layouts instead; prose styles conflict with the spreadsheet grid context |

---

## Vercel Deployment

### What's Needed

Two files. Nothing else.

**1. `vercel.json` in project root** — handles SPA routing (prevents 404 on direct URL access or refresh):

```json
{
  "rewrites": [
    { "source": "/:path*", "destination": "/index.html" }
  ]
}
```

This is required because Vercel serves static files by default; without rewrites, navigating directly to `/drills` returns 404 instead of letting React Router handle it.

**2. Vercel auto-detection handles the rest.** Vercel detects Vite, sets build command to `npm run build`, and output directory to `dist` automatically. No `buildCommand` or `outputDirectory` fields needed in `vercel.json` unless overriding.

### Deployment Commands

```bash
# Install Vercel CLI (one-time)
npm install -g vercel

# First deploy — links project, prompts for team/scope
vercel

# Subsequent production deploys
vercel --prod
```

No Railway, no Docker, no server — this is a pure static SPA.

---

## Tailwind 4 Theming: Design Tokens

Use the `@theme` block in the global CSS file (not a config file — Tailwind v4 is CSS-first). This is the correct v4 approach verified from official Tailwind docs.

```css
/* src/index.css */
@import "tailwindcss";

@theme {
  /* Brand colors — generates bg-brand-*, text-brand-*, border-brand-* utilities */
  --color-brand-green:      #1a6b3c;
  --color-brand-green-dark: #145530;
  --color-brand-green-light:#22894e;
  --color-surface:          #ffffff;
  --color-surface-muted:    #f8fafb;
  --color-border:           #e2e8f0;
  --color-text-primary:     #0f172a;
  --color-text-muted:       #64748b;

  /* Typography */
  --font-sans: "Inter Variable", ui-sans-serif, system-ui, sans-serif;

  /* Border radius — Modern SaaS uses consistent rounding */
  --radius-card: 0.75rem;
  --radius-btn:  0.5rem;
}
```

`@theme` variables automatically generate utility classes: `bg-brand-green`, `text-brand-green`, `border-surface-muted`, etc. They also become CSS variables accessible as `var(--color-brand-green)` for inline styles if needed.

**Do not use `tailwind.config.js` for colors** — that is the v3 approach. Tailwind v4 with `@tailwindcss/vite` plugin does not read a config file by default.

---

## Font Hosting

Use Fontsource (self-hosted via npm), not Google Fonts CDN.

```bash
npm install @fontsource-variable/inter
```

```typescript
// src/main.tsx — import once, before any other CSS
import "@fontsource-variable/inter";
```

```css
/* Already handled by @theme above */
--font-sans: "Inter Variable", ui-sans-serif, system-ui, sans-serif;
```

**Why Fontsource over Google Fonts CDN:**
- Eliminates external DNS lookup and SSL handshake (removes 100–300 ms on cold load)
- No third-party request — GDPR-clean
- Managed like any npm dependency (lockfile, version pinning)
- Variable font package covers weights 100–900 in one file (~60 KB), smaller than loading multiple static weight files

---

## Animations: Do Not Add a Library

**Verdict: Use Tailwind's built-in transition utilities only. No Framer Motion. No tailwindcss-motion.**

Rationale:

- Motion for React (Framer Motion) minimum bundle is 34 KB uncompressed even with tree-shaking. For hover effects and simple reveals, this is 34 KB solving a 2 KB problem.
- `tailwindcss-motion` plugin (romboHQ) has unresolved Tailwind v4 compatibility issues as of early 2025 — open GitHub issues confirm typewriter presets broken on v4, and the core plugin relies on `flattenColorPalette` which no longer exists at the same import path in v4.
- Tailwind's native `transition-*`, `duration-*`, `ease-*`, `scale-*`, `opacity-*` utilities handle 95% of SaaS polish: button hover, card lift, tab underline slide, feedback fade-in.

**Example of what "no library" looks like:**

```tsx
// Hover lift on a card — no library required
<div className="transition-shadow duration-200 hover:shadow-md cursor-pointer rounded-card border border-border p-6">
```

```tsx
// Correct answer feedback — fade in
<div className={clsx(
  "transition-opacity duration-300",
  isCorrect ? "opacity-100" : "opacity-0"
)}>
  Great work!
</div>
```

If a specific animation genuinely cannot be done with CSS transitions (e.g., exit animations on unmount), revisit Motion's `<AnimatePresence>` at that point. Do not preemptively add it.

---

## Installation (New Additions Only)

```bash
# Font (only new npm dependency for v1.1)
npm install @fontsource-variable/inter

# Vercel CLI (global, one-time)
npm install -g vercel
```

---

## Alternatives Considered

| Recommended | Alternative | Why Not |
|-------------|-------------|---------|
| `@fontsource-variable/inter` | Google Fonts CDN `<link>` tag | External DNS + SSL round-trip adds 100–300 ms; third-party request; no lockfile versioning |
| `@fontsource-variable/inter` | `@fontsource/inter` (static) | Variable font covers all weights in one file; static package requires separate imports per weight |
| CSS `transition-*` utilities | Motion for React (Framer Motion) | 34 KB minimum bundle for hover effects that CSS handles in 0 KB; overkill for this scope |
| CSS `transition-*` utilities | `tailwindcss-motion` plugin | Unresolved Tailwind v4 compatibility (open GitHub issues as of early 2025); do not use until plugin confirms v4 support |
| Tailwind `@theme` custom colors | CSS custom properties in `:root` | `@theme` generates Tailwind utility classes automatically; `:root` only creates CSS variables, requires manual arbitrary values like `bg-[var(--color-x)]` everywhere |
| `vercel.json` rewrites | Netlify `_redirects` file | Project is deploying to Vercel; Netlify syntax does not apply here |

---

## What NOT to Add

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| `@tailwindcss/typography` (prose plugin) | Prose styles target long-form article text; conflict with spreadsheet grid and structured drill UI; class conflicts with Handsontable | Explicit Tailwind layout utilities for drill text formatting |
| Framer Motion / Motion for React | 34 KB minimum for simple hover animations; not worth it | Tailwind `transition-*` utilities |
| `tailwindcss-motion` plugin | Tailwind v4 incompatibility confirmed in open GitHub issues | Tailwind built-in animation utilities |
| `tailwind.config.js` for colors | v3 pattern; Tailwind v4 with `@tailwindcss/vite` ignores JS config by default | `@theme` block in CSS |
| CSS Modules or styled-components | Would fight Tailwind; adds a second styling paradigm | Stick with Tailwind utilities throughout |
| Any charting or data viz library | Not in v1.1 scope | Defer to future milestone if progress dashboard is added |

---

## Version Compatibility (New Additions)

| Package | Compatible With | Notes |
|---------|-----------------|-------|
| `@fontsource-variable/inter` (latest) | Vite 7, any bundler | Pure CSS/font files, no JS compatibility concerns |
| `vercel.json` rewrites syntax | Vercel platform (any version) | Current rewrites syntax confirmed in official Vercel docs |
| Tailwind v4 `@theme` | `@tailwindcss/vite@4.x` (already installed) | Native feature, no additional plugins |

---

## Sources

- [Tailwind CSS v4 — Theme variables (official docs)](https://tailwindcss.com/docs/theme) — `@theme` syntax, custom color namespaces; HIGH confidence
- [Tailwind CSS v4.0 release blog](https://tailwindcss.com/blog/tailwindcss-v4) — CSS-first config, `@theme` replaces `tailwind.config.js`; HIGH confidence
- [Vercel project configuration docs](https://vercel.com/docs/project-configuration) — `rewrites` property confirmed current; HIGH confidence
- [Vercel Vite deployment guide](https://vercel.com/docs/frameworks/frontend/vite) — auto-detection of Vite, `dist` output directory default; HIGH confidence (referenced via WebSearch)
- [Fontsource — Inter variable font](https://fontsource.org/fonts/inter/install) — npm package name, import syntax; HIGH confidence
- [Motion for React — bundle size docs](https://motion.dev/docs/react-reduce-bundle-size) — 34 KB minimum confirmed; HIGH confidence
- [tailwindcss-motion GitHub — Tailwind v4 issue #40](https://github.com/romboHQ/tailwindcss-motion/issues/40) — v4 compat request opened Jan 2025, still open; HIGH confidence (issue exists)
- [tailwindcss-motion GitHub — typewriter broken on v4 issue #47](https://github.com/romboHQ/tailwindcss-motion/issues/47) — v4 breakage confirmed Feb 2025; HIGH confidence
- WebSearch: self-hosting Google Fonts vs CDN performance — MEDIUM confidence (multiple independent sources agree on 100–300 ms savings)
- WebSearch: Vercel SPA routing with `vercel.json` rewrites — MEDIUM confidence (multiple community sources, confirmed against official docs)

---

*Stack research for: Excel Interview Prep v1.1 — Polish & Deploy milestone*
*Researched: 2026-02-23*
