# Excel Interview Prep

## What This Is

An interactive web app that prepares beginners for Excel-heavy finance interviews. Combines hands-on formula practice in a spreadsheet grid with scenario-based drills covering financial analysis, investment banking, and accounting functions. Tracks progress to surface weak areas and focus study time.

## Core Value

A beginner can rapidly learn the Excel functions and patterns that finance interviews test, through active practice rather than passive reading.

## Current Milestone: v1.1 Polish & Deploy

**Goal:** Transform the functional prototype into a polished, deployable product with professional visual design, improved UX, and live hosting.

**Target features:**
- Visual redesign: Modern SaaS aesthetic with Excel-green (#1a6b3c) and white color scheme
- Onboarding/UX flow improvements for first-time users
- Drill question formatting fix (break up wall-of-text scenarios into structured layouts)
- Bug fixes and edge case handling
- Vercel deployment with production build

## Requirements

### Validated

- Interactive spreadsheet grid where users type real formulas and see results (v1.0)
- Challenge-based tasks with finance-scenario prompts (v1.0)
- Rapid-fire formula drills (v1.0)
- Finance/IB/accounting-focused function library (v1.0)
- Progress tracking across sessions (v1.0)
- Structured learning path from beginner to interview-ready (v1.0)
- Explanations after each question (v1.0)

### Active

- [ ] Professional visual redesign (Modern SaaS, green & white, not generic Tailwind)
- [ ] Improved onboarding/welcome experience
- [ ] Drill question text reformatted (structured layout, not wall of text)
- [ ] Bug fixes and edge case polish
- [ ] Deployed to Vercel with production URL

### Out of Scope

- Mobile/phone optimization — laptop only
- VBA/macros — interviews focus on formulas and functions
- General Excel tutorials (formatting, charts) — focused on finance interview content
- Multiplayer/social features — solo study tool
- Dark mode toggle — keep it simple, light theme only for v1.1
- Sound effects — unnecessary for professional tool
- Custom domain — Vercel subdomain sufficient for now

## Context

- User has a finance firm interview in ~1-2 weeks
- Currently beginner-level Excel (knows basic SUM, formatting, simple formulas)
- Role spans financial analysis, IB, and accounting
- Tight timeline means the app itself must be buildable in days
- Learning method: challenge-based tasks + rapid-fire drills (active recall)
- Needs to work on laptop only — no mobile constraints
- User wants to impress someone with Deloitte/CPA background — visual polish matters
- Current app works but looks like a prototype — needs professional finish

## Constraints

- **Timeline**: Must be usable within days — simple stack, fast to build
- **Scope**: Finance interview functions only — not a general Excel course
- **Device**: Desktop/laptop browser only
- **Visual direction**: Modern SaaS (clean, light, professional) with Excel-green accent — NOT Bloomberg terminal dark theme
- **Deploy target**: Vercel (free tier)

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Active recall over passive reading | Research shows testing yourself beats re-reading for retention | ✓ Good |
| Finance-specific content only | Time is limited; general Excel knowledge won't help in interview | ✓ Good |
| Embedded spreadsheet grid | Hands-on practice builds muscle memory for actual Excel use | ✓ Good |
| Modern SaaS over Bloomberg terminal aesthetic | Target audience is Big 4/CPA track, not trading floor | — Pending |
| Green & white color scheme | On-brand for Excel tool, professional, clean | — Pending |
| Vercel deployment | Free, fast, great for React SPAs | — Pending |

---
*Last updated: 2026-02-23 after milestone v1.1 start*
