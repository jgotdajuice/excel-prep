# Roadmap: Excel Interview Prep

## Overview

Build a client-side SPA that teaches Excel functions for finance interviews through active practice. v1.0 delivered the complete learning engine (formula grid, challenges, drills, shortcuts, progress tracking). v1.1 transforms the functional prototype into a polished, deployable product with professional visual design, improved UX, and live hosting on Vercel.

## Phases

**Phase Numbering:**
- Phases 1-5: v1.0 milestone (complete)
- Phases 6-9: v1.1 milestone (Polish & Deploy)

### v1.0 — Core Learning Engine (Complete)

- [x] **Phase 1: Formula Engine** - Interactive spreadsheet grid wired to a verified, Excel-compatible formula engine (completed 2026-02-23)
- [x] **Phase 2: Challenge Loop** - Single end-to-end challenge flow: grid renders, user enters formula, grader grades it, explanation appears (completed 2026-02-23)
- [x] **Phase 3: Content Library** - Finance-framed question bank and structured beginner-to-interview-ready learning path (completed 2026-02-23)
- [x] **Phase 4: Keyboard Shortcuts** - Independent drill module for finance/IB keyboard shortcuts with keypress capture (completed 2026-02-23)
- [x] **Phase 5: Progress and Weak Areas** - Session persistence, per-function accuracy tracking, weighted drill queue, next-topic suggestions (completed 2026-02-23)

### v1.1 — Polish & Deploy

- [ ] **Phase 6: Design Foundation** - CSS design tokens, shared UI primitives, Inter font, page title/favicon, vercel.json
- [x] **Phase 7: Shell, Welcome, and Page Restyling** - AppShell restyle, WelcomePage onboarding, DrillPage light theme, ProgressPage/ShortcutsPage polish, feedback animations (completed 2026-02-23)
- [x] **Phase 8: Challenge Components and Prompt Formatting** - CSS class migration to Tailwind, structured prompt formatting, formula chip styling (completed 2026-02-23)
- [ ] **Phase 9: Deployment and Verification** - Vercel deploy, route verification, production build validation

## Phase Details

### Phase 6: Design Foundation
**Goal**: Establish the design token system, shared UI primitives, and deployment config that all subsequent visual work depends on — without changing any existing visuals yet
**Depends on**: Phase 5 (v1.0 complete)
**Requirements**: VIS-01, VIS-03, VIS-04, UX-04
**Success Criteria** (what must be TRUE):
  1. `@theme` block in `index.css` defines color tokens (brand, surface, border, text) and typography tokens (font-family, size scale) — all pages can reference them via Tailwind utilities
  2. `@fontsource-variable/inter` is installed and configured as the default font family
  3. `vercel.json` exists with SPA rewrite rule
  4. `index.html` has app name ("ExcelPrep") as page title and a custom favicon (not Vite defaults)
  5. `ui/Button.tsx` and `ui/Card.tsx` shared components exist and are importable
  6. Handsontable grid renders correctly with no visual regressions after Tailwind token additions (preflight does not break grid borders/padding)
**Plans:** 2/2 plans executed

Plans:
- [x] 06-01-PLAN.md — Design tokens, Inter font, page identity, vercel.json, HOT preflight repair
- [x] 06-02-PLAN.md — Button and Card shared UI primitives, build verification

### Phase 7: Shell, Welcome, and Page Restyling
**Goal**: Restyle the app shell and all non-challenge pages to the new design system — unified light theme with green accent, professional typography, onboarding copy, and feedback animations
**Depends on**: Phase 6 (tokens and primitives must exist)
**Requirements**: VIS-02, UX-01, UX-03
**Success Criteria** (what must be TRUE):
  1. AppShell (header, sidebar, nav links) uses Tailwind utilities consuming design tokens — no inline styles
  2. WelcomePage includes a "How it works" section with 3 bullets explaining the learning loop
  3. DrillPage uses light theme (white/light surfaces) — no dark background (#111827 removed)
  4. ProgressPage and ShortcutsPage use shared Card/StatCard/Button components
  5. Correct answer shows green flash animation; incorrect shows red shake animation
  6. All pages have consistent typography (Inter font, size scale from tokens)
**Plans:** 3/3 plans complete

Plans:
- [ ] 07-01-PLAN.md — AppShell restyle + WelcomePage onboarding section
- [ ] 07-02-PLAN.md — DrillPage light theme + feedback animations
- [ ] 07-03-PLAN.md — ProgressPage + ShortcutsPage restyle with shared components

### Phase 8: Challenge Components and Prompt Formatting
**Goal**: Migrate challenge sub-components from CSS classes to Tailwind utilities and implement structured prompt formatting to fix the wall-of-text problem
**Depends on**: Phase 7 (patterns proven on simpler pages first)
**Requirements**: UX-02
**Success Criteria** (what must be TRUE):
  1. ChallengeList, TierTabs, RightPanel, and CompletionScreen use Tailwind utilities — old CSS class definitions removed from `index.css`
  2. Challenge prompts render with structured layout: scenario label, data block (styled as code/table), task instruction — not a single paragraph
  3. Drill question prompts use the same structured formatting
  4. Handsontable grid still renders correctly after adjacent component CSS changes (no height collapse, no border loss)
**Plans:** 2/2 plans executed

Plans:
- [x] 08-01-PLAN.md — formatPrompt utility + ChallengeList, TierTabs, CompletionScreen Tailwind migration
- [x] 08-02-PLAN.md — RightPanel + ChallengePage layout + DrillQuestionCard migration, prompt formatting integration, CSS cleanup

### Phase 9: Deployment and Verification
**Goal**: Deploy the polished app to Vercel and verify all routes and features work in production
**Depends on**: Phase 8 (all visual work complete)
**Requirements**: DEPLOY-01, DEPLOY-02, DEPLOY-03
**Success Criteria** (what must be TRUE):
  1. App is live on a Vercel URL
  2. All routes (/challenge, /drill, /progress, /shortcuts) load correctly on direct URL access (no 404s)
  3. `npm run build` (tsc -b && vite build) passes with zero errors
  4. Challenge flow works end-to-end on production (load challenge, enter formula, see grade + explanation)
  5. Progress persists across page refreshes on production
**Plans:** 1 plans

Plans:
- [ ] 09-01-PLAN.md — Production build validation, Vercel deploy, route and feature verification

## Progress

**Execution Order:**
v1.0: Phases 1 -> 2 -> 3 -> 4 -> 5 (complete)
v1.1: Phases 6 -> 7 -> 8 -> 9

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Formula Engine | 2/2 | Complete | 2026-02-23 |
| 2. Challenge Loop | 3/3 | Complete | 2026-02-23 |
| 3. Content Library | 4/4 | Complete | 2026-02-23 |
| 4. Keyboard Shortcuts | 2/2 | Complete | 2026-02-23 |
| 5. Progress and Weak Areas | 3/3 | Complete | 2026-02-23 |
| 6. Design Foundation | 2/2 | Complete | 2026-02-23 |
| 7. Shell, Welcome, and Page Restyling | 3/3 | Complete   | 2026-02-23 |
| 8. Challenge Components and Prompt Formatting | 2/2 | Complete | 2026-02-23 |
| 9. Deployment and Verification | 0/1 | Pending | — |
