import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Challenge, ChallengeStatus, GradeResult, Tier } from '../types';
import { gradeCell } from '../engine/grader';
import { useDrillStore } from './drillStore';
import type { DrillAnswerRecord } from './drillStore';
import { safeLocalStorage } from './safeStorage';

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

  // Tier state
  activeTier: Tier;
  tierChallenges: Challenge[];

  // UI state
  hintVisible: boolean;
  explanationVisible: boolean;
  isLocked: boolean;         // Grid locked after grading
  startTime: number | null;  // Timer start timestamp (ms)
  elapsedSeconds: number;

  // Persisted metrics
  hintUsageCount: number;

  // Internal: hydrated status record from localStorage (keyed by challengeId)
  // Used by loadChallenges to rebuild statuses[] after challenges are available.
  // Not exposed externally — do not use outside the store.
  _hydratedStatusRecord: Record<string, ChallengeStatus>;

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

  // Tier actions
  setActiveTier: (tier: Tier) => void;
  isTierUnlocked: (tier: 'intermediate' | 'advanced') => boolean;

  // Helper
  globalIndex: (challengeId: string) => number;
}

/** Determine overall challenge status from cell grades */
function computeOverallStatus(
  cellGrades: CellGrade[],
): 'correct' | 'incorrect' {
  return cellGrades.every((g) => g.result.status === 'correct')
    ? 'correct'
    : 'incorrect';
}

/**
 * Per-function gating: for each function category in the prerequisite tier,
 * compute a weighted score combining grid challenges (100% weight) and
 * drill answers (50% weight). If weighted score >= 70%, function is unlocked.
 *
 * Prerequisite: beginner for intermediate, intermediate for advanced.
 * If a function has 0 attempts (both grid and drill), it is NOT unlocked.
 * ALL prerequisite functions must meet 70% weighted threshold.
 */
function computeTierUnlocked(
  targetTier: 'intermediate' | 'advanced',
  allChallenges: Challenge[],
  statuses: ChallengeStatus[],
  drillAnswers: DrillAnswerRecord[],
): boolean {
  const prereqTier: Tier = targetTier === 'intermediate' ? 'beginner' : 'intermediate';
  const prereqChallenges = allChallenges.filter(c => c.tier === prereqTier);
  if (prereqChallenges.length === 0) return false;

  const categories = [...new Set(prereqChallenges.map(c => c.category ?? 'General'))];

  return categories.every(category => {
    const catChallenges = prereqChallenges.filter(c => (c.category ?? 'General') === category);
    if (catChallenges.length === 0) return false;
    const catChallengeIds = new Set(catChallenges.map(c => c.id));

    // Grid challenge score (weight = 1.0)
    const gridCorrect = catChallenges.filter(c => {
      const globalIdx = allChallenges.findIndex(ac => ac.id === c.id);
      return statuses[globalIdx] === 'correct';
    }).length;
    const gridTotal = catChallenges.length;

    // Drill score for this category (weight = 0.5)
    // Filter drill answers whose challengeId belongs to this category
    const catDrillAnswers = drillAnswers.filter(a => catChallengeIds.has(a.challengeId));
    const drillCorrect = catDrillAnswers.filter(a => a.status === 'correct').length;
    const drillTotal = catDrillAnswers.length;

    // Weighted combination: grid at full weight, drill at 50%
    const weightedCorrect = gridCorrect + (drillCorrect * 0.5);
    const weightedTotal = gridTotal + (drillTotal * 0.5);

    if (weightedTotal === 0) return false;
    return weightedCorrect / weightedTotal >= 0.70;
  });
}

/** Shuffle array in random order */
function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

// Shape of what gets written to localStorage
interface PersistedChallengeState {
  challengeStatuses: Record<string, ChallengeStatus>;
  hintUsageCount: number;
}

