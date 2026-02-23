# Phase 5: Progress and Weak Areas - Research

**Researched:** 2026-02-24
**Domain:** localStorage persistence (Zustand persist middleware), progress dashboard UI, weighted drill queue algorithm
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Progress Dashboard**
- Lives at the existing "Progress" sidebar link (currently a placeholder — `disabled: true` in AppShell NAV_ITEMS)
- Per-function accuracy bars — horizontal bars showing percentage correct (e.g., "VLOOKUP: 4/6 — 67%")
- Group by tier: Beginner functions, then Intermediate, then Advanced
- Show only functions the user has attempted (don't show 0/0 functions they haven't seen)
- Overall stats at top: total challenges completed, total drill questions answered, overall accuracy percentage
- Tier unlock status shown inline — checkmark for unlocked tiers, progress indicator for in-progress tiers
- Weakest function highlighted with a "Focus on this" callout
- Clean, minimal design — no charts library, just styled bars and numbers

**Persistence Strategy**
- localStorage for all persistent data
- Persist: challenge statuses (keyed by challenge ID), drill answer history (array of {challengeId, status, timestamp}), hint usage count
- Tier unlock state is DERIVED from persisted challenge/drill data on load — not stored separately
- Timer data is NOT persisted — session-only, resets on page load
- Hydrate Zustand stores from localStorage on app mount, write back on every state change
- Handle localStorage being unavailable (private browsing) gracefully — app works but nothing persists, no errors shown

**Weak-Area Suggestions**
- Show on progress dashboard: "Suggested next: [Function Name]" card based on lowest accuracy function (minimum 2 attempts to qualify)
- The suggestion links directly to a challenge for that function (or starts a drill filtered to it)
- If all functions are above 80% accuracy, show "You're doing great — keep practicing!" instead of a specific suggestion
- No suggestions shown on the challenge page itself — keep that focused on the current task

**Weighted Drill Queue**
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

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| PROG-01 | User's completed challenges and scores persist across browser sessions | Zustand persist middleware with `partialize` covers challenge statuses and drill answer history; localStorage is synchronous so hydration is instant at store creation |
| PROG-02 | User can see weak areas tagged by function/concept with accuracy rates per topic | Computed from persisted `allAnswers` + `statuses` arrays grouped by `challenge.category`; per-function accuracy bars (correct / total attempts) |
| PROG-03 | User receives suggested next topics based on their performance and gaps | Derived: find category with lowest accuracy among those with ≥2 attempts; link to `/challenge?category=X` or `/drill` with pre-selected tier |
| LEARN-06 | Drill queue surfaces frequently-missed formulas more often (weighted-random) | Cumulative-weight random selection on challenge pool in `drillStore.startSession`; weight = inverse of per-category accuracy (0-attempt categories default to 0.5) |
</phase_requirements>

---

## Summary

Phase 5 has three interconnected concerns: (1) persisting existing Zustand store data across sessions via localStorage, (2) building a progress dashboard page at `/progress` that derives accuracy metrics from persisted data, and (3) modifying the drill queue selection algorithm to favor weak areas.

The persistence concern is the foundation — nothing else works without it. The project's existing Zustand stores (`challengeStore`, `drillStore`) hold all the data needed; the task is wiring them to localStorage via Zustand's built-in `persist` middleware. No new data structures are required beyond what already exists, though the schema must be chosen carefully to support the computed metrics the dashboard needs.

The weighted drill queue is a pure algorithm change inside `drillStore.startSession`. The progress dashboard is a new page (`ProgressPage`) at `/progress` that computes metrics from already-persisted state — no new API calls, no backend, just derived views over localStorage-hydrated store data.

