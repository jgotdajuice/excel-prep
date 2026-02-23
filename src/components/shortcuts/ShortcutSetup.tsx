import { useState } from 'react';
import type { OSMode, DrillMode, DrillDirection, ShortcutCategory } from '../../types';
import { useShortcutStore } from '../../store/shortcutStore';
import { drillableShortcuts, shortcutsByCategory } from '../../data/shortcuts';
import { BrowserBlockedRef } from './BrowserBlockedRef';

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

function btnStyle(active: boolean): React.CSSProperties {
  return {
    padding: '6px 16px',
    fontSize: '13px',
    cursor: 'pointer',
    borderRadius: '4px',
    border: active ? '2px solid #1a6b3c' : '2px solid #d0d0d0',
    backgroundColor: active ? '#e6f4ec' : '#fff',
    color: active ? '#1a3a2a' : '#555',
    fontWeight: active ? 600 : 400,
    transition: 'all 0.1s',
  };
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

  const sectionLabel: React.CSSProperties = {
    fontSize: '11px',
    fontWeight: 600,
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: '0.8px',
    marginBottom: '8px',
    display: 'block',
  };

  const rowStyle: React.CSSProperties = {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  };

  return (
    <div style={{ maxWidth: '600px' }}>
      <h2
        style={{
          margin: '0 0 4px 0',
          fontSize: '20px',
          fontWeight: 700,
          color: '#1a3a2a',
        }}
      >
        Keyboard Shortcut Drill
      </h2>
      <p style={{ margin: '0 0 24px 0', fontSize: '13px', color: '#777' }}>
        Practice the Excel shortcuts that matter most in IB interviews.
      </p>

      {/* OS Selection */}
      <div style={{ marginBottom: '20px' }}>
        <span style={sectionLabel}>Operating System</span>
        <div style={rowStyle}>
          {(['windows', 'mac'] as OSMode[]).map((o) => (
            <button key={o} style={btnStyle(os === o)} onClick={() => setOs(o)}>
              {o === 'windows' ? 'Windows' : 'Mac'}
            </button>
          ))}
        </div>
        {showMacCtrlWarning && (
          <div
            style={{
              marginTop: '8px',
              padding: '8px 12px',
              backgroundColor: '#fff8e1',
              border: '1px solid #ffe082',
              borderRadius: '4px',
              fontSize: '12px',
              color: '#795548',
            }}
          >
            Windows mode on Mac: the physical Ctrl key is required — Cmd will not substitute.
          </div>
        )}
      </div>

      {/* Drill Mode */}
      <div style={{ marginBottom: '20px' }}>
        <span style={sectionLabel}>Drill Mode</span>
        <div style={rowStyle}>
          {(['practice', 'timed'] as DrillMode[]).map((m) => (
            <button key={m} style={btnStyle(mode === m)} onClick={() => setMode(m)}>
              {m === 'practice' ? 'Practice (untimed)' : 'Timed (7s)'}
            </button>
          ))}
        </div>
      </div>

      {/* Drill Direction */}
      <div style={{ marginBottom: '20px' }}>
        <span style={sectionLabel}>Drill Direction</span>
        <div style={rowStyle}>
          {([
            ['action-to-keys', 'Action \u2192 Keys'],
            ['keys-to-action', 'Keys \u2192 Action'],
          ] as [DrillDirection, string][]).map(([d, label]) => (
            <button key={d} style={btnStyle(direction === d)} onClick={() => setDirection(d)}>
              {label}
            </button>
          ))}
        </div>
        <p style={{ margin: '6px 0 0 0', fontSize: '11px', color: '#aaa' }}>
          {direction === 'action-to-keys'
            ? 'You see the action — press the correct key combination.'
            : 'You see the keys — pick the correct action from 4 options.'}
        </p>
      </div>

      {/* Category Picker */}
      <div style={{ marginBottom: '24px' }}>
        <span style={sectionLabel}>Category</span>
        <div style={rowStyle}>
          {CATEGORIES.map((cat) => (
            <button key={cat} style={btnStyle(category === cat)} onClick={() => setCategory(cat)}>
              {CATEGORY_LABELS[cat]} ({countForCategory(cat)})
            </button>
          ))}
        </div>
      </div>

      {/* Start */}
      <button
        onClick={handleStart}
        style={{
          padding: '10px 28px',
          fontSize: '14px',
          fontWeight: 600,
          backgroundColor: '#1a3a2a',
          color: '#fff',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
        }}
      >
        Start Session
      </button>

      {/* Browser-blocked reference */}
      <BrowserBlockedRef />
    </div>
  );
}
