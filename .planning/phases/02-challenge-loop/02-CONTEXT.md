# Phase 2: Challenge Loop - Context

**Gathered:** 2026-02-22
**Status:** Ready for planning

<domain>
## Phase Boundary

Single end-to-end challenge flow: grid renders with seed data, user enters a formula, grader evaluates the computed result against expected value, explanation appears. User can navigate between challenges, retry, skip, and see progress. This phase builds the challenge infrastructure — content library (Phase 3) fills it with challenges later.

</domain>

<decisions>
## Implementation Decisions

### Challenge Presentation
- Right panel for challenge prompt text (scenario description, instructions)
- Seed data in grid is locked (read-only) — user can only edit answer cell(s)
- Answer cell(s) marked with highlighted border (colored outline)
- Multiple answer cells possible per challenge — some challenges require helper formulas across 2-3 cells
- Progressive hints — no hint by default, "Show hint" button reveals the function name
- Enter key auto-submits the answer (no Submit button)
- Show full grid first when challenge loads — no auto-focus on answer cell
- Grid labels in header rows/columns describe the data — no separate legend in the prompt panel
- Adaptive grid sizing — grid resizes to fit the challenge data, no extra empty rows/columns
- Optional informational timer — visible but no penalty, purely tracks time spent
- Reset button to clear answer cell(s) and start the challenge fresh
- For multi-cell challenges: prompt user to fill all answer cells before grading ("Fill all answer cells before submitting")

### Grading Feedback
- Correct answer: green checkmark + "Correct!" — simple and minimal
- Wrong value (valid formula, incorrect result): "Expected: $X — Got: $Y" with both values shown
- Formula syntax error: Excel error code in the cell (#VALUE!, #REF!, #N/A) — no plain English translation
- Answer cell color changes after grading — green border for correct, red for incorrect
- Grid locks (read-only) after grading — user must click Retry or Next to continue
- Grading triggers on Enter only — clicking away from the answer cell does NOT trigger grading
- Multi-cell challenges: each cell graded independently as user presses Enter in it (per-cell feedback)
- Allow retry — "Try Again" button resets answer cell(s) for another attempt

### Explanation Display
- Expandable "See explanation" section — always starts collapsed (even on incorrect answers)
- Always shows the correct formula, whether the user got it right or wrong
- Include interview pro tips when applicable (e.g., "In interviews, always use NPV+initial_outlay pattern")
- Explanation detail level at Claude's discretion based on function complexity

### Challenge Navigation
- "Next Challenge" button in the right panel after grading
- "Skip" button available — skipped challenges do NOT count toward learning path progress
- Allow going back to previously completed challenges
- Challenge counter + progress bar: "3/10" plus visual fill bar
- Completion screen: brief celebration animation + summary (correct count, time spent, missed questions), then option to continue or return to dashboard
- Visible challenge list showing all challenges in current set with status icons: bullet (not attempted), checkmark (correct), X (incorrect)
- User can click any challenge in the list to jump to it

### Claude's Discretion
- Narrative depth per challenge prompt (brief vs scenario-based)
- Challenge metadata display (function category, difficulty tags)
- Grading result placement (in right panel, overlay, or below grid)
- Numeric comparison tolerance for floating point values
- Challenge data realism (simplified teaching numbers vs real-world scale)
- Challenge list placement (left sidebar vs top of right panel)
- Exact celebration animation on completion

</decisions>

<specifics>
## Specific Ideas

- Challenge flow should feel like a focused study session — right panel guides the user through each challenge while the grid stays front and center for hands-on practice
- The "Skip" button exists for convenience but has a clear cost: no progress credited. This encourages attempting every challenge.
- Progressive hints strike a balance — beginners get help when stuck, but aren't spoonfed the answer upfront
- Per-cell grading on multi-cell challenges lets users learn incrementally instead of failing everything at once
- Interview pro tips in explanations directly connect formula practice to interview readiness

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 02-challenge-loop*
*Context gathered: 2026-02-22*
