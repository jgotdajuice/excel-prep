import { useShortcutStore } from '../../store/shortcutStore';
import type { Shortcut } from '../../types';

interface ShortcutFeedbackProps {
  shortcut: Shortcut;
}

export function ShortcutFeedback({ shortcut }: ShortcutFeedbackProps) {
  const { lastCorrect, lastPressedKeys, osMode } = useShortcutStore((s) => ({
    lastCorrect: s.lastCorrect,
    lastPressedKeys: s.lastPressedKeys,
    osMode: s.osMode,
  }));

  const isTimeout = lastPressedKeys.length === 0 && lastCorrect === false;
  const expectedKeys = osMode === 'windows' ? shortcut.keys.windows : shortcut.keys.mac;
  const expectedDisplay = expectedKeys.join(' + ');

  const bgColor = lastCorrect ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)';
  const borderColor = lastCorrect ? '#22c55e' : '#ef4444';
  const textColor = lastCorrect ? '#15803d' : '#b91c1c';

  return (
    <div
      style={{
        backgroundColor: bgColor,
        border: `2px solid ${borderColor}`,
        borderRadius: '8px',
        padding: '20px 24px',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          fontSize: '28px',
          marginBottom: '8px',
        }}
      >
        {lastCorrect ? '\u2713' : '\u2717'}
      </div>
      <div
        style={{
          fontSize: '18px',
          fontWeight: 700,
          color: textColor,
          marginBottom: '8px',
        }}
      >
        {lastCorrect ? 'Correct!' : isTimeout ? "Time's up!" : 'Incorrect'}
      </div>
      <div style={{ fontSize: '14px', color: '#555', marginBottom: '4px' }}>
        {shortcut.action}
      </div>
      {!lastCorrect && (
        <div style={{ marginTop: '12px' }}>
          <span style={{ fontSize: '12px', color: '#888' }}>Correct shortcut: </span>
          <span
            style={{
              fontSize: '13px',
              fontFamily: 'monospace',
              backgroundColor: '#f0f0f0',
              borderRadius: '4px',
              padding: '2px 10px',
              color: '#333',
              fontWeight: 600,
            }}
          >
            {expectedDisplay}
          </span>
        </div>
      )}
    </div>
  );
}
