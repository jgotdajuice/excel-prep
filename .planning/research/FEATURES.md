# Feature Research

**Domain:** Polish & Deploy (v1.1) — visual redesign, UX, drill text formatting, Vercel deployment for a React/Vite SPA learning tool
**Researched:** 2026-02-23
**Confidence:** HIGH — architecture verified by direct codebase inspection; UX patterns confirmed from multiple sources including official Vercel docs and comparable learning tools (Duolingo, Quizlet, Khan Academy)

---

## Context: What Already Exists (From Codebase Inspection)

v1.0 features that are **done and working** — not in scope for v1.1:
- React 19 + Vite 7 + TypeScript + Tailwind 4 + Zustand + react-router-dom v7
- AppShell: dark green header (#1a3a2a), gray sidebar (220px), NavLink-based navigation
- WelcomePage: white card, green CTA, one-line description, returning-user detection via localStorage
- ChallengePage: Handsontable grid + right panel (prompt, hint, feedback, explanation accordion)
- DrillPage: dark-card UI (#111827), countdown timer, MC/typing modes, auto-advance feedback
- ProgressPage: 3-stat overview, tier-grouped accuracy bars, "Focus on this" weakest-category card
- 60+ finance challenges in `/src/data/challenges/` (beginner/intermediate/advanced)
- localStorage persistence via Zustand stores

**The core problem:** The app is functional but looks like a prototype because:
1. No unified color token system — hex values (#1a3a2a, #1a6b3c, #145530, #1a4a7a, #c0392b) scattered across 8+ files
2. No typography scale — font sizes are arbitrary per-component (32px, 22px, 18px, 16px, 15px, 14px, 13px, 12px, 11px, 10px with no system)
3. DrillPage uses a dark theme (#111827 background) that clashes with the light theme everywhere else
4. Challenge prompts render as raw strings with bullet chars (•) and line breaks — wall of text in a 280px sidebar
5. No vercel.json — all non-root routes (e.g., /challenge, /drill) return 404 on Vercel
6. Page title is "excel-prep-scaffold" and favicon is the default Vite logo

---

## Feature Landscape

### Table Stakes (Users Expect These)

Features a polished learning tool must have. Missing = product looks unfinished.

| Feature | Why Expected | Complexity | Existing State | Notes |
|---------|--------------|------------|----------------|-------|
| Consistent color token system | Polished SaaS products define 5-8 named colors, applied uniformly. Scattered hex values produce visual noise — buttons that should look the same don't. | LOW | Not done — 15+ hardcoded hex values across files | Define CSS custom properties (`--color-brand`, `--color-brand-dark`, `--color-surface`, `--color-border`, `--color-text-primary`, `--color-text-muted`) in `index.css`. Replace all hardcoded values. |
| Consistent typography scale | Polished tools use a defined type scale (e.g., 12/13/14/16/18/22/28px with paired weights). Current code has arbitrary sizes per-component. | LOW | Not done | Add CSS custom properties or Tailwind config for `--text-xs` through `--text-2xl`. Apply consistently across all pages. |
| Coherent spacing scale | Spacing should follow a 4px base unit. WelcomePage uses `padding: '48px 56px'` which is fine; other pages mix 8/10/12/16/18/20/24/28/32/40 with no system. | LOW | Not done | Pick Tailwind's default scale (4/8/12/16/20/24/32/40/48/56/64px) and stick to it throughout |
| Page title and favicon | Browser tab shows "excel-prep-scaffold". Favicon is the Vite triangle. Both kill credibility for anyone shown the app. | LOW | Not done | Update `<title>` in `index.html` to "ExcelPrep — Finance Interview Prep". Create a simple SVG favicon (green square with "E" or "X"). |
| Unified light theme | All pages should use the same light surface. DrillPage uses `backgroundColor: '#111827'` (near-black), creating jarring visual break. | MEDIUM | Not done — DrillPage is dark, everything else is light | Replace DrillPage dark backgrounds with white/light-gray (#f9fafb). Adapt text colors accordingly (white text → dark). |
| Structured drill/challenge question text | Challenge prompts (displayed in the 280px right panel) are 6-8 line raw strings with bullet chars (•) and newlines. Drill prompts are shorter but still plain prose. Both are hard to scan. | MEDIUM | Not done | Create a `formatPrompt()` render utility that identifies and styles: (1) scenario description, (2) data section (formula-chip styled code block), (3) task instruction. No library needed — CSS classes + JSX render function. |
| First-visit orientation on WelcomePage | New user lands on a card with app name + 1 sentence + 2 buttons. No explanation of how the app works or what to do first. | LOW | Partial — description text exists but insufficient | Add a 3-item "How it works" section: "Type formulas in the grid → get graded instantly → track your weak spots". Static copy, no new state. |
| Vercel SPA routing config | React Router v7 uses client-side routing. Without a server-side catch-all, Vercel serves 404 for any URL that isn't `/`. All nav links break in production. | LOW | Not done — no vercel.json exists | Add `vercel.json` with SPA rewrite rule (5 lines of JSON). |
| Smooth answer feedback | Correct/wrong answer feedback appears instantly with no visual transition. Learning tools (Duolingo, Quizlet) use brief animations to reinforce the right/wrong moment. | LOW | Partial — `completion-pop` keyframe exists but not applied to drill feedback | Add CSS `@keyframes` for correct (green flash/scale) and incorrect (red shake). Apply on `.feedback-correct` and `.feedback-incorrect`. |

### Differentiators (Competitive Advantage)

Features that elevate ExcelPrep above a generic quiz. These align with "impressive to a Deloitte/CPA audience."

| Feature | Value Proposition | Complexity | Existing State | Notes |
|---------|-------------------|------------|----------------|-------|
| Finance-professional visual identity | Excel-green (#1a6b3c) used as the single brand accent on a clean white canvas creates domain-credibility that generic blue SaaS tools don't have. The current mixed dark/light aesthetic undermines this. | MEDIUM | Mixed — some green, some dark, some arbitrary grays | Unify: white card surfaces, brand-green for primary actions and active states, muted gray for secondary text. Remove the dark theme from DrillPage. |
| Structured scenario cards in challenge prompts | Break wall-of-text into labeled sections — a "Scenario" header, a styled data block (monospace, light background), and a bold "Task:" line. Used by Khan Academy and Quizlet to reduce cognitive load. | MEDIUM | Not done | `PromptCard` component or `formatChallengePrompt()` utility in the render layer. Parses existing prompt strings — no data file changes needed if prompts follow consistent patterns. |
| Returning-user progress summary on WelcomePage | User comes back the next day and sees "14/60 challenges done, 68% accuracy" above the CTA. Creates continuity and motivation. Duolingo equivalent: streak count + last session summary. | LOW | Partial — `hasStarted` flag exists, but no stats surface on WelcomePage | Read from `challengeStore` + `drillStore` (already Zustand stores with localStorage persistence). Render a 2-stat mini card when `hasStarted === true`. |
| Formula syntax highlighting in prompts | `=VLOOKUP(A2, B2:D10, 3, FALSE)` rendered in a styled code chip (monospace, green-tinted background) rather than inline text. Already done for the explanation area (`.correct-formula` class exists). | LOW | Partial — `.correct-formula` exists in explanation accordion; not applied to prompt text | Extend the pattern: detect formula-like substrings in prompt text and wrap in `<code className="formula-chip">`. Or add explicit `formulaRefs` field to challenge data. |

### Anti-Features (Commonly Requested, Often Problematic)

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Full design system / component library (shadcn/ui, Radix) | "Professional apps use design systems" | Mid-milestone installation creates a full migration effort. Existing CSS classes in `index.css` are functional. The overhead far exceeds value for a personal tool on a 2-day build window. | Define CSS custom properties for color and spacing tokens. Achieve visual consistency without a third-party component library. |
| Dark mode toggle | Common SaaS feature | Explicitly out of scope per PROJECT.md. The DrillPage dark theme is itself the problem to fix — adding a toggle enshrines the inconsistency. | Remove DrillPage dark background. Keep light theme only. |
| Interactive product tour (tooltips, multi-step walkthrough) | "Help new users" | A 3-5 step interactive tour requires substantial engineering. The app is simple enough that well-written static copy on WelcomePage handles orientation. No returning user wants to replay a tour. | Static "How it works" bullets on WelcomePage. |
| Decorative animations beyond feedback | "Makes it feel polished" | Page transition animations, loading skeletons, and hover particle effects are gimmicky for a professional study tool targeting finance interviews. | Limit animation to meaningful feedback moments (correct/wrong flash). Keep all navigation transitions instant. |
| Google Fonts or custom webfonts | "Better typography" | Adds a network dependency, FOUC risk, and complexity for no perceptible gain. System font stack (`-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto`) renders excellently on Mac/Windows laptops — the only target device. | Improve the existing system font stack with CSS token-defined weights and sizes. |
| Analytics / telemetry | "Know how users study" | This is a single-user personal tool. Adding a third-party script (Mixpanel, Plausible) adds complexity and potential privacy friction. | LocalStorage persistence is sufficient. |

---

## Feature Dependencies

```
[CSS color token system]
    └──required before──> [Unified light theme (DrillPage)]
    └──required before──> [Visual redesign across all pages]
    └──required before──> [Formula chip styling in prompts]

[vercel.json SPA rewrite rule]
    └──required for──> [Vercel deployment — all routes work]

[Structured prompt formatting]
    └──depends on──> [Prompt data shape] (inspected — prompts are raw strings with bullet chars, consistent enough to parse)
    └──enhances──> [Challenge right panel readability]
    └──independent of──> [DrillPage dark theme removal] (separate components)

[Returning-user stats on WelcomePage]
    └──requires──> [challengeStore + drillStore Zustand stores] (already exist)
    └──note──> Both stores already persist to localStorage; WelcomePage already reads `hasStarted`

[Feedback animation]
    └──requires──> [Unified light theme on DrillPage] (dark background makes green flash invisible)
    └──extends──> [existing `completion-pop` @keyframes pattern]

[Page title + favicon]
    └──no dependencies — standalone 15-minute tasks]
```

### Dependency Notes

- **Color tokens first.** Define CSS custom properties before touching any component. This makes every subsequent edit consistent and prevents re-touching the same files twice.
- **DrillPage dark theme before feedback animation.** The dark background (#111827) makes a green correct-flash nearly invisible. Remove the dark background first, then add the animation.
- **Prompt formatting is render-layer only.** The prompt strings live in `/src/data/challenges/*.ts`. Formatting happens in `RightPanel.tsx` (renders `.challenge-prompt`) and `DrillPage.tsx` (renders `currentQuestion.prompt`). No data file changes required for basic formatting.
- **vercel.json is a deploy prerequisite.** Without it, every test of the deployed URL from a non-root route returns 404. Ship this first.

---

## MVP Definition for v1.1 Polish & Deploy

### Launch With (must ship)

- [ ] **vercel.json with SPA catch-all rewrite** — without this the deployed app 404s on any non-root route. 5-minute task. Zero risk.
- [ ] **Page title + favicon** — "excel-prep-scaffold" in the browser tab is an instant credibility kill. Update `index.html` title. Create a minimal green SVG favicon.
- [ ] **CSS color token system** — 5-6 CSS custom properties replace 15+ scattered hex values. Gate for all other visual work.
- [ ] **Remove DrillPage dark theme** — unify all pages to white/light surfaces. The dark card (#111827) is the single largest visual inconsistency.
- [ ] **Structured challenge prompt formatting** — the wall-of-text scenario in the 280px right panel is the clearest UX problem. Break into labeled sections (scenario, data block, task).
- [ ] **Typography scale** — apply consistent size/weight CSS tokens across AppShell, WelcomePage, DrillPage, ProgressPage.
- [ ] **WelcomePage "how it works" section** — 3 bullets explaining the learning loop for first-time users. Static copy.
- [ ] **Answer feedback animation** — green scale-up for correct, red shake for wrong. Pure CSS. Makes the drill feel like a real learning tool.

### Add After Core (v1.1 stretch, if time allows)

- [ ] **Returning-user mini-stats on WelcomePage** — "X challenges done, Y% accuracy" when `hasStarted` is true. Reads from Zustand stores.
- [ ] **Formula chip styling in prompts** — extend `.correct-formula` CSS pattern to inline formula references in prompt text.

### Future Consideration (v2+)

- [ ] **Spaced repetition scheduling** — replace weighted random drill queue with SM-2 algorithm. Significant engine work; overkill for 1-2 week prep window.
- [ ] **Mini model challenge (multi-step DCF)** — high value, high complexity. Already identified as v1.x in v1.0 research.
- [ ] **Mobile layout** — explicitly out of scope per PROJECT.md.
- [ ] **Interactive product tour** — unnecessary given app simplicity; revisit if the app gets more users.

---

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| vercel.json SPA rewrite | HIGH (deploy blocker) | LOW (5 lines JSON) | P1 |
| Page title + favicon | HIGH (credibility) | LOW (15 min) | P1 |
| CSS color token system | HIGH (enables all polish) | LOW (CSS vars) | P1 |
| Remove DrillPage dark theme | HIGH (visual coherence) | LOW-MEDIUM (inline style sweep) | P1 |
| Structured prompt formatting | HIGH (UX problem) | MEDIUM (render util + CSS) | P1 |
| Typography scale | MEDIUM (polish) | LOW (CSS vars + apply) | P1 |
| WelcomePage "how it works" | MEDIUM (onboarding) | LOW (static copy + layout) | P1 |
| Answer feedback animation | MEDIUM (learning feel) | LOW (CSS keyframes) | P1 |
| Returning-user stats on Welcome | MEDIUM (motivation) | MEDIUM (Zustand reads) | P2 |
| Formula chip in prompts | LOW-MEDIUM (readability) | LOW (CSS + markup) | P2 |

**Priority key:**
- P1: Ship in v1.1
- P2: Ship if time allows, otherwise v1.2
- P3: Defer to v2+

---

## Competitor Feature Analysis

| Feature | Quizlet | Khan Academy | Duolingo | Our Approach |
|---------|---------|--------------|----------|--------------|
| Question text formatting | Structured card: term on top, definition revealed below. Clear separation. | Labeled problem sections with scaffolded steps. Math notation rendered properly. | Short prompts (1-2 lines max). Visual context image where helpful. | Parse existing prompt strings into three labeled sections: scenario, data block (styled code), task line. No library needed. |
| Visual identity | Blue accent (#4255ff) on white. Consistent throughout. | Blue/teal accent, white surfaces. Consistent font scale. | Custom green + cartoon illustrations. Consistent throughout. | Excel-green (#1a6b3c) accent on white surfaces. Professional/finance-appropriate. Must unify DrillPage to match. |
| First-time onboarding | Subject picker → "Create a study set" or "Search". No tutorial. | Course overview with progress steps. First lesson is gentle. | Animated walkthrough with character. A/B tests onboarding flows heavily. | 3-bullet "How it works" static section on WelcomePage. No interactive tour needed for this use case. |
| Feedback on answers | Color flash (green/red) + correct answer reveal. | Right/wrong + step-by-step explanation. | Sound + animation + XP pop + streak update. | CSS flash animation (correct = green scale, wrong = red shake) + existing explanation accordion. |
| Progress tracking | Study streak + accuracy per card set. | Mastery bars per topic. | XP, streaks, leagues, hearts. | Per-function accuracy bars + weakest-category highlight (already built). |
| Deployment model | Multi-tenant SaaS. | Multi-tenant SaaS. | Native app + web. | Static SPA on Vercel free tier. Requires vercel.json SPA catch-all. |

---

## Sources

- Codebase inspection: `/Users/jam/excel-prep/src/` — all components, pages, index.css, vite.config.ts, package.json, index.html
- Vercel SPA routing (official): https://vercel.com/docs/frameworks/frontend/vite
- Vercel SPA routing pattern: https://medium.com/today-i-solved/deploy-spa-with-react-router-to-vercel-d10a6b2bfde8
- SaaS design systems 2025: https://jetbase.io/blog/saas-design-trends-best-practices
- SaaS UX typography and color psychology: https://medium.com/@fineartdesignagency/the-psychology-behind-saas-design-color-typography-and-layout-for-conversions-cb16a126ccf2
- Onboarding UX patterns 2025: https://www.appcues.com/blog/user-onboarding-ui-ux-patterns
- Learning tool visual design (Duolingo): https://www.frontmatter.io/blog/duolingo-technology-and-design-shape-learning-journeys
- Quiz question formatting / structured layout: https://api.bookwidgets.com/blog/2025/12/how-to-create-structured-multimedia-quizzes-for-in-the-classroom

---

*Feature research for: Excel Interview Prep v1.1 Polish & Deploy*
*Researched: 2026-02-23*