export const useChallengeStore = create<ChallengeStore>()(
  persist(
    (set, get) => ({
      // Initial state
      challenges: [],
      currentIndex: 0,
      statuses: [],
      cellGrades: [],
      activeTier: 'beginner',
      tierChallenges: [],
      hintVisible: false,
      explanationVisible: false,
      isLocked: false,
      startTime: null,
      elapsedSeconds: 0,
      hintUsageCount: 0,
      _hydratedStatusRecord: {},

      // ── Actions ────────────────────────────────────────────────────────────────

      loadChallenges: (challenges) => {
        const { _hydratedStatusRecord } = get();
        const beginnerChallenges = shuffle(challenges.filter(c => c.tier === 'beginner'));

        // If we have a hydrated status record from localStorage, use it to restore
        // persisted statuses. Otherwise initialize all to 'unattempted'.
        const hasHydratedData = Object.keys(_hydratedStatusRecord).length > 0;
        const statuses: ChallengeStatus[] = hasHydratedData
          ? challenges.map(c => _hydratedStatusRecord[c.id] ?? 'unattempted')
          : challenges.map(() => 'unattempted' as ChallengeStatus);

        set({
          challenges,
          currentIndex: 0,
          statuses,
          cellGrades: [],
          hintVisible: false,
          explanationVisible: false,
          isLocked: false,
          startTime: Date.now(),
          elapsedSeconds: 0,
          activeTier: 'beginner',
          tierChallenges: beginnerChallenges,
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
        const { challenges, currentIndex, cellGrades, statuses, tierChallenges } = get();
        // currentIndex refers to index within tierChallenges
        const challenge = tierChallenges[currentIndex];
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
          // Map back to global index for status tracking
          const globalIdx = challenges.findIndex(c => c.id === challenge.id);
          const updatedStatuses = [...statuses];
          if (globalIdx >= 0) {
            updatedStatuses[globalIdx] = overallStatus;
          }
          set({
            cellGrades: updatedGrades,
            statuses: updatedStatuses,
            isLocked: true,
          });
        } else {
          set({ cellGrades: updatedGrades });
        }
      },

      showHint: () =>
        set((state) => ({
          hintVisible: true,
          hintUsageCount: state.hintUsageCount + 1,
        })),

      toggleExplanation: () =>
        set((state) => ({ explanationVisible: !state.explanationVisible })),

      retry: () => {
        const { statuses, currentIndex, challenges, tierChallenges } = get();
        const challenge = tierChallenges[currentIndex];
        const updatedStatuses = [...statuses];
        if (challenge) {
          const globalIdx = challenges.findIndex(c => c.id === challenge.id);
          if (globalIdx >= 0) {
            updatedStatuses[globalIdx] = 'unattempted';
          }
        }
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
        const { statuses, currentIndex, challenges, tierChallenges } = get();
        const challenge = tierChallenges[currentIndex];
        const updatedStatuses = [...statuses];
        if (challenge) {
          const globalIdx = challenges.findIndex(c => c.id === challenge.id);
          if (globalIdx >= 0) {
            updatedStatuses[globalIdx] = 'skipped';
          }
        }
        const nextIndex = Math.min(currentIndex + 1, tierChallenges.length - 1);
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
        const { currentIndex, tierChallenges } = get();
        if (currentIndex < tierChallenges.length - 1) {
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

      // ── Tier actions ────────────────────────────────────────────────────────────

      setActiveTier: (tier) => {
        const { challenges } = get();
        const filtered = challenges.filter(c => c.tier === tier);
        const shuffled = shuffle(filtered);
        set({
          activeTier: tier,
          tierChallenges: shuffled,
          currentIndex: 0,
          cellGrades: [],
          hintVisible: false,
          explanationVisible: false,
          isLocked: false,
          startTime: Date.now(),
          elapsedSeconds: 0,
        });
      },

      isTierUnlocked: (tier) => {
        const { challenges, statuses } = get();
        const drillAnswers = useDrillStore.getState().allAnswers;
        return computeTierUnlocked(tier, challenges, statuses, drillAnswers);
      },

      // ── Helper ──────────────────────────────────────────────────────────────────

      globalIndex: (challengeId) => {
        const { challenges } = get();
        return challenges.findIndex(c => c.id === challengeId);
      },
    }),
    {
      name: 'excelprep-challenge-v1',
      storage: createJSONStorage(() => safeLocalStorage),
      version: 1,
      // Only persist durable data — never session/UI state
      partialize: (state) => ({
        challengeStatuses: Object.fromEntries(
          state.challenges.map((c, i) => [c.id, state.statuses[i] ?? 'unattempted']),
        ) as Record<string, ChallengeStatus>,
        hintUsageCount: state.hintUsageCount,
      } satisfies PersistedChallengeState),
      // On hydration: store the persisted Record in _hydratedStatusRecord so that
      // loadChallenges (called after challenges are available) can rebuild statuses[].
      merge: (persisted, current) => {
        const p = persisted as Partial<PersistedChallengeState>;
        return {
          ...current,
          hintUsageCount: p.hintUsageCount ?? 0,
          _hydratedStatusRecord: p.challengeStatuses ?? {},
        };
      },
    },
  ),
);