**Primary recommendation:** Use Zustand `persist` middleware with `partialize` to selectively persist challenge statuses and drill answer history. Derive all metrics (accuracy, tier unlock, suggestions) at read time from raw persisted data — do not store derived values.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `zustand/middleware` — `persist` | 5.0.11 (already installed) | Sync selected Zustand state to/from localStorage | Built-in, no extra dependency; synchronous localStorage hydration means no loading flash |
| `zustand/middleware` — `createJSONStorage` | 5.0.11 (already installed) | Wraps a storage getter into the PersistStorage interface | Required companion to `persist`; enables try/catch wrapper for private-browsing safety |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| React Router DOM `useNavigate` / `Link` | 7.13.0 (already installed) | Navigate from "Suggested next" card to challenge or drill | In ProgressPage for the suggestion CTA |
| `clsx` | 2.1.1 (already installed) | Conditional class names on progress bars | For threshold color changes (red/yellow/green) |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `persist` middleware | Manual `useEffect` + `localStorage.get/setItem` | Manual sync requires explicit write on every action; more error-prone, more boilerplate; persist handles versioning/migration automatically |
| `persist` middleware | `idb-keyval` (IndexedDB) | IndexedDB is async — adds hydration complexity with no benefit for this data volume |
| Computed accuracy at read time | Storing pre-computed accuracy in localStorage | Derived values can go stale; raw event log is always correct source of truth |

**Installation:** No new packages needed — `zustand/middleware` is included in `zustand` 5.0.11 already installed.

---

## Architecture Patterns

### Recommended Project Structure

```
src/
├── store/
│   ├── challengeStore.ts        # Add persist middleware wrapping statuses[]
│   ├── drillStore.ts            # Add persist middleware for allAnswers[]; modify startSession for weighted queue
│   └── progressSelectors.ts    # NEW: pure functions computing accuracy metrics from store state
├── pages/
│   └── ProgressPage.tsx         # NEW: /progress route — dashboard UI
└── App.tsx                      # Add /progress route; remove disabled flag from AppShell nav
```

### Pattern 1: Zustand persist with partialize (selective persistence)

**What:** Wrap the store creator with `persist`, using `partialize` to exclude transient session state (timer, current index, UI flags) from localStorage.

**When to use:** Always — we never want to persist timer state, `currentIndex`, `isLocked`, `hintVisible`, etc. Only the durable historical record matters.

**Example:**

```typescript
// Source: https://deepwiki.com/pmndrs/zustand/3.1-persist-middleware
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// Safe localStorage wrapper — silently no-ops in private browsing
const safeStorage = {
  getItem: (name: string): string | null => {
    try { return localStorage.getItem(name); } catch { return null; }
  },
  setItem: (name: string, value: string): void => {
    try { localStorage.setItem(name, value); } catch { /* silent */ }
  },
  removeItem: (name: string): void => {
    try { localStorage.removeItem(name); } catch { /* silent */ }
  },
};

export const useDrillStore = create<DrillStore>()(
  persist(
    (set, get) => ({
      // ... all existing store logic unchanged ...
    }),
    {
      name: 'excelprep-drill-v1',          // unique key
      storage: createJSONStorage(() => safeStorage),
      version: 1,
      partialize: (state) => ({
        allAnswers: state.allAnswers,        // persist ONLY durable history
        // Everything else (phase, questions, timer, etc.) is session-only
      }),
    }
  )
);
```

**challengeStore** persists:
```typescript
partialize: (state) => ({
  statuses: state.statuses,       // array indexed by challenges[]
  // challenges[] itself is not persisted — it's always loaded from static data
})
```

**Key insight on challengeStore statuses:** `statuses[]` is globally indexed by `challenges[]`. On hydration, if the challenges array hasn't changed, the indices remain valid. The challenges array is static (imported from data files), so index alignment is stable.

### Pattern 2: Deriving accuracy metrics from raw data

**What:** Pure selector functions computed from `statuses[]` + `allAnswers[]` + static `challenges[]`. Never stored; always derived on read.

**Example:**

```typescript
// src/store/progressSelectors.ts
import { challenges } from '../data/challenges';
import type { ChallengeStatus } from '../types';
import type { DrillAnswerRecord } from './drillStore';

export interface CategoryAccuracy {
  category: string;
  tier: Tier;
  gridCorrect: number;
  gridTotal: number;      // only attempted challenges (status !== 'unattempted')
  drillCorrect: number;
  drillTotal: number;
  accuracy: number;       // weighted: (gridCorrect + drillCorrect*0.5) / (gridTotal + drillTotal*0.5)
}

export function computeCategoryAccuracies(
  statuses: ChallengeStatus[],
  allAnswers: DrillAnswerRecord[],
): CategoryAccuracy[] {
  // Group challenges by category, compute per-category metrics
  // Only include categories where gridTotal + drillTotal > 0
  // ...
}

export function weakestCategory(
  accuracies: CategoryAccuracy[],
  minAttempts = 2,
): CategoryAccuracy | null {
  const qualified = accuracies.filter(
    (a) => (a.gridTotal + a.drillTotal) >= minAttempts
  );
  if (qualified.length === 0) return null;
  return qualified.reduce((weakest, curr) =>
    curr.accuracy < weakest.accuracy ? curr : weakest
  );
}
```

