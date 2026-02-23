import { useEffect, useMemo, useRef } from 'react';
import { useShortcutStore } from '../../store/shortcutStore';
import { drillableShortcuts } from '../../data/shortcuts';
import type { Shortcut } from '../../types';
import { ShortcutFeedback } from './ShortcutFeedback';

/** Format a keys array as "Ctrl + D" */
function formatKeys(keys: string[]): string {
  return keys.join(' + ');
}

/** Keys that should trigger preventDefault during drill to block browser defaults */
const INTERCEPTABLE = new Set(['s', 'p', 'd', 'r', 'b', 'i', 'u', 'f', 'z', 'a', 'l', '1', '9']);
const FN_KEYS = new Set(['F2', 'F4', 'F5', 'F9']);

/** Build the pressed-keys array from a KeyboardEvent */
function buildPressedKeys(e: KeyboardEvent): string[] {
  const pressed: string[] = [];
  if (e.ctrlKey) pressed.push('Ctrl');
  if (e.altKey) pressed.push('Alt');
  if (e.shiftKey) pressed.push('Shift');
  if (e.metaKey) pressed.push('Cmd');

  const MODIFIERS_KEYS = new Set(['Control', 'Alt', 'Shift', 'Meta']);
  if (!MODIFIERS_KEYS.has(e.key)) {
    // Normalize single-char key to uppercase; keep multi-char keys as-is
    const normalized = e.key.length === 1 ? e.key.toUpperCase() : e.key;
    pressed.push(normalized);
  }
  return pressed;
}

/** Generate 3 wrong-answer options from the shortcut pool */
function getWrongOptions(correct: Shortcut, pool: Shortcut[]): Shortcut[] {
  // Prefer same category, then any
  const sameCategory = pool.filter((s) => s.id !== correct.id && s.category === correct.category);
  const others = pool.filter((s) => s.id !== correct.id && s.category !== correct.category);

  const candidates = [...sameCategory, ...others];
  // Shuffle candidates
  const shuffled = candidates.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 3);
}

