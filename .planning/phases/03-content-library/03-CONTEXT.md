# Phase 3: Content Library - Context

**Gathered:** 2026-02-23
**Status:** Ready for planning

<domain>
## Phase Boundary

Finance interview formula question bank (60+ challenges across 10 tier-1 functions), rapid-fire drill mode for recognition practice, and a three-tier learning path (beginner/intermediate/advanced) with gated progression. Existing 3 seed challenges are absorbed into the unified library. Progress persistence and weak-area tracking are Phase 5.

</domain>

<decisions>
## Implementation Decisions

### Drill Mode Interaction
- Both typing and multiple choice modes available — user can toggle between them
- Countdown timer per question, varies by difficulty: beginner 45s, intermediate 30s, advanced 20s
- When countdown expires: auto-skip, mark as wrong
- Question format varies — mix of: short finance scenario + formula blank, pure function recall prompts, and compact mini scenario cards
- Fixed 10 questions per drill session
- Immediate feedback after each question: green/red flash, brief correct formula shown, then auto-advance
- End-of-session: score + full review — user can click through each question and see explanation
- Filter drills by tier (beginner/intermediate/advanced)
- In typing mode, answer scope depends on question type — some ask for full formula, some just function name
- Multiple choice wrong options: mix of plausible common mistakes AND wrong functions
- Drill questions derived from grid challenges — same content pool, different format
- Data shown inline in text (no grid/table in drill mode) — pure text prompt with embedded values

### Learning Path + Tier Gating
- Three tiers: Beginner, Intermediate, Advanced
- Simple tab navigation (Beginner | Intermediate | Advanced), locked tabs show lock icon
- Score threshold to unlock next tier: 70% correct per function
- Per-function gating — must hit 70% on each function's challenges at current tier before unlocking that function at the next tier
- Drills count partially toward tier progression (50% weight)
- Locked tier content is visible but locked — users can see challenge titles but can't start them
- Progressive function introduction — simpler functions (SUM, IF) appear at beginner, complex ones (INDEX/MATCH, XLOOKUP) introduced at higher tiers
- Challenges within a tier are randomized each session (not fixed order)

### Content Organization
- 6 challenges per function minimum (60+ total)
- Grouped by tier only — flat list within each tier, functions mixed together
- 80% finance/IB/accounting scenarios, 20% general business for variety
- Existing 3 seed challenges absorbed into the unified content library at appropriate tiers

### Claude's Discretion
- Drill mode route placement (separate /drill route vs tab within challenge page)
- Difficulty progression design within functions (simple→nested→combined, small→large data, or hybrid)
- Per-function progress visibility design
- Exact drill question presentation layout
- Which functions appear at which tiers (progressive introduction mapping)
- Drill feedback animation timing and transitions

</decisions>

<specifics>
## Specific Ideas

- Drill mode should feel fast and game-like — countdown creates urgency, immediate feedback keeps momentum
- "Same pool, different format" for drill content — don't duplicate authoring effort. A grid challenge about VLOOKUP salary lookup becomes a text-based drill asking "Write the VLOOKUP formula to find Employee 103's salary from columns A:C"
- Per-function gating ensures no knowledge gaps — a user can't skip VLOOKUP and jump to advanced INDEX/MATCH
- Randomized order within tiers prevents "I memorized challenge #3 is always NPV" pattern
- Visible-but-locked tiers motivate progression — users see what's ahead

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 03-content-library*
*Context gathered: 2026-02-23*
