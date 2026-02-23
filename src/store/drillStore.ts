import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Challenge, DrillQuestion, Tier } from '../types';
import { challengeToDrillQuestion } from '../types';
import { challenges } from '../data/challenges';
import { safeLocalStorage } from './safeStorage';
import { computeCategoryAccuracies } from './progressSelectors';
// challengeStore and drillStore are mutually dependent:
//   challengeStore imports DrillAnswerRecord + useDrillStore from drillStore.
//   drillStore imports useChallengeStore from challengeStore (here, below).
//
// This circular import is safe in ESM because:
//   1. drillStore is evaluated first (challengeStore depends on it).
//   2. useDrillStore is created synchronously at the bottom of this file.
//   3. By the time challengeStore module body runs, useDrillStore is defined.
//   4. useChallengeStore is only referenced inside startSession() —
//      a function body, never at module init time — so the reference is
//      resolved after both modules are fully evaluated.
import { useChallengeStore } from './challengeStore';

// ── Weighted queue helpers ────────────────────────────────────────────────────

/**
 * Cumulative-weight random selection — picks one item proportional to its weight.
 * Returns the selected item. Items with higher weight are chosen more often.
 */
function weightedPick<T>(items: T[], weights: number[]): T {
  const total = weights.reduce((s, w) => s + w, 0);
  let r = Math.random() * total;
  for (let i = 0; i < items.length; i++) {
    r -= weights[i];
    if (r <= 0) return items[i];
  }
  return items[items.length - 1];
}

/**
 * Build a weighted drill question list from candidates.
 *
 * Algorithm:
 * 1. Group candidates by category. Compute per-category weight: max(0.05, 1 - accuracy).
 *    Categories with 0 attempts use accuracy = 0.5 (neutral weight = 0.5).
 * 2. Guarantee 1 question per category (up to targetCount).
 * 3. Fill remaining slots via cumulative-weight random WITHOUT replacement.
 * 4. Shuffle and return up to targetCount.
 *
 * Weight math: 30% accuracy → weight 0.70, 80% accuracy → weight 0.20, ratio ≈ 3.5x.
 * This satisfies the "roughly 2-3x" spec for weak-area prioritisation.
 */
function buildWeightedQueue(
  candidates: Challenge[],
  accuracyMap: Map<string, number>,
  targetCount: number,
): Challenge[] {
  // Edge case: no filtering needed
  if (candidates.length <= targetCount) {
    return [...candidates].sort(() => Math.random() - 0.5);
  }

  // Group by category
  const byCategory = new Map<string, Challenge[]>();
  for (const c of candidates) {
    const cat = c.category ?? 'General';
    const group = byCategory.get(cat);
    if (group) {
      group.push(c);
    } else {
      byCategory.set(cat, [c]);
    }
  }

  const categories = [...byCategory.keys()];

  // Compute weight per category
  const categoryWeights = new Map<string, number>();
  for (const cat of categories) {
    const accuracy = accuracyMap.get(cat) ?? 0.5; // 0-attempt → neutral
    const weight = Math.max(0.05, 1 - accuracy);
    categoryWeights.set(cat, weight);
  }

  // Step 1: Guarantee minimum 1 question per category
  const guaranteed: Challenge[] = [];
  const pool: Challenge[] = [];

  for (const [cat, group] of byCategory.entries()) {
    // Pick one random challenge from this category as the guaranteed entry
    const idx = Math.floor(Math.random() * group.length);
    guaranteed.push(group[idx]);
    // Remaining go into the weighted pool
    for (let i = 0; i < group.length; i++) {
      if (i !== idx) pool.push(group[i]);
    }
  }

  // If guaranteed already fills (or exceeds) targetCount, shuffle and return
  if (guaranteed.length >= targetCount) {
    return guaranteed.sort(() => Math.random() - 0.5).slice(0, targetCount);
  }

  // Step 2: Fill remaining slots via weighted random without replacement
  const remaining = targetCount - guaranteed.length;
  const extras: Challenge[] = [];
  const available = [...pool];

  for (let i = 0; i < remaining && available.length > 0; i++) {
    const weights = available.map((c) => {
      const cat = c.category ?? 'General';
      return categoryWeights.get(cat) ?? 0.5;
    });
    const picked = weightedPick(available, weights);
    extras.push(picked);
    // Remove picked item from available pool (no duplicates)
    const pickIdx = available.indexOf(picked);
    if (pickIdx >= 0) available.splice(pickIdx, 1);
  }

  // Combine guaranteed + extras, shuffle, and return
  const combined = [...guaranteed, ...extras];
  return combined.sort(() => Math.random() - 0.5).slice(0, targetCount);
}

export type DrillAnswerStatus = 'correct' | 'incorrect' | 'timeout';

export interface DrillAnswerRecord {
  challengeId: string;
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
  allAnswers: DrillAnswerRecord[];

  // Session phase
  phase: 'idle' | 'active' | 'feedback' | 'review';
  feedbackStatus: 'correct' | 'incorrect' | null;

