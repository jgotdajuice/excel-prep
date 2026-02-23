import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDrillStore } from '../store/drillStore';

export function DrillReview() {
  const { questions, answers, endSession } = useDrillStore();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const correctCount = answers.filter((a) => a.status === 'correct').length;
  const total = questions.length;
  const percentage = total > 0 ? Math.round((correctCount / total) * 100) : 0;

  const scoreColor =
    percentage >= 80 ? '#16a34a' : percentage >= 50 ? '#ca8a04' : '#dc2626';

  return (
    <div style={{ width: '100%', maxWidth: '640px', margin: '0 auto' }}>
      {/* Score summary */}
      <div
        style={{
          textAlign: 'center',
          marginBottom: '32px',
          padding: '24px',
          backgroundColor: 'rgba(255,255,255,0.05)',
          borderRadius: '12px',
          border: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        <div
          style={{
            fontSize: '48px',
            fontWeight: 700,
            color: scoreColor,
            lineHeight: 1,
            marginBottom: '8px',
          }}
        >
          {correctCount}/{total}
        </div>
        <div style={{ fontSize: '20px', color: 'rgba(255,255,255,0.7)' }}>
          {percentage}% correct
        </div>
      </div>

      {/* Per-question breakdown */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '28px' }}>
        {questions.map((question, idx) => {
          const answer = answers[idx];
          const status = answer?.status ?? 'timeout';
          const isCorrect = status === 'correct';
          const isExpanded = expandedIndex === idx;

          return (
            <div
              key={question.challengeId}
              style={{
                borderRadius: '8px',
                border: `1px solid ${isCorrect ? 'rgba(22, 163, 74, 0.3)' : 'rgba(220, 38, 38, 0.3)'}`,
                overflow: 'hidden',
              }}
            >
              {/* Question row header */}
              <button
                onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  width: '100%',
                  padding: '12px 14px',
                  backgroundColor: isCorrect
                    ? 'rgba(22, 163, 74, 0.1)'
                    : 'rgba(220, 38, 38, 0.1)',
                  border: 'none',
                  cursor: 'pointer',
                  gap: '10px',
                  textAlign: 'left',
                  color: '#ffffff',
                }}
              >
                <span
                  style={{
                    fontSize: '16px',
                    flexShrink: 0,
                    width: '20px',
                    textAlign: 'center',
                  }}
                >
                  {isCorrect ? '✓' : '✗'}
                </span>
                <span
                  style={{
                    fontSize: '12px',
                    color: 'rgba(255,255,255,0.5)',
                    flexShrink: 0,
                    width: '28px',
                  }}
                >
                  #{idx + 1}
                </span>
                <span
                  style={{
                    flex: 1,
                    fontSize: '13px',
                    color: 'rgba(255,255,255,0.85)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {question.prompt.length > 80
                    ? question.prompt.slice(0, 80) + '…'
                    : question.prompt}
                </span>
                <span
                  style={{
                    fontSize: '11px',
                    color: 'rgba(255,255,255,0.4)',
                    flexShrink: 0,
                  }}
                >
                  {isExpanded ? '▲' : '▼'}
                </span>
              </button>

              {/* Expanded detail */}
              {isExpanded && (
                <div
                  style={{
                    padding: '14px 16px',
                    backgroundColor: 'rgba(0,0,0,0.2)',
                    borderTop: '1px solid rgba(255,255,255,0.08)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                  }}
                >
                  <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>
                    <span style={{ color: 'rgba(255,255,255,0.45)', marginRight: '6px' }}>
                      Your answer:
                    </span>
                    <span style={{ fontFamily: 'monospace' }}>
                      {answer?.userAnswer && answer.userAnswer !== ''
                        ? answer.userAnswer
                        : status === 'timeout'
                          ? '(timed out)'
                          : '(no answer)'}
                    </span>
                  </div>
                  <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>
                    <span style={{ color: 'rgba(255,255,255,0.45)', marginRight: '6px' }}>
                      Correct answer:
                    </span>
                    <span style={{ fontFamily: 'monospace', color: '#4ade80' }}>
                      {question.correctFormula}
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: '13px',
                      color: 'rgba(255,255,255,0.6)',
                      marginTop: '4px',
                      lineHeight: 1.5,
                    }}
                  >
                    {question.explanation}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
        <button
          onClick={endSession}
          style={{
            padding: '10px 24px',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: '#1a6b3c',
            color: '#ffffff',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Try Again
        </button>
        <Link
          to="/challenge"
          style={{
            padding: '10px 24px',
            borderRadius: '8px',
            border: '1px solid rgba(255,255,255,0.2)',
            color: 'rgba(255,255,255,0.8)',
            fontSize: '14px',
            fontWeight: 500,
            cursor: 'pointer',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
          }}
        >
          Back to Challenges
        </Link>
      </div>
    </div>
  );
}
