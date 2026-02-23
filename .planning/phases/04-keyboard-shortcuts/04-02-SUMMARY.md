# Plan 04-02: Drill UI, Routing & Sidebar — Summary

**Status:** Complete
**Duration:** ~10 min (including bug fix)

## What Was Built

### Components Created
- `src/pages/ShortcutsPage.tsx` — Orchestrates idle/drilling/feedback/summary states
- `src/components/shortcuts/ShortcutSetup.tsx` — OS + mode + direction + category picker
- `src/components/shortcuts/ShortcutDrill.tsx` — Native keydown listener with keypress capture, multiple choice for Keys→Action, timer, quit confirmation
- `src/components/shortcuts/ShortcutFeedback.tsx` — Green/red flash with correct shortcut display, auto-advance
- `src/components/shortcuts/ShortcutSummary.tsx` — Score, time stats (avg/fastest/slowest), missed shortcuts list
- `src/components/shortcuts/BrowserBlockedRef.tsx` — Reference cards for Ctrl+W, Ctrl+T, Ctrl+N

### Routing & Navigation
- `/shortcuts` route added in `src/App.tsx`
- `src/components/AppShell.tsx` upgraded to NavLink-based sidebar with active state

## Commits
- `93768f0` feat(04-02): create ShortcutsPage and all drill UI components
- `0fb29d8` feat(04-02): wire /shortcuts route and upgrade sidebar to NavLink navigation
- `b142c74` fix(04-02): remove unused destructured store vars from ShortcutDrill
- `97ef30f` fix(04-02): use individual Zustand selectors to fix React 19 infinite re-render

## Deviations
- **Bug fix required:** Object-returning Zustand selectors caused React 19 `useSyncExternalStore` infinite re-render loop. Fixed by switching to individual selectors matching existing project pattern.

## Key Files

### Created
- src/pages/ShortcutsPage.tsx
- src/components/shortcuts/ShortcutSetup.tsx
- src/components/shortcuts/ShortcutDrill.tsx
- src/components/shortcuts/ShortcutFeedback.tsx
- src/components/shortcuts/ShortcutSummary.tsx
- src/components/shortcuts/BrowserBlockedRef.tsx

### Modified
- src/App.tsx (added /shortcuts route)
- src/components/AppShell.tsx (upgraded to NavLink sidebar)

## Self-Check: PASSED
- All components render without errors
- Action→Keys keypress capture works (green/red feedback, auto-advance)
- Keys→Action multiple choice works
- Timed mode countdown works, timeout treated as incorrect
- Escape shows quit confirmation dialog
- Session summary shows score + missed + time stats
- Sidebar active state highlights correct route
- Browser-blocked reference cards display on setup screen