### Pattern 3: Weighted random drill queue selection

**What:** Cumulative-weights approach. Build weight array proportional to inverse accuracy, then pick via random number against cumulative sum. O(n) per selection, n = number of categories, which is ≤ 12 — no optimization needed.

**Example:**

```typescript
// Inside drillStore.startSession — replaces current shuffle+slice
function buildWeightedQueue(
  candidates: Challenge[],
  allAnswers: DrillAnswerRecord[],
  statuses: ChallengeStatus[],
  targetCount: number,
): Challenge[] {
  // 1. Compute per-category accuracy (0-attempt → 0.5 neutral)
  const categoryAccuracy = computeAccuracyMap(candidates, allAnswers, statuses);

  // 2. Assign weight = 1 - accuracy (lower accuracy = higher weight)
  //    Clamp so 0% accuracy doesn't get infinite weight; cap at 0.95
  const categories = [...new Set(candidates.map(c => c.category ?? 'General'))];
  const weights = categories.map(cat => {
    const acc = categoryAccuracy[cat] ?? 0.5;
    return Math.max(0.05, 1 - acc);  // inverse, minimum weight 0.05
  });

  // 3. Guarantee minimum 1 question per category (if categories < targetCount)
  const guaranteed: Challenge[] = categories.map(cat =>
    randomFrom(candidates.filter(c => (c.category ?? 'General') === cat))
  );

  // 4. Fill remaining slots via cumulative-weight random selection
  const remaining = targetCount - guaranteed.length;
  const extras = weightedSample(candidates, weights, categories, remaining);

  // 5. Shuffle combined list to interleave categories
  return shuffle([...guaranteed, ...extras]).slice(0, targetCount);
}
```

**Weighting math (per CONTEXT.md spec):** "30% accuracy gets roughly 2-3x the questions of 80%". With weight = 1 - accuracy: weight(30%) = 0.70, weight(80%) = 0.20. Ratio: 0.70/0.20 = 3.5x. This matches the "2-3x" spec. Confirmed correct.

### Anti-Patterns to Avoid

- **Storing tier unlock state in localStorage:** Tier unlock is already computed by `computeTierUnlocked()` in challengeStore — re-deriving on hydration from statuses + allAnswers is correct. Storing derived state creates sync bugs.
- **Persisting the entire store:** `persist` without `partialize` would store timer state, session questions, currentIndex — causing confusing re-hydration where the user is "mid-session" on page load.
- **Using the statuses array index naively across schema changes:** If challenges are reordered in data files, statuses[] indices break. Mitigation: key by `challengeId` instead of array index in the persisted schema. See Data Schema section below.
- **Blocking render on hydration:** Zustand persist with localStorage is synchronous — hydration completes before first render. No loading spinner needed, no `useEffect` hydration dance.

---

## Data Schema Design

**Recommended: key statuses by challengeId (not array index)**

The current in-memory `statuses: ChallengeStatus[]` is indexed by position in `challenges[]`. This works in memory but is fragile for serialization — if challenges are reordered, old persisted data maps to wrong challenges.

Recommended persisted schema:

```typescript
// What gets stored in localStorage under 'excelprep-challenge-v1'
interface PersistedChallengeState {
  challengeStatuses: Record<string, ChallengeStatus>;  // { [challengeId]: status }
  hintUsageCount: number;                               // per CONTEXT.md
}

// What gets stored under 'excelprep-drill-v1'
interface PersistedDrillState {
  allAnswers: DrillAnswerRecord[];   // already has challengeId field — safe as-is
}
```

