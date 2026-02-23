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
    <div className="w-full max-w-[640px] mx-auto">
      {/* Score summary */}
      <div className="text-center mb-8 p-6 bg-base rounded-xl border border-border">
        <div
          className="text-5xl font-bold leading-none mb-2"
          style={{ color: scoreColor }}
        >
          {correctCount}/{total}
        </div>
        <div className="text-xl text-muted">
          {percentage}% correct
        </div>
      </div>

      {/* Per-question breakdown */}
      <div className="flex flex-col gap-2 mb-7">
        {questions.map((question, idx) => {
          const answer = answers[idx];
          const status = answer?.status ?? 'timeout';
          const isCorrect = status === 'correct';
          const isExpanded = expandedIndex === idx;

          return (
            <div
              key={question.challengeId}
              className={isCorrect ? 'rounded-lg border border-green-600/30 overflow-hidden' : 'rounded-lg border border-red-600/30 overflow-hidden'}
            >
              {/* Question row header */}
              <button
                onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                className={`flex items-center w-full px-3.5 py-3 border-none cursor-pointer gap-2.5 text-left ${isCorrect ? 'bg-green-600/10' : 'bg-red-600/10'}`}
              >
                <span className="text-base flex-shrink-0 w-5 text-center text-text-primary">
                  {isCorrect ? '✓' : '✗'}
                </span>
                <span className="text-[12px] text-muted flex-shrink-0 w-7">
                  #{idx + 1}
                </span>
                <span className="flex-1 text-[13px] text-text-primary overflow-hidden text-ellipsis whitespace-nowrap">
                  {question.prompt.length > 80
                    ? question.prompt.slice(0, 80) + '…'
                    : question.prompt}
                </span>
                <span className="text-[11px] text-muted flex-shrink-0">
                  {isExpanded ? '▲' : '▼'}
                </span>
              </button>

              {/* Expanded detail */}
              {isExpanded && (
                <div className="p-3.5 px-4 bg-base border-t border-border flex flex-col gap-2">
                  <div className="text-[13px] text-text-primary">
                    <span className="text-muted mr-1.5">Your answer:</span>
                    <span className="font-mono">
                      {answer?.userAnswer && answer.userAnswer !== ''
                        ? answer.userAnswer
                        : status === 'timeout'
                          ? '(timed out)'
                          : '(no answer)'}
                    </span>
                  </div>
                  <div className="text-[13px] text-text-primary">
                    <span className="text-muted mr-1.5">Correct answer:</span>
                    <span className="font-mono text-brand">
                      {question.correctFormula}
                    </span>
                  </div>
                  <div className="text-[13px] text-muted mt-1 leading-relaxed">
                    {question.explanation}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Actions */}
      <div className="flex gap-3 justify-center">
        <button
          onClick={endSession}
          className="px-6 py-2.5 rounded-btn border-none bg-brand text-white text-sm font-semibold cursor-pointer hover:brightness-110 transition-colors duration-150"
        >
          Try Again
        </button>
        <Link
          to="/challenge"
          className="px-6 py-2.5 rounded-btn border border-border text-muted text-sm font-medium no-underline inline-flex items-center hover:bg-base"
        >
          Back to Challenges
        </Link>
      </div>
    </div>
  );
}
