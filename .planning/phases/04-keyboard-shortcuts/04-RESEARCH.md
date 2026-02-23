# Phase 4: Keyboard Shortcuts - Research

**Researched:** 2026-02-22
**Domain:** Keyboard event capture, React global listeners, shortcut data modeling, drill state machine
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Drill interaction format**
- **Keypress capture**: User sees an action prompt, must press the actual key combination (app captures keypress events)
- **Bidirectional drills**: Action→Keys (press the keys) AND Keys→Action (reverse — Claude decides format, likely multiple choice)
- **Category-based sessions**: User picks a category and drills ALL shortcuts in it; also an "All Categories" mixed option
- **Two modes**: Practice (untimed) for learning + Timed (countdown per question, Claude decides duration) for interview pressure
- **Text prompts only**: No visual keyboard — clean text showing the action description
- **No key echo**: User presses keys, immediately graded correct/incorrect — no real-time display of pressed keys
- **OS selection**: User picks Mac or Windows mode at session start; shortcuts adapt accordingly
- **Mac+Windows mode**: When Mac user selects Windows mode, Ctrl is literal (must press actual Ctrl key, Cmd does NOT substitute)

**Shortcut content scope**
- **All four categories**: Navigation, formula entry, formatting, selection & editing
- **~30 total shortcuts**: Essential IB analyst shortcuts only — focused and memorizable
- **Alt-key ribbon sequences**: Claude decides whether to include (e.g., Alt+H+B+A for borders) based on interview relevance
- **IB context per shortcut**: Each shortcut includes brief finance workflow context (e.g., "Used when building DCF models to lock cell references")

**Feedback and scoring**
- **Correct answer**: Green flash + auto-advance to next question (~1s delay)
- **Incorrect answer**: Red flash, display correct shortcut for ~2s, auto-advance
- **Timeout**: Counts as incorrect (same treatment as wrong answer)
- **No live score**: Running score is hidden during drill; revealed only at session end
- **Progress indicator**: Show "Question X of Y" during drill
- **Session summary**: Score (correct/total) + list of missed shortcuts with correct answers + time stats (average response time, fastest, slowest)
- **No auto-repeat of missed**: Session ends clean after summary. User starts a new session to practice more
- **Mid-session quit**: Escape + confirmation dialog → partial summary of what was completed

**Browser conflict strategy**
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

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| KEYS-01 | User can practice Excel keyboard shortcuts through interactive drills | Global `keydown` listener with `useEffect` + `document.addEventListener`; drill state machine in a new Zustand store (`useShortcutStore`); separate route `/shortcuts` with dedicated `ShortcutsPage` component |
| KEYS-02 | Shortcut drills cover finance-workflow-relevant shortcuts (navigation, formatting, formula entry) | ~30 IB-verified shortcuts across 4 categories compiled below; each has Windows/Mac variants and finance context; Alt-key sequences (Alt+=, Alt+Enter) are safe to drill; Alt+H+B (ribbon sequences) deferred — not memorizable as keypress |
</phase_requirements>

---

## Summary

Phase 4 is architecturally independent from the formula challenge loop. It needs: (1) a shortcut data file defining ~30 IB shortcuts with Windows/Mac key combos and finance context; (2) a Zustand store (`useShortcutStore`) managing drill session state entirely separate from `useChallengeStore`; (3) a `ShortcutsPage` component at `/shortcuts` with a session-setup screen, drill screen, and summary screen; (4) global `keydown` listener active only during drill mode using `document.addEventListener` (NOT React synthetic events); and (5) correct handling of browser-reserved vs interceptable shortcuts.

The most important technical constraint: for the keypress-capture drill, the listener MUST be a native DOM `addEventListener` on `document`, not a React `onKeyDown` prop. React synthetic events are delegated through the root element; native `document` listeners run earlier in the event flow and can call `e.preventDefault()` before the browser acts. This is the only reliable way to intercept Ctrl+S, Ctrl+P, and similar shortcuts during drill mode.

The second most important constraint: Ctrl+W, Ctrl+T, and Ctrl+N are browser-reserved on all major browsers and cannot be `preventDefault`-ed. These shortcuts are real Excel shortcuts but cannot be drilled in a browser. The user decided to show them in a separate reference section instead. This must be enforced at the data layer — mark them with `browserBlocked: true` and exclude them from drill queues.

**Primary recommendation:** Build a completely separate `useShortcutStore` using the same `create` from Zustand. Wire a single `useEffect` in the drill view that adds/removes the global `keydown` listener. Model the drill as a state machine: `idle` → `setup` → `drilling` → `feedback` → `drilling` | `summary`.

---

## Standard Stack

### Core (all already installed — no new packages needed)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | 19.2.x | Drill UI, category picker, session summary | Already installed |
| Zustand | 5.0.11 | Drill session state (mode, OS, current Q, score) | Already installed; same pattern as `useChallengeStore` |
| TypeScript | 5.9.x | Shortcut type, DrillSession type | Already installed |
| react-router-dom | 7.13.0 | `/shortcuts` route, routing between pages | Already installed |
| Tailwind CSS | 4.2.x | Drill UI layout, flash states (green/red) | Already installed |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `clsx` + `tailwind-merge` | installed | Conditional class names for green/red flash feedback | Already installed |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Native `document.addEventListener` | React `onKeyDown` on a focused `div` | React `onKeyDown` requires the element to be focused and doesn't intercept browser-handled shortcuts before the browser acts; native listener runs first |
| Separate `useShortcutStore` | Adding to `useChallengeStore` | Drill state and challenge state are unrelated domains; co-locating creates coupling and complicates the existing challenge store |
| `setInterval` for countdown timer | `requestAnimationFrame` | `setInterval` with 1s tick is sufficient — no sub-second display needed; `requestAnimationFrame` is overkill |

**No new packages needed.** All required capabilities are in the existing stack.

**Installation:**
```bash
# No installation needed — all packages already in package.json
```

---

## Architecture Patterns

### Recommended Project Structure