On hydration, convert `challengeStatuses` Record back to the `statuses[]` array by iterating `challenges[]` and looking up each id. This keeps the in-memory array format (required by existing store logic) while making the persisted format stable.

**Alternatively (lower migration cost):** Keep `statuses[]` as-is but add `version: 1` and a `migrate` function that resets to all-unattempted if the version changes. Accept that challenge reordering invalidates stored progress. Given the static nature of the challenges data file this is LOW risk.

**Recommendation:** Use the Record<string, ChallengeStatus> approach for the persisted format. Add a `version: 1` + `migrate` that handles version 0 → 1 by resetting to empty. This is the safer default.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| localStorage sync with change detection | Custom `useEffect` watchers | `zustand/middleware` `persist` | persist hooks into every `set()` call automatically; handles serialization, versioning, migration |
| Private browsing detection | `try { localStorage.setItem('test',...) }` guard at app boot | try/catch in `safeStorage.setItem/getItem` | Granular per-operation safety; no global flag needed |
| Schema migration | Custom JSON comparison logic | `persist` `version` + `migrate` option | Declarative version number; persist calls migrate automatically when stored version differs |
| Progress bar component | Custom SVG or canvas | Plain `<div>` with `width: X%` CSS | The requirement says "no charts library, just styled bars" — a div with inline width percentage is the correct call |

**Key insight:** The weighted random algorithm is simple enough (≤12 categories) that no library is needed — standard cumulative-weights in ~20 lines of TypeScript is the right call. `weighted-random` npm package would add a dep with no benefit at this scale.

---

## Common Pitfalls

### Pitfall 1: statuses[] index drift after challenge data changes

**What goes wrong:** Developer adds or reorders a challenge in `beginner.ts`. The persisted `statuses[3]` now refers to a different challenge.
**Why it happens:** In-memory array indexing is used as the persistence key.
**How to avoid:** Persist as `Record<string, ChallengeStatus>` keyed by `challengeId`. On load, rebuild the array by mapping the static `challenges[]` array through the Record.
**Warning signs:** Challenge shows wrong status after a code change that reorders challenges.

### Pitfall 2: Persisting too much state causes confusing hydration

**What goes wrong:** User left mid-drill. On page reload, `phase: 'active'` and `questions: [...]` are hydrated from localStorage. The drill timer starts running with stale questions from last session.
**Why it happens:** `partialize` not used — entire store is persisted.
**How to avoid:** Always use `partialize` to whitelist only `allAnswers` (drill) and `statuses` / `hintUsageCount` (challenge). Everything else is session-only.
**Warning signs:** User sees a drill question immediately on page load without choosing "Start Session."

### Pitfall 3: computeTierUnlocked called before store hydration

**What goes wrong:** `isTierUnlocked('intermediate')` returns `false` on first render because `statuses[]` hasn't been hydrated yet (in async storage scenarios).
**Why it happens:** Async storages hydrate after first render; function is called during render.
**How to avoid:** localStorage is synchronous — this pitfall does NOT apply here. Zustand persist with synchronous localStorage hydrates before first render. No guards needed. (Only relevant if storage is ever switched to IndexedDB/AsyncStorage.)
**Warning signs:** Intermediate tier shows locked even though user has completed all beginner challenges. Not expected with localStorage.

### Pitfall 4: Weighted queue produces duplicate questions in a session

**What goes wrong:** Same challenge appears 2-3 times in the 10-question drill because it has high weight and is selected multiple times.
**Why it happens:** Cumulative-weight selection with replacement.
**How to avoid:** Sample WITHOUT replacement — remove each selected challenge from the pool before the next pick. Or use the guaranteed-1-per-category + extras-from-pool pattern described in Architecture Patterns.
**Warning signs:** User sees the same scenario repeated back-to-back.

### Pitfall 5: Accuracy calculation includes 'skipped' challenges incorrectly

**What goes wrong:** A skipped challenge is counted in `gridTotal`, dragging down accuracy for a function the user never actually tried.
**Why it happens:** `statuses[]` contains `'skipped'` entries; naive count of non-`'unattempted'` includes skipped.
**How to avoid:** For accuracy purposes, only count `'correct'` and `'incorrect'` statuses. `'skipped'` = unattempted for accuracy purposes.
**Warning signs:** User who skipped 3 VLOOKUP challenges shows 33% accuracy despite getting 2/3 correct.

