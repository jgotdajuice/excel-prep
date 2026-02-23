# Phase 3: Content Library - Research

**Researched:** 2026-02-23
**Domain:** Content data architecture, drill mode UI, tiered progression gating, Zustand state extension — all within the existing React 19 + TypeScript 5 + Zustand 5 + Tailwind 4 stack
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Drill Mode Interaction**
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

**Learning Path + Tier Gating**
- Three tiers: Beginner, Intermediate, Advanced
- Simple tab navigation (Beginner | Intermediate | Advanced), locked tabs show lock icon
- Score threshold to unlock next tier: 70% correct per function
- Per-function gating — must hit 70% on each function's challenges at current tier before unlocking that function at the next tier
- Drills count partially toward tier progression (50% weight)
- Locked tier content is visible but locked — users can see challenge titles but can't start them
- Progressive function introduction — simpler functions (SUM, IF) appear at beginner, complex ones (INDEX/MATCH, XLOOKUP) introduced at higher tiers
- Challenges within a tier are randomized each session (not fixed order)

**Content Organization**
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

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| LEARN-02 | User can do rapid-fire formula drills (scenario presented → user writes the correct formula) | New DrillPage component with countdown timer, text-prompt questions derived from Challenge pool, typing/MC toggle, auto-advance on answer or timeout, end-session review |
| LEARN-05 | User can follow a structured learning path from beginner to interview-ready | Three-tier tab UI on ChallengePage, per-function unlock gating (70% threshold), locked-visible display, tier/function assignment in Challenge type already has `difficulty` field |
</phase_requirements>

---

## Summary

Phase 3 adds two things to the existing working system: (1) a large content library (60+ challenges across 10 functions in three tiers) replacing the 3 seed challenges, and (2) a drill mode that reuses the same challenge content as rapid-fire text-prompt questions with countdown timer and auto-advance. Tier gating is a UI concern — no backend needed. All state lives in Zustand and localStorage (localStorage deferred to Phase 5 per REQUIREMENTS.md, so in-session only for this phase).

The existing `Challenge` type already has `difficulty` and `category` fields. The main type extension needed is a `tier` field on the challenge itself (distinct from `difficulty`), and a `DrillQuestion` type derived from a challenge. The content data itself (60+ challenges) is pure TypeScript authoring — no library involved. The most technically non-trivial part is the drill countdown timer and auto-advance state machine, which is straightforward with the existing `useRef`/`setInterval` pattern already in the codebase (see `RightPanel.tsx` timer).

