---
phase: 06-design-foundation
plan: 01
subsystem: ui
tags: [tailwind, css-tokens, inter-font, favicon, vercel, handsontable]

# Dependency graph
requires: []
provides:
  - "@theme CSS token block with 8 color tokens, font-sans, 2 radius tokens in src/index.css"
  - "Inter Variable font self-hosted via @fontsource-variable/inter"
  - "HOT preflight repair CSS preventing Tailwind from breaking Handsontable grid"
  - "Custom green spreadsheet favicon at public/favicon.svg"
  - "Page title updated to ExcelPrep"
  - "vercel.json with SPA rewrite rule for client-side routing"
affects: [07-welcome-page, 08-ux-polish]

# Tech tracking
tech-stack:
  added: ["@fontsource-variable/inter@5.2.8"]
  patterns:
    - "Tailwind v4 CSS-first @theme block — no tailwind.config.js needed"
    - "HOT preflight repair pattern: .hot-container td/th/table override box-sizing to content-box"
    - "Module type declarations via src/declarations.d.ts for untyped side-effect imports"

key-files:
  created:
    - src/declarations.d.ts
    - public/favicon.svg
    - vercel.json
  modified:
    - src/index.css
    - src/main.tsx
    - index.html

key-decisions:
  - "Token names use --color-brand not --color-brand-green for clean utility classes (bg-brand, not bg-brand-green)"
  - "HOT preflight repair targets .hot-container wrapper — avoids global table overrides that would break other UI"
  - "Unused-variable TS errors in drillStore.ts and progressSelectors.ts were pre-existing — fixed as blocking devs per Rule 3"

patterns-established:
  - "CSS token pattern: all color/font/radius values defined in @theme block at top of index.css"
  - "Font import order: @fontsource import BEFORE ./index.css in main.tsx"

requirements-completed: [VIS-01, VIS-03, UX-04]

# Metrics
duration: 2min
completed: 2026-02-23
---

# Phase 6 Plan 01: Design Foundation Summary

**Tailwind v4 @theme token system with Inter Variable font, green favicon, ExcelPrep title, Handsontable preflight repair, and vercel.json SPA config**

## Performance

- **Duration:** 2 min
- **Started:** 2026-02-23T18:36:14Z
- **Completed:** 2026-02-23T18:38:51Z
- **Tasks:** 2
- **Files modified:** 7

## Accomplishments
- @theme block defines 8 color tokens (brand, brand-dark, brand-light, surface, base, border, text-primary, muted), Inter Variable font-sans, and 2 radius tokens
- Inter Variable font self-hosted via @fontsource-variable/inter — imported before index.css in main.tsx
- HOT preflight repair CSS prevents Tailwind's box-sizing reset from breaking Handsontable cell layout
- Browser tab now shows "ExcelPrep" title with a green spreadsheet grid favicon (replaces Vite logo)
- vercel.json created with SPA rewrite rule — all routes serve index.html on Vercel

## Task Commits

Each task was committed atomically:

1. **Task 1: Install Inter font, add @theme design tokens, HOT preflight repair** - `3c35c44` (feat)
2. **Task 2: Update page title, create custom favicon, add vercel.json** - `190ffa0` (feat)

## Files Created/Modified
- `src/index.css` - Added @theme token block and HOT preflight repair CSS; removed old font-family from html/body/#root
- `src/main.tsx` - Added @fontsource-variable/inter import before ./index.css
- `src/declarations.d.ts` - TypeScript module declaration for @fontsource-variable/inter (no bundled types)
- `public/favicon.svg` - Custom green spreadsheet grid icon (2x2 white cells on green rounded rect)
- `index.html` - Title changed to "ExcelPrep", favicon updated to /favicon.svg
- `vercel.json` - SPA rewrite rule: all routes → /index.html
- `package.json` + `package-lock.json` - Added @fontsource-variable/inter@5.2.8 dependency

## Decisions Made
- Token names: `--color-brand` not `--color-brand-green` to keep utility classes clean (`bg-brand` not `bg-brand-green`)
- HOT repair targets `.hot-container` wrapper (scoped) rather than global `table` override
- `vercel.json` uses `(.*)` not `/:path*` form per plan spec; no buildCommand/outputDirectory (Vercel auto-detects Vite)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Added TypeScript module declaration for @fontsource-variable/inter**
- **Found during:** Task 1 (Install Inter font)
- **Issue:** `@fontsource-variable/inter` has no TypeScript type declarations; `noUncheckedSideEffectImports: true` in tsconfig caused TS2307 error blocking the build
- **Fix:** Created `src/declarations.d.ts` with `declare module "@fontsource-variable/inter"`
- **Files modified:** src/declarations.d.ts (created)
- **Verification:** Build passes with zero errors after fix
- **Committed in:** 3c35c44 (Task 1 commit)

**2. [Rule 3 - Blocking] Fixed pre-existing unused variable TS errors blocking build**
- **Found during:** Task 1 (build verification)
- **Issue:** Two pre-existing `noUnusedLocals` errors prevented the build from passing — `cat` in drillStore.ts (destructured loop key, never used) and `challengeIdToTier` in progressSelectors.ts (declared but never used below)
- **Fix:** Changed `[cat, group]` to `[, group]` in drillStore.ts; removed unused `challengeIdToTier` declaration in progressSelectors.ts
- **Files modified:** src/store/drillStore.ts, src/store/progressSelectors.ts
- **Verification:** Build passes with zero errors; logic unchanged (cat key was unused, map was never referenced)
- **Committed in:** 3c35c44 (Task 1 commit)

---

**Total deviations:** 2 auto-fixed (2 blocking)
**Impact on plan:** Both auto-fixes necessary to achieve clean build. No scope creep — pre-existing TS errors were latent, surfaced when Inter import was added and build verification was run.

## Issues Encountered
- None beyond the above auto-fixed blocking issues.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Design token foundation complete — Phases 7-8 can reference `bg-brand`, `text-muted`, `font-sans` etc. without defining colors
- HOT grid protection in place — Tailwind preflight will not break Handsontable borders/padding
- Vercel SPA routing ready — client-side routes will work on deploy
- Blocker resolved: "Tailwind preflight may conflict with HOT grid styles" — addressed by .hot-container preflight repair

---
*Phase: 06-design-foundation*
*Completed: 2026-02-23*
