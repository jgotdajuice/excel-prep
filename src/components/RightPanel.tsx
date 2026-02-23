import { useEffect, useRef } from 'react';
import { useChallengeStore } from '../store/challengeStore';
import { formatPrompt, PromptDisplay } from '../utils/formatPrompt';

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function formatValue(v: number | string | boolean | undefined): string {
  if (v === undefined) return '';
  if (typeof v === 'number') return v.toFixed(2);
  return String(v);
}

export function RightPanel() {
  const {
    challenges,
    currentIndex,
    cellGrades,
    hintVisible,
    isLocked,
    elapsedSeconds,
    statuses,
    tierChallenges,
    showHint,
    retry,
    skip,
    nextChallenge,
    tick,
  } = useChallengeStore();

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Start timer interval, reset when challenge changes
  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => tick(), 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [currentIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  const challenge = tierChallenges[currentIndex];
  if (!challenge) {
    return (
      <div className="w-[280px] min-w-[280px] border-l border-border bg-surface overflow-y-auto p-4 flex flex-col gap-3 shrink-0">
        <p className="text-muted text-sm">Loading challenge...</p>
      </div>
    );
  }

  // Scope progress to current tier
  const totalChallenges = tierChallenges.length;
  const completedCount = tierChallenges.filter((tc) => {
    const globalIdx = challenges.findIndex((c) => c.id === tc.id);
    return globalIdx >= 0 && statuses[globalIdx] !== 'unattempted';
  }).length;
  const progressPct = totalChallenges > 0 ? (completedCount / totalChallenges) * 100 : 0;

  // Determine feedback state
  const allAnswerCellsGraded =
    cellGrades.length === challenge.answerCells.length;

  // Build per-cell feedback
  const feedbackItems = cellGrades.map((cg) => {
    const result = cg.result;
    if (result.status === 'correct') {
      return { key: `${cg.row}:${cg.col}`, type: 'correct' as const };
    } else if (result.status === 'error') {
      return {
        key: `${cg.row}:${cg.col}`,
        type: 'error' as const,
        errorCode: result.errorCode,
      };
    } else {
      return {
        key: `${cg.row}:${cg.col}`,
        type: 'incorrect' as const,
        expected: result.expectedValue,
        got: result.gotValue,
      };
    }
  });

  const overallCorrect =
    allAnswerCellsGraded && feedbackItems.every((f) => f.type === 'correct');
  const overallIncorrect =
    allAnswerCellsGraded && !overallCorrect;

  return (
    <div className="w-[280px] min-w-[280px] border-l border-border bg-surface overflow-y-auto p-4 flex flex-col gap-3 shrink-0">
      {/* Progress bar */}
      <div className="flex flex-col gap-1">
        <span className="text-[11px] text-muted font-semibold">
          {completedCount}/{totalChallenges} completed
        </span>
        <div className="h-1 bg-border rounded-sm overflow-hidden">
          <div
            className="h-full bg-brand rounded-sm transition-[width] duration-300 ease-out"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Timer */}
      <div className="text-xs text-muted font-mono text-right -mt-2">{formatTime(elapsedSeconds)}</div>

      {/* Title */}
      <h2 className="text-[15px] font-bold text-brand-dark m-0 leading-tight">{challenge.title}</h2>

      {/* Prompt — structured rendering via PromptDisplay */}
      <PromptDisplay sections={formatPrompt(challenge.prompt)} />

      {/* Hint */}
      {!hintVisible ? (
        <button
          className="self-start px-2.5 py-2 text-[13px] font-semibold bg-blue-50 text-blue-800 rounded-btn border-none cursor-pointer transition-opacity duration-150 hover:opacity-85"
          onClick={() => showHint()}
        >
          Show Hint
        </button>
      ) : (
        <div className="text-[13px] bg-blue-50 border border-blue-200 rounded-btn px-2.5 py-2 text-blue-800">
          <strong>Hint:</strong> Try using: <code>{challenge.hintFunction}</code>
        </div>
      )}

      {/* Grading feedback */}
      {isLocked && (
        <div className="flex flex-col gap-1.5">
          {challenge.answerCells.length > 1 && !allAnswerCellsGraded && (
            <p className="text-[13px] text-muted m-0">
              Fill all answer cells before submitting.
            </p>
          )}

          {allAnswerCellsGraded && (
            <>
              {overallCorrect && (
                <div className="flex items-center gap-1.5 text-sm font-bold text-brand bg-brand-light rounded-btn py-2 px-3">
                  <span className="text-lg">&#10003;</span> Correct!
                </div>
              )}
              {overallIncorrect && (
                <div className="flex flex-col gap-1 text-[13px] text-red-600 bg-red-50 rounded-btn py-2 px-3">
                  {feedbackItems.map((item) => (
                    <div key={item.key} className="text-[13px]">
                      {item.type === 'correct' && (
                        <span className="text-brand">&#10003; Correct</span>
                      )}
                      {item.type === 'incorrect' && (
                        <span>
                          Expected: <strong>{formatValue(item.expected)}</strong>{' '}
                          &mdash; Got: <strong>{formatValue(item.got)}</strong>
                        </span>
                      )}
                      {item.type === 'error' && (
                        <span>
                          Error in cell:{' '}
                          <code className="font-mono bg-base px-1 py-px rounded text-xs text-red-600">{item.errorCode}</code>
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Explanation accordion */}
      <details className="border border-border rounded-btn overflow-hidden">
        <summary className="text-[13px] font-semibold text-brand-dark py-2 px-3 cursor-pointer bg-base select-none hover:bg-border/40">See explanation</summary>
        <div className="py-2.5 px-3 flex flex-col gap-1.5">
          <p className="text-xs font-semibold text-muted m-0 uppercase tracking-wide">Correct formula:</p>
          <code className="font-mono text-[13px] bg-brand-light text-brand-dark rounded-btn py-1 px-2 block break-all">{challenge.correctFormula}</code>
          <p className="text-xs text-muted leading-relaxed m-0 whitespace-pre-wrap">{challenge.explanation}</p>
        </div>
      </details>

      {/* Navigation buttons */}
      <div className="flex gap-2 flex-wrap mt-auto pt-2">
        {!isLocked && (
          <button
            className="px-3.5 py-2 text-[13px] font-semibold bg-base text-muted rounded-btn border-none cursor-pointer transition-opacity duration-150 hover:opacity-85"
            onClick={() => skip()}
          >
            Skip
          </button>
        )}
        {isLocked && (
          <>
            <button
              className="px-3.5 py-2 text-[13px] font-semibold bg-red-50 text-red-600 rounded-btn border border-red-200 cursor-pointer transition-opacity duration-150 hover:opacity-85"
              onClick={() => retry()}
            >
              Try Again
            </button>
            <button
              className="flex-1 px-3.5 py-2 text-[13px] font-semibold bg-brand text-white rounded-btn border-none cursor-pointer transition-opacity duration-150 hover:opacity-85"
              onClick={() => nextChallenge()}
            >
              Next Challenge
            </button>
          </>
        )}
      </div>
    </div>
  );
}
