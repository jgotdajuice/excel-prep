# Phase 5: Progress and Weak Areas - Context

**Gathered:** 2026-02-24
**Status:** Ready for planning

<domain>
## Phase Boundary

Session persistence via localStorage, a progress dashboard showing per-function accuracy, weighted drill queue that favors weak areas, and next-topic suggestions. No backend — all data stays in the browser. This is the final phase of the current milestone.

</domain>

<decisions>
## Implementation Decisions

### Progress Dashboard
- Lives at the existing "Progress" sidebar link (currently a placeholder)
- Per-function accuracy bars — horizontal bars showing percentage correct (e.g., "VLOOKUP: 4/6 — 67%")
- Group by tier: Beginner functions, then Intermediate, then Advanced
- Show only functions the user has attempted (don't show 0/0 functions they haven't seen)
- Overall stats at top: total challenges completed, total drill questions answered, overall accuracy percentage
- Tier unlock status shown inline — checkmark for unlocked tiers, progress indicator for in-progress tiers
- Weakest function highlighted with a "Focus on this" callout
- Clean, minimal design — no charts library, just styled bars and numbers

### Persistence Strategy
- localStorage for all persistent data
- Persist: challenge statuses (keyed by challenge ID), drill answer history (array of {challengeId, status, timestamp}), hint usage count
- Tier unlock state is DERIVED from persisted challenge/drill data on load — not stored separately
- Timer data is NOT persisted — session-only, resets on page load
- Hydrate Zustand stores from localStorage on app mount, write back on every state change
- Handle localStorage being unavailable (private browsing) gracefully — app works but nothing persists, no errors shown

### Weak-Area Suggestions
- Show on progress dashboard: "Suggested next: [Function Name]" card based on lowest accuracy function (minimum 2 attempts to qualify)
- The suggestion links directly to a challenge for that function (or starts a drill filtered to it)
- If all functions are above 80% accuracy, show "You're doing great — keep practicing!" instead of a specific suggestion
- No suggestions shown on the challenge page itself — keep that focused on the current task

### Weighted Drill Queue
- When starting a drill session, question selection favors functions with lower accuracy
- Weighting formula: inverse of accuracy percentage — a function at 30% accuracy gets roughly 2-3x the questions of one at 80%
- Functions with 0 attempts get neutral weight (treated as 50% for weighting purposes)
- Minimum 1 question guaranteed per function category in a 10-question session (if enough functions exist)
- User does NOT see or control the weighting — it just works behind the scenes
- If user selects a specific tier filter, weighting only applies within that tier's functions

### Claude's Discretion
- Exact localStorage key naming and data schema
- Progress bar visual styling and animation
- How to handle migration if data schema changes in future
- Whether to add a "Reset Progress" button (and confirmation flow if so)
- Zustand persist middleware choice vs manual localStorage sync

</decisions>

<specifics>
## Specific Ideas

- Progress bars should feel like a skill tree or XP tracker — motivating, not clinical
- The "suggested next" feature is the key differentiator — most practice apps just show scores, this one tells you what to do next
- Weighted drill queue should feel natural — user shouldn't notice they're getting more VLOOKUP questions, it should just feel like "the app knows what I need"

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 05-progress-and-weak-areas*
*Context gathered: 2026-02-24*