---

## Code Examples

### Persist middleware setup (drillStore)

```typescript
// Source: https://deepwiki.com/pmndrs/zustand/3.1-persist-middleware
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const safeLocalStorage = {
  getItem: (name: string) => {
    try { return localStorage.getItem(name); } catch { return null; }
  },
  setItem: (name: string, value: string) => {
    try { localStorage.setItem(name, value); } catch { /* silent */ }
  },
  removeItem: (name: string) => {
    try { localStorage.removeItem(name); } catch { /* silent */ }
  },
};

export const useDrillStore = create<DrillStore>()(
  persist(
    (set, get) => ({
      // ... existing DrillStore implementation unchanged ...
    }),
    {
      name: 'excelprep-drill-v1',
      storage: createJSONStorage(() => safeLocalStorage),
      version: 1,
      partialize: (state) => ({
        allAnswers: state.allAnswers,
      }),
    }
  )
);
```

### Persist middleware setup (challengeStore)

```typescript
export const useChallengeStore = create<ChallengeStore>()(
  persist(
    (set, get) => ({
      // ... existing ChallengeStore implementation unchanged ...
    }),
    {
      name: 'excelprep-challenge-v1',
      storage: createJSONStorage(() => safeLocalStorage),
      version: 1,
      partialize: (state) => ({
        // Persist challenge statuses as a Record for stability
        // (convert to/from array via merge option)
        challengeStatuses: Object.fromEntries(
          state.challenges.map((c, i) => [c.id, state.statuses[i]])
        ),
        hintUsageCount: /* add this field to store */,
      }),
      merge: (persisted, current) => {
        // Rebuild statuses[] array from persisted Record
        const record = (persisted as any).challengeStatuses ?? {};
        const statuses = current.challenges.map(
          (c) => record[c.id] ?? 'unattempted'
        );
        return { ...current, statuses };
      },
    }
  )
);
```

### Cumulative-weight random selection

```typescript
// Source: pattern from https://dev.to/trekhleb/weighted-random-algorithm-in-javascript-1pdc
function weightedPick<T>(items: T[], weights: number[]): T {
  const cumulative = weights.reduce<number[]>((acc, w, i) => {
    acc.push((acc[i - 1] ?? 0) + w);
    return acc;
  }, []);
  const rand = Math.random() * cumulative[cumulative.length - 1];
  const idx = cumulative.findIndex((c) => c >= rand);
  return items[idx];
}
```

### Progress bar component (no library)

```typescript
// Pure CSS progress bar — per CONTEXT.md "no charts library"
function AccuracyBar({ label, correct, total }: { label: string; correct: number; total: number }) {
  const pct = total === 0 ? 0 : Math.round((correct / total) * 100);
  const color = pct >= 80 ? '#1a6b3c' : pct >= 50 ? '#d97706' : '#dc2626';
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span>{label}</span>
        <span>{correct}/{total} — {pct}%</span>
      </div>
      <div style={{ height: 8, background: '#e5e7eb', borderRadius: 4 }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 4, transition: 'width 0.3s ease' }} />
      </div>
    </div>
  );
}
```

---

## Known Codebase Facts (from reading existing code)

These facts are verified from the codebase and constrain implementation:

1. **Challenge categories are:** `SUM`, `IF`, `IFERROR`, `VLOOKUP` (beginner); `SUMIFS`, `INDEX/MATCH`, `NPV`, `PMT` (intermediate); `IRR`, `XLOOKUP`, `XNPV` (advanced). 11 total categories across ~66 challenges.

2. **`allAnswers` already uses `challengeId` as the key** — DrillAnswerRecord has `{ challengeId: string, status: DrillAnswerStatus }`. This is already the correct format for accurate per-function tracking.

3. **`statuses[]` is globally indexed** by position in `challenges[]` (the full unsorted array from `data/challenges/index.ts`). The `globalIndex()` helper exists to map challengeId → index. The persist schema needs to account for this.

