import { useEffect, useRef } from 'react';
import { useChallengeStore } from '../store/challengeStore';

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

  const challenge = challenges[currentIndex];
  if (!challenge) {
    return (
      <div className="right-panel">
        <p style={{ color: '#888', fontSize: '14px' }}>Loading challenge...</p>
      </div>
    );
  }

  const totalChallenges = challenges.length;
  const completedCount = statuses.filter((s) => s !== 'unattempted').length;
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
    <div className="right-panel">
      {/* Progress bar */}
      <div className="progress-bar-wrapper">
        <span className="progress-label">
          {completedCount}/{totalChallenges} completed
        </span>
        <div className="progress-bar-track">
          <div
            className="progress-bar-fill"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Timer */}
      <div className="challenge-timer">{formatTime(elapsedSeconds)}</div>

      {/* Title */}
      <h2 className="challenge-title">{challenge.title}</h2>

      {/* Prompt */}
      <p className="challenge-prompt">{challenge.prompt}</p>

      {/* Hint */}
      {!hintVisible ? (
        <button
          className="btn btn-hint"
          onClick={() => showHint()}
        >
          Show Hint
        </button>
      ) : (
        <div className="hint-box">
          <strong>Hint:</strong> Try using: <code>{challenge.hintFunction}</code>
        </div>
      )}

      {/* Grading feedback */}
      {isLocked && (
        <div className="feedback-section">
          {challenge.answerCells.length > 1 && !allAnswerCellsGraded && (
            <p className="feedback-pending">
              Fill all answer cells before submitting.
            </p>
          )}

          {allAnswerCellsGraded && (
            <>
              {overallCorrect && (
                <div className="feedback-correct">
                  <span className="feedback-checkmark">&#10003;</span> Correct!
                </div>
              )}
              {overallIncorrect && (
                <div className="feedback-incorrect">
                  {feedbackItems.map((item) => (
                    <div key={item.key} className="feedback-item">
                      {item.type === 'correct' && (
                        <span style={{ color: '#1a6b3c' }}>&#10003; Correct</span>
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
                          <code className="error-code">{item.errorCode}</code>
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
      <details className="explanation-details">
        <summary className="explanation-summary">See explanation</summary>
        <div className="explanation-body">
          <p className="explanation-label">Correct formula:</p>
          <code className="correct-formula">{challenge.correctFormula}</code>
          <p className="explanation-text">{challenge.explanation}</p>
        </div>
      </details>

      {/* Navigation buttons */}
      <div className="nav-buttons">
        {!isLocked && (
          <button className="btn btn-skip" onClick={() => skip()}>
            Skip
          </button>
        )}
        {isLocked && (
          <>
            <button className="btn btn-retry" onClick={() => retry()}>
              Try Again
            </button>
            <button className="btn btn-next" onClick={() => nextChallenge()}>
              Next Challenge
            </button>
          </>
        )}
      </div>
    </div>
  );
}
