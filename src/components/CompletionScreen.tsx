import { useNavigate } from 'react-router-dom';
import { useChallengeStore } from '../store/challengeStore';
import { Card } from './ui/Card';
import { Button } from './ui/Button';

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
    <div className="flex items-center justify-center h-full bg-base">
      <Card shadow padding={false} className="text-center flex flex-col items-center gap-5 max-w-[440px] w-full mx-auto px-12 py-10">
        {/* Celebration icon */}
        <div className="text-[56px] animate-[completion-pop_0.5s_ease-out]">&#127942;</div>

        <h2 className="text-[22px] font-bold text-brand-dark m-0">All Challenges Complete!</h2>

        {/* Summary stats */}
        <div className="flex gap-8 justify-center">
          <div className="flex flex-col items-center gap-1">
            <span className="text-[28px] font-bold text-brand">{correctCount}/{total}</span>
            <span className="text-xs text-muted uppercase tracking-wide">Correct</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="text-[28px] font-bold text-brand">{formatTime(elapsedSeconds)}</span>
            <span className="text-xs text-muted uppercase tracking-wide">Time</span>
          </div>
        </div>

        {/* Missed questions */}
        {missedChallenges.length > 0 && (
          <div className="text-left w-full">
            <p className="text-[13px] font-semibold text-muted mb-1.5 m-0">Review these:</p>
            <ul className="text-[13px] text-red-600 m-0 pl-5 [&_li]:mb-1">
              {missedChallenges.map((c) => (
                <li key={c.id}>{c.title}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-3 w-full justify-center">
          <Button variant="secondary" onClick={handleReview}>Review Challenges</Button>
          <Button onClick={() => navigate('/')}>Back to Home</Button>
        </div>
      </Card>
    </div>
  );
}