```
src/
├── data/
│   └── shortcuts/
│       └── index.ts          # NEW: ~30 IB shortcuts with Windows/Mac combos + finance context
├── store/
│   ├── challengeStore.ts     # UNCHANGED (do not touch)
│   └── shortcutStore.ts      # NEW: drill session state (separate from challengeStore)
├── pages/
│   ├── WelcomePage.tsx       # UNCHANGED
│   ├── ChallengePage.tsx     # UNCHANGED (do not touch)
│   └── ShortcutsPage.tsx     # NEW: drill flow orchestrator (setup → drill → summary)
├── components/
│   ├── AppShell.tsx          # MODIFY: add 'Keyboard Shortcuts' nav link to /shortcuts
│   └── shortcuts/            # NEW: drill UI components (separate folder to avoid clutter)
│       ├── ShortcutSetup.tsx        # Category + OS + mode selection screen
│       ├── ShortcutDrill.tsx        # Active drill — listens for keypresses
│       ├── ShortcutSummary.tsx      # End-of-session score + missed list
│       ├── ShortcutFeedback.tsx     # Green/red flash overlay or inline
│       └── BrowserBlockedRef.tsx   # Reference card for Ctrl+W/T/N
├── App.tsx                   # MODIFY: add /shortcuts route
└── types/
    └── index.ts              # EXTEND: add Shortcut, DrillSession types
```

### Pattern 1: Shortcut Data Model

**What:** TypeScript type for a single shortcut entry, supporting Windows and Mac key combinations, browser-blocked flag, and IB finance context.

**Example:**
```typescript
// src/types/index.ts — add to existing types

export type ShortcutCategory = 'navigation' | 'formula-entry' | 'formatting' | 'selection-editing';

export interface ShortcutKeys {
  windows: string[];  // e.g. ['Ctrl', 'D'] or ['F4'] or ['Alt', '=']
  mac: string[];      // e.g. ['Cmd', 'D'] or ['F4'] or ['Cmd', '=']
}

export interface Shortcut {
  id: string;
  action: string;           // What it does: "Fill Down"
  keys: ShortcutKeys;
  category: ShortcutCategory;
  financeContext: string;   // IB workflow note: "Used to copy formulas down a column in DCF models"
  browserBlocked?: boolean; // true = cannot be captured (Ctrl+W, Ctrl+T, Ctrl+N)
}
```

**Key insight:** Store keys as string arrays (not a single display string) so the grader can normalize and compare against `KeyboardEvent` properties without string parsing.

### Pattern 2: Global Keydown Listener (CRITICAL)

**What:** Attach a native DOM event listener to `document` during drill mode. NOT a React `onKeyDown` prop.

**Why native:** React synthetic events are delegated to the root element and run after browser processing. Native `document.addEventListener` with `{ capture: true }` runs first in the event chain, enabling `e.preventDefault()` to block Ctrl+S, Ctrl+P, and similar interceptable shortcuts before the browser acts on them.

**Verified source:** Mozilla Bugzilla #1291706 — Firefox intentionally blocked Ctrl+W/T/N from script override. MDN KeyboardEvent docs — `ctrlKey`, `shiftKey`, `altKey`, `metaKey` booleans plus `key` string for combination detection.

```typescript
// src/components/shortcuts/ShortcutDrill.tsx

import { useEffect } from 'react';

export function ShortcutDrill({ onAnswer }: { onAnswer: (keys: string[]) => void }) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Build the pressed key combo
      const pressed: string[] = [];
      if (e.ctrlKey)  pressed.push('Ctrl');
      if (e.altKey)   pressed.push('Alt');
      if (e.shiftKey) pressed.push('Shift');
      if (e.metaKey)  pressed.push('Cmd');

      // Normalize key name
      const key = e.key.length === 1 ? e.key.toUpperCase() : e.key;
      if (!['Control', 'Alt', 'Shift', 'Meta'].includes(e.key)) {
        pressed.push(key);
      }

      // Block interceptable shortcuts during drill
      const interceptable = ['s', 'p', 'f', 'd', 'r', 'b', 'i', 'u', 'z'];
      if (e.ctrlKey && interceptable.includes(e.key.toLowerCase())) {
        e.preventDefault();
      }

      // Suppress Escape from closing dialogs (let drill handle it)
      if (e.key === 'Escape') {
        e.preventDefault();
      }

      onAnswer(pressed);
    }

    document.addEventListener('keydown', handleKeyDown, { capture: true });
    return () => {
      document.removeEventListener('keydown', handleKeyDown, { capture: true });
    };
  }, [onAnswer]); // onAnswer must be stable (useCallback in parent)
  // ...
}
```

**CRITICAL cleanup:** The exact same function reference must be passed to both `addEventListener` and `removeEventListener`. Use `useEffect` cleanup return — never a separate `removeEventListener` call. The `onAnswer` callback from the parent must be wrapped in `useCallback` to keep it stable across renders.

### Pattern 3: Drill State Machine in Zustand

**What:** A separate Zustand store modeling the drill lifecycle as a state machine. Never modifies `useChallengeStore`.

**States:**
- `idle` — no active session; shows setup screen
- `drilling` — active question; listener is live
- `feedback` — showing result (correct/incorrect) before auto-advance
- `summary` — session complete; shows results