4. **`allAnswers` intentionally NOT reset on `endSession()`** — comment in drillStore confirms this design. It's the cross-session accumulator. Persist this field.

5. **AppShell `/progress` nav item** is currently `disabled: true`. Implementation requires removing `disabled` and adding the route to `App.tsx`.

6. **Existing `computeTierUnlocked`** already combines grid statuses + drill allAnswers with weighted scoring (grid 100%, drill 50%). The progress dashboard should reuse this same weighting logic for display consistency.

7. **`hintVisible`** is transient UI state. But if CONTEXT.md says persist "hint usage count," that's a NEW field — a counter incremented each time `showHint()` is called. Currently not tracked.

8. **Zustand 5 already installed** (`^5.0.11`) — `zustand/middleware` is part of the same package, no additional install.

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Manual `useEffect` localStorage sync | `persist` middleware built into Zustand | Zustand v3+ | Automatic sync on every `set()`, no boilerplate |
| Storing computed/derived state | Store raw events, derive metrics | Current best practice | Avoids stale derived state bugs |
| Polling for localStorage changes | Zustand subscribers | N/A | Reactive; no polling |

---

## Open Questions

1. **hintUsageCount: per-challenge or global total?**
   - What we know: CONTEXT.md says "hint usage count" is persisted. The current store has `hintVisible: boolean` per-session, no count.
   - What's unclear: Is this a single global counter (user clicked hint 14 times total) or per-challenge (how many times they needed a hint for VLOOKUP)?
   - Recommendation: Implement as a simple global counter for now (increment in `showHint()` action). Per-challenge hint tracking could be v2. Dashboard could show "Hints used: 14."

2. **"Links directly to a challenge for that function" — which challenge?**
   - What we know: The suggestion card links to a challenge for the weakest function. There can be 5-6 challenges per function.
   - What's unclear: Does it link to the first unattempted challenge for that function, a random one, or the challenge page filtered to that tier?
   - Recommendation: Link to `/challenge` with the tier pre-set to the tier containing the weak function (using `setActiveTier` action). The challenge page will then show that tier's content. Alternatively, navigate to `/drill` with that tier pre-selected. Simpler implementation; user still gets targeted practice.

3. **Reset Progress button (Claude's Discretion)**
   - What we know: User left this to Claude's discretion.
   - Recommendation: Include a "Reset Progress" button in the dashboard footer with a simple `window.confirm()` or inline "Are you sure?" text expansion before clearing. Calling `persist.clearStorage()` on both stores + reloading page is the cleanest implementation. This is a reasonable quality-of-life feature that takes 15 minutes to add.

---

## Sources

### Primary (HIGH confidence)
- DeepWiki: https://deepwiki.com/pmndrs/zustand/3.1-persist-middleware — persist middleware full API including all options, TypeScript signatures, private browsing pattern
- Codebase read: `/Users/jam/excel-prep/src/store/challengeStore.ts`, `drillStore.ts`, `types/index.ts`, `App.tsx`, `AppShell.tsx` — verified store structure, existing patterns, category values, allAnswers design

### Secondary (MEDIUM confidence)
- WebSearch result: Zustand persist TypeScript usage — confirmed `create<T>()()` double-parentheses, partialize, version/migrate options
- WebSearch result: Weighted random algorithm — confirmed cumulative-weights approach; verified O(n) is adequate at ≤12 categories
- https://dev.to/trekhleb/weighted-random-algorithm-in-javascript-1pdc — cumulative weights algorithm pattern

### Tertiary (LOW confidence)
- None needed — all critical claims verified from primary sources

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — zustand persist is built into installed package; no new deps
- Architecture: HIGH — patterns derived directly from reading existing store code; persist API verified from official DeepWiki
- Data schema: HIGH — challengeId-keyed Record is verified safe given existing DrillAnswerRecord already uses challengeId
- Weighted algorithm: HIGH — cumulative weights is textbook; verified adequate for n≤12
- Pitfalls: HIGH — derived from direct code inspection of statuses[] indexing, partialize omission risk, and drillStore endSession design comment

**Research date:** 2026-02-24
**Valid until:** 2026-03-24 (Zustand 5 stable; localStorage API unchanged)
