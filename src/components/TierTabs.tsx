import type { Tier } from '../types';

interface TierTabsProps {
  activeTier: Tier;
  intermediateUnlocked: boolean;
  advancedUnlocked: boolean;
  onSelectTier: (tier: Tier) => void;
}

const TIER_LABELS: Record<Tier, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
};

const TIERS: Tier[] = ['beginner', 'intermediate', 'advanced'];

export function TierTabs({
  activeTier,
  intermediateUnlocked,
  advancedUnlocked,
  onSelectTier,
}: TierTabsProps) {
  function isUnlocked(tier: Tier): boolean {
    if (tier === 'beginner') return true;
    if (tier === 'intermediate') return intermediateUnlocked;
    return advancedUnlocked;
  }

  return (
    <div className="tier-tabs">
      {TIERS.map((tier) => {
        const unlocked = isUnlocked(tier);
        const isActive = tier === activeTier;

        return (
          <button
            key={tier}
            className={`tier-tab${isActive ? ' tier-tab--active' : ''}${!unlocked ? ' tier-tab--locked' : ''}`}
            onClick={() => onSelectTier(tier)}
            aria-pressed={isActive}
            aria-label={`${TIER_LABELS[tier]}${!unlocked ? ' (locked)' : ''}`}
          >
            {!unlocked && (
              <span className="tier-tab-lock" aria-hidden="true">
                {'\u{1F512}'}
              </span>
            )}
            <span className="tier-tab-label">{TIER_LABELS[tier]}</span>
          </button>
        );
      })}
    </div>
  );
}
