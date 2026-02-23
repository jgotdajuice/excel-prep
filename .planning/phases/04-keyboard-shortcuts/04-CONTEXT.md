# Phase 4: Keyboard Shortcuts - Context

**Gathered:** 2026-02-22
**Status:** Ready for planning

<domain>
## Phase Boundary

Interactive keypress-recognition drill module for finance/IB Excel keyboard shortcuts. Separate from the formula challenge flow. Users drill shortcuts by pressing actual keys, with timed and practice modes, organized by category. Covers ~30 essential IB shortcuts across navigation, formula entry, formatting, and selection/editing.

</domain>

<decisions>
## Implementation Decisions

### Drill interaction format
- **Keypress capture**: User sees an action prompt, must press the actual key combination (app captures keypress events)
- **Bidirectional drills**: Action→Keys (press the keys) AND Keys→Action (reverse — Claude decides format, likely multiple choice)
- **Category-based sessions**: User picks a category and drills ALL shortcuts in it; also an "All Categories" mixed option
- **Two modes**: Practice (untimed) for learning + Timed (countdown per question, Claude decides duration) for interview pressure
- **Text prompts only**: No visual keyboard — clean text showing the action description
- **No key echo**: User presses keys, immediately graded correct/incorrect — no real-time display of pressed keys
- **OS selection**: User picks Mac or Windows mode at session start; shortcuts adapt accordingly
- **Mac+Windows mode**: When Mac user selects Windows mode, Ctrl is literal (must press actual Ctrl key, Cmd does NOT substitute)

### Shortcut content scope
- **All four categories**: Navigation, formula entry, formatting, selection & editing
- **~30 total shortcuts**: Essential IB analyst shortcuts only — focused and memorizable
- **Alt-key ribbon sequences**: Claude decides whether to include (e.g., Alt+H+B+A for borders) based on interview relevance
- **IB context per shortcut**: Each shortcut includes brief finance workflow context (e.g., "Used when building DCF models to lock cell references")

### Feedback and scoring
- **Correct answer**: Green flash + auto-advance to next question (~1s delay)
- **Incorrect answer**: Red flash, display correct shortcut for ~2s, auto-advance
- **Timeout**: Counts as incorrect (same treatment as wrong answer)
- **No live score**: Running score is hidden during drill; revealed only at session end
- **Progress indicator**: Show "Question X of Y" during drill
- **Session summary**: Score (correct/total) + list of missed shortcuts with correct answers + time stats (average response time, fastest, slowest)
- **No auto-repeat of missed**: Session ends clean after summary. User starts a new session to practice more
- **Mid-session quit**: Escape + confirmation dialog → partial summary of what was completed

### Browser conflict strategy
- **Unblockable shortcuts** (Ctrl+W, Ctrl+T, Ctrl+N): Show as info cards in a separate "Browser-blocked shortcuts" reference section — NOT drilled
- **Interceptable shortcuts** (Ctrl+S, Ctrl+P, etc.): Use preventDefault during active drill mode — user practices them cleanly
- **Capture mode indicator**: Visible banner/badge showing "Capturing shortcuts" when drill is active
- **Capture scope**: Only capture keypresses during active drill. Normal browser behavior everywhere else (summary screen, shortcut list, etc.)
- **Escape behavior**: Escape shows confirmation dialog during drill, not instant exit

### Claude's Discretion
- Countdown timer duration per question (somewhere between 5-10 seconds)
- Reverse drill (Keys→Action) answer format — likely multiple choice with 3-4 options
- Whether to include Alt-key ribbon sequences based on IB interview relevance research
- Auto-advance delay timing (exact ms for correct/incorrect)
- Session summary visual design

</decisions>

<specifics>
## Specific Ideas

- IB desks use Windows — the Windows mode with literal Ctrl is the primary use case
- Each shortcut should have finance context like "Used when building DCF models to lock cell references" — not just "Toggle absolute reference"
- Category-based sessions drill ALL shortcuts in the category (not a random subset)
- The drill module is completely separate from the formula challenge flow — its own route/page

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 04-keyboard-shortcuts*
*Context gathered: 2026-02-22*
