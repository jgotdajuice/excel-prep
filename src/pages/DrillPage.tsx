import { useRef, useEffect } from 'react';
import type { Tier } from '../types';
import { useDrillStore } from '../store/drillStore';
import { DrillQuestionCard } from '../components/DrillQuestion';
import { DrillFeedback } from '../components/DrillFeedback';
import { DrillReview } from '../components/DrillReview';

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
      <div
        style={{
          backgroundColor: '#111827',
          color: '#ffffff',
          borderRadius: '12px',
          padding: '40px',
          maxWidth: '520px',
          margin: '40px auto',
          boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
        }}
      >
        <h1
          style={{
            fontSize: '24px',
            fontWeight: 700,
            marginBottom: '6px',
            color: '#ffffff',
          }}
        >
          Rapid-Fire Drill
        </h1>
        <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.55)', marginBottom: '32px' }}>
          10 questions, answer quickly!
        </p>

        {/* Tier selector */}
        <div style={{ marginBottom: '24px' }}>
          <div
            style={{
              fontSize: '12px',
              fontWeight: 600,
              color: 'rgba(255,255,255,0.5)',
              textTransform: 'uppercase',
              letterSpacing: '0.7px',
              marginBottom: '10px',
            }}
          >
            Difficulty
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {(['beginner', 'intermediate', 'advanced', 'all'] as const).map((tier) => {
              const isSelected = sessionTier === tier;
              return (
                <button
                  key={tier}
                  onClick={() =>
                    useDrillStore.setState({ sessionTier: tier as Tier | 'all' })
                  }
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: `2px solid ${isSelected ? '#1a6b3c' : 'rgba(255,255,255,0.15)'}`,
                    backgroundColor: isSelected
                      ? 'rgba(26, 107, 60, 0.25)'
                      : 'rgba(255,255,255,0.04)',
                    color: isSelected ? '#4ade80' : 'rgba(255,255,255,0.7)',
                    fontSize: '13px',
                    fontWeight: isSelected ? 600 : 400,
                    cursor: 'pointer',
                    textTransform: 'capitalize',
                    transition: 'all 0.15s',
                  }}
                >
                  {tier === 'all' ? 'All' : tier.charAt(0).toUpperCase() + tier.slice(1)}
                </button>
              );
            })}
          </div>
        </div>

        {/* Mode toggle */}
        <div style={{ marginBottom: '32px' }}>
          <div
            style={{
              fontSize: '12px',
              fontWeight: 600,
              color: 'rgba(255,255,255,0.5)',
              textTransform: 'uppercase',
              letterSpacing: '0.7px',
              marginBottom: '10px',
            }}
          >
            Answer Mode
          </div>
          <div
            style={{
              display: 'flex',
              backgroundColor: 'rgba(255,255,255,0.06)',
              borderRadius: '8px',
              padding: '4px',
              width: 'fit-content',
            }}
          >
            {(['typing', 'mc'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                style={{
                  padding: '8px 20px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: mode === m ? '#1a6b3c' : 'transparent',
                  color: mode === m ? '#ffffff' : 'rgba(255,255,255,0.55)',
                  fontSize: '13px',
                  fontWeight: mode === m ? 600 : 400,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {m === 'typing' ? 'Typing' : 'Multiple Choice'}
              </button>
            ))}
          </div>
        </div>

        {/* Timer info */}
        <div
          style={{
            backgroundColor: 'rgba(255,255,255,0.04)',
            borderRadius: '8px',
            padding: '12px 16px',
            marginBottom: '28px',
            fontSize: '13px',
            color: 'rgba(255,255,255,0.5)',
          }}
        >
          Timer per question:{' '}
          <span style={{ color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>
            {sessionTier === 'beginner' ? '45s' : sessionTier === 'intermediate' ? '30s' : sessionTier === 'advanced' ? '20s' : '30s'}
          </span>
        </div>

        <button
          onClick={() => startSession(sessionTier, mode)}
          style={{
            display: 'block',
            width: '100%',
            padding: '14px',
            borderRadius: '10px',
            border: 'none',
            backgroundColor: '#1a6b3c',
            color: '#ffffff',
            fontSize: '16px',
            fontWeight: 700,
            cursor: 'pointer',
            letterSpacing: '0.3px',
          }}
        >
          Start Drill
        </button>
      </div>
    );
  }

  // ── Review ──────────────────────────────────────────────────────────────────
  if (phase === 'review') {
    return (
      <div
        style={{
          backgroundColor: '#111827',
          color: '#ffffff',
          borderRadius: '12px',
          padding: '32px',
          maxWidth: '680px',
          margin: '32px auto',
          boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
          overflowY: 'auto',
          maxHeight: 'calc(100vh - 100px)',
        }}
      >
        <h1
          style={{
            fontSize: '22px',
            fontWeight: 700,
            marginBottom: '24px',
            textAlign: 'center',
          }}
        >
          Session Complete
        </h1>
        <DrillReview />
      </div>
    );
  }

  // ── Active + Feedback ────────────────────────────────────────────────────────
  if (!currentQuestion) return null;

  const isUrgent = secondsRemaining <= 10 && phase === 'active';

  return (
    <div
      style={{
        backgroundColor: '#111827',
        color: '#ffffff',
        borderRadius: '12px',
        padding: '32px',
        maxWidth: '640px',
        margin: '32px auto',
        boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
        position: 'relative',
      }}
    >
      {/* Feedback overlay */}
      {phase === 'feedback' && feedbackStatus && (
        <DrillFeedback
          status={feedbackStatus}
          correctFormula={currentQuestion.correctFormula}
        />
      )}

      {/* Header: question number + score */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
        }}
      >
        <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>
          Question{' '}
          <span style={{ color: '#ffffff', fontWeight: 600 }}>
            {currentQuestionIndex + 1}
          </span>{' '}
          / {questions.length}
        </span>
        <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>
          Score:{' '}
          <span style={{ color: '#4ade80', fontWeight: 600 }}>{correctCount}</span>
        </span>
      </div>

      {/* Timer */}
      <div
        style={{
          textAlign: 'center',
          marginBottom: '24px',
        }}
      >
        <div
          style={{
            display: 'inline-block',
            fontSize: '40px',
            fontWeight: 700,
            fontVariantNumeric: 'tabular-nums',
            color: isUrgent ? '#ef4444' : '#ffffff',
            lineHeight: 1,
            transition: 'color 0.3s',
          }}
        >
          {secondsRemaining}
        </div>
        <div
          style={{
            fontSize: '11px',
            color: 'rgba(255,255,255,0.35)',
            marginTop: '2px',
            letterSpacing: '0.5px',
          }}
        >
          seconds
        </div>
      </div>

      {/* Category badge */}
      <div style={{ marginBottom: '8px' }}>
        <span
          style={{
            display: 'inline-block',
            fontSize: '11px',
            fontWeight: 600,
            color: 'rgba(255,255,255,0.45)',
            textTransform: 'uppercase',
            letterSpacing: '0.7px',
            backgroundColor: 'rgba(255,255,255,0.06)',
            padding: '3px 8px',
            borderRadius: '4px',
          }}
        >
          {currentQuestion.category} · {currentQuestion.tier}
        </span>
      </div>

      {/* Question prompt */}
      <div
        style={{
          fontSize: '16px',
          lineHeight: 1.6,
          color: 'rgba(255,255,255,0.9)',
          marginBottom: '24px',
          minHeight: '60px',
        }}
      >
        {currentQuestion.prompt}
      </div>

      {/* Answer input */}
      <DrillQuestionCard
        question={currentQuestion}
        mode={mode}
        onSubmit={submitAnswer}
        disabled={phase !== 'active'}
      />
    </div>
  );
}