  // Actions
  startSession: (tier: Tier | 'all', mode: 'typing' | 'mc') => void;
  submitAnswer: (userAnswer: string) => void;
  tickTimer: () => void;
  advanceToNextQuestion: () => void;
  endSession: () => void;
  setMode: (mode: 'typing' | 'mc') => void;
}

function getTimerSeconds(tier: Tier | 'all'): number {
  switch (tier) {
    case 'beginner':
      return 45;
    case 'intermediate':
      return 30;
    case 'advanced':
      return 20;
    case 'all':
    default:
      return 30;
  }
}

function normalizeAnswer(answer: string, scope: 'formula' | 'function'): string {
  let normalized = answer.trim();
  // Strip leading '='
  if (normalized.startsWith('=')) {
    normalized = normalized.slice(1);
  }
  if (scope === 'formula') {
    // Remove all whitespace and uppercase
    return normalized.replace(/\s+/g, '').toUpperCase();
  } else {
    // function scope: just trim and uppercase
    return normalized.toUpperCase();
  }
}

export const useDrillStore = create<DrillStore>()(
  persist(
    (set, get) => ({
      // Initial state
      sessionTier: 'all',
      mode: 'typing',
      questions: [],
      currentQuestionIndex: 0,
      secondsRemaining: 30,
      timerActive: false,
      answers: [],
      allAnswers: [],
      phase: 'idle',
      feedbackStatus: null,

      // ── Actions ────────────────────────────────────────────────────────────────

      startSession: (tier, mode) => {
        const filtered = tier === 'all'
          ? challenges
          : challenges.filter((c) => c.tier === tier);

        // Build accuracy map from current challenge + drill history for weighting.
        const { challenges: allChallenges, statuses } = useChallengeStore.getState();
        const accuracies = computeCategoryAccuracies(allChallenges, statuses, get().allAnswers);
        const accuracyMap = new Map(accuracies.map((a) => [a.category, a.accuracy]));

        const selected = buildWeightedQueue(filtered, accuracyMap, 10);
        const questions = selected.map(challengeToDrillQuestion);
        const seconds = getTimerSeconds(tier);

        set({
          sessionTier: tier,
          mode,
          questions,
          currentQuestionIndex: 0,
          secondsRemaining: seconds,
          timerActive: true,
          answers: [],
          phase: 'active',
          feedbackStatus: null,
        });
      },

      submitAnswer: (userAnswer) => {
        const { questions, currentQuestionIndex, answers, allAnswers } = get();
        const question = questions[currentQuestionIndex];
        if (!question) return;

        const normalized = normalizeAnswer(userAnswer, question.answerScope);
        const expected = normalizeAnswer(question.correctAnswer, question.answerScope);
        const isCorrect = normalized === expected;
        const status: DrillAnswerStatus = isCorrect ? 'correct' : 'incorrect';

        const record: DrillAnswerRecord = {
          challengeId: question.challengeId,
          questionIndex: currentQuestionIndex,
          userAnswer,
          status,
        };

        set({
          answers: [...answers, record],
          allAnswers: [...allAnswers, record],
          phase: 'feedback',
          feedbackStatus: isCorrect ? 'correct' : 'incorrect',
          timerActive: false,
        });
      },

      tickTimer: () => {
        const { secondsRemaining, phase, questions, currentQuestionIndex, answers, allAnswers } = get();
        if (phase !== 'active') return;

        const newSeconds = secondsRemaining - 1;

        if (newSeconds <= 0) {
          const question = questions[currentQuestionIndex];
          const record: DrillAnswerRecord = {
            challengeId: question?.challengeId ?? '',
            questionIndex: currentQuestionIndex,
            userAnswer: '',
            status: 'timeout',
          };

          set({
            secondsRemaining: 0,
            answers: [...answers, record],
            allAnswers: [...allAnswers, record],
            phase: 'feedback',
            feedbackStatus: 'incorrect',
            timerActive: false,
          });
        } else {
          set({ secondsRemaining: newSeconds });
        }
      },

      advanceToNextQuestion: () => {
        const { currentQuestionIndex, questions, sessionTier } = get();
        if (currentQuestionIndex < questions.length - 1) {
          const nextIndex = currentQuestionIndex + 1;
          const seconds = getTimerSeconds(sessionTier);
          set({
            currentQuestionIndex: nextIndex,
            secondsRemaining: seconds,
            timerActive: true,
            phase: 'active',
            feedbackStatus: null,
          });
        } else {
          set({
            phase: 'review',
            timerActive: false,
          });
        }
      },

      endSession: () => {
        set({
          phase: 'idle',
          questions: [],
          currentQuestionIndex: 0,
          secondsRemaining: 30,
          timerActive: false,
          answers: [],
          feedbackStatus: null,
          // allAnswers intentionally NOT reset — persists across sessions
        });
      },

      setMode: (mode) => set({ mode }),
    }),
    {
      name: 'excelprep-drill-v1',
      storage: createJSONStorage(() => safeLocalStorage),
      version: 1,
      // Only persist allAnswers — all session state is ephemeral
      partialize: (state) => ({
        allAnswers: state.allAnswers,
      }),
    },
  ),
);
