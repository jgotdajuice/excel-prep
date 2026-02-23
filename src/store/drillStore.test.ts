import { describe, it, expect, beforeEach } from 'vitest';
import { useDrillStore } from './drillStore';

// Reset store state before each test
beforeEach(() => {
  useDrillStore.setState({
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
  });
});

// Helper: mock questions for controlled testing
const mockQuestions = [
  {
    challengeId: 'vlookup-01',
    prompt: 'Write a VLOOKUP formula',
    correctAnswer: '=VLOOKUP(A2,B2:D10,3,0)',
    answerScope: 'formula' as const,
    wrongOptions: ['=INDEX(B2:D10,MATCH(A2,B2:B10,0),3)', '=HLOOKUP(A2,B2:D10,3,0)', '=LOOKUP(A2,B2:D10)'],
    tier: 'beginner' as const,
    category: 'Lookup',
    explanation: 'VLOOKUP looks up a value in the first column of a range.',
    correctFormula: '=VLOOKUP(A2,B2:D10,3,0)',
  },
  {
    challengeId: 'if-01',
    prompt: 'Write an IF formula',
    correctAnswer: '=IF(A2>0,"Positive","Negative")',
    answerScope: 'formula' as const,
    wrongOptions: ['=IF(A2=0,"Zero","Not Zero")', '=IFS(A2>0,"Positive")', '=SWITCH(A2,0,"Zero")'],
    tier: 'beginner' as const,
    category: 'Logic',
    explanation: 'IF checks a condition and returns one value for true, another for false.',
    correctFormula: '=IF(A2>0,"Positive","Negative")',
  },
];

