import { useEffect } from 'react';
import { SpreadsheetGrid, hfInstance } from '../components/SpreadsheetGrid';
import { RightPanel } from '../components/RightPanel';
import { ChallengeList } from '../components/ChallengeList';
import { CompletionScreen } from '../components/CompletionScreen';
import { useChallengeStore } from '../store/challengeStore';
import { challenges as seedChallenges } from '../data/challenges';

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
  } = useChallengeStore();

  // Load seed challenges on mount
  useEffect(() => {
    loadChallenges(seedChallenges);
    setChallenge(0);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const currentChallenge = challenges[currentIndex];

  // All challenges attempted → show completion screen
  const allDone =
    challenges.length > 0 && statuses.every((s) => s !== 'unattempted');

  function handleGradeCell(row: number, col: number) {
    let cellValue: unknown;
    try {
      cellValue = hfInstance.getCellValue({ sheet: 0, row, col });
    } catch {
      cellValue = null;
    }
    gradeCellAction(row, col, cellValue);
  }

  if (allDone) {
    return <CompletionScreen />;
  }

  return (
    <div className="challenge-page">
      {/* Left: challenge list sidebar */}
      <ChallengeList />

      {/* Center: spreadsheet grid */}
      <div className="challenge-grid-area">
        <SpreadsheetGrid
          challenge={currentChallenge}
          isLocked={isLocked}
          cellGrades={cellGrades}
          onGradeCell={handleGradeCell}
        />
      </div>

      {/* Right: prompt, feedback, navigation */}
      <RightPanel />
    </div>
  );
}
