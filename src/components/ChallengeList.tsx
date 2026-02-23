import { useChallengeStore } from '../store/challengeStore';
import type { ChallengeStatus } from '../types';

function statusIcon(status: ChallengeStatus): string {
  switch (status) {
    case 'correct':
      return '✓';
    case 'incorrect':
      return '✗';
    case 'skipped':
      return '–';
    default:
      return '●';
  }
}

function statusIconColor(status: ChallengeStatus): string {
  switch (status) {
    case 'correct':
      return '#1a6b3c';
    case 'incorrect':
      return '#c0392b';
    case 'skipped':
      return '#888';
    default:
      return '#0066cc';
  }
}

export function ChallengeList() {
  const { challenges, statuses, currentIndex, setChallenge } = useChallengeStore();

  if (challenges.length === 0) {
    return <div className="challenge-list" />;
  }

  return (
    <div className="challenge-list">
      <p className="challenge-list-header">Challenges</p>
      <ul className="challenge-list-items">
        {challenges.map((challenge, index) => {
          const status = statuses[index] ?? 'unattempted';
          const isActive = index === currentIndex;
          return (
            <li
              key={challenge.id}
              className={`challenge-list-item${isActive ? ' active' : ''}`}
              onClick={() => setChallenge(index)}
            >
              <span
                className="challenge-list-icon"
                style={{ color: statusIconColor(status) }}
              >
                {statusIcon(status)}
              </span>
              <span className="challenge-list-title">{challenge.title}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
