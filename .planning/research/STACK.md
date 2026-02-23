# Stack Research

**Domain:** Interactive spreadsheet-based learning web app (finance interview prep)
**Researched:** 2026-02-22
**Confidence:** HIGH (core choices), MEDIUM (supporting libraries)

---

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| React | 19.x (stable, Dec 2024) | UI framework | De facto standard for component-driven SPAs; React 19 stable released Dec 2024; ecosystem matches all spreadsheet libraries considered |
| Vite | 6.x | Build tool / dev server | Sub-2s cold starts, millisecond HMR; no SSR needed for this app (desktop SPA); no Next.js overhead; `npm create vite@latest -- --template react-ts` gets you running in seconds |
| TypeScript | 5.x | Type safety | Catches formula-comparison bugs and state shape errors early; all chosen libraries are TypeScript-first |
| Handsontable | 16.2.x | Spreadsheet grid component | Best-in-class Excel look-and-feel; 400+ formulas via HyperFormula plugin; React wrapper (`@handsontable/react`); keyboard shortcuts match real Excel; non-commercial license is free for this personal project (use key `'non-commercial-and-evaluation'`) |
| HyperFormula | 3.2.x (Feb 2026) | Formula engine (headless) | Powers Handsontable's formula plugin; 398 built-in functions including every function tested in finance interviews (NPV, IRR, PMT, XNPV, VLOOKUP, INDEX, MATCH, SUMIFS, nested IF); can be used standalone to evaluate a user's formula string and compare result — this is the core challenge-validation mechanism |
| Tailwind CSS | 4.x (stable Jan 2025) | Styling | Zero-config, fastest build times, utility-first; v4 is production-ready and removes the separate config file; for a laptop-only SPA this avoids designing a custom stylesheet from scratch |
| Zustand | 5.x | Client state management | Minimal boilerplate; hook-based; perfect for tracking current challenge, drill progress, and user score state without Redux ceremony; <1 KB gzipped |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `better-sqlite3` | 9.x | Progress persistence (server-side if adding backend) | Only if adding a Node.js backend for persistent cross-device progress; skip if going pure frontend |
| `localStorage` (browser built-in) | — | Progress persistence (frontend-only) | Default choice for MVP: stores completed challenges, drill scores, and weak-area tags as JSON; no setup, no server; sufficient for a personal study tool used on one machine |
| `react-router-dom` | 7.x | Client-side routing | If you add multiple pages (home, drills, challenges, progress); not needed if keeping as a single-view app |
| `clsx` + `tailwind-merge` | latest | Conditional class composition | For dynamic Tailwind class logic on challenge cards, result feedback states; standard utility pair in Tailwind projects |
| `vitest` | 3.x | Unit testing | Test formula-validation logic and challenge-scoring functions; pairs natively with Vite, no Jest config needed |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| `create vite` | Project scaffold | `npm create vite@latest excel-prep -- --template react-ts`; gets TypeScript + React + Vite wired in under a minute |
| ESLint + `eslint-plugin-react` | Linting | Ships with Vite React template; catch issues early |
| Prettier | Code formatting | Add once, forget about formatting debates |
| VS Code + Vite extension | DX | HMR updates render in browser instantly during challenge development |

---

## Installation

```bash
# Scaffold
npm create vite@latest excel-prep -- --template react-ts
cd excel-prep

# Core spreadsheet stack
npm install handsontable @handsontable/react hyperformula

# State + styling
npm install zustand
npm install tailwindcss @tailwindcss/vite

# Routing (add only if multi-page)
npm install react-router-dom

# Utility
npm install clsx tailwind-merge

# Dev
npm install -D vitest @vitest/ui
```

---

## Alternatives Considered

| Recommended | Alternative | Why Not |
|-------------|-------------|---------|
| Handsontable + HyperFormula | FortuneSheet | FortuneSheet (MIT, v1.0.4, Nov 2025) is actively maintained but docs are sparse, formula engine is a forked/older handsontable/formula-parser (not as capable as HyperFormula 3.2), and its API is still pre-stable. Handsontable's formula coverage is verified superior for finance functions. |
| Handsontable + HyperFormula | Jspreadsheet CE | CE edition's built-in formula engine covers common cases but is underdocumented for financial functions; Pro version costs money; React integration is less polished than Handsontable's official React wrapper. |
| Handsontable + HyperFormula | Luckysheet | Effectively unmaintained — the dream-num org migrated to "Univer" (a complete rewrite). Do not use Luckysheet for new projects. |
| Handsontable + HyperFormula | SpreadJS / Syncfusion / Kendo UI Spreadsheet | Enterprise commercial pricing, overkill for a solo study app. |
| Vite | Next.js | No SSR, SEO, or server-side data fetching needed. Next.js adds routing conventions and build complexity without benefit. A SPA is the right model for an offline-capable interactive drill app. |
| Zustand | Redux Toolkit | RTK adds actions/reducers/slice boilerplate for no benefit at this scale. Zustand achieves the same in 10 lines. |
| localStorage | SQLite / IndexedDB / server DB | localStorage is sufficient for one user's progress on one machine (the explicit constraint). IndexedDB adds async complexity; a server DB adds infrastructure. Start simple, migrate if needed. |
| Tailwind v4 | Tailwind v3 | v4 is stable (Jan 2025), 5x faster full builds, zero config file. No reason to use v3 on a greenfield project. |
| TypeScript | Plain JavaScript | Formula validation logic involves comparing computed values with expected values across nested IF and lookup functions — type safety catches shape mismatches early and is worth the minimal overhead at this project scale. |

