import { useRef, useEffect } from 'react';
import { clsx } from 'clsx';
import type { Tier } from '../types';
import { useDrillStore } from '../store/drillStore';
import { DrillQuestionCard } from '../components/DrillQuestion';
import { DrillFeedback } from '../components/DrillFeedback';
import { DrillReview } from '../components/DrillReview';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

export function DrillPage() {
  const {
    phase,
    mode,
    sessionTier,
    questions,
    currentQuestionIndex,
    secondsRemaining,
    feedbackStatus,
    answers,
    startSession,
    submitAnswer,
    tickTimer,
    advanceToNextQuestion,
    setMode,
  } = useDrillStore();

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Timer effect
  useEffect(() => {
    if (phase === 'active') {
      intervalRef.current = setInterval(() => tickTimer(), 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [phase, tickTimer]);

  // Auto-advance from feedback after 1.5s
  useEffect(() => {
    if (phase === 'feedback') {
      const timeout = setTimeout(() => advanceToNextQuestion(), 1500);
      return () => clearTimeout(timeout);
    }
  }, [phase, currentQuestionIndex, advanceToNextQuestion]);

  const currentQuestion = questions[currentQuestionIndex] ?? null;
  const correctCount = answers.filter((a) => a.status === 'correct').length;

  // ── Idle: setup screen ──────────────────────────────────────────────────────
  if (phase === 'idle') {
    return (
      <Card shadow className="max-w-[520px] mx-auto mt-10">
        <h1 className="text-2xl font-bold text-brand-dark mb-1">
          Rapid-Fire Drill
        </h1>
        <p className="text-sm text-muted mb-8">
          10 questions, answer quickly!
        </p>

        {/* Tier selector */}
        <div className="mb-6">
          <span className="text-[11px] font-semibold text-muted uppercase tracking-wide mb-2.5 block">
            Difficulty
          </span>
          <div className="flex gap-2 flex-wrap">
            {(['beginner', 'intermediate', 'advanced', 'all'] as const).map((tier) => {
              const isSelected = sessionTier === tier;
              return (
                <button
                  key={tier}
                  onClick={() =>
                    useDrillStore.setState({ sessionTier: tier as Tier | 'all' })
                  }
                  className={clsx(
                    'px-4 py-2 rounded-lg text-[13px] cursor-pointer transition-all duration-150',
                    isSelected
                      ? 'bg-brand-light border-2 border-brand text-brand-dark font-semibold'
                      : 'bg-surface border-2 border-border text-text-primary/70 hover:border-brand/50'
                  )}
                >
                  {tier === 'all' ? 'All' : tier.charAt(0).toUpperCase() + tier.slice(1)}
                </button>
              );
            })}
          </div>
        </div>

        {/* Mode toggle */}
        <div className="mb-8">
          <span className="text-[11px] font-semibold text-muted uppercase tracking-wide mb-2.5 block">
            Answer Mode
          </span>
          <div className="flex bg-base rounded-lg p-1 w-fit">
            {(['typing', 'mc'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={clsx(
                  'px-5 py-2 rounded-md text-[13px] cursor-pointer border-none transition-all duration-150',
                  mode === m ? 'bg-brand text-white font-semibold' : 'bg-transparent text-muted'
                )}
              >
                {m === 'typing' ? 'Typing' : 'Multiple Choice'}
              </button>
            ))}
          </div>
        </div>

        {/* Timer info */}
        <div className="bg-base rounded-lg px-4 py-3 mb-7 text-sm text-muted">
          Timer per question:{' '}
          <span className="text-text-primary font-medium">
            {sessionTier === 'beginner' ? '45s' : sessionTier === 'intermediate' ? '30s' : sessionTier === 'advanced' ? '20s' : '30s'}
          </span>
        </div>

        <Button className="w-full py-3.5 text-base font-bold rounded-[10px]" onClick={() => startSession(sessionTier, mode)}>
          Start Drill
        </Button>
      </Card>
    );
  }

  // ── Review ──────────────────────────────────────────────────────────────────
  if (phase === 'review') {
    return (
      <Card shadow className="max-w-[680px] mx-auto mt-8 overflow-y-auto max-h-[calc(100vh-100px)]">
        <h1 className="text-xl font-bold text-brand-dark mb-6 text-center">
          Session Complete
        </h1>
        <DrillReview />
      </Card>
    );
  }

  // ── Active + Feedback ────────────────────────────────────────────────────────
  if (!currentQuestion) return null;

  const isUrgent = secondsRemaining <= 10 && phase === 'active';

  return (
    <Card shadow className="max-w-[640px] mx-auto mt-8 relative">
      {/* Feedback overlay */}
      {phase === 'feedback' && feedbackStatus && (
        <DrillFeedback
          status={feedbackStatus}
          correctFormula={currentQuestion.correctFormula}
        />
      )}

      {/* Header: question number + score */}
      <div className="flex justify-between items-center mb-5">
        <span className="text-[13px] text-muted">
          Question{' '}
          <span className="text-text-primary font-semibold">
            {currentQuestionIndex + 1}
          </span>{' '}
          / {questions.length}
        </span>
        <span className="text-[13px] text-muted">
          Score:{' '}
          <span className="text-brand font-semibold">{correctCount}</span>
        </span>
      </div>

      {/* Timer */}
      <div className="text-center mb-6">
        <div
          className="inline-block text-[40px] font-bold tabular-nums leading-none transition-colors duration-300"
          style={{ color: isUrgent ? '#ef4444' : 'var(--color-text-primary)' }}
        >
          {secondsRemaining}
        </div>
        <div className="text-[11px] text-muted mt-0.5 tracking-wide">
          seconds
        </div>
      </div>

      {/* Category badge */}
      <div className="mb-2">
        <span className="inline-block text-[11px] font-semibold text-muted uppercase tracking-wide bg-base px-2 py-0.5 rounded">
          {currentQuestion.category} · {currentQuestion.tier}
        </span>
      </div>

      {/* Question prompt */}
      <div className="text-base leading-relaxed text-text-primary mb-6 min-h-[60px]">
        {currentQuestion.prompt}
      </div>

      {/* Answer input */}
      <DrillQuestionCard
        question={currentQuestion}
        mode={mode}
        onSubmit={submitAnswer}
        disabled={phase !== 'active'}
      />
    </Card>
  );
}
