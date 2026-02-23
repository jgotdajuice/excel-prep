import { useState } from 'react';
import { clsx } from 'clsx';
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

function statusIconClass(status: ChallengeStatus, locked: boolean): string {
  if (locked) return 'text-muted/60';
  switch (status) {
    case 'correct':
      return 'text-brand';
    case 'incorrect':
      return 'text-red-600';
    case 'skipped':
      return 'text-muted';
    default:
      return 'text-blue-600';
  }
}

export function ChallengeList({ lockedTier, prereqTier }: ChallengeListProps) {
  const { challenges, statuses, currentIndex, setChallenge, tierChallenges } = useChallengeStore();
  const [lockedClickId, setLockedClickId] = useState<string | null>(null);

  if (tierChallenges.length === 0) {
    return <div className="overflow-y-auto bg-base flex flex-col py-3 flex-1" />;
  }

  function handleLockedClick(challengeId: string) {
    setLockedClickId(challengeId === lockedClickId ? null : challengeId);
  }

  return (
    <div className="overflow-y-auto bg-base flex flex-col py-3 flex-1">
      <p className="text-[11px] font-semibold text-muted uppercase tracking-wide px-3 mb-2">
        Challenges
      </p>
      <ul className="list-none m-0 p-0">
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
              className={clsx(
                'flex items-center flex-wrap gap-2 py-2 px-3 text-xs text-text-primary cursor-pointer border-l-[3px] border-transparent transition-colors duration-100',
                isActive && 'bg-brand-light border-l-brand font-semibold text-brand-dark',
                lockedTier && !isActive && 'text-muted hover:bg-base',
                !lockedTier && !isActive && 'hover:bg-border/40',
              )}
              onClick={() => {
                if (lockedTier) {
                  handleLockedClick(challenge.id);
                } else {
                  setChallenge(index);
                }
              }}
            >
              <span
                className={clsx(
                  'text-[13px] w-4 text-center shrink-0',
                  statusIconClass(status, lockedTier),
                )}
              >
                {lockedTier ? '\u{1F512}' : statusIcon(status)}
              </span>
              <span
                className={clsx(
                  'overflow-hidden text-ellipsis whitespace-nowrap flex-1 min-w-0',
                  lockedTier && 'text-muted/60',
                )}
              >
                {challenge.title}
              </span>
              {challenge.category && (
                <span className="text-[10px] text-muted bg-border/50 rounded px-1 py-px whitespace-nowrap shrink-0">
                  {challenge.category}
                </span>
              )}
              {showLockedMsg && (
                <span className="block w-full text-[10px] text-red-600 mt-1 pl-6">
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
