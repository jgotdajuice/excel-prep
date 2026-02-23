import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { DrillQuestion, Tier } from '../types';
import { challengeToDrillQuestion } from '../types';
import { challenges } from '../data/challenges';
import { safeLocalStorage } from './safeStorage';

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

        const shuffled = [...filtered].sort(() => Math.random() - 0.5);
        const selected = shuffled.slice(0, 10);
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