```typescript
// src/store/shortcutStore.ts

import { create } from 'zustand';
import type { Shortcut, ShortcutCategory } from '../types';

type DrillState = 'idle' | 'drilling' | 'feedback' | 'summary';
type OSMode = 'windows' | 'mac';
type DrillMode = 'practice' | 'timed';

interface DrillResult {
  shortcut: Shortcut;
  correct: boolean;
  responseMs: number;  // milliseconds from question shown to answer
}

interface ShortcutStore {
  // Session config
  osMode: OSMode;
  drillMode: DrillMode;
  selectedCategory: ShortcutCategory | 'all';

  // Session state
  drillState: DrillState;
  queue: Shortcut[];            // Ordered list of shortcuts for this session
  currentIndex: number;
  results: DrillResult[];
  questionStartTime: number;    // Date.now() when question became visible
  timeRemaining: number;        // seconds left (timed mode only)

  // Current feedback
  lastPressedKeys: string[];
  lastCorrect: boolean | null;

  // Actions
  setConfig: (os: OSMode, mode: DrillMode, category: ShortcutCategory | 'all') => void;
  startSession: (shortcuts: Shortcut[]) => void;
  submitAnswer: (pressedKeys: string[]) => void;
  advanceToNext: () => void;
  tick: () => void;             // Called by 1s interval in timed mode
  quitSession: () => void;      // Mid-session quit → goes to summary with partial results
  resetToIdle: () => void;
}

export const useShortcutStore = create<ShortcutStore>((set, get) => ({
  osMode: 'windows',
  drillMode: 'practice',
  selectedCategory: 'all',
  drillState: 'idle',
  queue: [],
  currentIndex: 0,
  results: [],
  questionStartTime: 0,
  timeRemaining: 7,             // 7 seconds default for timed mode
  lastPressedKeys: [],
  lastCorrect: null,

  setConfig: (os, mode, category) =>
    set({ osMode: os, drillMode: mode, selectedCategory: category }),

  startSession: (shortcuts) =>
    set({
      drillState: 'drilling',
      queue: shortcuts,
      currentIndex: 0,
      results: [],
      questionStartTime: Date.now(),
      timeRemaining: 7,
      lastPressedKeys: [],
      lastCorrect: null,
    }),

  submitAnswer: (pressedKeys) => {
    const { queue, currentIndex, osMode, questionStartTime, results } = get();
    const shortcut = queue[currentIndex];
    const correct = gradeKeys(pressedKeys, shortcut, osMode);
    const responseMs = Date.now() - questionStartTime;
    set({
      drillState: 'feedback',
      lastPressedKeys: pressedKeys,
      lastCorrect: correct,
      results: [...results, { shortcut, correct, responseMs }],
    });
  },

  advanceToNext: () => {
    const { queue, currentIndex } = get();
    const nextIndex = currentIndex + 1;
    if (nextIndex >= queue.length) {
      set({ drillState: 'summary' });
    } else {
      set({
        drillState: 'drilling',
        currentIndex: nextIndex,
        questionStartTime: Date.now(),
        timeRemaining: 7,
        lastPressedKeys: [],
        lastCorrect: null,
      });
    }
  },

  tick: () => {
    const { drillState, drillMode, timeRemaining } = get();
    if (drillState !== 'drilling' || drillMode !== 'timed') return;
    if (timeRemaining > 1) {
      set({ timeRemaining: timeRemaining - 1 });
    } else {
      // Timeout — treat as incorrect
      const { queue, currentIndex, osMode, questionStartTime, results } = get();
      const shortcut = queue[currentIndex];
      set({
        drillState: 'feedback',
        lastCorrect: false,
        lastPressedKeys: [],
        results: [...results, { shortcut, correct: false, responseMs: Date.now() - questionStartTime }],
      });
    }
  },

  quitSession: () => set({ drillState: 'summary' }),
  resetToIdle: () => set({ drillState: 'idle' }),
}));

// Pure grading function — compare pressed keys against shortcut definition
function gradeKeys(pressed: string[], shortcut: Shortcut, os: OSMode): boolean {
  const expected = os === 'windows' ? shortcut.keys.windows : shortcut.keys.mac;
  if (pressed.length !== expected.length) return false;
  const sortedPressed = [...pressed].sort();
  const sortedExpected = [...expected].sort();
  return sortedPressed.every((k, i) => k === sortedExpected[i]);
}
```

### Pattern 4: Drill Screen Component (ShortcutsPage orchestrator)

**What:** `ShortcutsPage` reads `drillState` from the store and renders the correct screen. No conditional rendering inside child components — all routing happens at the page level.

```typescript
// src/pages/ShortcutsPage.tsx
import { useShortcutStore } from '../store/shortcutStore';
import { ShortcutSetup } from '../components/shortcuts/ShortcutSetup';
import { ShortcutDrill } from '../components/shortcuts/ShortcutDrill';
import { ShortcutSummary } from '../components/shortcuts/ShortcutSummary';

export function ShortcutsPage() {
  const drillState = useShortcutStore((s) => s.drillState);

  if (drillState === 'idle') return <ShortcutSetup />;
  if (drillState === 'summary') return <ShortcutSummary />;
  // 'drilling' and 'feedback' are both handled in ShortcutDrill
  return <ShortcutDrill />;
}
```

### Pattern 5: Key Normalization for Grading

**What:** Normalize `KeyboardEvent` properties into a consistent string array that can be compared against `Shortcut.keys.windows` / `Shortcut.keys.mac`.

**Normalization rules (verified from MDN `KeyboardEvent`):**
- `e.ctrlKey === true` → push `'Ctrl'`
- `e.shiftKey === true` → push `'Shift'`
- `e.altKey === true` → push `'Alt'`
- `e.metaKey === true` → push `'Cmd'`
- `e.key === 'F4'` → push `'F4'` (function keys come through as-is)
- `e.key === '='` → push `'='` (symbol keys as-is)
- `e.key === 'ArrowDown'` → push `'ArrowDown'`
- `e.key === 'Home'` → push `'Home'`
- Single character letters (a-z) → uppercase: `e.key.toUpperCase()`
- Skip modifier-only events: filter out `['Control', 'Alt', 'Shift', 'Meta']` from the key push

**Critical:** `e.key` for letter keys returns lowercase when Shift is not pressed and uppercase when Shift IS pressed. To avoid double-Shift confusion, always normalize letters to uppercase and track `shiftKey` separately as `'Shift'` in the combo.

**Grade by sorted set comparison:** `['Ctrl', 'D']` and `['D', 'Ctrl']` must both match. Sort both arrays before comparing.

### Pattern 6: Timed Mode Countdown

**What:** `setInterval` ticking every second, calling `useShortcutStore.getState().tick()`. Mounted in `ShortcutDrill` when `drillMode === 'timed'` and `drillState === 'drilling'`.

```typescript
// Inside ShortcutDrill component
useEffect(() => {
  if (drillMode !== 'timed') return;
  const interval = setInterval(() => {
    useShortcutStore.getState().tick();
  }, 1000);
  return () => clearInterval(interval);
}, [drillMode, drillState]); // Re-mount when state changes
```

**Alternative approach** (simpler, avoids stale closure): Store `questionStartTime` in Zustand and compute `timeRemaining = timerDuration - Math.floor((Date.now() - questionStartTime) / 1000)` in a `tick()` called by the interval. This avoids needing to sync remaining seconds in state — just store the timestamp.

### Pattern 7: AppShell Navigation Update

