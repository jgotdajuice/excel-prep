import { useEffect, useMemo, useRef, useState } from 'react';
import { HotTable } from '@handsontable/react-wrapper';
import type { HotTableRef } from '@handsontable/react-wrapper';
import { registerAllModules } from 'handsontable/registry';
import Handsontable from 'handsontable';
import 'handsontable/styles/handsontable.min.css';
import 'handsontable/styles/ht-theme-main.min.css';
import { buildExcelCompatEngine } from '../engine/formulaEngine';
import { FormulaBar } from './FormulaBar';
import { FunctionAutocomplete } from './FunctionAutocomplete';
import type { SelectedCellState, Challenge, GradeResult } from '../types';

// Register all Handsontable modules once at module level
registerAllModules();

// HyperFormula instance must live outside React state to avoid proxy breakage
// Exported so ChallengePage can read cell values for grading
export const hfInstance = buildExcelCompatEngine();

/** Convert zero-based col index to Excel column letter (0 → A, 25 → Z) */
function colIndexToLetter(col: number): string {
  let letter = '';
  let n = col + 1;
  while (n > 0) {
    const rem = (n - 1) % 26;
    letter = String.fromCharCode(65 + rem) + letter;
    n = Math.floor((n - 1) / 26);
  }
  return letter;
}

interface CellGradeInfo {
  row: number;
  col: number;
  result: GradeResult;
}

interface SpreadsheetGridProps {
  challenge?: Challenge;
  isLocked?: boolean;
  cellGrades?: CellGradeInfo[];
  onGradeCell?: (row: number, col: number) => void;
}

// Register custom answer cell renderer once
Handsontable.renderers.registerRenderer(
  'answerCell',
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function (this: any, hotInstance, td, row, col, prop, value, cellProperties) {
    // Call base text renderer first
    Handsontable.renderers.TextRenderer.call(
      this,
      hotInstance,
      td,
      row,
      col,
      prop,
      value,
      cellProperties,
    );

    // Apply outline based on grade status stored in cellProperties
    const gradeStatus = (cellProperties as { gradeStatus?: string }).gradeStatus;
    if (gradeStatus === 'correct') {
      td.style.outline = '2px solid #1a6b3c';
    } else if (gradeStatus === 'incorrect' || gradeStatus === 'error') {
      td.style.outline = '2px solid #c0392b';
    } else {
      // Unattempted answer cell — blue
      td.style.outline = '2px solid #0066cc';
    }
    td.style.outlineOffset = '-2px';
  },
);

