/**
 * Pure selector functions for computing progress metrics from store data.
 *
 * All functions are pure — they take raw store state as arguments and
 * derive metrics without side effects. Never store derived values in state.
 *
 * Used by: ProgressPage (Phase 5 Plan 02) and drill queue weighting (Plan 03).
 */

import type { Challenge, ChallengeStatus, Tier } from '../types';
import type { DrillAnswerRecord } from './drillStore';

// ── Types ────────────────────────────────────────────────────────────────────

export interface CategoryAccuracy {
  /** Function/concept name, e.g. "VLOOKUP", "INDEX/MATCH" */
  category: string;
  /** The tier this category belongs to */
  tier: Tier;
  /** Grid challenges answered correctly */
  gridCorrect: number;
  /** Grid challenges attempted (correct + incorrect only, not unattempted/skipped) */
  gridTotal: number;
  /** Drill answers marked correct for this category */
  drillCorrect: number;
  /** Total drill answers for this category */
  drillTotal: number;
  /**
   * Combined accuracy rate: (gridCorrect + drillCorrect) / (gridTotal + drillTotal).
   * Simple unweighted ratio for display. Returns 0 if totalAttempts === 0.
   */
  accuracy: number;
  /** gridTotal + drillTotal */
  totalAttempts: number;
}

// ── Tier sort order ──────────────────────────────────────────────────────────

const TIER_ORDER: Record<Tier, number> = {
  beginner: 0,
  intermediate: 1,
  advanced: 2,
};

// ── computeCategoryAccuracies ────────────────────────────────────────────────

/**
 * Compute per-category accuracy from raw challenge + drill data.
 *
 * Rules:
 * - Only 'correct' and 'incorrect' statuses count toward gridTotal.
 *   'unattempted' and 'skipped' are excluded (Pitfall 5 from RESEARCH.md).
 * - Only categories with totalAttempts > 0 are returned.
 * - Sorted by tier (beginner → intermediate → advanced), then alphabetically within tier.
 *
 * @param challenges - Full static challenges array
 * @param statuses   - Global statuses array indexed by position in challenges[]
 * @param allAnswers - Accumulated drill answer records across all sessions
 */
export function computeCategoryAccuracies(
  challenges: Challenge[],
  statuses: ChallengeStatus[],
  allAnswers: DrillAnswerRecord[],
): CategoryAccuracy[] {
  // Build a map from challengeId to category for drill lookup
  const challengeIdToCategory = new Map<string, string>(
    challenges.map((c) => [c.id, c.category ?? 'General']),
  );
  const challengeIdToTier = new Map<string, Tier>(
    challenges.map((c) => [c.id, c.tier]),
  );

  // Collect unique categories with their tiers
  const categoryTierMap = new Map<string, Tier>();
  for (const c of challenges) {
    const cat = c.category ?? 'General';
    if (!categoryTierMap.has(cat)) {
      categoryTierMap.set(cat, c.tier);
    }
  }

  // Compute grid stats per category
  const gridCorrectMap = new Map<string, number>();
  const gridTotalMap = new Map<string, number>();

  for (let i = 0; i < challenges.length; i++) {
    const challenge = challenges[i];
    const status = statuses[i];
    const cat = challenge.category ?? 'General';

    if (status === 'correct' || status === 'incorrect') {
      gridTotalMap.set(cat, (gridTotalMap.get(cat) ?? 0) + 1);
      if (status === 'correct') {
        gridCorrectMap.set(cat, (gridCorrectMap.get(cat) ?? 0) + 1);
      }
    }
  }

  // Compute drill stats per category
  const drillCorrectMap = new Map<string, number>();
  const drillTotalMap = new Map<string, number>();

  for (const answer of allAnswers) {
    const cat = challengeIdToCategory.get(answer.challengeId);
    if (!cat) continue; // unknown challengeId — skip

    drillTotalMap.set(cat, (drillTotalMap.get(cat) ?? 0) + 1);
    if (answer.status === 'correct') {
      drillCorrectMap.set(cat, (drillCorrectMap.get(cat) ?? 0) + 1);
    }
  }

  // Build result array — only include categories with at least 1 attempt
  const results: CategoryAccuracy[] = [];

  for (const [category, tier] of categoryTierMap.entries()) {
    const gridCorrect = gridCorrectMap.get(category) ?? 0;
    const gridTotal = gridTotalMap.get(category) ?? 0;
    const drillCorrect = drillCorrectMap.get(category) ?? 0;
    const drillTotal = drillTotalMap.get(category) ?? 0;
    const totalAttempts = gridTotal + drillTotal;

    if (totalAttempts === 0) continue;

    const accuracy =
      totalAttempts > 0 ? (gridCorrect + drillCorrect) / totalAttempts : 0;

    results.push({
      category,
      tier,
      gridCorrect,
      gridTotal,
      drillCorrect,
      drillTotal,
      accuracy,
      totalAttempts,
    });
  }

  // Sort by tier order, then alphabetically within tier
  results.sort((a, b) => {
    const tierDiff = TIER_ORDER[a.tier] - TIER_ORDER[b.tier];
    if (tierDiff !== 0) return tierDiff;
    return a.category.localeCompare(b.category);
  });

  return results;
}