The tier gating computation is simple math: for each function, count correct challenge attempts at the current tier and compute a ratio. No library needed. The locked-visible tab UI is a Tailwind + conditional rendering pattern. Drill mode should live at a separate `/drill` route (Claude's discretion) since it has no spreadsheet grid and a completely different layout.

**Primary recommendation:** Author the 60+ challenge content first (it's the critical path), extend the `Challenge` type with tier field, add a `DrillQuestion` type, build a new `useDrillStore` in Zustand, and implement `DrillPage` at `/drill`. Tier gating is a computed selector over the challenge statuses in `challengeStore`.

---

## Standard Stack

### Core (all already installed — no new packages needed)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React 19 | ^19.2.0 | DrillPage component, tier tab UI, countdown display | Already installed |
| TypeScript 5 | ~5.9.3 | Challenge type extension, DrillQuestion type | Already installed |
| Zustand 5 | ^5.0.11 | useDrillStore for drill session state | Already installed; same pattern as challengeStore |
| React Router DOM 7 | ^7.13.0 | /drill route | Already installed |
| Tailwind CSS 4 | ^4.2.0 | Drill layout, tier tabs, lock icons, feedback flash | Already installed |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `clsx` + `tailwind-merge` | already installed | Conditional classes for locked/active tier tabs, green/red flash | Same pattern as Phase 2 answer cell states |

### No New Packages

No new packages are required. The drill countdown timer, progression gating, and content data are all hand-rolled logic — no library adds value over the simple patterns below.

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Hand-rolled countdown timer | `react-timer-hook` | The codebase already has a `tick()` action in challengeStore — same pattern applies to drill. No need for an external timer hook. |
| In-memory progression gating | localStorage persistence | Phase 5 owns persistence (PROG-01). Phase 3 gating is session-only — resets on page reload. This is correct per REQUIREMENTS.md scope. |
| Separate DrillQuestion type | Reuse Challenge directly | Challenge has `seedData` (grid data) irrelevant to drill mode. A `DrillQuestion` type derived from Challenge keeps drill code clean and doesn't expose grid-specific fields. |

---

## Architecture Patterns

### Recommended Project Structure (Phase 3 additions)

```
src/
├── components/
│   ├── TierTabs.tsx           # NEW: Beginner | Intermediate | Advanced tabs with lock icons
│   ├── DrillQuestion.tsx      # NEW: single drill question card (text prompt + input/MC)
│   ├── DrillFeedback.tsx      # NEW: green/red flash overlay + correct formula reveal
│   └── DrillReview.tsx        # NEW: end-of-session review screen
├── data/
│   └── challenges/
│       ├── index.ts           # REPLACE: 3 seeds → 60+ challenge array organized by tier
│       ├── beginner.ts        # NEW: ~24 beginner challenges (4 functions × 6)
│       ├── intermediate.ts    # NEW: ~24 intermediate challenges (4 functions × 6)
│       └── advanced.ts        # NEW: ~18 advanced challenges (2–3 functions × 6)
├── pages/
│   ├── ChallengePage.tsx      # EXTEND: add tier tab navigation + lock state
│   └── DrillPage.tsx          # NEW: drill session page at /drill
├── store/
│   ├── challengeStore.ts      # EXTEND: add per-function completion tracking
│   └── drillStore.ts          # NEW: drill session state (questions, timer, score)
├── types/
│   └── index.ts               # EXTEND: add tier field to Challenge, add DrillQuestion type
└── App.tsx                    # EXTEND: add /drill route
```

### Pattern 1: Challenge Type Extension

**What:** Add `tier` field to `Challenge` type. The existing `difficulty` field overlaps but is kept for backward compatibility. `tier` is the authoritative field for the learning path.

```typescript
// src/types/index.ts — additions to existing Challenge interface

export type Tier = 'beginner' | 'intermediate' | 'advanced';

export interface Challenge {
  id: string;
  title: string;
  prompt: string;
  hintFunction: string;
  correctFormula: string;
  explanation: string;
  seedData: (string | number | boolean | null)[][];
  answerCells: AnswerCell[];
  category?: string;          // function name tag: 'VLOOKUP', 'NPV', etc.
  difficulty?: Tier;          // existing field — keep for compat
  tier: Tier;                 // NEW: authoritative learning path tier
  /** Short text prompt for drill mode (no grid context) */
  drillPrompt?: string;       // NEW: if absent, prompt is used
  /** For typing-mode drill: acceptable answers (formula or function name) */
  drillAnswer: string;        // NEW: exact expected answer string in drill mode
  /** Whether drill asks for full formula or just function name */
  drillAnswerScope: 'formula' | 'function';  // NEW
  /** Wrong options for multiple choice drill */
  drillWrongOptions: string[];  // NEW: 3 wrong options; system picks 3 + correct = 4 choices
}
```

**Note on drillPrompt:** Most challenges can reuse their existing `prompt` with minor edits. A dedicated `drillPrompt` field allows a shorter, inline-data version. If absent, fallback to `prompt`. The Phase 2 VLOOKUP challenge already has a natural drill prompt: "Write the VLOOKUP formula to find Employee 103's salary from columns A:C where A=ID, B=Name, C=Salary."

### Pattern 2: DrillQuestion Derived Type

**What:** A lighter type for the active drill session. Generated from `Challenge` at drill start time — no grid data, just what the drill UI needs.

```typescript
// src/types/index.ts
export interface DrillQuestion {
  challengeId: string;        // References Challenge.id for end-session review
  prompt: string;             // The text prompt shown in drill UI
  correctAnswer: string;      // Exact answer string (formula or function name)
  answerScope: 'formula' | 'function';
  wrongOptions: string[];     // 3 wrong options for MC mode
  tier: Tier;
  category: string;           // Function tag for grouping in review
  explanation: string;        // Shown in end-session review
  correctFormula: string;     // Full formula shown after answer
}

// Factory function: Challenge → DrillQuestion
export function challengeToDrillQuestion(c: Challenge): DrillQuestion {
  return {
    challengeId: c.id,
    prompt: c.drillPrompt ?? c.prompt,
    correctAnswer: c.drillAnswer,
    answerScope: c.drillAnswerScope,
    wrongOptions: c.drillWrongOptions,
    tier: c.tier,
    category: c.category ?? 'General',
    explanation: c.explanation,
    correctFormula: c.correctFormula,
  };
}
```

### Pattern 3: Drill Session State (Zustand)

**What:** Separate Zustand store for drill state. Keeps drill concerns out of `challengeStore` which manages the grid-based flow.

```typescript
// src/store/drillStore.ts

type DrillAnswerStatus = 'correct' | 'incorrect' | 'timeout';

interface DrillAnswerRecord {
  questionIndex: number;
  userAnswer: string;
  status: DrillAnswerStatus;
}

interface DrillStore {
  // Session config
  sessionTier: Tier | 'all';
  mode: 'typing' | 'mc';

  // Session questions
  questions: DrillQuestion[];
  currentQuestionIndex: number;

  // Timer
  secondsRemaining: number;
  timerActive: boolean;

  // Answers
  answers: DrillAnswerRecord[];

  // Session phase
  phase: 'idle' | 'active' | 'feedback' | 'review';
  feedbackStatus: 'correct' | 'incorrect' | null;

  // Actions
  startSession: (tier: Tier | 'all', mode: 'typing' | 'mc', questions: DrillQuestion[]) => void;
  submitAnswer: (userAnswer: string) => void;
  tickTimer: () => void;          // called by 1s interval
  advanceToNextQuestion: () => void;
  endSession: () => void;
  setMode: (mode: 'typing' | 'mc') => void;
}
```

**State machine for drill question flow:**

```
idle
  → startSession() → active (timer starts, question shown)

active
  → submitAnswer() → feedback phase (green/red flash, correct formula shown)
  → tickTimer() to 0 → feedback phase (timeout, mark wrong, show correct)

feedback (auto-advances after ~1.5s)
  → advanceToNextQuestion()
    → if more questions: active (next question, timer reset)
    → if last question: review

review
  → endSession() → idle
```

**Timer implementation:** The drill timer is a countdown (not an elapsed stopwatch like in challengeStore). Use `secondsRemaining` decremented by `tickTimer()` called from a 1s interval in a `useEffect` in `DrillPage`. The interval runs only when `phase === 'active'`.

```typescript
// In DrillPage component
const { phase, secondsRemaining, tickTimer } = useDrillStore();
const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

useEffect(() => {
  if (phase === 'active') {
    intervalRef.current = setInterval(() => tickTimer(), 1000);
  } else {
    if (intervalRef.current) clearInterval(intervalRef.current);
  }
  return () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  };
}, [phase]); // Re-run when phase changes — starts/stops timer correctly
```

This is the exact same pattern as `RightPanel.tsx`'s timer (line 36–41), just countdown instead of elapsed.

### Pattern 4: Tier Gating Computation

**What:** Determine if a tier is unlocked. "Unlocked" = user has hit 70% correct on all functions that have challenges in the previous tier. Drills count at 50% weight.

**Data source:** In Phase 3, progression is session-only (Phase 5 adds persistence). Use `challengeStore.statuses` and `drillStore.answers`.

```typescript
// Computed selector — pure function over store state

interface FunctionProgress {
  category: string;
  tier: Tier;
  totalChallenges: number;
  correctChallenges: number;   // from challengeStore (full weight)
  totalDrillQuestions: number;
  correctDrillQuestions: number;  // from drillStore (0.5 weight)
  effectiveScore: number;      // (correct + 0.5*correctDrill) / (total + 0.5*totalDrill)
  unlocked: boolean;           // effectiveScore >= 0.70
}

function computeTierUnlocked(
  targetTier: 'intermediate' | 'advanced',
  allChallenges: Challenge[],
  challengeStatuses: ChallengeStatus[],
  drillAnswers: DrillAnswerRecord[],
  drillQuestions: DrillQuestion[],  // from completed sessions
): boolean {
  const prerequisiteTier: Tier =
    targetTier === 'intermediate' ? 'beginner' : 'intermediate';

  // Get all unique function categories in the prerequisite tier
  const prerequisiteChallenges = allChallenges.filter(c => c.tier === prerequisiteTier);
  const categories = [...new Set(prerequisiteChallenges.map(c => c.category ?? 'General'))];

  // Every function category must hit 70%
  return categories.every(category => {
    const catChallenges = prerequisiteChallenges.filter(c => c.category === category);
    const catStatuses = catChallenges.map((c, i) => {
      const globalIdx = allChallenges.findIndex(ac => ac.id === c.id);
      return challengeStatuses[globalIdx];
    });
    const correctCount = catStatuses.filter(s => s === 'correct').length;

    // Drill contribution (0.5 weight)
    const catDrillQuestions = drillQuestions.filter(q => q.category === category && q.tier === prerequisiteTier);
    const catDrillAnswers = drillAnswers.filter(a => {
      const q = catDrillQuestions[a.questionIndex];
      return q !== undefined;
    });
    const correctDrillCount = catDrillAnswers.filter(a => a.status === 'correct').length;

    const effectiveCorrect = correctCount + 0.5 * correctDrillCount;
    const effectiveTotal = catChallenges.length + 0.5 * catDrillAnswers.length;

    if (effectiveTotal === 0) return false;  // No attempts → locked
    return effectiveCorrect / effectiveTotal >= 0.70;
  });
}
```

**Simplification note for planning:** The 50% drill weight and per-function gating is the right design but complex to implement perfectly in Phase 3 with no persistence. The planner should consider implementing session-only gating as: if user has no challenge session data (first load), all intermediate/advanced are locked. Tier tabs show lock icon. No persistence means gating resets on page reload — this is correct per scope.

### Pattern 5: Tier Tab Navigation

**What:** Three tabs at top of the challenge list area. Locked tabs show a lock icon, are still clickable but display a "Complete beginner challenges to unlock" message.

```typescript
// src/components/TierTabs.tsx

interface TierTabsProps {
  activeTier: Tier;
  intermediateUnlocked: boolean;
  advancedUnlocked: boolean;
  onSelectTier: (tier: Tier) => void;
}

// Locked tier click: shows a toast/banner with unlock requirement,
// but does NOT navigate — stays on current tier.
// Users can see locked challenge titles in the list but clicking them
// shows "Complete beginner challenges first" message.
```

### Pattern 6: Drill Question Selection (10 questions per session)

**What:** Build a 10-question session from the content pool filtered by selected tier.

```typescript
// src/store/drillStore.ts — startSession action

function buildDrillSession(
  challenges: Challenge[],
  tier: Tier | 'all',
): DrillQuestion[] {
  const pool = challenges
    .filter(c => tier === 'all' || c.tier === tier)
    .map(challengeToDrillQuestion);

  // Shuffle pool
  const shuffled = [...pool].sort(() => Math.random() - 0.5);

  // Take first 10 (or all if fewer than 10)
  return shuffled.slice(0, 10);
}
```

**Randomization:** `Array.sort(() => Math.random() - 0.5)` is a standard shuffle. For production this is slightly biased (Math.random() - 0.5 is not a perfectly uniform comparator), but it is completely adequate for a study tool with <100 items.

### Pattern 7: Feedback Flash + Auto-Advance

**What:** After answer (or timeout), show green/red flash for ~1.5s, then auto-advance to next question.

```typescript
// In drillStore.ts — submitAnswer sets phase = 'feedback'
// DrillPage useEffect responds to phase change:

useEffect(() => {
  if (phase === 'feedback') {
    const timeout = setTimeout(() => {
      advanceToNextQuestion();
    }, 1500);  // 1.5s feedback display
    return () => clearTimeout(timeout);
  }
}, [phase]);
```

**Note:** Auto-advance uses `setTimeout`, not `setInterval`. Clean up in the return of `useEffect` to avoid double-advances if component re-renders.

### Pattern 8: Multiple Choice Wrong Options

**What:** Each challenge has 3 pre-authored `drillWrongOptions`. The MC display shuffles all 4 options so correct answer position varies.

```typescript
// Shuffle 4 options on question start
function buildMCOptions(correct: string, wrongs: string[]): string[] {
  return [...wrongs.slice(0, 3), correct].sort(() => Math.random() - 0.5);
}
```

Wrong options should be plausible mistakes: wrong argument count, reversed argument order, wrong function for the same job, or a common beginner error for the function. Example for VLOOKUP:
- Wrong: `=VLOOKUP(103,A2:C5,2,0)` (wrong column index)
- Wrong: `=HLOOKUP(103,A2:C5,3,0)` (H instead of V)
- Wrong: `=VLOOKUP(A2,103,C5,3)` (arguments scrambled)

### Pattern 9: Content File Organization

**What:** Split the 60+ challenge array into tier files for maintainability. Each file exports a `Challenge[]` array. The `index.ts` aggregates them.

```typescript
// src/data/challenges/beginner.ts
import type { Challenge } from '../../types';
export const beginnerChallenges: Challenge[] = [ /* 20–24 challenges */ ];

// src/data/challenges/intermediate.ts
export const intermediateChallenges: Challenge[] = [ /* 20–24 challenges */ ];

// src/data/challenges/advanced.ts
export const advancedChallenges: Challenge[] = [ /* 12–18 challenges */ ];

// src/data/challenges/index.ts
import { beginnerChallenges } from './beginner';
import { intermediateChallenges } from './intermediate';
import { advancedChallenges } from './advanced';

export const challenges: Challenge[] = [
  ...beginnerChallenges,
  ...intermediateChallenges,
  ...advancedChallenges,
];
```

### Pattern 10: Function-to-Tier Assignment (Claude's Discretion)

Based on interview prep context (user is a beginner, needs to hit tier-1 functions):

| Tier | Functions | Rationale |
|------|-----------|-----------|
| Beginner | SUM, IF/nested IF, IFERROR, VLOOKUP | Basic lookup + logic; every finance interview tests these |
| Intermediate | SUMIFS, INDEX/MATCH, NPV, PMT | Multi-condition aggregation + financial math |
| Advanced | IRR, XLOOKUP, XNPV, OFFSET | Complex financial functions; interview stretch questions |

This assigns ~4 functions per tier × 6 challenges = 24 per tier, 72 total. Meets the 60+ requirement with room.

Note: The 3 existing seed challenges map as: `vlookup-01` → beginner, `npv-01` → intermediate, `if-nested-01` → beginner.

### Anti-Patterns to Avoid

- **Storing drill timer in React state with useState:** `useState` triggers re-render on every tick. Use Zustand `secondsRemaining` (already triggers re-render via subscription) or a `useRef` with direct DOM update. Zustand with 1s tick interval is fine — 60 re-renders per minute is negligible.
- **Re-building the question pool on every render:** Build the session's 10 questions once in `startSession`. Store in `drillStore.questions`. Never recompute from challenges during a live session.
- **Deriving drill questions inline from challenge data without a factory:** The `challengeToDrillQuestion` factory ensures the drill always uses the right prompt fallback and fields — don't inline this logic across multiple components.
- **Treating tier gating as a backend concern:** It's pure computed math over in-memory state. No API, no async needed in Phase 3.
- **Putting all 60+ challenges in one file:** Files >500 lines are harder to review. Split by tier as shown in Pattern 9.
- **Using the Challenge type's `prompt` field directly for drill:** The grid `prompt` often references "columns A:C" or "the table below" — meaningless without a grid. Always use `drillPrompt` if present, fall back to `prompt` only for challenges where the prompt doesn't reference grid location.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Countdown timer | Custom requestAnimationFrame loop | `setInterval(1000)` + `secondsRemaining` in Zustand | 1-second precision is sufficient; RAF is overkill and harder to pause/reset |
| Array shuffle for question order | Fisher-Yates from scratch | `array.sort(() => Math.random() - 0.5)` | Slight bias is irrelevant for 10 items from 60+ pool; not a cryptographic context |
| Typing answer normalization | Regex parser | `.trim().toUpperCase()` comparison | Finance formula answers are deterministic strings; whitespace trimming is sufficient |
| Multiple choice option ordering | Deterministic shuffle algorithm | `[...options].sort(() => Math.random() - 0.5)` | Same as above; irrelevant bias for 4 options |
| Content validation | Runtime schema validation | TypeScript compile-time typing | All challenge data is static/authored — TS catches shape errors at build time |

**Key insight:** This phase is mostly content authoring (60+ challenges) and a new state machine (drill session). The technical complexity is low — the project's existing patterns handle everything. The main risk is content quality and the `drillPrompt`/`drillAnswer`/`drillWrongOptions` fields being correct for all 60+ challenges.

---

## Common Pitfalls

### Pitfall 1: drillPrompt References Grid Context

**What goes wrong:** Drill UI shows "Look at the table in column B..." — user has no grid to look at. Answer is impossible without grid context.

**Why it happens:** Reusing `prompt` from grid challenge directly without adapting for text-only drill mode.

**How to avoid:** For every challenge, author a dedicated `drillPrompt` that embeds the key data values inline in the text. "Employee table: ID 101=Alice/$75k, ID 102=Bob/$90k, ID 103=Carol/$105k. Write the VLOOKUP formula to find Employee 103's salary."

**Warning signs:** During drill review, user says they couldn't answer because they didn't have the data.

---

### Pitfall 2: Timer Drift on Phase Transitions

**What goes wrong:** Timer keeps running during feedback phase (1.5s auto-advance delay). Next question starts with -1 or -2 seconds remaining.

**Why it happens:** `setInterval` in `useEffect` tied to `phase` doesn't stop immediately when phase changes to `feedback`; one more tick fires before cleanup.

**How to avoid:** The `useEffect` cleanup runs synchronously on phase change, which stops the interval before the next tick. This is correct behavior if the dependency array is `[phase]`. Verify that `phase` in the cleanup closure is the NEW value (it is, due to how React schedules effects). No extra guard needed.

**Warning signs:** Second question countdown shows 44s instead of 45s.

---

### Pitfall 3: Per-Function Tier Gating with No Session Data

**What goes wrong:** User loads app fresh, no challenges completed, all tiers appear unlocked (0 attempts = 0% score which would be < 70%, correct — locked) OR a division-by-zero returns NaN which TypeScript treats as falsy, unlocking everything.

**Why it happens:** `effectiveTotal === 0` case not handled.

**How to avoid:** Explicit guard: `if (effectiveTotal === 0) return false;` — no attempts means locked. Already included in Pattern 4 above.

**Warning signs:** All tiers show as unlocked on first load.

---

### Pitfall 4: Challenge Content Doesn't Engine-Verify

**What goes wrong:** 60+ challenges authored with manually-estimated expected values. Several have wrong `expectedValue` in `AnswerCell`, causing grading to always return incorrect for valid formulas.

**Why it happens:** Author error — calculating NPV by hand is error-prone.

**How to avoid:** Run engine verification on every challenge before adding to the array. Use the existing `buildExcelCompatEngine()` from `src/engine/formulaEngine.ts` to verify. The Phase 1-2 pattern is: create engine, `setCellContents()` with seedData, evaluate the answer cell's formula, log the result, then set `expectedValue` from the engine output. This is documented in the challenge file header.

**Warning signs:** `gradeCell` always returns incorrect for challenges that were never engine-verified.

---

### Pitfall 5: Typing Mode Answer Matching is Too Strict or Too Loose

**What goes wrong:** User types `=VLOOKUP(103, A2:C5, 3, 0)` (with spaces), correct answer is `=VLOOKUP(103,A2:C5,3,0)` (no spaces). Marked incorrect.

OR: User types `vlookup` and system accepts it when `drillAnswerScope: 'formula'` — too loose.

**Why it happens:** No normalization for typing mode answers.

**How to avoid:** For `drillAnswerScope: 'formula'`: compare `userAnswer.trim().replace(/\s/g, '').toUpperCase()` vs `drillAnswer.replace(/\s/g, '').toUpperCase()`. Strip all whitespace, case-insensitive. This handles spacing variants without allowing semantically wrong answers.

For `drillAnswerScope: 'function'`: compare `.trim().toUpperCase()`. `VLOOKUP` vs `vlookup` both pass.

**Warning signs:** User feedback: "I typed the right formula but it says wrong."

---

### Pitfall 6: 60+ Challenge Content Volume Causes Slow Initial Load

**What goes wrong:** All 60+ challenges imported at bundle time, including large `seedData` arrays (each is a 2D grid array). Bundle size increases.

**Why it happens:** Static import of all challenge data.

**Assessment (LOW risk):** Each challenge's `seedData` is typically 5-8 rows × 4-5 columns = ~40 values. At 60 challenges that's ~2400 values. Total data volume is negligible (< 50KB uncompressed). Vite tree-shaking won't split this since it's all one array. This is NOT worth lazy-loading — static import is fine.

**Warning signs:** Not expected to be an issue at 60+ challenges.

---

## Code Examples

### Countdown Timer Integration

```typescript
// src/pages/DrillPage.tsx
import { useEffect, useRef } from 'react';
import { useDrillStore } from '../store/drillStore';

export function DrillPage() {
  const { phase, secondsRemaining, tickTimer, advanceToNextQuestion } = useDrillStore();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const feedbackRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Countdown timer — runs only during active phase
  useEffect(() => {
    if (phase === 'active') {
      intervalRef.current = setInterval(() => tickTimer(), 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-advance after feedback
  useEffect(() => {
    if (phase === 'feedback') {
      feedbackRef.current = setTimeout(() => {
        advanceToNextQuestion();
      }, 1500);
    }
    return () => {
      if (feedbackRef.current) clearTimeout(feedbackRef.current);
    };
  }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps

  // ...render
}
```

### Answer Normalization (Typing Mode)

```typescript
// src/store/drillStore.ts — inside submitAnswer action

function normalizeAnswer(answer: string, scope: 'formula' | 'function'): string {
  if (scope === 'function') {
    return answer.trim().toUpperCase();
  }
  // Formula: strip all whitespace, uppercase
  return answer.trim().replace(/\s+/g, '').toUpperCase();
}

// In submitAnswer:
const normalized = normalizeAnswer(userAnswer, question.answerScope);
const expected = normalizeAnswer(question.correctAnswer, question.answerScope);
const isCorrect = normalized === expected;
```

### Tier Unlock Check (Simplified for Phase 3)

```typescript
// src/store/challengeStore.ts — add computed getter

// Simpler version: check if user has >= 70% correct across ALL beginner challenges
// (not per-function) as a starting implementation.
// Per-function gating can be refined when content is authored and categories are confirmed.

function isTierUnlocked(
  targetTier: 'intermediate' | 'advanced',
  challenges: Challenge[],
  statuses: ChallengeStatus[],
): boolean {
  const prerequisiteTier: Tier =
    targetTier === 'intermediate' ? 'beginner' : 'intermediate';

  const prereqChallenges = challenges.filter(c => c.tier === prerequisiteTier);
  if (prereqChallenges.length === 0) return false;

  const prereqStatuses = prereqChallenges.map(c => {
    const idx = challenges.findIndex(ac => ac.id === c.id);
    return statuses[idx] ?? 'unattempted';
  });

  const attempted = prereqStatuses.filter(s => s !== 'unattempted').length;
  const correct = prereqStatuses.filter(s => s === 'correct').length;

  if (attempted === 0) return false;
  return correct / prereqChallenges.length >= 0.70;
}
```

### Challenge Content Template

```typescript
// Template for authoring new challenges — copy/fill for each of 60+
{
  id: 'sumifs-01',
  title: 'Revenue by Region with SUMIFS',
  tier: 'intermediate',
  difficulty: 'intermediate',
  category: 'SUMIFS',
  prompt: `Your VP of Finance needs total Q3 revenue for the "North" region...
[full grid prompt here]`,
  drillPrompt: `Sales data: North/Q1/$1.2M, South/Q1/$0.9M, North/Q2/$1.4M, South/Q2/$1.1M, North/Q3/$1.6M, South/Q3/$1.3M (columns: Region, Quarter, Revenue in A:C). Write a SUMIFS formula to sum Revenue where Region="North" AND Quarter="Q3".`,
  drillAnswer: '=SUMIFS(C2:C7,A2:A7,"North",B2:B7,"Q3")',
  drillAnswerScope: 'formula',
  drillWrongOptions: [
    '=SUMIF(A2:A7,"North",C2:C7)',          // SUMIF instead of SUMIFS
    '=SUMIFS(C2:C7,"North",A2:A7,"Q3",B2:B7)', // arguments in wrong order
    '=COUNTIFS(C2:C7,A2:A7,"North",B2:B7,"Q3")', // COUNT not SUM
  ],
  hintFunction: 'SUMIFS',
  correctFormula: '=SUMIFS(C2:C7,A2:A7,"North",B2:B7,"Q3")',
  explanation: `SUMIFS(sum_range, criteria_range1, criteria1, criteria_range2, criteria2, ...)
...`,
  seedData: [ /* engine-verified 2D array */ ],
  answerCells: [{ row: X, col: Y, expectedValue: 1600000, tolerance: 0 }],
},
```

---

## State of the Art

| Old Approach | Current Approach | Impact |
|--------------|------------------|--------|
| All state in challengeStore | Separate drillStore | Drill state machine is independent — no leakage into grid challenge session |
| 3 seed challenges inline in index.ts | 60+ challenges split across tier files | Content scales without one massive file; tier files can be authored independently |
| No tier concept | `tier` field on Challenge type | Enables tier tabs, gating computation, drill filtering |
| Single challenge mode | Challenge mode + Drill mode at /drill | Two distinct learning flows; drill reuses content without duplicating data |

---

## Open Questions

1. **drillPrompt authoring effort for 60+ challenges**
   - What we know: 60+ challenges need inline-data drill prompts because grid context is not available in drill mode
   - What's unclear: Whether the prompt rewrite effort is included in this phase or if drill questions can approximate using just the function name + a description
   - Recommendation: Author `drillPrompt` for every challenge. It's 1-3 sentences per challenge. The content authoring plan should budget this explicitly.

2. **Typing mode answer normalization edge cases**
   - What we know: Whitespace stripping + uppercase normalization handles most variants
   - What's unclear: Whether users type full formula with `=` prefix or without (e.g., `VLOOKUP(...)` vs `=VLOOKUP(...)`)
   - Recommendation: Normalize by stripping leading `=` from both user answer and expected. Accept both forms.

3. **Per-function gating vs whole-tier gating complexity**
   - What we know: CONTEXT.md specifies per-function gating (70% per function before unlocking that function at next tier)
   - What's unclear: Per-function gating in the locked-visible UI is complex — the challenge list would need to show individual challenge items as locked/unlocked within a tier, not just tab-level locking
   - Recommendation: In Phase 3 implementation, consider tab-level locking (70% of the tier overall) as a simplification, with per-function locking as a Phase 5 refinement when persistence makes the score tracking meaningful. Flag this as a decision for the planner.

4. **Content verification tooling**
   - What we know: Each challenge's `expectedValue` must be engine-verified using `buildExcelCompatEngine()`
   - What's unclear: Whether there's a test harness for batch-verifying all 60+ challenges
   - Recommendation: Add a Vitest test file `src/data/challenges/challenges.test.ts` that loads all challenges, builds the engine, feeds seed data, evaluates the answer formula, and asserts the result matches `expectedValue`. This catches authoring errors before they reach users.

---

## Sources

### Primary (HIGH confidence)
- `/Users/jam/excel-prep/src/types/index.ts` — existing `Challenge` type already has `difficulty` and `category` fields; `tier` addition is backward-compatible
- `/Users/jam/excel-prep/src/store/challengeStore.ts` — Zustand 5 `create` pattern verified; `tick()` action pattern reused for drillStore countdown
- `/Users/jam/excel-prep/src/components/RightPanel.tsx` — `setInterval` + `useRef` timer pattern (lines 32-41) is the proven pattern for drill countdown
- `/Users/jam/excel-prep/src/data/challenges/index.ts` — existing challenge structure; `drillPrompt`/`drillAnswer`/`drillWrongOptions` are net-new fields
- `/Users/jam/excel-prep/package.json` — confirms React 19, TypeScript 5, Zustand 5, Tailwind 4, React Router 7 — all needed; no new packages required

### Secondary (MEDIUM confidence)
- WebSearch: React countdown timer + Zustand — confirms `setInterval` + Zustand state is the standard pattern for this use case; `react-timer-hook` is an alternative but not needed here
- WebSearch: tiered content progression pattern — no standard React library exists; custom computed selector over store state is the correct approach

### Tertiary (LOW confidence)
- Array shuffle bias note (`sort(() => Math.random() - 0.5)`) — known slight bias; acceptable for non-cryptographic use case with small arrays; not verified against a specific authoritative source

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — no new packages; all existing libraries verified from package.json and working codebase
- Architecture patterns: HIGH — all patterns derived from the existing working codebase (RightPanel timer, challengeStore Zustand, Challenge type) and standard React patterns
- Content authoring: HIGH (structure) / MEDIUM (volume estimate) — 60+ challenge layout is clear; exact authoring time is an estimate
- Tier gating: HIGH — pure math over in-memory state; no unknowns
- Pitfalls: HIGH — drillPrompt context issue and answer normalization are real gotchas identified from requirements; engine verification requirement comes from established Phase 1-2 pattern

**Research date:** 2026-02-23
**Valid until:** 2026-03-23 (stable libraries; no anticipated breaking changes in React 19, Zustand 5, or Tailwind 4 in this window)
