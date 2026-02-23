import { useState } from 'react';
import { clsx } from 'clsx';
import type { OSMode, DrillMode, DrillDirection, ShortcutCategory } from '../../types';
import { useShortcutStore } from '../../store/shortcutStore';
import { drillableShortcuts, shortcutsByCategory } from '../../data/shortcuts';
import { BrowserBlockedRef } from './BrowserBlockedRef';
import { Button } from '../ui/Button';

type CategoryOption = ShortcutCategory | 'all';

const CATEGORY_LABELS: Record<CategoryOption, string> = {
  all: 'All Categories',
  navigation: 'Navigation',
  'formula-entry': 'Formula Entry',
  formatting: 'Formatting',
  'selection-editing': 'Selection & Editing',
};

const CATEGORIES: CategoryOption[] = [
  'all',
  'navigation',
  'formula-entry',
  'formatting',
  'selection-editing',
];

function countForCategory(cat: CategoryOption): number {
  if (cat === 'all') return drillableShortcuts.length;
  return shortcutsByCategory(cat).length;
}

function isMacDevice(): boolean {
  return navigator.platform.startsWith('Mac');
}

function optionBtnClass(active: boolean): string {
  return clsx(
    'px-4 py-1.5 text-[13px] rounded cursor-pointer border-2 transition-all duration-100',
    active
      ? 'border-brand bg-brand-light text-brand-dark font-semibold'
      : 'border-border bg-surface text-text-primary/70 font-normal hover:border-brand/50',
  );
}

export function ShortcutSetup() {
  const { setConfig, startSession } = useShortcutStore();

  const [os, setOs] = useState<OSMode>('windows');
  const [mode, setMode] = useState<DrillMode>('practice');
  const [direction, setDirection] = useState<DrillDirection>('action-to-keys');
  const [category, setCategory] = useState<CategoryOption>('all');

  const showMacCtrlWarning = os === 'windows' && isMacDevice();

  function handleStart() {
    const pool =
      category === 'all' ? drillableShortcuts : shortcutsByCategory(category as ShortcutCategory);
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    setConfig(os, mode, direction, category as ShortcutCategory | 'all');
    startSession(shuffled);
  }

  return (
    <div className="max-w-[600px]">
      <h2 className="text-xl font-bold text-brand-dark mb-1 mt-0">
        Keyboard Shortcut Drill
      </h2>
      <p className="text-[13px] text-muted mb-6 mt-0">
        Practice the Excel shortcuts that matter most in IB interviews.
      </p>

      {/* OS Selection */}
      <div className="mb-5">
        <span className="text-[11px] font-semibold text-muted uppercase tracking-widest mb-2 block">
          Operating System
        </span>
        <div className="flex gap-2 flex-wrap">
          {(['windows', 'mac'] as OSMode[]).map((o) => (
            <button key={o} className={optionBtnClass(os === o)} onClick={() => setOs(o)}>
              {o === 'windows' ? 'Windows' : 'Mac'}
            </button>
          ))}
        </div>
        {showMacCtrlWarning && (
          <div className="mt-2 px-3 py-2 bg-yellow-50 border border-yellow-300 rounded text-xs text-yellow-800">
            Windows mode on Mac: the physical Ctrl key is required — Cmd will not substitute.
          </div>
        )}
      </div>

      {/* Drill Mode */}
      <div className="mb-5">
        <span className="text-[11px] font-semibold text-muted uppercase tracking-widest mb-2 block">
          Drill Mode
        </span>
        <div className="flex gap-2 flex-wrap">
          {(['practice', 'timed'] as DrillMode[]).map((m) => (
            <button key={m} className={optionBtnClass(mode === m)} onClick={() => setMode(m)}>
              {m === 'practice' ? 'Practice (untimed)' : 'Timed (7s)'}
            </button>
          ))}
        </div>
      </div>

      {/* Drill Direction */}
      <div className="mb-5">
        <span className="text-[11px] font-semibold text-muted uppercase tracking-widest mb-2 block">
          Drill Direction
        </span>
        <div className="flex gap-2 flex-wrap">
          {([
            ['action-to-keys', 'Action \u2192 Keys'],
            ['keys-to-action', 'Keys \u2192 Action'],
          ] as [DrillDirection, string][]).map(([d, label]) => (
            <button key={d} className={optionBtnClass(direction === d)} onClick={() => setDirection(d)}>
              {label}
            </button>
          ))}
        </div>
        <p className="text-[11px] text-muted mt-1.5 mb-0">
          {direction === 'action-to-keys'
            ? 'You see the action — press the correct key combination.'
            : 'You see the keys — pick the correct action from 4 options.'}
        </p>
      </div>

      {/* Category Picker */}
      <div className="mb-6">
        <span className="text-[11px] font-semibold text-muted uppercase tracking-widest mb-2 block">
          Category
        </span>
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map((cat) => (
            <button key={cat} className={optionBtnClass(category === cat)} onClick={() => setCategory(cat)}>
              {CATEGORY_LABELS[cat]} ({countForCategory(cat)})
            </button>
          ))}
        </div>
      </div>

      {/* Start */}
      <Button onClick={handleStart} className="py-2.5 px-7 text-sm">Start Session</Button>

      {/* Browser-blocked reference */}
      <BrowserBlockedRef />
    </div>
  );
}