describe('drillStore state machine', () => {
  describe('idle -> startSession() -> active', () => {
    it('transitions to active phase when session is started', () => {
      useDrillStore.getState().startSession('beginner', 'typing');
      const state = useDrillStore.getState();
      expect(state.phase).toBe('active');
    });

    it('sets timer to 45s for beginner tier', () => {
      useDrillStore.getState().startSession('beginner', 'typing');
      expect(useDrillStore.getState().secondsRemaining).toBe(45);
    });

    it('sets timer to 30s for intermediate tier', () => {
      useDrillStore.getState().startSession('intermediate', 'typing');
      expect(useDrillStore.getState().secondsRemaining).toBe(30);
    });

    it('sets timer to 20s for advanced tier', () => {
      useDrillStore.getState().startSession('advanced', 'typing');
      expect(useDrillStore.getState().secondsRemaining).toBe(20);
    });

    it('sets timer to 30s for "all" tier', () => {
      useDrillStore.getState().startSession('all', 'typing');
      expect(useDrillStore.getState().secondsRemaining).toBe(30);
    });

    it('populates questions array', () => {
      useDrillStore.getState().startSession('all', 'typing');
      const { questions } = useDrillStore.getState();
      expect(questions.length).toBeGreaterThan(0);
      expect(questions.length).toBeLessThanOrEqual(10);
    });

    it('resets currentQuestionIndex to 0', () => {
      useDrillStore.getState().startSession('all', 'typing');
      expect(useDrillStore.getState().currentQuestionIndex).toBe(0);
    });

    it('resets answers to empty', () => {
      useDrillStore.getState().startSession('all', 'typing');
      expect(useDrillStore.getState().answers).toHaveLength(0);
    });

    it('sets timerActive to true', () => {
      useDrillStore.getState().startSession('all', 'typing');
      expect(useDrillStore.getState().timerActive).toBe(true);
    });
  });

  describe('active -> submitAnswer(correct) -> feedback', () => {
    beforeEach(() => {
      // Set up controlled state with mock questions
      useDrillStore.setState({
        phase: 'active',
        questions: mockQuestions,
        currentQuestionIndex: 0,
        secondsRemaining: 45,
        timerActive: true,
        answers: [],
        allAnswers: [],
        sessionTier: 'beginner',
        feedbackStatus: null,
        mode: 'typing',
      });
    });

    it('transitions to feedback phase on submit', () => {
      useDrillStore.getState().submitAnswer('=VLOOKUP(A2,B2:D10,3,0)');
      expect(useDrillStore.getState().phase).toBe('feedback');
    });

    it('sets feedbackStatus to "correct" for correct answer', () => {
      useDrillStore.getState().submitAnswer('=VLOOKUP(A2,B2:D10,3,0)');
      expect(useDrillStore.getState().feedbackStatus).toBe('correct');
    });

    it('pushes record to answers array', () => {
      useDrillStore.getState().submitAnswer('=VLOOKUP(A2,B2:D10,3,0)');
      expect(useDrillStore.getState().answers).toHaveLength(1);
      expect(useDrillStore.getState().answers[0].status).toBe('correct');
    });

    it('pushes record to allAnswers array', () => {
      useDrillStore.getState().submitAnswer('=VLOOKUP(A2,B2:D10,3,0)');
      expect(useDrillStore.getState().allAnswers).toHaveLength(1);
      expect(useDrillStore.getState().allAnswers[0].challengeId).toBe('vlookup-01');
    });
  });

  describe('active -> submitAnswer(wrong) -> feedback', () => {
    beforeEach(() => {
      useDrillStore.setState({
        phase: 'active',
        questions: mockQuestions,
        currentQuestionIndex: 0,
        secondsRemaining: 45,
        timerActive: true,
        answers: [],
        allAnswers: [],
        sessionTier: 'beginner',
        feedbackStatus: null,
        mode: 'typing',
      });
    });

    it('sets feedbackStatus to "incorrect" for wrong answer', () => {
      useDrillStore.getState().submitAnswer('=WRONG_FORMULA()');
      expect(useDrillStore.getState().feedbackStatus).toBe('incorrect');
    });

    it('pushes "incorrect" record to answers array', () => {
      useDrillStore.getState().submitAnswer('=WRONG_FORMULA()');
      const { answers } = useDrillStore.getState();
      expect(answers).toHaveLength(1);
      expect(answers[0].status).toBe('incorrect');
    });
  });

  describe('feedback -> advanceToNextQuestion() -> active', () => {
    beforeEach(() => {
      useDrillStore.setState({
        phase: 'feedback',
        questions: mockQuestions,
        currentQuestionIndex: 0,
        secondsRemaining: 0,
        timerActive: false,
        answers: [{ challengeId: 'vlookup-01', questionIndex: 0, userAnswer: '=VLOOKUP(A2,B2:D10,3,0)', status: 'correct' }],
        allAnswers: [],
        sessionTier: 'beginner',
        feedbackStatus: 'correct',
        mode: 'typing',
      });
    });

    it('increments currentQuestionIndex', () => {
      useDrillStore.getState().advanceToNextQuestion();
      expect(useDrillStore.getState().currentQuestionIndex).toBe(1);
    });

    it('resets timer based on session tier', () => {
      useDrillStore.getState().advanceToNextQuestion();
      expect(useDrillStore.getState().secondsRemaining).toBe(45);
    });

    it('transitions to active phase', () => {
      useDrillStore.getState().advanceToNextQuestion();
      expect(useDrillStore.getState().phase).toBe('active');
    });

    it('clears feedbackStatus', () => {
      useDrillStore.getState().advanceToNextQuestion();
      expect(useDrillStore.getState().feedbackStatus).toBeNull();
    });
  });

  describe('feedback -> advanceToNextQuestion() on last question -> review', () => {
    beforeEach(() => {
      useDrillStore.setState({
        phase: 'feedback',
        questions: mockQuestions,
        currentQuestionIndex: mockQuestions.length - 1, // last question
        secondsRemaining: 0,
        timerActive: false,
        answers: [],
        allAnswers: [],
        sessionTier: 'beginner',
        feedbackStatus: 'incorrect',
        mode: 'typing',
      });
    });

    it('transitions to review phase after last question', () => {
      useDrillStore.getState().advanceToNextQuestion();
      expect(useDrillStore.getState().phase).toBe('review');
    });
  });

  describe('review -> endSession() -> idle', () => {
    beforeEach(() => {
      useDrillStore.setState({
        phase: 'review',
        questions: mockQuestions,
        currentQuestionIndex: 1,
        secondsRemaining: 0,
        timerActive: false,
        answers: [
          { challengeId: 'vlookup-01', questionIndex: 0, userAnswer: '=VLOOKUP(A2,B2:D10,3,0)', status: 'correct' },
          { challengeId: 'if-01', questionIndex: 1, userAnswer: '', status: 'timeout' },
        ],
        allAnswers: [
          { challengeId: 'vlookup-01', questionIndex: 0, userAnswer: '=VLOOKUP(A2,B2:D10,3,0)', status: 'correct' },
          { challengeId: 'if-01', questionIndex: 1, userAnswer: '', status: 'timeout' },
        ],
        sessionTier: 'beginner',
        feedbackStatus: null,
        mode: 'typing',
      });
    });

    it('resets phase to idle', () => {
      useDrillStore.getState().endSession();
      expect(useDrillStore.getState().phase).toBe('idle');
    });

    it('clears session answers', () => {
      useDrillStore.getState().endSession();
      expect(useDrillStore.getState().answers).toHaveLength(0);
    });

    it('preserves allAnswers across session reset', () => {
      useDrillStore.getState().endSession();
      expect(useDrillStore.getState().allAnswers).toHaveLength(2);
    });
  });

  describe('tickTimer to 0 -> feedback (timeout)', () => {
    beforeEach(() => {
      useDrillStore.setState({
        phase: 'active',
        questions: mockQuestions,
        currentQuestionIndex: 0,
        secondsRemaining: 1,
        timerActive: true,
        answers: [],
        allAnswers: [],
        sessionTier: 'beginner',
        feedbackStatus: null,
        mode: 'typing',
      });
    });

    it('transitions to feedback when timer reaches 0', () => {
      useDrillStore.getState().tickTimer();
      expect(useDrillStore.getState().phase).toBe('feedback');
    });

    it('sets feedbackStatus to "incorrect" on timeout', () => {
      useDrillStore.getState().tickTimer();
      expect(useDrillStore.getState().feedbackStatus).toBe('incorrect');
    });

    it('records timeout answer with status "timeout"', () => {
      useDrillStore.getState().tickTimer();
      const { answers } = useDrillStore.getState();
      expect(answers).toHaveLength(1);
      expect(answers[0].status).toBe('timeout');
    });

    it('records empty string as userAnswer on timeout', () => {
      useDrillStore.getState().tickTimer();
      expect(useDrillStore.getState().answers[0].userAnswer).toBe('');
    });

    it('also pushes to allAnswers on timeout', () => {
      useDrillStore.getState().tickTimer();
      expect(useDrillStore.getState().allAnswers).toHaveLength(1);
    });

    it('does not tick when phase is not active', () => {
      useDrillStore.setState({ phase: 'feedback' });
      useDrillStore.getState().tickTimer();
      expect(useDrillStore.getState().phase).toBe('feedback');
      expect(useDrillStore.getState().secondsRemaining).toBe(1);
    });
  });

  describe('answer normalization', () => {
    beforeEach(() => {
      useDrillStore.setState({
        phase: 'active',
        questions: mockQuestions,
        currentQuestionIndex: 0,
        secondsRemaining: 45,
        timerActive: true,
        answers: [],
        allAnswers: [],
        sessionTier: 'beginner',
        feedbackStatus: null,
        mode: 'typing',
      });
    });

    it('accepts answer without leading = sign (formula scope)', () => {
      // correctAnswer is '=VLOOKUP(A2,B2:D10,3,0)' — submit without =
      useDrillStore.getState().submitAnswer('VLOOKUP(A2,B2:D10,3,0)');
      expect(useDrillStore.getState().feedbackStatus).toBe('correct');
    });

    it('is case insensitive for formula scope', () => {
      useDrillStore.getState().submitAnswer('=vlookup(a2,b2:d10,3,0)');
      expect(useDrillStore.getState().feedbackStatus).toBe('correct');
    });

    it('ignores whitespace differences in formula scope', () => {
      useDrillStore.getState().submitAnswer('= VLOOKUP( A2, B2:D10, 3, 0 )');
      expect(useDrillStore.getState().feedbackStatus).toBe('correct');
    });

    it('is case insensitive for function scope', () => {
      // Set up a function-scope question
      useDrillStore.setState({
        questions: [{
          ...mockQuestions[0],
          answerScope: 'function',
          correctAnswer: 'VLOOKUP',
        }],
      });
      useDrillStore.getState().submitAnswer('vlookup');
      expect(useDrillStore.getState().feedbackStatus).toBe('correct');
    });

    it('accepts function name with leading = stripped', () => {
      useDrillStore.setState({
        questions: [{
          ...mockQuestions[0],
          answerScope: 'function',
          correctAnswer: 'VLOOKUP',
        }],
      });
      useDrillStore.getState().submitAnswer('=vlookup');
      expect(useDrillStore.getState().feedbackStatus).toBe('correct');
    });
  });
});
