import { useEffect } from 'react';
import { SpreadsheetGrid, hfInstance } from '../components/SpreadsheetGrid';
import { RightPanel } from '../components/RightPanel';
import { ChallengeList } from '../components/ChallengeList';
import { CompletionScreen } from '../components/CompletionScreen';
import { TierTabs } from '../components/TierTabs';
import { useChallengeStore } from '../store/challengeStore';
import { challenges as seedChallenges } from '../data/challenges';
import type { Tier } from '../types';

export function ChallengePage() {
  const {
    challenges,
    currentIndex,
    statuses,
    isLocked,
    cellGrades,
    loadChallenges,
    setChallenge,
    gradeCellAction,
    activeTier,
    tierChallenges,
    setActiveTier,
    isTierUnlocked,
  } = useChallengeStore();

  // Load seed challenges on mount
  useEffect(() => {
    loadChallenges(seedChallenges);
    setChallenge(0);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const intermediateUnlocked = challenges.length > 0 ? isTierUnlocked('intermediate') : false;
  const advancedUnlocked = challenges.length > 0 ? isTierUnlocked('advanced') : false;

  // Determine if the current active tier is locked
  const activeTierLocked =
    (activeTier === 'intermediate' && !intermediateUnlocked) ||
    (activeTier === 'advanced' && !advancedUnlocked);

  const currentChallenge = tierChallenges[currentIndex];

  // All challenges in current tier attempted → show completion screen
  // Only show completion when tier is unlocked and all tierChallenges are done
  const tierStatuses = tierChallenges.map(c => {
    const globalIdx = challenges.findIndex(ch => ch.id === c.id);
    return globalIdx >= 0 ? (statuses[globalIdx] ?? 'unattempted') : 'unattempted';
  });
  const allDone =
    !activeTierLocked &&
    tierChallenges.length > 0 &&
    tierStatuses.every((s) => s !== 'unattempted');

  function handleGradeCell(row: number, col: number) {
    let cellValue: unknown;
    try {
      cellValue = hfInstance.getCellValue({ sheet: 0, row, col });
    } catch {
      cellValue = null;
    }
    gradeCellAction(row, col, cellValue);
  }

  function handleSelectTier(tier: Tier) {
    setActiveTier(tier);
  }

  if (allDone) {
    return <CompletionScreen />;
  }

  const prereqTier = activeTier === 'intermediate' ? 'Beginner' : 'Intermediate';

  return (
    <div className="challenge-page">
      {/* Left: tier tabs + challenge list sidebar */}
      <div className="challenge-sidebar">
        <TierTabs
          activeTier={activeTier}
          intermediateUnlocked={intermediateUnlocked}
          advancedUnlocked={advancedUnlocked}
          onSelectTier={handleSelectTier}
        />
        <ChallengeList lockedTier={activeTierLocked} prereqTier={prereqTier} />
      </div>

      {/* Center: spreadsheet grid (only when tier unlocked) */}
      <div className="challenge-grid-area">
        {activeTierLocked ? (
          <div className="tier-locked-message">
            <p className="tier-locked-title">{'\u{1F512}'} Tier Locked</p>
            <p className="tier-locked-body">
              Complete {prereqTier} challenges first to unlock{' '}
              {activeTier.charAt(0).toUpperCase() + activeTier.slice(1)}.
            </p>
            <p className="tier-locked-hint">
              You need 70% correct in each function category.
            </p>
          </div>
        ) : (
          <SpreadsheetGrid
            challenge={currentChallenge}
            isLocked={isLocked}
            cellGrades={cellGrades}
            onGradeCell={handleGradeCell}
          />
        )}
      </div>

      {/* Right: prompt, feedback, navigation (only when tier unlocked) */}
      {!activeTierLocked && <RightPanel />}
    </div>
  );
}