**What:** Add a clickable "Keyboard Shortcuts" nav link pointing to `/shortcuts`. The current `AppShell` uses a static `NAV_ITEMS` array with `active: true/false` — upgrade to use `react-router-dom`'s `NavLink` or `useLocation` to determine active state.

```typescript
// src/components/AppShell.tsx — modify NAV_ITEMS to route-based links
import { NavLink } from 'react-router-dom';

const NAV_ITEMS = [
  { label: 'Formula Practice', to: '/challenge' },
  { label: 'Keyboard Shortcuts', to: '/shortcuts' },
  { label: 'Progress', to: '/progress', disabled: true },
];

// Render with NavLink, passing isActive to style the active state
```

### Anti-Patterns to Avoid

- **React `onKeyDown` on a div for shortcut capture:** Requires the element to have focus AND doesn't intercept browser shortcuts before the browser handles them. Use native `document.addEventListener` in a `useEffect`.
- **Putting drill state in component `useState`:** Session state (score, results, timer) must survive component re-renders during feedback flash. Use Zustand store.
- **Attempting to intercept Ctrl+W, Ctrl+T, Ctrl+N:** These are browser-reserved on Chrome and Firefox. Any `e.preventDefault()` calls for these are silently ignored. Mark these shortcuts `browserBlocked: true` in the data and exclude them from the drill queue entirely.
- **Not cleaning up the event listener:** Always `document.removeEventListener` in the `useEffect` cleanup. Stale listeners accumulate and fire multiple times per keypress.
- **Grading before the listener is active:** The listener is only attached when `drillState === 'drilling'`. In `feedback` state, the listener must be removed (or ignore events) to prevent double-grading while the answer flash is displayed.
- **Using `e.code` instead of `e.key`:** `e.code` gives the physical key position (`'KeyD'`, `'Digit4'`). `e.key` gives the logical value (`'d'`, `'4'`, `'F4'`, `'ArrowDown'`). For shortcut matching, `e.key` is more reliable and keyboard-layout independent for letters.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Key combination detection | Custom key buffer, debounce logic | `KeyboardEvent.ctrlKey` + `.shiftKey` + `.altKey` + `.metaKey` + `.key` | Browser provides combination state directly on every event — no need to track keys held down manually |
| Timer countdown | Custom animation-frame loop | `setInterval` + Zustand `tick()` action | 1-second granularity is sufficient; simpler state management |
| Drill queue shuffle | Seeded random number generator | `[...shortcuts].sort(() => Math.random() - 0.5)` | Simple Fisher-Yates via sort is sufficient for ~30 items |
| Multiple choice options for reverse drill | External library | Slice + shuffle of shortcut pool | Pick N-1 wrong answers from the same category for plausibility |

**Key insight:** The keyboard event API provides all combination state as boolean properties on the event object. No key-tracking library is needed.

---

## Common Pitfalls

### Pitfall 1: Global Listener Fires When Drill Is Not Active

**What goes wrong:** User navigates back to the challenge page; the shortcut drill listener is still attached and intercepts keypresses in the spreadsheet grid (e.g., prevents Ctrl+S saving behavior or interferes with Handsontable).

**Why it happens:** `useEffect` cleanup only runs on unmount. If the listener is attached to `document` globally, it persists as long as the component is mounted.

**How to avoid:** Only attach the `keydown` listener when `drillState === 'drilling'`. In the `useEffect` dependency array, include `drillState`. When `drillState` transitions to `feedback` or `summary`, the cleanup fires and the listener is removed.

```typescript
useEffect(() => {
  if (drillState !== 'drilling') return; // Don't attach unless drilling
  document.addEventListener('keydown', handleKeyDown, { capture: true });
  return () => document.removeEventListener('keydown', handleKeyDown, { capture: true });
}, [drillState, handleKeyDown]);
```

**Warning signs:** Ctrl+S triggers "answer submitted" while on other pages; Handsontable Enter key behavior changes when navigating from shortcuts page.

---

### Pitfall 2: `handleKeyDown` Reference Instability Causes Double Listeners

**What goes wrong:** Every render creates a new `handleKeyDown` function reference. `useEffect` sees a changed dependency, removes the old listener and adds the new one — but if there's any timing gap or if React renders twice in development StrictMode, two listeners can be active simultaneously. Each keypress fires `onAnswer` twice.

**Why it happens:** `onAnswer` is passed as a prop from the parent without `useCallback`, so it's recreated on every parent render. `handleKeyDown` closes over `onAnswer` and is recreated too.

