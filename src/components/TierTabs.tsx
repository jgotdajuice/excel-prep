import { clsx } from 'clsx';
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
    <div className="flex flex-row border-b border-border bg-surface shrink-0">
      {TIERS.map((tier) => {
        const unlocked = isUnlocked(tier);
        const isActive = tier === activeTier;

        return (
          <button
            key={tier}
            className={clsx(
              'flex-1 flex items-center justify-center gap-1 py-2 px-1 text-[11px] font-medium text-muted bg-transparent border-none border-b-2 border-transparent cursor-pointer transition-all duration-150 whitespace-nowrap',
              'hover:bg-base hover:text-text-primary',
              isActive && !unlocked && 'text-muted border-b-muted',
              isActive && unlocked && 'text-brand-dark font-bold border-b-brand-dark bg-surface',
              !isActive && !unlocked && 'text-muted/60',
            )}
            onClick={() => onSelectTier(tier)}
            aria-pressed={isActive}
            aria-label={`${TIER_LABELS[tier]}${!unlocked ? ' (locked)' : ''}`}
          >
            {!unlocked && (
              <span className="text-[10px] leading-none" aria-hidden="true">
                {'\u{1F512}'}
              </span>
            )}
            <span>{TIER_LABELS[tier]}</span>
          </button>
        );
      })}
    </div>
  );
}