// ── weakestCategory ──────────────────────────────────────────────────────────

/**
 * Find the category with the lowest accuracy among those with sufficient attempts.
 *
 * @param accuracies  - Output of computeCategoryAccuracies
 * @param minAttempts - Minimum totalAttempts to qualify (default 2)
 * @returns The weakest CategoryAccuracy, or null if no category qualifies
 */
export function weakestCategory(
  accuracies: CategoryAccuracy[],
  minAttempts = 2,
): CategoryAccuracy | null {
  const qualified = accuracies.filter((a) => a.totalAttempts >= minAttempts);
  if (qualified.length === 0) return null;

  return qualified.reduce((weakest, curr) =>
    curr.accuracy < weakest.accuracy ? curr : weakest,
  );
}

// ── overallStats ─────────────────────────────────────────────────────────────

export interface OverallStats {
  /** Count of challenges with status 'correct' or 'incorrect' (attempted) */
  totalChallengesCompleted: number;
  /** Total drill answers accumulated across all sessions */
  totalDrillAnswered: number;
  /**
   * Combined accuracy across both grid and drill:
   * (all grid correct + all drill correct) / (all grid attempted + all drill answered).
   * Returns 0 if no attempts.
   */
  overallAccuracy: number;
  /** Total number of times the hint button was clicked (global counter) */
  hintUsageCount: number;
}

/**
 * Compute overall progress statistics from raw store data.
 *
 * @param challenges     - Full static challenges array
 * @param statuses       - Global statuses array indexed by position in challenges[]
 * @param allAnswers     - Accumulated drill answer records across all sessions
 * @param hintUsageCount - From challengeStore.hintUsageCount
 */
export function overallStats(
  challenges: Challenge[],
  statuses: ChallengeStatus[],
  allAnswers: DrillAnswerRecord[],
  hintUsageCount: number,
): OverallStats {
  // Grid: only count 'correct' and 'incorrect' as attempted
  let gridCorrect = 0;
  let gridAttempted = 0;

  for (let i = 0; i < challenges.length; i++) {
    const status = statuses[i];
    if (status === 'correct' || status === 'incorrect') {
      gridAttempted++;
      if (status === 'correct') gridCorrect++;
    }
  }

  // Drill: all answers count as attempted
  const drillCorrect = allAnswers.filter((a) => a.status === 'correct').length;
  const drillAttempted = allAnswers.length;

  const totalAttempted = gridAttempted + drillAttempted;
  const totalCorrect = gridCorrect + drillCorrect;

  return {
    totalChallengesCompleted: gridAttempted,
    totalDrillAnswered: drillAttempted,
    overallAccuracy: totalAttempted > 0 ? totalCorrect / totalAttempted : 0,
    hintUsageCount,
  };
}
