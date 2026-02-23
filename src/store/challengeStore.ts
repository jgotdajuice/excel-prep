import { create } from 'zustand';
import type { Challenge, ChallengeStatus, GradeResult } from '../types';
import { gradeCell } from '../engine/grader';

interface CellGrade {
  row: number;
  col: number;
  result: GradeResult;
}

interface ChallengeStore {
  // Data
  challenges: Challenge[];
  currentIndex: number;
  statuses: ChallengeStatus[];
  cellGrades: CellGrade[];

  // UI state
  hintVisible: boolean;
  explanationVisible: boolean;
  isLocked: boolean;         // Grid locked after grading
  startTime: number | null;  // Timer start timestamp (ms)
  elapsedSeconds: number;

  // Actions
  loadChallenges: (challenges: Challenge[]) => void;
  setChallenge: (index: number) => void;
  gradeCellAction: (row: number, col: number, cellValue: unknown) => void;
  showHint: () => void;
  toggleExplanation: () => void;
  retry: () => void;
  skip: () => void;
  nextChallenge: () => void;
  prevChallenge: () => void;
  tick: () => void;           // Called by timer interval
}

/** Determine overall challenge status from cell grades */
function computeOverallStatus(
  cellGrades: CellGrade[],
): 'correct' | 'incorrect' {
  return cellGrades.every((g) => g.result.status === 'correct')
    ? 'correct'
    : 'incorrect';
}

export const useChallengeStore = create<ChallengeStore>((set, get) => ({
  // Initial state
  challenges: [],
  currentIndex: 0,
  statuses: [],
  cellGrades: [],
  hintVisible: false,
  explanationVisible: false,
  isLocked: false,
  startTime: null,
  elapsedSeconds: 0,

  // ── Actions ────────────────────────────────────────────────────────────────

  loadChallenges: (challenges) => {
    set({
      challenges,
      currentIndex: 0,
      statuses: challenges.map(() => 'unattempted' as ChallengeStatus),
      cellGrades: [],
      hintVisible: false,
      explanationVisible: false,
      isLocked: false,
      startTime: Date.now(),
      elapsedSeconds: 0,
    });
  },

  setChallenge: (index) => {
    set({
      currentIndex: index,
      cellGrades: [],
      hintVisible: false,
      explanationVisible: false,
      isLocked: false,
      startTime: Date.now(),
      elapsedSeconds: 0,
    });
  },

  gradeCellAction: (row, col, cellValue) => {
    const { challenges, currentIndex, cellGrades, statuses } = get();
    const challenge = challenges[currentIndex];
    if (!challenge) return;

    const answerCell = challenge.answerCells.find(
      (ac) => ac.row === row && ac.col === col,
    );
    if (!answerCell) return;

    const result = gradeCell(cellValue, answerCell);

    // Replace any existing grade for this cell, then add new result
    const updatedGrades: CellGrade[] = [
      ...cellGrades.filter((g) => !(g.row === row && g.col === col)),
      { row, col, result },
    ];

    const allAnswerCellsGraded =
      updatedGrades.length === challenge.answerCells.length;

    if (allAnswerCellsGraded) {
      const overallStatus = computeOverallStatus(updatedGrades);
      const updatedStatuses = [...statuses];
      updatedStatuses[currentIndex] = overallStatus;
      set({
        cellGrades: updatedGrades,
        statuses: updatedStatuses,
        isLocked: true,
      });
    } else {
      set({ cellGrades: updatedGrades });
    }
  },

  showHint: () => set({ hintVisible: true }),

  toggleExplanation: () =>
    set((state) => ({ explanationVisible: !state.explanationVisible })),

  retry: () => {
    const { statuses, currentIndex } = get();
    const updatedStatuses = [...statuses];
    updatedStatuses[currentIndex] = 'unattempted';
    set({
      cellGrades: [],
      isLocked: false,
      explanationVisible: false,
      statuses: updatedStatuses,
      startTime: Date.now(),
      elapsedSeconds: 0,
    });
  },

  skip: () => {
    const { statuses, currentIndex, challenges } = get();
    const updatedStatuses = [...statuses];
    updatedStatuses[currentIndex] = 'skipped';
    const nextIndex = Math.min(currentIndex + 1, challenges.length - 1);
    set({
      statuses: updatedStatuses,
      currentIndex: nextIndex,
      cellGrades: [],
      hintVisible: false,
      explanationVisible: false,
      isLocked: false,
      startTime: Date.now(),
      elapsedSeconds: 0,
    });
  },

  nextChallenge: () => {
    const { currentIndex, challenges } = get();
    if (currentIndex < challenges.length - 1) {
      get().setChallenge(currentIndex + 1);
    }
  },

  prevChallenge: () => {
    const { currentIndex } = get();
    if (currentIndex > 0) {
      get().setChallenge(currentIndex - 1);
    }
  },

  tick: () => {
    const { startTime } = get();
    if (startTime !== null) {
      set({ elapsedSeconds: Math.floor((Date.now() - startTime) / 1000) });
    }
  },
}));
