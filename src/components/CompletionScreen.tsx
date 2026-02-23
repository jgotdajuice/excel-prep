import { useNavigate } from 'react-router-dom';
import { useChallengeStore } from '../store/challengeStore';

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function CompletionScreen() {
  const navigate = useNavigate();
  const { challenges, statuses, elapsedSeconds, loadChallenges, setChallenge } =
    useChallengeStore();

  const total = challenges.length;
  const correctCount = statuses.filter((s) => s === 'correct').length;
  const missedChallenges = challenges.filter(
    (_, i) => statuses[i] === 'incorrect' || statuses[i] === 'skipped',
  );

  function handleReview() {
    // Reset all statuses and restart
    loadChallenges(challenges);
    setChallenge(0);
  }

  return (
    <div className="completion-screen">
      <div className="completion-card">
        {/* Celebration icon */}
        <div className="completion-trophy">&#127942;</div>

        <h2 className="completion-title">All Challenges Complete!</h2>

        {/* Summary stats */}
        <div className="completion-stats">
          <div className="completion-stat">
            <span className="completion-stat-value">{correctCount}/{total}</span>
            <span className="completion-stat-label">Correct</span>
          </div>
          <div className="completion-stat">
            <span className="completion-stat-value">{formatTime(elapsedSeconds)}</span>
            <span className="completion-stat-label">Time</span>
          </div>
        </div>

        {/* Missed questions */}
        {missedChallenges.length > 0 && (
          <div className="completion-missed">
            <p className="completion-missed-label">Review these:</p>
            <ul className="completion-missed-list">
              {missedChallenges.map((c) => (
                <li key={c.id}>{c.title}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Action buttons */}
        <div className="completion-buttons">
          <button className="btn btn-review" onClick={handleReview}>
            Review Challenges
          </button>
          <button className="btn btn-home" onClick={() => navigate('/')}>
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
