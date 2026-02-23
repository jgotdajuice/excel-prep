# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-23)

**Core value:** A beginner can rapidly learn the Excel functions and patterns that finance interviews test, through active practice rather than passive reading.
**Current focus:** Milestone v1.1 — Polish & Deploy

## Current Position

Phase: 8 — Challenge Components and Prompt Formatting
Plan: 1 of 2 complete
Status: Phase 08 in progress — plan 01 done
Last activity: 2026-02-23 — 08-01 formatPrompt utility + ChallengeList, TierTabs, CompletionScreen Tailwind migration

Progress: [█████░░░░░] 50% (phase 08, 1 of 2 plans done)

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
| Phase 07-shell-welcome-page-restyling P02 | 7 | 2 tasks | 4 files |
| Phase 07-shell-welcome-page-restyling P03 | 2 | 2 tasks | 4 files |

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
- [Phase 07-02]: CSS keyframes in index.css, referenced via .animate-* class names — no embedded <style> blocks in components
- [Phase 07-02]: Timer urgent color uses dynamic inline style (runtime value) — isUrgent ? '#ef4444' : 'var(--color-text-primary)'
- [Phase 07-02]: DrillFeedback overlay uses dark green/red backgrounds — intentional overlay colors on top of light card, not dark-theme violations
- [Phase 07-03]: AccuracyBar fill div retains inline style for width/backgroundColor — dynamic runtime values from accuracy state, not design-token-resolvable
- [Phase 07-03]: StatCard delegates container styling to Card — no duplication of bg-surface/border/rounded-card
- [Phase 07-03]: optionBtnClass(active) as local clsx function — mirrors Button variant pattern for ShortcutSetup toggle buttons
- [Phase 08-01]: formatPrompt uses line-by-line parsing — table lines start with |, bullet data lines start with • or '- ' and contain data chars (digits, $, /)
- [Phase 08-01]: PromptDisplay uses React.createElement (not JSX) in .ts file — avoids need to rename to .tsx while keeping single-file utility
- [Phase 08-01]: ChallengeList locked+active state uses separate clsx conditions for locked/non-locked hover paths
- [Phase 08-01]: CompletionScreen Card uses padding={false} + className px-12 py-10 to override Card default p-6
- [Phase 08-01]: completion-pop keyframe stays in index.css, referenced via Tailwind arbitrary animate-[completion-pop_0.5s_ease-out]

### Pending Todos

None.

### Blockers/Concerns

- [v1.1 RESOLVED by 06-01]: Tailwind preflight may conflict with Handsontable grid styles — addressed with .hot-container preflight repair CSS
- [v1.1 RESOLVED by 08-01]: Drill question text is wall-of-text — formatPrompt utility now splits prompts into scenario/data/task sections; PromptDisplay will be integrated in 08-02
- [v1.0 RESOLVED]: All 15 v1.0 requirements shipped and verified

## Session Continuity

Last session: 2026-02-23
Stopped at: Completed 08-01-PLAN.md — formatPrompt utility, ChallengeList/TierTabs/CompletionScreen Tailwind migration
Resume file: /gsd:execute-phase 8