export function SpreadsheetGrid({
  challenge,
  isLocked,
  cellGrades,
  onGradeCell,
}: SpreadsheetGridProps) {
  const hotRef = useRef<HotTableRef>(null);

  const [selectedCell, setSelectedCell] = useState<SelectedCellState>({
    row: 0,
    col: 0,
    formula: undefined,
    value: null,
  });

  const [autocomplete, setAutocomplete] = useState<{
    isVisible: boolean;
    filterText: string;
    position: { top: number; left: number };
  }>({
    isVisible: false,
    filterText: '',
    position: { top: 0, left: 0 },
  });

  // Track current editing row/col for autocomplete
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const keyupListenerRef = useRef<((e: KeyboardEvent) => void) | null>(null);

  // Enter-key grading flag: set true when Enter is pressed in an answer cell
  const enterPressedRef = useRef(false);

  // Use refs for challenge props to avoid re-creating cells callback on every render
  const isLockedRef = useRef(isLocked);
  isLockedRef.current = isLocked;
  const cellGradesRef = useRef(cellGrades);
  cellGradesRef.current = cellGrades;
  const onGradeCellRef = useRef(onGradeCell);
  onGradeCellRef.current = onGradeCell;

  // Build answer cell set — memoized on challenge ID, also stored in ref for stable callbacks
  const answerCellSet = useMemo(
    () => new Set<string>((challenge?.answerCells ?? []).map((ac) => `${ac.row}:${ac.col}`)),
    [challenge?.id], // eslint-disable-line react-hooks/exhaustive-deps
  );
  const answerCellSetRef = useRef(answerCellSet);
  answerCellSetRef.current = answerCellSet;

  const isChallenge = !!challenge;

  // Set localStorage flag so WelcomePage can show "Continue" on next visit
  useEffect(() => {
    localStorage.setItem('hasStarted', 'true');
  }, []);

  // When grades or lock state change, re-render grid cells to update outlines
  useEffect(() => {
    if (!isChallenge) return;
    const hot = hotRef.current?.hotInstance;
    if (hot) hot.render();
  }, [isLocked, cellGrades, isChallenge]);

  // When challenge changes, imperatively load seed data into HOT
  useEffect(() => {
    if (!challenge) return;
    const hot = hotRef.current?.hotInstance;
    if (!hot) return;
    // Small delay to ensure HOT is mounted
    setTimeout(() => {
      hotRef.current?.hotInstance?.loadData(
        challenge.seedData as Handsontable.CellValue[][],
      );
    }, 0);
  }, [challenge?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  function hideAutocomplete() {
    setAutocomplete((prev) => ({ ...prev, isVisible: false }));
  }

  function handleAutocompleteSelect(funcName: string) {
    hideAutocomplete();
    if (textareaRef.current) {
      textareaRef.current.value = '=' + funcName;
      const len = textareaRef.current.value.length;
      textareaRef.current.setSelectionRange(len, len);
      textareaRef.current.focus();
    }
  }

  function cleanupTextareaListener() {
    if (textareaRef.current && keyupListenerRef.current) {
      textareaRef.current.removeEventListener('keyup', keyupListenerRef.current);
    }
    keyupListenerRef.current = null;
    textareaRef.current = null;
  }

  // ── Challenge mode props ─────────────────────────────────────────────────
  const minRows = isChallenge ? challenge!.seedData.length : 50;
  const maxRows = isChallenge ? challenge!.seedData.length : undefined;
  const minCols = isChallenge
    ? Math.max(...challenge!.seedData.map((r) => r.length))
    : 26;
  const maxCols = isChallenge
    ? Math.max(...challenge!.seedData.map((r) => r.length))
    : undefined;

  // Stable cells callback — reads ALL state from refs to avoid re-render loops
  const cellsCallbackRef = useRef((row: number, col: number): Handsontable.CellMeta => {
    const key = `${row}:${col}`;
    const locked = isLockedRef.current;
    const acSet = answerCellSetRef.current;
    // Build grade map from current ref
    const gradeMap = new Map<string, string>();
    for (const cg of cellGradesRef.current ?? []) {
      gradeMap.set(`${cg.row}:${cg.col}`, cg.result.status);
    }
    if (locked) {
      if (acSet.has(key)) {
        const gradeStatus = gradeMap.get(key);
        return { readOnly: true, renderer: 'answerCell', gradeStatus } as Handsontable.CellMeta;
      }
      return { readOnly: true };
    }
    if (acSet.has(key)) {
      const gradeStatus = gradeMap.get(key);
      return { readOnly: false, renderer: 'answerCell', gradeStatus } as Handsontable.CellMeta;
    }
    return { readOnly: true };
  });
  const cellsCallback = isChallenge ? cellsCallbackRef.current : undefined;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {!isChallenge && (
        <FormulaBar
          formula={selectedCell.formula}
          value={selectedCell.value}
          cellLabel={`${colIndexToLetter(selectedCell.col)}${selectedCell.row + 1}`}
        />
      )}
      <div className="hot-container" style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        <HotTable
          ref={hotRef}
          // Use challenge key to force full re-mount when challenge changes
          key={isChallenge ? `challenge-${challenge!.id}` : 'freeform'}
          formulas={{ engine: hfInstance, sheetName: 'Sheet1' }}
          themeName="ht-theme-main"
          colHeaders={true}
          rowHeaders={true}
          width="100%"
          height="100%"
          minCols={minCols}
          minRows={minRows}
          {...(maxRows !== undefined ? { maxRows } : {})}
          {...(maxCols !== undefined ? { maxCols } : {})}
          licenseKey="non-commercial-and-evaluation"
          {...(isChallenge
            ? {
                data: challenge!.seedData as Handsontable.CellValue[][],
                cells: cellsCallback,
              }
            : {})}
          beforeKeyDown={(e: KeyboardEvent) => {
            if (!isChallenge || !onGradeCellRef.current) return;
            if (e.key !== 'Enter') return;
            const hot = hotRef.current?.hotInstance;
            if (!hot) return;
            const selected = hot.getSelected();
            if (!selected || selected.length === 0) return;
            const [row, col] = selected[0];
            const key = `${row}:${col}`;
            if (answerCellSetRef.current.has(key) && !isLockedRef.current) {
              enterPressedRef.current = true;
            }
          }}
          afterChange={(changes, source) => {
            if (isChallenge && onGradeCellRef.current && source === 'edit') {
              if (enterPressedRef.current) {
                enterPressedRef.current = false;
                if (changes) {
                  for (const [row, col] of changes) {
                    const key = `${row}:${Number(col)}`;
                    if (answerCellSetRef.current.has(key)) {
                      onGradeCellRef.current!(row as number, Number(col));
                    }
                  }
                }
              }
            }
            if (!isChallenge) {
              // Free-form mode cleanup
              hideAutocomplete();
              cleanupTextareaListener();
            }
          }}
          afterSelection={(row, col) => {
            // Skip state updates in challenge mode — FormulaBar isn't shown
            if (isChallenge) return;
            let formula: string | undefined;
            let value: string | number | boolean | null = null;
            try {
              const rawFormula = hfInstance.getCellFormula({ sheet: 0, row, col });
              formula = rawFormula !== undefined ? String(rawFormula) : undefined;
              const rawValue = hfInstance.getCellValue({ sheet: 0, row, col });
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              value = rawValue !== null && rawValue !== undefined ? (rawValue as any) : null;
            } catch {
              // Cell may not exist in HF yet — fine
            }
            setSelectedCell({ row, col, formula, value });
          }}
          afterBeginEditing={(row, col) => {
            if (isChallenge) return; // No autocomplete in challenge mode
            // Clean up any previous listener
            cleanupTextareaListener();

            const hot = hotRef.current?.hotInstance;
            if (!hot) return;

            // Slight delay lets HOT open the editor DOM before we query it
            setTimeout(() => {
              const editor = hot.getActiveEditor();
              if (!editor) return;
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const textarea = (editor as any).TEXTAREA as HTMLTextAreaElement | undefined;
              if (!textarea) return;

              textareaRef.current = textarea;

              function onKeyup() {
                const val = textarea!.value;
                const match = val.match(/^=([A-Za-z]*)$/);
                if (match) {
                  const cell = hot!.getCell(row, col);
                  if (cell) {
                    const rect = cell.getBoundingClientRect();
                    setAutocomplete({
                      isVisible: true,
                      filterText: match[1].toUpperCase(),
                      position: { top: rect.bottom, left: rect.left },
                    });
                  }
                } else {
                  hideAutocomplete();
                }
              }

              keyupListenerRef.current = onKeyup;
              textarea.addEventListener('keyup', onKeyup);
            }, 0);
          }}
          afterDeselect={() => {
            if (!isChallenge) {
              hideAutocomplete();
              cleanupTextareaListener();
            }
          }}
        />
        {!isChallenge && (
          <FunctionAutocomplete
            isVisible={autocomplete.isVisible}
            filterText={autocomplete.filterText}
            position={autocomplete.position}
            onSelect={handleAutocompleteSelect}
            onHide={hideAutocomplete}
          />
        )}
      </div>
    </div>
  );
}
