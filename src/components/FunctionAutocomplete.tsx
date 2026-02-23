import { useEffect, useRef, useState } from 'react';
import { FINANCE_FUNCTIONS } from '../engine/formulaEngine';

interface FunctionAutocompleteProps {
  isVisible: boolean;
  filterText: string;
  position: { top: number; left: number };
  onSelect: (funcName: string) => void;
  onHide: () => void;
}

export function FunctionAutocomplete({
  isVisible,
  filterText,
  position,
  onSelect,
  onHide,
}: FunctionAutocompleteProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const listRef = useRef<HTMLUListElement>(null);

  const filtered = filterText
    ? FINANCE_FUNCTIONS.filter((fn) =>
        fn.toUpperCase().startsWith(filterText.toUpperCase())
      )
    : [...FINANCE_FUNCTIONS];

  // Reset active index when filter changes
  useEffect(() => {
    setActiveIndex(0);
  }, [filterText]);

  // Scroll active item into view
  useEffect(() => {
    if (listRef.current) {
      const activeEl = listRef.current.children[activeIndex] as HTMLElement;
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [activeIndex]);

  // Handle keyboard events bubbled from the editor textarea via the grid
  useEffect(() => {
    if (!isVisible) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (!isVisible || filtered.length === 0) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        e.stopPropagation();
        setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        e.stopPropagation();
        setActiveIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === 'Enter' || e.key === 'Tab') {
        if (filtered.length > 0) {
          e.preventDefault();
          e.stopPropagation();
          onSelect(filtered[activeIndex] + '(');
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onHide();
      }
    }

    window.addEventListener('keydown', handleKeyDown, true);
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [isVisible, filtered, activeIndex, onSelect, onHide]);

  if (!isVisible || filtered.length === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: position.top,
        left: position.left,
        zIndex: 9999,
        backgroundColor: '#fff',
        border: '1px solid #c0c0c0',
        borderRadius: '2px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        maxHeight: '200px',
        overflowY: 'auto',
        minWidth: '160px',
      }}
    >
      <ul
        ref={listRef}
        style={{
          listStyle: 'none',
          margin: 0,
          padding: '2px 0',
        }}
      >
        {filtered.map((fn, idx) => (
          <li
            key={fn}
            onMouseDown={(e) => {
              e.preventDefault();
              onSelect(fn + '(');
            }}
            onMouseEnter={() => setActiveIndex(idx)}
            style={{
              padding: '4px 12px',
              cursor: 'pointer',
              fontFamily: 'Consolas, "Courier New", monospace',
              fontSize: '13px',
              backgroundColor: idx === activeIndex ? '#0066cc' : 'transparent',
              color: idx === activeIndex ? '#fff' : '#1a1a1a',
            }}
          >
            {fn}
          </li>
        ))}
      </ul>
    </div>
  );
}
