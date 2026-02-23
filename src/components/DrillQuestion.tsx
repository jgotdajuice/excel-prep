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
      <div className="w-full">
        <div className="text-[13px] text-muted mb-2 italic">
          {scopeHint}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (disabled) return;
            const val = (e.currentTarget.elements.namedItem('answer') as HTMLInputElement).value;
            onSubmit(val);
          }}
          className="flex gap-2"
        >
          <input
            ref={inputRef}
            name="answer"
            type="text"
            disabled={disabled}
            placeholder="Type your answer..."
            autoComplete="off"
            spellCheck={false}
            className="flex-1 font-mono text-base px-3.5 py-2.5 rounded-lg border-2 border-border bg-surface text-text-primary outline-none focus:border-brand transition-colors duration-150 disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={disabled}
            className="px-5 py-2.5 rounded-lg border-none bg-brand text-white text-sm font-semibold cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
          >
            Submit
          </button>
        </form>
      </div>
    );
  }

  // Multiple choice mode
  return (
    <div className="w-full flex flex-col gap-2.5">
      {shuffledOptions.map((option) => (
        <button
          key={option}
          disabled={disabled}
          onClick={() => !disabled && onSubmit(option)}
          className="block w-full px-4 py-3 rounded-lg border-2 border-border bg-surface text-text-primary font-mono text-sm text-left cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 transition-all duration-150 hover:border-brand/50 hover:bg-brand-light/30"
        >
          {option}
        </button>
      ))}
    </div>
  );
}