export function ShortcutDrill() {
  const store = useShortcutStore();
  const {
    drillState,
    drillDirection,
    drillMode,
    queue,
    currentIndex,
    timeRemaining,
    showQuitConfirm,
    requestQuit,
    confirmQuit,
    cancelQuit,
    submitAnswer,
    submitMultipleChoiceAnswer,
  } = store;

  const currentShortcut = queue[currentIndex];
  const advanceCalledRef = useRef(false);

  // ── Timer (timed mode only) ──────────────────────────────────────────────────
  useEffect(() => {
    if (drillMode !== 'timed' || drillState !== 'drilling') return;
    const id = setInterval(() => {
      useShortcutStore.getState().tick();
    }, 1000);
    return () => clearInterval(id);
  }, [drillMode, drillState, currentIndex]);

  // ── Auto-advance on feedback ──────────────────────────────────────────────────
  useEffect(() => {
    if (drillState !== 'feedback') {
      advanceCalledRef.current = false;
      return;
    }
    if (advanceCalledRef.current) return;
    advanceCalledRef.current = true;

    const { lastCorrect } = useShortcutStore.getState();
    const delay = lastCorrect ? 1000 : 2000;
    const id = setTimeout(() => {
      useShortcutStore.getState().advanceToNext();
    }, delay);
    return () => clearTimeout(id);
  }, [drillState]);

  // ── Global keydown listener (Action→Keys, or Escape-only for Keys→Action) ───
  useEffect(() => {
    if (drillState !== 'drilling' && drillState !== 'feedback') return;
    // In feedback state, don't attach listener
    if (drillState === 'feedback') return;

    function handleKeyDown(e: KeyboardEvent) {
      const state = useShortcutStore.getState();

      // preventDefault for interceptable shortcuts
      if (e.ctrlKey && INTERCEPTABLE.has(e.key.toLowerCase())) {
        e.preventDefault();
      }
      if (FN_KEYS.has(e.key)) {
        e.preventDefault();
      }
      if (e.key === 'Escape') {
        e.preventDefault();
      }
      if (e.shiftKey && e.key === 'F3') {
        e.preventDefault();
      }

      // Escape: quit confirm toggle
      if (e.key === 'Escape') {
        if (state.showQuitConfirm) {
          state.cancelQuit();
        } else {
          state.requestQuit();
        }
        return;
      }

      // While quit dialog is shown, ignore all other keys
      if (state.showQuitConfirm) return;

      // Keys→Action: only handle Escape (done above), no grading
      if (state.drillDirection === 'keys-to-action') return;

      // Action→Keys: build pressed keys and submit
      const pressed = buildPressedKeys(e);
      // Skip modifier-only
      const MODS = new Set(['Ctrl', 'Alt', 'Shift', 'Cmd']);
      const hasActionKey = pressed.some((k) => !MODS.has(k));
      if (!hasActionKey) return;

      state.submitAnswer(pressed);
    }

    document.addEventListener('keydown', handleKeyDown, { capture: true });
    return () => {
      document.removeEventListener('keydown', handleKeyDown, { capture: true });
    };
  }, [drillState, currentIndex]);

  if (!currentShortcut) return null;

  const osKeys =
    store.osMode === 'windows' ? currentShortcut.keys.windows : currentShortcut.keys.mac;

  // Multiple-choice options for Keys→Action — stable per question (memoized by currentIndex)
  const allOptions = useMemo(() => {
    const wrong = getWrongOptions(currentShortcut, drillableShortcuts);
    return [currentShortcut, ...wrong].sort(() => Math.random() - 0.5);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex]);

  return (
    <div style={{ maxWidth: '600px' }}>
      {/* Progress + mode indicators */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
        }}
      >
        <span style={{ fontSize: '13px', color: '#888' }}>
          Question {currentIndex + 1} of {queue.length}
        </span>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {drillMode === 'timed' && drillState === 'drilling' && (
            <span
              style={{
                fontSize: '13px',
                fontWeight: 600,
                color: timeRemaining <= 3 ? '#ef4444' : '#555',
                minWidth: '48px',
                textAlign: 'right',
              }}
            >
              {timeRemaining}s
            </span>
          )}
          {drillDirection === 'action-to-keys' && (
            <span
              style={{
                fontSize: '11px',
                backgroundColor: '#e6f4ec',
                color: '#1a6b3c',
                borderRadius: '4px',
                padding: '2px 8px',
                fontWeight: 600,
              }}
            >
              Capturing shortcuts
            </span>
          )}
        </div>
      </div>

      {/* Quit confirmation dialog */}
      {showQuitConfirm && (
        <div
          style={{
            backgroundColor: '#fff8e1',
            border: '1px solid #ffe082',
            borderRadius: '8px',
            padding: '16px 20px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
          }}
        >
          <span style={{ fontSize: '14px', color: '#555' }}>Quit this session?</span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={confirmQuit}
              style={{
                padding: '6px 14px',
                fontSize: '13px',
                backgroundColor: '#ef4444',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              Yes, quit
            </button>
            <button
              onClick={cancelQuit}
              style={{
                padding: '6px 14px',
                fontSize: '13px',
                backgroundColor: '#fff',
                color: '#555',
                border: '1px solid #d0d0d0',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Keep going
            </button>
          </div>
        </div>
      )}

      {/* Main question card */}
      {drillState === 'drilling' && (
        <div
          style={{
            backgroundColor: '#fff',
            border: '1px solid #d0d0d0',
            borderRadius: '8px',
            padding: '28px 24px',
            marginBottom: '16px',
            textAlign: 'center',
          }}
        >
          {drillDirection === 'action-to-keys' ? (
            <>
              <p
                style={{
                  fontSize: '22px',
                  fontWeight: 600,
                  color: '#1a3a2a',
                  margin: '0 0 12px 0',
                  lineHeight: 1.3,
                }}
              >
                {currentShortcut.action}
              </p>
              <p style={{ fontSize: '13px', color: '#888', margin: 0 }}>
                {currentShortcut.financeContext}
              </p>
            </>
          ) : (
            <>
              <p
                style={{
                  fontSize: '26px',
                  fontWeight: 700,
                  fontFamily: 'monospace',
                  color: '#1a3a2a',
                  margin: '0 0 8px 0',
                }}
              >
                {formatKeys(osKeys)}
              </p>
              <p style={{ fontSize: '13px', color: '#888', margin: '0 0 20px 0' }}>
                What does this shortcut do?
              </p>
              {/* Multiple choice options */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  textAlign: 'left',
                }}
              >
                {allOptions.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => submitMultipleChoiceAnswer(opt.id)}
                    style={{
                      padding: '10px 16px',
                      fontSize: '13px',
                      backgroundColor: '#fff',
                      border: '1px solid #d0d0d0',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      color: '#333',
                      transition: 'background-color 0.1s',
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#f5f5f5';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#fff';
                    }}
                  >
                    {opt.action}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Feedback */}
      {drillState === 'feedback' && <ShortcutFeedback shortcut={currentShortcut} />}

      {/* Escape hint */}
      {drillState === 'drilling' && !showQuitConfirm && (
        <p style={{ fontSize: '11px', color: '#bbb', textAlign: 'center', margin: '8px 0 0 0' }}>
          Press Esc to quit session
        </p>
      )}
    </div>
  );
}
