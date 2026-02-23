# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-23)

**Core value:** A beginner can rapidly learn the Excel functions and patterns that finance interviews test, through active practice rather than passive reading.
**Current focus:** Milestone v1.1 — Polish & Deploy

## Current Position

Phase: 7 — Shell and Welcome Page Restyling
Plan: 1 of ? complete
Status: Phase 07 in progress — plan 01 done
Last activity: 2026-02-23 — 07-01 AppShell + WelcomePage restyled with Tailwind tokens

Progress: [███░░░░░░░] 25%

## Performance Metrics

**Velocity (v1.0):**
- Total plans completed: 14
- Average duration: ~6 min
- Total execution time: ~1.4 hours

**By Phase (v1.0):**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01-formula-engine | 2 | 10 min | 5 min |
| 02-challenge-loop | 3 | 32 min | 10.7 min |
| 03-content-library | 4 | 25 min | 6.25 min |
| 04-keyboard-shortcuts | 2 | ~6 min | 3 min |
| 05-progress-and-weak-areas | 3 | ~23 min | 7.7 min |
| Phase 06-design-foundation P01 | 2 | 2 tasks | 7 files |
| Phase 06-design-foundation P02 | 2 | 2 tasks | 2 files |

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Key decisions carried forward:

- Stack: React 19 + Vite 7 + TypeScript 5 + Handsontable 16.2 + HyperFormula 3.2 + Zustand 5 + Tailwind CSS 4
- HyperFormula singleton (`hfInstance`) requires explicit sheet cleanup on unmount to prevent SheetSizeLimitExceededError
- Zustand persist middleware with partialize for localStorage — session state excluded
- Refs pattern for stable Handsontable callbacks — prevents re-render loops
- currentIndex is tier-scoped (within tierChallenges, not global challenges array)

v1.1 decisions:
- Visual direction: Modern SaaS aesthetic (clean, light, professional) — NOT Bloomberg terminal dark theme
- Color scheme: Excel-green (#1a6b3c) accent + white surfaces
- Font: Inter via @fontsource-variable/inter (self-hosted, no CDN)
- Tailwind v4 @theme for token system (CSS-first, no tailwind.config.js)
- No animation library — CSS transitions/keyframes only
- Deploy target: Vercel free tier
- DrillPage dark background (#111827) must be removed for visual consistency
- [Phase 06-design-foundation]: CSS token names use --color-brand (not --color-brand-green) for clean bg-brand utility classes
- [Phase 06-design-foundation]: HOT preflight repair targets .hot-container (scoped) to avoid global table overrides
- [Phase 06-02]: Button uses clsx (not tailwind-merge) — variants are non-conflicting by design
- [Phase 06-02]: Card is layout-only container — no hover/click, just bg-surface + border + rounded-card
- [Phase 07-01]: NavLink uses className callback (not style callback) with clsx for isActive toggling — Tailwind-consistent approach
- [Phase 07-01]: Sidebar w-[220px] min-w-[220px] uses arbitrary values for explicit 220px width
- [Phase 07-01]: WelcomePage secondary CTA uses variant='secondary' (brand-light + border-brand) rather than ghost

### Pending Todos

None.

### Blockers/Concerns

- [v1.1 RESOLVED by 06-01]: Tailwind preflight may conflict with Handsontable grid styles — addressed with .hot-container preflight repair CSS
- [v1.1]: Drill question text is wall-of-text — addressed in Phase 8 (UX-02)
- [v1.0 RESOLVED]: All 15 v1.0 requirements shipped and verified

## Session Continuity

Last session: 2026-02-23
Stopped at: Completed 07-01-PLAN.md — AppShell + WelcomePage Tailwind restyling
Resume file: /gsd:execute-phase 7
