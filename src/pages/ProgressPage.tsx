import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChallengeStore } from '../store/challengeStore';
import { useDrillStore } from '../store/drillStore';
import { challenges as seedChallenges } from '../data/challenges';
import {
  computeCategoryAccuracies,
  weakestCategory,
  overallStats,
} from '../store/progressSelectors';
import type { CategoryAccuracy } from '../store/progressSelectors';
import type { Tier } from '../types';
import { Card } from '../components/ui/Card';
import { StatCard } from '../components/ui/StatCard';
import { Button } from '../components/ui/Button';

// ── Helpers ───────────────────────────────────────────────────────────────────

function tierLabel(tier: Tier): string {
  switch (tier) {
    case 'beginner':
      return 'Beginner Functions';
    case 'intermediate':
      return 'Intermediate Functions';
    case 'advanced':
      return 'Advanced Functions';
  }
}

function barColor(accuracy: number): string {
  if (accuracy >= 0.8) return '#1a6b3c';
  if (accuracy >= 0.5) return '#d97706';
  return '#dc2626';
}

function pct(accuracy: number): string {
  return `${Math.round(accuracy * 100)}%`;
}

// ── Accuracy Bar ──────────────────────────────────────────────────────────────

function AccuracyBar({ item }: { item: CategoryAccuracy }) {
  const color = barColor(item.accuracy);
  const widthPct = `${Math.round(item.accuracy * 100)}%`;

  return (
    <div className="mb-3">
      <div className="flex justify-between items-center mb-1">
        <span className="text-[13px] font-medium text-text-primary">
          {item.category}
        </span>
        <span className="text-xs text-muted">
          {item.gridCorrect + item.drillCorrect}/{item.totalAttempts} — {pct(item.accuracy)}
        </span>
      </div>
      <div className="h-2.5 bg-border rounded-full overflow-hidden shadow-inner">
        <div
          className="h-full rounded-full transition-[width] duration-300"
          style={{ width: widthPct, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export function ProgressPage() {
  const navigate = useNavigate();
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const { challenges, statuses, hintUsageCount, setActiveTier, isTierUnlocked, loadChallenges } =
    useChallengeStore();
  const { allAnswers } = useDrillStore();

  // Ensure challenges are loaded (needed if user navigates to /progress directly)
  useEffect(() => {
    if (challenges.length === 0) {
      loadChallenges(seedChallenges);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const accuracies = computeCategoryAccuracies(challenges, statuses, allAnswers);
  const stats = overallStats(challenges, statuses, allAnswers, hintUsageCount);
  const weakest = weakestCategory(accuracies, 2);

  // Group accuracies by tier
  const tiers: Tier[] = ['beginner', 'intermediate', 'advanced'];
  const byTier: Record<Tier, CategoryAccuracy[]> = {
    beginner: [],
    intermediate: [],
    advanced: [],
  };
  for (const item of accuracies) {
    byTier[item.tier].push(item);
  }

  // Tier unlock status — beginner is always unlocked
  function isTierAccessible(tier: Tier): boolean {
    if (tier === 'beginner') return true;
    return isTierUnlocked(tier as 'intermediate' | 'advanced');
  }

  // What fraction of this tier's categories are at >= 70%
  function tierCompletionText(tier: Tier): string {
    const items = byTier[tier];
    if (items.length === 0) return '';
    const passing = items.filter((i) => i.accuracy >= 0.7).length;
    return `${Math.round((passing / items.length) * 100)}% complete`;
  }

  // Navigate to challenges and pre-select the weakest tier
  function handleFocusClick() {
    if (!weakest) return;
    setActiveTier(weakest.tier);
    navigate('/challenge');
  }

  // Reset all progress
  function handleReset() {
    localStorage.removeItem('excelprep-challenge-v1');
    localStorage.removeItem('excelprep-drill-v1');
    window.location.reload();
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="overflow-y-auto h-full py-8 px-10 bg-base">
      <div className="max-w-[720px] mx-auto">

        {/* Header */}
        <h1 className="text-xl font-bold text-brand-dark mb-7">
          Your Progress
        </h1>

        {/* Overall Stats Row */}
        <div className="grid grid-cols-3 gap-4 mb-7">
          <StatCard label="Challenges Completed" value={String(stats.totalChallengesCompleted)} />
          <StatCard label="Drill Questions" value={String(stats.totalDrillAnswered)} />
          <StatCard
            label="Overall Accuracy"
            value={
              stats.totalChallengesCompleted + stats.totalDrillAnswered > 0
                ? pct(stats.overallAccuracy)
                : '---'
            }
          />
        </div>

        {/* Suggested Next Section */}
        <div className="mb-7">
          {weakest ? (
            <div className="bg-brand-light/50 border border-green-300 border-l-4 border-l-brand rounded-[10px] px-5 py-4">
              <p className="m-0 mb-1 text-[11px] font-semibold text-brand uppercase tracking-widest">
                Focus on this
              </p>
              <p className="m-0 mb-0.5 text-[17px] font-bold text-brand-dark">
                {weakest.category}
              </p>
              <p className="m-0 mb-3.5 text-[13px] text-text-primary">
                Your accuracy: {pct(weakest.accuracy)} ({weakest.totalAttempts} attempts)
              </p>
              <Button onClick={handleFocusClick}>Practice {weakest.category}</Button>
            </div>
          ) : (
            <div className="bg-brand-light/50 border border-green-300 rounded-[10px] px-5 py-4 text-center">
              <p className="m-0 text-[15px] text-brand-dark font-medium">
                You're doing great — keep practicing!
              </p>
            </div>
          )}
        </div>

        {/* Per-Function Accuracy by Tier */}
        {tiers.map((tier) => {
          const items = byTier[tier];
          const unlocked = isTierAccessible(tier);

          return (
            <Card key={tier} shadow className="mb-4">
              {/* Tier header */}
              <div
                className={`flex justify-between items-center ${items.length > 0 ? 'mb-4' : ''}`}
              >
                <h2 className="text-sm font-bold text-brand-dark uppercase tracking-wide m-0">
                  {tierLabel(tier)}
                </h2>
                <span className={`text-xs font-medium ${unlocked ? 'text-brand' : 'text-muted'}`}>
                  {unlocked ? '\u2713 Unlocked' : tierCompletionText(tier) || 'Locked'}
                </span>
              </div>

              {/* Bars or empty message */}
              {items.length > 0 ? (
                items.map((item) => <AccuracyBar key={item.category} item={item} />)
              ) : (
                <p className="text-sm text-muted m-0">
                  No attempts yet
                </p>
              )}
            </Card>
          );
        })}

        {/* Reset Progress */}
        <div className="mt-6 mb-10 text-center">
          {!showResetConfirm ? (
            <Button variant="ghost" onClick={() => setShowResetConfirm(true)}>
              Reset All Progress
            </Button>
          ) : (
            <div className="inline-flex flex-col items-center gap-2.5">
              <p className="text-sm text-text-primary m-0">
                Are you sure? This cannot be undone.
              </p>
              <div className="flex gap-2">
                <Button variant="danger" onClick={handleReset} className="text-sm py-1.5 px-3.5">
                  Yes, reset
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setShowResetConfirm(false)}
                  className="text-sm py-1.5 px-3.5"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
