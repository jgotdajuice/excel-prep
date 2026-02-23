# Requirements: Excel Interview Prep

**Defined:** 2026-02-22
**Core Value:** A beginner can rapidly learn the Excel functions and patterns that finance interviews test, through active practice rather than passive reading.

## v1.0 Requirements (Complete)

All 15 v1.0 requirements shipped and verified. See MILESTONES.md for archive.

- [x] GRID-01..04, LEARN-01..06, PROG-01..03, KEYS-01..02

## v1.1 Requirements

Requirements for Polish & Deploy milestone.

### Visual Design

- [x] **VIS-01**: App uses a consistent CSS design token system (color, typography, spacing) defined via Tailwind v4 `@theme` — no scattered hardcoded hex values
- [ ] **VIS-02**: All pages use a unified light theme with Excel-green (#1a6b3c) accent and white surfaces — no dark-themed pages (DrillPage dark background removed)
- [x] **VIS-03**: Typography uses a professional font (Inter) with consistent size/weight scale across all pages
- [x] **VIS-04**: Shared UI primitives (Button, Card) replace inconsistent per-page implementations

### User Experience

- [x] **UX-01**: WelcomePage includes a "How it works" section explaining the learning loop for first-time users
- [ ] **UX-02**: Challenge and drill prompts use structured formatting (scenario label, data block, task instruction) instead of wall-of-text paragraphs
- [ ] **UX-03**: Correct/incorrect answer feedback includes visual animation (green flash for correct, red shake for wrong)
- [x] **UX-04**: Browser tab shows app name ("ExcelPrep") and a custom favicon (not Vite defaults)

### Deployment

- [ ] **DEPLOY-01**: App is deployed to Vercel with a working production URL
- [ ] **DEPLOY-02**: All client-side routes (/challenge, /drill, /progress, /shortcuts) work on direct URL access (no 404s)
- [ ] **DEPLOY-03**: Production build passes TypeScript check and Vite build with no errors

## v2 Requirements

Deferred to future release.

### Learning Enhancements

- **LEARN-V2-01**: Full mini-model builders (build a complete DCF or LBO step by step)
- **LEARN-V2-02**: Timed challenge mode simulating interview pressure
- **LEARN-V2-03**: Spaced repetition algorithm replacing weighted-random queue

### Content

- **CONT-V2-01**: Advanced function coverage (XIRR, INDIRECT, array formulas)
- **CONT-V2-02**: Industry-specific question banks (PE, hedge fund, corporate finance)

## Out of Scope

| Feature | Reason |
|---------|--------|
| Dark mode toggle | Light theme only for v1.1; clean professional look |
| Mobile optimization | Spreadsheet grids don't work on mobile; laptop only |
| Sound effects | Unnecessary for professional study tool |
| Custom domain | Vercel subdomain sufficient for now |
| Interactive product tour | App is simple enough; static copy on WelcomePage covers orientation |
| Analytics/telemetry | Single-user tool; localStorage sufficient |
| Video lectures | Passive learning; slower than active practice |
| VBA/macros | Finance interviews focus on formulas and functions |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| VIS-01 | Phase 6 | Complete |
| VIS-02 | Phase 7 | Pending |
| VIS-03 | Phase 6 | Complete |
| VIS-04 | Phase 6 | Complete |
| UX-01 | Phase 7 | Complete |
| UX-02 | Phase 8 | Pending |
| UX-03 | Phase 7 | Pending |
| UX-04 | Phase 6 | Complete |
| DEPLOY-01 | Phase 9 | Pending |
| DEPLOY-02 | Phase 9 | Pending |
| DEPLOY-03 | Phase 9 | Pending |

**Coverage:**
- v1.1 requirements: 11 total
- Mapped to phases: 11
- Unmapped: 0

---
*Requirements defined: 2026-02-22*
*Last updated: 2026-02-23 after v1.1 milestone start*