**How to avoid:** Wrap the `handleKeyDown` definition in `useCallback` or define it inside `useEffect` (so it's only recreated when deps change, not on every render). Better: call `useShortcutStore.getState().submitAnswer()` directly inside `handleKeyDown` instead of receiving a callback prop — the store reference is stable.

```typescript
useEffect(() => {
  if (drillState !== 'drilling') return;
  function handleKeyDown(e: KeyboardEvent) {
    // ... normalize keys ...
    useShortcutStore.getState().submitAnswer(pressedKeys);
  }
  document.addEventListener('keydown', handleKeyDown, { capture: true });
  return () => document.removeEventListener('keydown', handleKeyDown, { capture: true });
}, [drillState]); // Only drillState as dep — handleKeyDown defined inside, accesses store directly
```

**Warning signs:** Answer processes twice per keypress; score doubles unexpectedly in results.

---

### Pitfall 3: Alt Key Sequences Not Captured Correctly

**What goes wrong:** Alt+= (AutoSum) works fine, but Alt+H+B sequences (ribbon navigation) do not register as a single keypress because they are sequential key presses, not simultaneous combinations.

**Why it happens:** Alt+H+B is not a chord (held simultaneously) — it's a sequential key sequence where each key is pressed and released in order. `KeyboardEvent` fires one event per key, not one event for the sequence.

**How to avoid:** Do NOT include sequential Alt ribbon sequences (Alt+H+B+A, Alt+H+FC, etc.) in the keypress-detection drill. These are valid Excel shortcuts but require a sequential input model, not a chord detector. Include only chord-style Alt combinations (Alt+=, Alt+Enter) that are pressed simultaneously. Show ribbon sequences in the reference section only, clearly labeled as "press in sequence" rather than "hold simultaneously."

**Research finding:** Based on IB shortcut research, Alt+= (AutoSum) and Alt+Enter (new line in cell) are the only Alt sequences commonly tested in interviews that are also true chords. Ribbon sequences (Alt+H+...) are important for productivity but not typically tested as memorized keypresses in interviews.

**Warning signs:** Alt ribbon sequences never register as correct; users hold all keys simultaneously expecting it to work.

---

### Pitfall 4: F-Key Shortcuts Intercepted by OS or Browser

**What goes wrong:** F1 opens browser help, F5 refreshes the page, F11 toggles full screen — these fire before `keydown` handlers can `preventDefault`.

**Why it happens:** Certain F-keys are OS-level or browser-level shortcuts that cannot be overridden by web content.

**How to avoid:** Test each F-key shortcut before adding it to the drill data. Confirmed interceptable (can `preventDefault`): F2, F4, F9. Confirmed risky: F1 (browser help), F5 (refresh), F11 (fullscreen), F12 (devtools). Include F2, F4, F9 in the drill. Add a note to the shortcut data for F5 (Go To dialog) that it may be browser-intercepted and handle gracefully.

**Warning signs:** Page refreshes when user tries to answer F5 question; browser help pops up on F1.

---

### Pitfall 5: OS Mismatch — Mac User in Windows Mode

**What goes wrong:** Mac user selects Windows mode. They press Cmd+D expecting it to register as Ctrl+D. It doesn't — Windows mode requires literal Ctrl key.

**Why it happens:** This is intentional per the user decision: "Ctrl is literal (must press actual Ctrl key, Cmd does NOT substitute)." But the UI must be crystal clear about this.

**How to avoid:** On the session setup screen, when a Mac user selects Windows mode, show a warning banner: "Windows mode requires Ctrl, not Cmd. You'll need to use the actual Ctrl key." On Mac, `e.ctrlKey` is true when the physical Control key (bottom-left of keyboard) is pressed — not when Cmd is pressed. Test this behavior during implementation.

**Warning signs:** Mac users in Windows mode always get incorrect answers; confusion reported about why Cmd doesn't work.

---

### Pitfall 6: Escape During Drill Behavior

**What goes wrong:** Escape closes a browser dialog or navigates back before the confirmation dialog can appear.

**Why it happens:** Browser default Escape behavior varies. In some contexts, it can close overlays or cancel page loads.

**How to avoid:** In the `keydown` handler active during drill, call `e.preventDefault()` for Escape key AND show the quit-confirmation dialog. The handler intercepts Escape before any browser default fires.

```typescript
if (e.key === 'Escape') {
  e.preventDefault();
  // Show quit confirmation dialog (React state)
}
```

---

## Code Examples

Verified patterns from official sources and installed packages:

### KeyboardEvent Properties — From MDN (MEDIUM confidence, standard web API)

```typescript
// Source: MDN Web Docs - KeyboardEvent
// https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent

function normalizeKeyCombo(e: KeyboardEvent): string[] {
  const pressed: string[] = [];
  if (e.ctrlKey)  pressed.push('Ctrl');
  if (e.altKey)   pressed.push('Alt');
  if (e.shiftKey) pressed.push('Shift');
  if (e.metaKey)  pressed.push('Cmd');  // Cmd on Mac, Windows key on Windows

  // Only push non-modifier key if it's not a bare modifier press
  const MODIFIERS = new Set(['Control', 'Alt', 'Shift', 'Meta']);
  if (!MODIFIERS.has(e.key)) {
    // Normalize single characters to uppercase; keep function keys as-is
    const key = e.key.length === 1 ? e.key.toUpperCase() : e.key;
    pressed.push(key);
  }

  return pressed;  // e.g. ['Ctrl', 'D'] or ['F4'] or ['Alt', '=']
}

// Grade against shortcut definition (sort both to handle order-insensitivity)
function keysMatch(pressed: string[], expected: string[]): boolean {
  if (pressed.length !== expected.length) return false;
  const a = [...pressed].sort();
  const b = [...expected].sort();
  return a.every((k, i) => k === b[i]);
}
```

### Global Listener in useEffect — Verified Pattern

```typescript
// Standard React + TypeScript pattern for global keyboard listener
// Source: React docs + MDN EventTarget.addEventListener

import { useEffect, useCallback } from 'react';
import { useShortcutStore } from '../../store/shortcutStore';

export function ShortcutDrill() {
  const drillState = useShortcutStore((s) => s.drillState);

  useEffect(() => {
    if (drillState !== 'drilling') return;

    function handleKeyDown(e: KeyboardEvent) {
      const pressed = normalizeKeyCombo(e);

      // Prevent browser from acting on interceptable shortcuts during drill
      const interceptableCtrl = new Set(['s', 'p', 'd', 'r', 'b', 'i', 'u', 'f', 'z']);
      if (e.ctrlKey && interceptableCtrl.has(e.key.toLowerCase())) {
        e.preventDefault();
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        useShortcutStore.getState().requestQuit(); // triggers confirmation dialog
        return;
      }

      // Only grade on non-modifier-only presses
      const MODIFIERS = new Set(['Control', 'Alt', 'Shift', 'Meta']);
      if (!MODIFIERS.has(e.key)) {
        useShortcutStore.getState().submitAnswer(pressed);
      }
    }

    // capture: true ensures we run before browser handles the event
    document.addEventListener('keydown', handleKeyDown, { capture: true });
    return () => {
      document.removeEventListener('keydown', handleKeyDown, { capture: true });
    };
  }, [drillState]); // Re-evaluate when drillState changes
  // ...
}
```

### Shortcut Data File Structure

```typescript
// src/data/shortcuts/index.ts

import type { Shortcut } from '../../types';

export const shortcuts: Shortcut[] = [
  // ── Navigation ─────────────────────────────────────────────────────────────
  {
    id: 'nav-ctrl-arrow',
    action: 'Jump to edge of data region',
    keys: { windows: ['Ctrl', 'ArrowDown'], mac: ['Cmd', 'ArrowDown'] },
    category: 'navigation',
    financeContext: 'Jump to the bottom of a column in a DCF or LBO model to find the last row instantly',
  },
  {
    id: 'nav-ctrl-home',
    action: 'Go to cell A1',
    keys: { windows: ['Ctrl', 'Home'], mac: ['Cmd', 'Home'] },
    category: 'navigation',
    financeContext: 'Return to the top of any model to start reviewing from the beginning',
  },
  {
    id: 'nav-ctrl-end',
    action: 'Go to last used cell',
    keys: { windows: ['Ctrl', 'End'], mac: ['Cmd', 'End'] },
    category: 'navigation',
    financeContext: "Quickly find where a model's data ends to check model size",
  },
  {
    id: 'nav-f5',
    action: 'Open Go To dialog',
    keys: { windows: ['F5'], mac: ['F5'] },
    category: 'navigation',
    financeContext: 'Navigate directly to a specific cell address (e.g., jump to B47 in a large model)',
    // Note: F5 may refresh browser — handle gracefully with instruction
  },
  {
    id: 'nav-ctrl-pgdn',
    action: 'Move to next worksheet tab',
    keys: { windows: ['Ctrl', 'PageDown'], mac: ['Cmd', 'PageDown'] },  // Adjust for Mac
    category: 'navigation',
    financeContext: 'Navigate between the Income Statement, Balance Sheet, and Cash Flow tabs',
  },
  {
    id: 'nav-ctrl-pgup',
    action: 'Move to previous worksheet tab',
    keys: { windows: ['Ctrl', 'PageUp'], mac: ['Cmd', 'PageUp'] },
    category: 'navigation',
    financeContext: 'Navigate between model tabs without lifting hands from keyboard',
  },

  // ── Formula Entry ───────────────────────────────────────────────────────────
  {
    id: 'formula-f4',
    action: 'Toggle absolute/relative cell reference ($A$1 ↔ A$1 ↔ $A1 ↔ A1)',
    keys: { windows: ['F4'], mac: ['F4'] },
    category: 'formula-entry',
    financeContext: 'Lock a cell reference when building a formula that references a fixed assumption (e.g., discount rate)',
  },
  {
    id: 'formula-f2',
    action: 'Edit cell (enter edit mode)',
    keys: { windows: ['F2'], mac: ['F2'] },
    category: 'formula-entry',
    financeContext: 'Edit an existing formula in a cell without retyping from scratch',
  },
  {
    id: 'formula-alt-equals',
    action: 'AutoSum selected range',
    keys: { windows: ['Alt', '='], mac: ['Cmd', 'Shift', 'T'] },
    category: 'formula-entry',
    financeContext: 'Instantly sum a column of revenue or expense figures in a P&L',
  },
  {
    id: 'formula-ctrl-backtick',
    action: 'Toggle show formulas (instead of values)',
    keys: { windows: ['Ctrl', '`'], mac: ['Ctrl', '`'] },
    category: 'formula-entry',
    financeContext: 'Audit a model by revealing all formulas at once — standard due diligence step',
  },
  {
    id: 'formula-f9',
    action: 'Recalculate all formulas',
    keys: { windows: ['F9'], mac: ['F9'] },
    category: 'formula-entry',
    financeContext: 'Force recalculation after changing assumptions in a model with circular references',
  },
  {
    id: 'formula-shift-f3',
    action: 'Open Insert Function dialog',
    keys: { windows: ['Shift', 'F3'], mac: ['Shift', 'F3'] },
    category: 'formula-entry',
    financeContext: 'Look up function syntax while building a complex formula',
  },
  {
    id: 'formula-ctrl-shift-enter',
    action: 'Enter array formula',
    keys: { windows: ['Ctrl', 'Shift', 'Enter'], mac: ['Cmd', 'Shift', 'Enter'] },
    category: 'formula-entry',
    financeContext: 'Enter multi-cell array calculations — used in advanced sensitivity analysis',
  },

  // ── Formatting ──────────────────────────────────────────────────────────────
  {
    id: 'fmt-ctrl-1',
    action: 'Open Format Cells dialog',
    keys: { windows: ['Ctrl', '1'], mac: ['Cmd', '1'] },
    category: 'formatting',
    financeContext: 'Access full cell formatting options — number format, borders, alignment in one dialog',
  },
  {
    id: 'fmt-ctrl-b',
    action: 'Bold',
    keys: { windows: ['Ctrl', 'B'], mac: ['Cmd', 'B'] },
    category: 'formatting',
    financeContext: 'Bold total rows and headers in financial models — standard presentation convention',
  },
  {
    id: 'fmt-ctrl-shift-bang',
    action: 'Apply number format (comma, 2 decimals)',
    keys: { windows: ['Ctrl', 'Shift', '!'], mac: ['Cmd', 'Shift', '!'] },
    category: 'formatting',
    financeContext: "Format revenue and expense numbers as 1,234.56 for professional financial presentations",
  },
  {
    id: 'fmt-ctrl-shift-percent',
    action: 'Apply percentage format',
    keys: { windows: ['Ctrl', 'Shift', '%'], mac: ['Cmd', 'Shift', '%'] },
    category: 'formatting',
    financeContext: 'Display discount rates, margins, and growth rates as percentages',
  },
  {
    id: 'fmt-ctrl-shift-hash',
    action: 'Apply date format',
    keys: { windows: ['Ctrl', 'Shift', '#'], mac: ['Cmd', 'Shift', '#'] },
    category: 'formatting',
    financeContext: 'Format cells containing date values in deal timelines and capital structures',
  },
  {
    id: 'fmt-alt-h-b',
    action: 'Open borders menu (ribbon sequence: Alt → H → B)',
    keys: { windows: ['Alt', 'H', 'B'], mac: ['Alt', 'H', 'B'] },
    category: 'formatting',
    financeContext: 'Apply borders to totals rows — standard in IB financial models',
    // NOTE: This is a SEQUENTIAL key sequence, not a chord. Mark for reference-only display.
    // DO NOT include in keypress drill — cannot be captured as simultaneous chord.
    browserBlocked: false, // Not browser-blocked, but sequentialOnly: true (see open questions)
  },
  {
    id: 'fmt-ctrl-9',
    action: 'Hide rows',
    keys: { windows: ['Ctrl', '9'], mac: ['Cmd', '9'] },
    category: 'formatting',
    financeContext: 'Hide detail rows to present summary view of a financial model',
  },
  {
    id: 'fmt-ctrl-shift-9',
    action: 'Unhide rows',
    keys: { windows: ['Ctrl', 'Shift', '9'], mac: ['Cmd', 'Shift', '9'] },
    category: 'formatting',
    financeContext: 'Reveal hidden detail rows when auditing model structure',
  },

  // ── Selection & Editing ─────────────────────────────────────────────────────
  {
    id: 'sel-ctrl-shift-arrow',
    action: 'Extend selection to edge of data',
    keys: { windows: ['Ctrl', 'Shift', 'ArrowDown'], mac: ['Cmd', 'Shift', 'ArrowDown'] },
    category: 'selection-editing',
    financeContext: 'Select an entire column of revenue figures to sum, format, or copy at once',
  },
  {
    id: 'sel-ctrl-d',
    action: 'Fill down (copy cell above into selection)',
    keys: { windows: ['Ctrl', 'D'], mac: ['Cmd', 'D'] },
    category: 'selection-editing',
    financeContext: 'Propagate a formula from the first year to all subsequent years in a DCF',
  },
  {
    id: 'sel-ctrl-r',
    action: 'Fill right (copy leftmost cell across selection)',
    keys: { windows: ['Ctrl', 'R'], mac: ['Cmd', 'R'] },
    category: 'selection-editing',
    financeContext: 'Copy a formula from one column across all years in a multi-year model',
  },
  {
    id: 'sel-ctrl-z',
    action: 'Undo',
    keys: { windows: ['Ctrl', 'Z'], mac: ['Cmd', 'Z'] },
    category: 'selection-editing',
    financeContext: 'Revert accidental changes — essential when editing live models',
  },
  {
    id: 'sel-ctrl-shift-l',
    action: 'Toggle AutoFilter',
    keys: { windows: ['Ctrl', 'Shift', 'L'], mac: ['Cmd', 'Shift', 'L'] },
    category: 'selection-editing',
    financeContext: 'Add or remove filter dropdowns on a data table for quick analysis',
  },
  {
    id: 'sel-ctrl-minus',
    action: 'Delete selected cells/rows/columns',
    keys: { windows: ['Ctrl', '-'], mac: ['Cmd', '-'] },
    category: 'selection-editing',
    financeContext: 'Remove rows or columns cleanly when restructuring a model',
  },
  {
    id: 'sel-alt-enter',
    action: 'Insert line break within cell',
    keys: { windows: ['Alt', 'Enter'], mac: ['Cmd', 'Alt', 'Enter'] },
    category: 'selection-editing',
    financeContext: 'Add multi-line labels in header cells of complex financial tables',
  },
  {
    id: 'sel-ctrl-a',
    action: 'Select all cells in range / entire sheet',
    keys: { windows: ['Ctrl', 'A'], mac: ['Cmd', 'A'] },
    category: 'selection-editing',
    financeContext: 'Select all data at once for bulk formatting or copying',
  },

  // ── Browser-blocked (reference only, NOT drilled) ───────────────────────────
  {
    id: 'blocked-ctrl-w',
    action: 'Close active workbook/window',
    keys: { windows: ['Ctrl', 'W'], mac: ['Cmd', 'W'] },
    category: 'navigation',
    financeContext: 'Close the current Excel workbook (important in multi-file analysis workflows)',
    browserBlocked: true,
  },
  {
    id: 'blocked-ctrl-t',
    action: 'Create table (Convert range to Excel Table)',
    keys: { windows: ['Ctrl', 'T'], mac: ['Cmd', 'T'] },
    category: 'formatting',
    financeContext: 'Convert data ranges to structured Excel Tables with auto-expanding formulas',
    browserBlocked: true,
  },
  {
    id: 'blocked-ctrl-n',
    action: 'Create new workbook',
    keys: { windows: ['Ctrl', 'N'], mac: ['Cmd', 'N'] },
    category: 'navigation',
    financeContext: 'Open a blank Excel workbook for quick calculations',
    browserBlocked: true,
  },
];
```

### Route Addition to App.tsx

```typescript
// src/App.tsx — add /shortcuts route (partial — don't touch other routes)
import { ShortcutsPage } from './pages/ShortcutsPage';

// Inside <Routes>, add:
<Route
  path="/shortcuts"
  element={
    <AppShell>
      <ShortcutsPage />
    </AppShell>
  }
/>
```

### AppShell NavLink Update

```typescript
// src/components/AppShell.tsx — replace static NAV_ITEMS with react-router-dom NavLink
import { NavLink } from 'react-router-dom';

const NAV_ITEMS = [
  { label: 'Formula Practice', to: '/challenge' },
  { label: 'Keyboard Shortcuts', to: '/shortcuts' },
  { label: 'Progress', to: '/progress', disabled: true },
];

// In render:
{NAV_ITEMS.map((item) => (
  item.disabled ? (
    <li key={item.label} style={{ padding: '8px 16px', fontSize: '13px', color: '#aaa', cursor: 'default', borderLeft: '3px solid transparent' }}>
      {item.label}
    </li>
  ) : (
    <NavLink key={item.label} to={item.to} style={({ isActive }) => ({
      display: 'block',
      padding: '8px 16px',
      fontSize: '13px',
      color: isActive ? '#1a3a2a' : '#555',
      fontWeight: isActive ? 600 : 400,
      borderLeft: `3px solid ${isActive ? '#1a6b3c' : 'transparent'}`,
      textDecoration: 'none',
    })}>
      {item.label}
    </NavLink>
  )
))}
```

---

## Shortcut Content Decision: Alt Ribbon Sequences

**Research finding (MEDIUM confidence):** Alt+H+B, Alt+H+H, Alt+H+FC, and similar ribbon sequences are sequential key presses (press Alt, release, press H, release, press B), NOT simultaneous chords. They cannot be captured as a single `keydown` event. A chord detector cannot recognize them.

**Recommendation:** Exclude Alt ribbon sequences from the keypress-detection drill. Include them in a read-only "Reference" section of the shortcuts page. Mark with a label "Sequential (press in order, not held)" to educate users. This aligns with the decision: Claude decides whether to include based on interview relevance — and the technical constraint makes the decision clear.

**IB interview relevance:** Ribbon sequences (Alt+H+B for borders, Alt+H+H for fill color) are important for speed in practice, but interviews typically test conceptual knowledge of shortcuts rather than requiring live demonstration. The more testable shortcuts (F4, Ctrl+D, Ctrl+Shift+Arrow) are all chord-based and CAN be drilled.

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `keyCode` / `charCode` | `e.key` + modifier booleans | ~2015-2018 | `keyCode` is deprecated; `e.key` gives logical key name regardless of layout |
| Global `window.onkeydown = fn` | `addEventListener('keydown', fn, { capture })` | Longstanding | Multiple handlers coexist; capture phase ensures preprocessing before browser |
| F-keys for all shortcuts | Mix of Ctrl combos, F-keys, Alt chords | N/A — Excel convention | Some F-keys are browser-intercepted; test each before adding to drill |

**Deprecated/outdated:**
- `KeyboardEvent.keyCode`: Deprecated, avoid. Use `e.key` instead.
- `KeyboardEvent.charCode`: Deprecated, avoid. Use `e.key` instead.
- `KeyboardEvent.which`: Deprecated, avoid. Use `e.key` + modifier booleans.

---

## Open Questions

1. **Sequential Alt ribbon sequences — add `sequentialOnly` flag to data type?**
   - What we know: Alt+H+B is sequential, not a chord; cannot be detected as a single `keydown` event.
   - What's unclear: Should the `Shortcut` type have a `sequentialOnly?: boolean` flag to mark these for reference-only display, or should they just be excluded from the data entirely?
   - Recommendation: Add `sequentialOnly?: boolean` to the `Shortcut` type. Include them in the data file for completeness (they're real IB shortcuts) but filter them out of the drill queue. Display them in the reference section with a visual indicator. This gives users the full picture while making the drill technically sound.

2. **F5 (Go To) browser conflict**
   - What we know: F5 refreshes the page in browser. In Excel it opens the Go To dialog.
   - What's unclear: Can `e.preventDefault()` on `keydown` for F5 actually block the page refresh?
   - Recommendation: Test during implementation. `preventDefault()` in `{ capture: true }` mode may or may not block F5 depending on browser. If it cannot be blocked, mark F5 with `browserBlocked: true` and show it in the reference section. F5 is a real IB shortcut worth mentioning even if it can't be drilled.

3. **Mac Ctrl+PageDown / Ctrl+PageUp for worksheet navigation**
   - What we know: On Windows, Ctrl+PageDown moves to the next worksheet. On Mac, the equivalent varies — it might be Ctrl+PageDown, Fn+Ctrl+Down, or Cmd+PageDown depending on keyboard.
   - What's unclear: The exact Mac key combination for worksheet tab navigation.
   - Recommendation: During implementation, verify the Mac equivalent empirically or consult official Microsoft Mac Excel documentation. The data file above has a placeholder — update before content is finalized.

4. **Confirmation dialog for mid-session quit**
   - What we know: Escape during drill shows confirmation dialog before quitting.
   - What's unclear: The dialog should be a native browser `confirm()` (simplest) or a custom React modal (consistent with app style).
   - Recommendation: Use a custom React state flag `showQuitConfirm: boolean` in the Zustand store. Render a simple inline confirmation panel in the drill screen when this flag is true. Avoids native `confirm()` which blocks the thread and looks inconsistent.

5. **Reverse drill (Keys→Action) answer format**
   - What we know: CONTEXT.md says "likely multiple choice with 3-4 options".
   - What's unclear: How to generate plausible wrong-answer options from the shortcut pool.
   - Recommendation: For each Keys→Action question, pick 2-3 wrong answers from the same `category` to keep options plausible. If fewer than 3 other shortcuts exist in the category, pull from adjacent categories. Shuffle the correct answer into a random position.

---

## Sources

### Primary (HIGH confidence)
- `/Users/jam/excel-prep/node_modules/zustand/react.d.ts` — `create<T>()` pattern verified; same as `useChallengeStore` in Phase 2
- `/Users/jam/excel-prep/node_modules/react-router-dom/dist/index.d.ts` — `NavLink` component with `isActive` callback style prop; `Route` element prop pattern
- Existing codebase `/Users/jam/excel-prep/src/store/challengeStore.ts` — established Zustand pattern to follow
- Existing codebase `/Users/jam/excel-prep/src/App.tsx` — BrowserRouter + Routes + Route pattern to extend
- Existing codebase `/Users/jam/excel-prep/src/components/AppShell.tsx` — NAV_ITEMS pattern to extend with NavLink

### Secondary (MEDIUM confidence)
- MDN Web Docs — KeyboardEvent: `key`, `ctrlKey`, `shiftKey`, `altKey`, `metaKey` properties; `addEventListener({ capture: true })`; modifier key names ('Control', 'Alt', 'Shift', 'Meta')
- Mozilla Bugzilla #1291706 — Firefox intentionally blocked Ctrl+W, Ctrl+N, Ctrl+T from `preventDefault` override
- Google Chrome Community thread — Chrome cannot intercept tab/window management shortcuts
- Wall Street Prep Excel Shortcuts cheat sheet — confirmed Windows shortcut list: Ctrl+D, Ctrl+R, Ctrl+Shift+Arrow, F2, F4, F9, Alt+=, Ctrl+1, Ctrl+B, Ctrl+Shift+!, Ctrl+Shift+%, Ctrl+Shift+#
- Breaking Into Wall Street — IB-specific shortcut set and Alt ribbon sequence conventions

### Tertiary (LOW confidence)
- Mac equivalent for worksheet navigation (Ctrl+PageDown/PageUp) — not verified empirically; needs implementation-time testing
- F5 preventDefault behavior in browser — browser-dependent; flag as needing verification during implementation

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — no new packages; all capabilities from existing installed stack
- Architecture: HIGH — pattern follows established Phase 2 conventions (Zustand store, React page, route addition); global listener pattern is standard and well-documented
- Shortcut data: MEDIUM — sourced from Wall Street Prep and BIWS, both authoritative; Mac equivalents need verification for a few shortcuts
- Browser conflict handling: HIGH — Ctrl+W/T/N browser-blocking is well-documented and cross-verified from multiple sources; capture phase listener approach is standard

**Research date:** 2026-02-22
**Valid until:** 2026-03-22 (stable libraries; browser keyboard behavior is well-established and unlikely to change)
