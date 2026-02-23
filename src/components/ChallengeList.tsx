import { useState } from 'react';
import { useChallengeStore } from '../store/challengeStore';
import type { ChallengeStatus } from '../types';

interface ChallengeListProps {
  lockedTier: boolean;
  prereqTier: string;
}

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

export function ChallengeList({ lockedTier, prereqTier }: ChallengeListProps) {
  const { challenges, statuses, currentIndex, setChallenge, tierChallenges } = useChallengeStore();
  const [lockedClickId, setLockedClickId] = useState<string | null>(null);

  if (tierChallenges.length === 0) {
    return <div className="challenge-list" />;
  }

  function handleLockedClick(challengeId: string) {
    setLockedClickId(challengeId === lockedClickId ? null : challengeId);
  }

  return (
    <div className="challenge-list">
      <p className="challenge-list-header">Challenges</p>
      <ul className="challenge-list-items">
        {tierChallenges.map((challenge, index) => {
          // Look up global status
          const globalIdx = challenges.findIndex(c => c.id === challenge.id);
          const status: ChallengeStatus =
            globalIdx >= 0 ? (statuses[globalIdx] ?? 'unattempted') : 'unattempted';
          const isActive = !lockedTier && index === currentIndex;
          const showLockedMsg = lockedTier && lockedClickId === challenge.id;

          return (
            <li
              key={challenge.id}
              className={`challenge-list-item${isActive ? ' active' : ''}${lockedTier ? ' locked' : ''}`}
              onClick={() => {
                if (lockedTier) {
                  handleLockedClick(challenge.id);
                } else {
                  setChallenge(index);
                }
              }}
            >
              <span
                className="challenge-list-icon"
                style={{ color: lockedTier ? '#aaa' : statusIconColor(status) }}
              >
                {lockedTier ? '\u{1F512}' : statusIcon(status)}
              </span>
              <span className={`challenge-list-title${lockedTier ? ' text-locked' : ''}`}>
                {challenge.title}
              </span>
              {challenge.category && (
                <span className="challenge-category-badge">
                  {challenge.category}
                </span>
              )}
              {showLockedMsg && (
                <span className="challenge-locked-msg">
                  Complete {prereqTier} challenges first
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
