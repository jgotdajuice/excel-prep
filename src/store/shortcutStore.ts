import { create } from 'zustand';
import type {
  Shortcut,
  ShortcutCategory,
  DrillResult,
  OSMode,
  DrillMode,
  DrillDirection,
  DrillState,
} from '../types';

interface ShortcutStore {
  // ── Session config ────────────────────────────────────────────────────────
  osMode: OSMode;
  drillMode: DrillMode;
  drillDirection: DrillDirection;
  selectedCategory: ShortcutCategory | 'all';

  // ── Session state ─────────────────────────────────────────────────────────
  drillState: DrillState;
  queue: Shortcut[];
  currentIndex: number;
  results: DrillResult[];
  questionStartTime: number;
  /** Seconds remaining in timed mode (7s default per question) */
  timeRemaining: number;

  // ── Feedback state ────────────────────────────────────────────────────────
  lastPressedKeys: string[];
  lastCorrect: boolean | null;

  // ── Quit dialog ───────────────────────────────────────────────────────────
  showQuitConfirm: boolean;

  // ── Actions ───────────────────────────────────────────────────────────────
  setConfig: (
    os: OSMode,
    mode: DrillMode,
    direction: DrillDirection,
    category: ShortcutCategory | 'all',
  ) => void;
  startSession: (shortcuts: Shortcut[]) => void;
  submitAnswer: (pressedKeys: string[]) => void;
  submitMultipleChoiceAnswer: (selectedShortcutId: string) => void;
  advanceToNext: () => void;
  tick: () => void;
  requestQuit: () => void;
  confirmQuit: () => void;
  cancelQuit: () => void;
  resetToIdle: () => void;
}

export const useShortcutStore = create<ShortcutStore>((set, get) => ({
  // ── Defaults ──────────────────────────────────────────────────────────────
  osMode: 'windows',
  drillMode: 'practice',
  drillDirection: 'action-to-keys',
  selectedCategory: 'all',
  drillState: 'idle',
  queue: [],
  currentIndex: 0,
  results: [],
  questionStartTime: 0,
  timeRemaining: 7,
  lastPressedKeys: [],
  lastCorrect: null,
  showQuitConfirm: false,

  // ── setConfig ─────────────────────────────────────────────────────────────
  setConfig: (os, mode, direction, category) =>
    set({ osMode: os, drillMode: mode, drillDirection: direction, selectedCategory: category }),

  // ── startSession: idle → drilling ─────────────────────────────────────────
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
      showQuitConfirm: false,
    }),

  // ── submitAnswer: drilling → feedback (Action→Keys direction) ─────────────
  submitAnswer: (pressedKeys) => {
    const { queue, currentIndex, osMode, questionStartTime, results } = get();
    const shortcut = queue[currentIndex];
    if (!shortcut) return;

    // Ignore modifier-only presses (no action key present)
    if (pressedKeys.length === 0) return;
    const MODIFIERS = new Set(['Ctrl', 'Alt', 'Shift', 'Cmd']);
    const hasActionKey = pressedKeys.some((k) => !MODIFIERS.has(k));
    if (!hasActionKey) return;

    const correct = gradeKeys(pressedKeys, shortcut, osMode);
    const responseMs = Date.now() - questionStartTime;

    set({
      drillState: 'feedback',
      lastPressedKeys: pressedKeys,
      lastCorrect: correct,
      results: [...results, { shortcut, correct, responseMs }],
    });
  },

  // ── submitMultipleChoiceAnswer: drilling → feedback (Keys→Action direction)
  submitMultipleChoiceAnswer: (selectedShortcutId) => {
    const { queue, currentIndex, questionStartTime, results } = get();
    const shortcut = queue[currentIndex];
    if (!shortcut) return;

    const correct = selectedShortcutId === shortcut.id;
    const responseMs = Date.now() - questionStartTime;

    set({
      drillState: 'feedback',
      lastPressedKeys: [],
      lastCorrect: correct,
      results: [...results, { shortcut, correct, responseMs }],
    });
  },

  // ── advanceToNext: feedback → drilling | summary ──────────────────────────
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

  // ── tick: decrement timer, treat 0 as timeout (incorrect) ────────────────
  tick: () => {
    const { drillState, drillMode, timeRemaining } = get();
    if (drillState !== 'drilling' || drillMode !== 'timed') return;

    if (timeRemaining > 1) {
      set({ timeRemaining: timeRemaining - 1 });
    } else {
      // Timeout — record as incorrect and move to feedback
      const { queue, currentIndex, questionStartTime, results } = get();
      const shortcut = queue[currentIndex];
      if (!shortcut) return;

      set({
        drillState: 'feedback',
        lastPressedKeys: [],
        lastCorrect: false,
        results: [
          ...results,
          { shortcut, correct: false, responseMs: Date.now() - questionStartTime },
        ],
      });
    }
  },

  // ── Quit dialog ───────────────────────────────────────────────────────────
  requestQuit: () => set({ showQuitConfirm: true }),

  confirmQuit: () =>
    set({
      drillState: 'summary',
      showQuitConfirm: false,
    }),

  cancelQuit: () => set({ showQuitConfirm: false }),

  // ── resetToIdle: return to initial state ──────────────────────────────────
  resetToIdle: () =>
    set({
      drillState: 'idle',
      queue: [],
      currentIndex: 0,
      results: [],
      questionStartTime: 0,
      timeRemaining: 7,
      lastPressedKeys: [],
      lastCorrect: null,
      showQuitConfirm: false,
    }),
}));

/**
 * Pure grading function — compares pressed keys against shortcut definition
 * using sorted-set comparison (order-independent).
 *
 * Exported for unit testing.
 */
export function gradeKeys(pressed: string[], shortcut: Shortcut, os: OSMode): boolean {
  const expected = os === 'windows' ? shortcut.keys.windows : shortcut.keys.mac;
  if (pressed.length !== expected.length) return false;
  const sortedPressed = [...pressed].sort();
  const sortedExpected = [...expected].sort();
  return sortedPressed.every((k, i) => k === sortedExpected[i]);
}
