---
phase: 04-keyboard-shortcuts
plan: 01
subsystem: shortcut-data-layer
tags: [typescript, zustand, data-model, state-machine]
dependency_graph:
  requires: []
  provides: [shortcut-types, shortcut-dataset, shortcut-drill-store]
  affects: [04-02-shortcut-ui]
tech_stack:
  added: []
  patterns: [zustand-create, sorted-set-comparison, state-machine]
key_files:
  created:
    - src/data/shortcuts/index.ts
    - src/store/shortcutStore.ts
  modified:
    - src/types/index.ts
decisions:
  - "33 total shortcuts (29 drillable, 3 browser-blocked, 1 sequential-only) — slightly more than ~30 target to cover all 4 categories fully"
  - "7 seconds per timed question — midpoint of 5-10s range; provides pressure without frustration"
  - "submitAnswer ignores modifier-only presses (no action key) — prevents premature grading when user holds Ctrl before pressing the action key"
  - "gradeKeys exported as pure function for unit testing — not internal to store closure"
  - "submitMultipleChoiceAnswer added for Keys→Action direction — compares selected shortcut id against current shortcut id"
metrics:
  duration: 3 min
  completed: 2026-02-23
  tasks_completed: 2
  files_created: 2
  files_modified: 1
---

# Phase 04 Plan 01: Shortcut Data Layer Summary

**One-liner:** TypeScript types + 33 IB shortcut dataset + Zustand drill state machine with bidirectional grading and timed mode.

## What Was Built

### Task 1: Shortcut types and dataset (`a6a25b2`)

Extended `src/types/index.ts` with 8 new types for the shortcut module:
- `ShortcutCategory`, `ShortcutKeys`, `Shortcut`, `DrillResult`
- `OSMode`, `DrillMode`, `DrillDirection`, `DrillState`

Created `src/data/shortcuts/index.ts` with 33 IB shortcuts:

| Category | Count | Drillable |
|---|---|---|
| Navigation | 9 (incl. 2 browser-blocked) | 7 |
| Formula Entry | 7 | 7 |
| Formatting | 8 (incl. 1 browser-blocked, 1 sequential) | 6 |
| Selection & Editing | 8 | 8 |
| **Total** | **33** | **29** |

Exports: `shortcuts`, `drillableShortcuts`, `browserBlockedShortcuts`, `sequentialOnlyShortcuts`, `shortcutsByCategory()`.

### Task 2: Shortcut drill Zustand store (`e6b5adc`)

Created `src/store/shortcutStore.ts` with full drill lifecycle:

**State machine:** `idle` → `drilling` → `feedback` → `drilling` | `summary`

**Actions implemented:**
- `setConfig(os, mode, direction, category)` — session configuration
- `startSession(shortcuts)` — idle → drilling, initializes queue
- `submitAnswer(pressedKeys)` — Action→Keys grading with modifier-only guard
- `submitMultipleChoiceAnswer(selectedShortcutId)` — Keys→Action grading by id
- `advanceToNext()` — feedback → next question or summary
- `tick()` — timed mode countdown, timeout → feedback as incorrect
- `requestQuit()` / `confirmQuit()` / `cancelQuit()` — mid-session quit dialog
- `resetToIdle()` — clears all session state

**Pure grading function:** `gradeKeys(pressed, shortcut, os)` — sorted-set comparison, exported for testing.

## Decisions Made

| Decision | Rationale |
|---|---|
| 7s timed mode default | Midpoint of 5-10s range; provides interview pressure without excessive anxiety |
| Ignore modifier-only presses in submitAnswer | Prevents grading firing when user holds Ctrl before pressing action key |
| Export `gradeKeys` as top-level function | Enables unit testing without store setup |
| `submitMultipleChoiceAnswer` separate from `submitAnswer` | Clean separation of grading logic for two drill directions |
| 33 shortcuts (slightly over ~30) | All 4 categories fully represented; each shortcut is genuinely IB-interview relevant |

## Deviations from Plan

None — plan executed exactly as written. The store interface matched the plan spec precisely including `drillDirection`, `showQuitConfirm`, `submitMultipleChoiceAnswer`, and all quit dialog actions.

## Self-Check: PASSED

**Created files:**
- FOUND: src/types/index.ts
- FOUND: src/data/shortcuts/index.ts
- FOUND: src/store/shortcutStore.ts

**Commits:**
- FOUND: a6a25b2 — feat(04-01): add shortcut types and IB shortcut dataset
- FOUND: e6b5adc — feat(04-01): create shortcut drill Zustand store
