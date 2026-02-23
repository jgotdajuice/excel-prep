import { useShortcutStore } from '../../store/shortcutStore';
import type { DrillResult } from '../../types';

function formatKeys(keys: string[]): string {
  return keys.join(' + ');
}

function calcStats(results: DrillResult[]) {
  const answered = results.filter((r) => r.responseMs > 0);
  if (answered.length === 0) return { avg: 0, fastest: 0, slowest: 0 };

  const times = answered.map((r) => r.responseMs);
  const avg = times.reduce((a, b) => a + b, 0) / times.length;
  const fastest = Math.min(...times);
  const slowest = Math.max(...times);
  return { avg, fastest, slowest };
}

function msToSec(ms: number): string {
  return (ms / 1000).toFixed(1) + 's';
}

export function ShortcutSummary() {
  const { results, osMode, resetToIdle, startSession } = useShortcutStore((s) => ({
    results: s.results,
    osMode: s.osMode,
    resetToIdle: s.resetToIdle,
    startSession: s.startSession,
  }));

  const correct = results.filter((r) => r.correct).length;
  const total = results.length;
  const pct = total > 0 ? Math.round((correct / total) * 100) : 0;

  const missed = results.filter((r) => !r.correct);
  const stats = calcStats(results);

  function handlePracticeMissed() {
    const missedShortcuts = missed.map((r) => r.shortcut);
    const shuffled = [...missedShortcuts].sort(() => Math.random() - 0.5);
    startSession(shuffled);
  }

  const scoreColor = pct >= 80 ? '#15803d' : pct >= 60 ? '#b45309' : '#b91c1c';

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
        Session Complete
      </h2>

      {/* Score card */}
      <div
        style={{
          backgroundColor: '#fff',
          border: '1px solid #d0d0d0',
          borderRadius: '8px',
          padding: '24px',
          marginBottom: '20px',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            fontSize: '48px',
            fontWeight: 700,
            color: scoreColor,
            marginBottom: '4px',
          }}
        >
          {pct}%
        </div>
        <div style={{ fontSize: '16px', color: '#555', marginBottom: '16px' }}>
          {correct} / {total} correct
        </div>

        {/* Time stats */}
        {total > 0 && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '24px',
              fontSize: '13px',
              color: '#888',
              borderTop: '1px solid #eee',
              paddingTop: '16px',
            }}
          >
            <div>
              <div style={{ fontWeight: 600, color: '#555' }}>{msToSec(stats.avg)}</div>
              <div>avg response</div>
            </div>
            {stats.fastest > 0 && (
              <div>
                <div style={{ fontWeight: 600, color: '#15803d' }}>{msToSec(stats.fastest)}</div>
                <div>fastest</div>
              </div>
            )}
            {stats.slowest > 0 && (
              <div>
                <div style={{ fontWeight: 600, color: '#b91c1c' }}>{msToSec(stats.slowest)}</div>
                <div>slowest</div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
        <button
          onClick={resetToIdle}
          style={{
            padding: '10px 20px',
            fontSize: '14px',
            fontWeight: 600,
            backgroundColor: '#1a3a2a',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
          }}
        >
          Try Again
        </button>
        {missed.length > 0 && (
          <button
            onClick={handlePracticeMissed}
            style={{
              padding: '10px 20px',
              fontSize: '14px',
              fontWeight: 600,
              backgroundColor: '#fff',
              color: '#1a3a2a',
              border: '2px solid #1a3a2a',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
          >
            Practice Missed ({missed.length})
          </button>
        )}
      </div>

      {/* Missed shortcuts */}
      {missed.length > 0 && (
        <div>
          <h3
            style={{
              fontSize: '14px',
              fontWeight: 600,
              color: '#555',
              margin: '0 0 12px 0',
            }}
          >
            Missed Shortcuts
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {missed.map((r) => {
              const keys =
                osMode === 'windows' ? r.shortcut.keys.windows : r.shortcut.keys.mac;
              return (
                <div
                  key={r.shortcut.id}
                  style={{
                    backgroundColor: '#fff5f5',
                    border: '1px solid #fecaca',
                    borderLeft: '3px solid #ef4444',
                    borderRadius: '6px',
                    padding: '10px 14px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'baseline',
                      marginBottom: '4px',
                    }}
                  >
                    <span style={{ fontSize: '13px', fontWeight: 500, color: '#444' }}>
                      {r.shortcut.action}
                    </span>
                    <span
                      style={{
                        fontSize: '12px',
                        fontFamily: 'monospace',
                        backgroundColor: '#fee2e2',
                        borderRadius: '4px',
                        padding: '2px 8px',
                        color: '#b91c1c',
                        whiteSpace: 'nowrap',
                        marginLeft: '12px',
                        fontWeight: 600,
                      }}
                    >
                      {formatKeys(keys)}
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: '11px', color: '#888' }}>
                    {r.shortcut.financeContext}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {missed.length === 0 && total > 0 && (
        <div
          style={{
            textAlign: 'center',
            padding: '20px',
            fontSize: '14px',
            color: '#15803d',
            backgroundColor: '#f0fdf4',
            borderRadius: '8px',
            border: '1px solid #bbf7d0',
          }}
        >
          Perfect score! All shortcuts correct.
        </div>
      )}
    </div>
  );
}