---

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| Luckysheet | Abandoned — maintainers migrated to Univer (a full rewrite); do not use in new projects | Handsontable or FortuneSheet |
| Excel.js / SheetJS for formula evaluation | These are file-format parsers, not formula engines; they don't evaluate `=NPV(...)` at runtime | HyperFormula (headless formula engine) |
| iframe embedding Google Sheets or actual Excel | No control over input validation, no formula interception, no custom challenge logic, CORS/auth issues | Handsontable + HyperFormula |
| React Context for global state | Re-renders entire tree on state change; fine for themes, wrong for drill progress updates on every keystroke | Zustand (only re-renders subscribed components) |
| `formula-parser` (handsontable/formula-parser) | Older, forked library with incomplete financial function coverage; FortuneSheet uses this internally | HyperFormula (superset, actively maintained by same team) |
| Web SQL | Deprecated by W3C, removed from browsers | localStorage or IndexedDB |

---

## Key Architecture Insight: How Formula Validation Works

The core challenge mechanic requires checking "did the user type a formula that produces the correct result?" HyperFormula solves this standalone:

```typescript
import { HyperFormula } from 'hyperformula';

// Initialize a headless sheet with seeded data (the challenge scenario)
const hf = HyperFormula.buildFromArray([
  [100000, 0.05, 10],   // LoanAmount, Rate, Periods
]);

// Evaluate the user's formula string
const result = hf.calculateFormula('=PMT(B1/12, C1*12, -A1)', { sheet: 0, row: 0, col: 3 });

// Compare to expected answer
const isCorrect = Math.abs(result - 1060.66) < 0.01;
```

This approach runs entirely client-side, needs no server, and gives exact Excel-compatible results for all 398 supported functions.

---

## Stack Patterns by Variant

**If keeping as a pure frontend SPA (recommended for MVP):**
- Skip any backend entirely
- Use localStorage for progress
- Deploy to Vercel / Netlify / GitHub Pages as a static site

**If adding cross-device progress sync later:**
- Add a lightweight Node.js/Express API
- Use better-sqlite3 on the server for per-user progress
- Add a minimal auth layer (Clerk or simple JWT)

**If scope expands to team/classroom use:**
- Migrate to Next.js App Router for SSR and API routes
- Move to PostgreSQL for multi-user progress
- This is a future-state — do not build it now

---

## Version Compatibility

| Package | Compatible With | Notes |
|---------|-----------------|-------|
| `handsontable@16.x` | `hyperformula@^3.0.0` | Confirmed in official docs; use `3.2.x` |
| `@handsontable/react@16.x` | `react@18.x` and `react@19.x` | React 19 compatible per latest release |
| `hyperformula@3.2.x` | No Handsontable required | Can be used standalone for formula evaluation |
| `tailwindcss@4.x` | `vite@6.x` via `@tailwindcss/vite` plugin | v4 uses a Vite plugin instead of PostCSS by default |

---

## Sources

- [HyperFormula official docs — built-in functions list](https://hyperformula.handsontable.com/guide/built-in-functions) — verified NPV, IRR, PMT, XNPV, VLOOKUP, INDEX, MATCH, SUMIFS, IF; v3.2.0; HIGH confidence
- [HyperFormula GitHub — version 3.2.0, released 2026-02-19](https://github.com/handsontable/hyperformula) — HIGH confidence
- [Handsontable React docs — formula-calculation](https://handsontable.com/docs/react-data-grid/formula-calculation/) — confirmed HyperFormula integration, version compatibility table; HIGH confidence
- [Handsontable npm — version 16.2.0, Feb 2025](https://www.npmjs.com/package/handsontable) — HIGH confidence
- [Handsontable software license docs](https://handsontable.com/docs/javascript-data-grid/software-license/) — non-commercial license confirmed free for personal/education use; HIGH confidence
- [Tailwind CSS v4.0 release blog](https://tailwindcss.com/blog/tailwindcss-v4) — stable Jan 22 2025; HIGH confidence
- [React v19 stable release blog](https://react.dev/blog/2024/12/05/react-19) — Dec 2024; HIGH confidence
- [Vite docs](https://vite.dev/guide/) — v6 current; HIGH confidence
- [FortuneSheet GitHub — v1.0.4, Nov 2025, pre-stable API](https://github.com/ruilisi/fortune-sheet) — MEDIUM confidence (activity confirmed but API stability caveat)
- [Luckysheet GitHub — migrated to Univer](https://github.com/dream-num/Luckysheet) — HIGH confidence (avoid)
- WebSearch: Zustand vs Redux 2025 — MEDIUM confidence (multiple sources agree on Zustand for small/medium apps)
- WebSearch: localStorage vs IndexedDB for progress tracking — MEDIUM confidence (localStorage sufficient at this scale)
- WebSearch: Vite vs Next.js 2025/2026 greenfield SPA — MEDIUM confidence (multiple sources agree Vite for SPAs without SSR needs)

---

*Stack research for: Interactive Excel interview prep web app*
*Researched: 2026-02-22*
