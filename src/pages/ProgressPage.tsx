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
    <div style={{ marginBottom: '12px' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '4px',
        }}
      >
        <span style={{ fontSize: '13px', fontWeight: 500, color: '#1f2937' }}>
          {item.category}
        </span>
        <span style={{ fontSize: '12px', color: '#6b7280' }}>
          {item.gridCorrect + item.drillCorrect}/{item.totalAttempts} — {pct(item.accuracy)}
        </span>
      </div>
      <div
        style={{
          height: '10px',
          backgroundColor: '#e5e7eb',
          borderRadius: '999px',
          overflow: 'hidden',
          boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.08)',
        }}
      >
        <div
          style={{
            height: '100%',
            width: widthPct,
            backgroundColor: color,
            borderRadius: '999px',
            transition: 'width 0.3s ease',
          }}
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
    <div
      style={{
        overflowY: 'auto',
        height: '100%',
        padding: '32px 40px',
        backgroundColor: '#f9fafb',
      }}
    >
      <div style={{ maxWidth: '720px', margin: '0 auto' }}>

        {/* Header */}
        <h1
          style={{
            fontSize: '22px',
            fontWeight: 700,
            color: '#1a3a2a',
            margin: '0 0 28px 0',
          }}
        >
          Your Progress
        </h1>

        {/* Overall Stats Row */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '16px',
            marginBottom: '28px',
          }}
        >
          {[
            { label: 'Challenges Completed', value: String(stats.totalChallengesCompleted) },
            { label: 'Drill Questions', value: String(stats.totalDrillAnswered) },
            {
              label: 'Overall Accuracy',
              value:
                stats.totalChallengesCompleted + stats.totalDrillAnswered > 0
                  ? pct(stats.overallAccuracy)
                  : '—',
            },
          ].map(({ label, value }) => (
            <div
              key={label}
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '10px',
                padding: '16px 20px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
              }}
            >
              <p
                style={{
                  margin: '0 0 4px 0',
                  fontSize: '12px',
                  color: '#6b7280',
                  fontWeight: 500,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                {label}
              </p>
              <p
                style={{
                  margin: 0,
                  fontSize: '26px',
                  fontWeight: 700,
                  color: '#1a3a2a',
                }}
              >
                {value}
              </p>
            </div>
          ))}
        </div>

        {/* Suggested Next Section */}
        <div style={{ marginBottom: '28px' }}>
          {weakest ? (
            <div
              style={{
                backgroundColor: '#f0fdf4',
                border: '1px solid #86efac',
                borderLeft: '4px solid #1a6b3c',
                borderRadius: '10px',
                padding: '18px 22px',
              }}
            >
              <p
                style={{
                  margin: '0 0 4px 0',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: '#1a6b3c',
                  textTransform: 'uppercase',
                  letterSpacing: '0.6px',
                }}
              >
                Focus on this
              </p>
              <p
                style={{
                  margin: '0 0 2px 0',
                  fontSize: '17px',
                  fontWeight: 700,
                  color: '#1a3a2a',
                }}
              >
                {weakest.category}
              </p>
              <p style={{ margin: '0 0 14px 0', fontSize: '13px', color: '#374151' }}>
                Your accuracy: {pct(weakest.accuracy)} ({weakest.totalAttempts} attempts)
              </p>
              <button
                onClick={handleFocusClick}
                style={{
                  backgroundColor: '#1a6b3c',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '8px 16px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Practice {weakest.category}
              </button>
            </div>
          ) : (
            <div
              style={{
                backgroundColor: '#f0fdf4',
                border: '1px solid #86efac',
                borderRadius: '10px',
                padding: '18px 22px',
                textAlign: 'center',
              }}
            >
              <p style={{ margin: 0, fontSize: '15px', color: '#1a3a2a', fontWeight: 500 }}>
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
            <div
              key={tier}
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '10px',
                padding: '20px 24px',
                marginBottom: '16px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
              }}
            >
              {/* Tier header */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: items.length > 0 ? '16px' : '0',
                }}
              >
                <h2
                  style={{
                    margin: 0,
                    fontSize: '14px',
                    fontWeight: 700,
                    color: '#1a3a2a',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}
                >
                  {tierLabel(tier)}
                </h2>
                <span
                  style={{
                    fontSize: '12px',
                    color: unlocked ? '#1a6b3c' : '#9ca3af',
                    fontWeight: 500,
                  }}
                >
                  {unlocked ? '✓ Unlocked' : tierCompletionText(tier) || 'Locked'}
                </span>
              </div>

              {/* Bars or empty message */}
              {items.length > 0 ? (
                items.map((item) => <AccuracyBar key={item.category} item={item} />)
              ) : (
                <p style={{ margin: 0, fontSize: '13px', color: '#9ca3af' }}>
                  No attempts yet
                </p>
              )}
            </div>
          );
        })}

        {/* Reset Progress */}
        <div
          style={{
            marginTop: '24px',
            marginBottom: '40px',
            textAlign: 'center',
          }}
        >
          {!showResetConfirm ? (
            <button
              onClick={() => setShowResetConfirm(true)}
              style={{
                backgroundColor: 'transparent',
                color: '#9ca3af',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                padding: '8px 16px',
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              Reset All Progress
            </button>
          ) : (
            <div
              style={{
                display: 'inline-flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <p style={{ margin: 0, fontSize: '13px', color: '#374151' }}>
                Are you sure? This cannot be undone.
              </p>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={handleReset}
                  style={{
                    backgroundColor: '#dc2626',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '7px 14px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Yes, reset
                </button>
                <button
                  onClick={() => setShowResetConfirm(false)}
                  style={{
                    backgroundColor: '#f3f4f6',
                    color: '#374151',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    padding: '7px 14px',
                    fontSize: '13px',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
