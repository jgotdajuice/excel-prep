import { useMemo, useRef, useEffect } from 'react';
import type { DrillQuestion } from '../types';

interface DrillQuestionProps {
  question: DrillQuestion;
  mode: 'typing' | 'mc';
  onSubmit: (answer: string) => void;
  disabled: boolean;
}

export function DrillQuestionCard({ question, mode, onSubmit, disabled }: DrillQuestionProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  // Shuffle options ONCE per question (key is challengeId)
  const shuffledOptions = useMemo(() => {
    const opts = [...question.wrongOptions, question.correctAnswer];
    return opts.sort(() => Math.random() - 0.5);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question.challengeId]);

  // Auto-focus input in typing mode when question changes
  useEffect(() => {
    if (mode === 'typing' && inputRef.current && !disabled) {
      inputRef.current.focus();
      inputRef.current.value = '';
    }
  }, [question.challengeId, mode, disabled]);

  const scopeHint =
    question.answerScope === 'formula'
      ? 'Enter the full formula (e.g. =VLOOKUP(...))'
      : 'Enter the function name (e.g. VLOOKUP)';

  if (mode === 'typing') {
    return (
      <div style={{ width: '100%' }}>
        <div
          style={{
            fontSize: '13px',
            color: 'rgba(255,255,255,0.55)',
            marginBottom: '8px',
            fontStyle: 'italic',
          }}
        >
          {scopeHint}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (disabled) return;
            const val = (e.currentTarget.elements.namedItem('answer') as HTMLInputElement).value;
            onSubmit(val);
          }}
          style={{ display: 'flex', gap: '8px' }}
        >
          <input
            ref={inputRef}
            name="answer"
            type="text"
            disabled={disabled}
            placeholder="Type your answer..."
            autoComplete="off"
            spellCheck={false}
            style={{
              flex: 1,
              fontFamily: 'monospace',
              fontSize: '16px',
              padding: '10px 14px',
              borderRadius: '8px',
              border: '2px solid rgba(255,255,255,0.2)',
              backgroundColor: 'rgba(255,255,255,0.08)',
              color: '#ffffff',
              outline: 'none',
            }}
          />
          <button
            type="submit"
            disabled={disabled}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: '#1a6b3c',
              color: '#ffffff',
              fontSize: '14px',
              fontWeight: 600,
              cursor: disabled ? 'not-allowed' : 'pointer',
              opacity: disabled ? 0.5 : 1,
            }}
          >
            Submit
          </button>
        </form>
      </div>
    );
  }

  // Multiple choice mode
  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {shuffledOptions.map((option) => (
        <button
          key={option}
          disabled={disabled}
          onClick={() => !disabled && onSubmit(option)}
          style={{
            display: 'block',
            width: '100%',
            padding: '12px 16px',
            borderRadius: '8px',
            border: '2px solid rgba(255,255,255,0.15)',
            backgroundColor: 'rgba(255,255,255,0.05)',
            color: '#ffffff',
            fontFamily: 'monospace',
            fontSize: '14px',
            textAlign: 'left',
            cursor: disabled ? 'not-allowed' : 'pointer',
            opacity: disabled ? 0.6 : 1,
            transition: 'border-color 0.15s, background-color 0.15s',
          }}
          onMouseEnter={(e) => {
            if (!disabled) {
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.45)';
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'rgba(255,255,255,0.12)';
            }
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.15)';
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'rgba(255,255,255,0.05)';
          }}
        >
          {option}
        </button>
      ))}
    </div>
  );
}
