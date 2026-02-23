import { useEffect, useRef, useState } from 'react';
import { HotTable } from '@handsontable/react-wrapper';
import type { HotTableRef } from '@handsontable/react-wrapper';
import { registerAllModules } from 'handsontable/registry';
import 'handsontable/styles/handsontable.min.css';
import 'handsontable/styles/ht-theme-main.min.css';
import { buildExcelCompatEngine } from '../engine/formulaEngine';
import { FormulaBar } from './FormulaBar';
import { FunctionAutocomplete } from './FunctionAutocomplete';
import type { SelectedCellState } from '../types';

// Register all Handsontable modules once at module level
registerAllModules();

// HyperFormula instance must live outside React state to avoid proxy breakage
const hfInstance = buildExcelCompatEngine();

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

export function SpreadsheetGrid() {
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

  // Set localStorage flag so WelcomePage can show "Continue" on next visit
  useEffect(() => {
    localStorage.setItem('hasStarted', 'true');
  }, []);

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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <FormulaBar
        formula={selectedCell.formula}
        value={selectedCell.value}
        cellLabel={`${colIndexToLetter(selectedCell.col)}${selectedCell.row + 1}`}
      />
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        <HotTable
          ref={hotRef}
          formulas={{ engine: hfInstance, sheetName: 'Sheet1' }}
          themeName="ht-theme-main"
          colHeaders={true}
          rowHeaders={true}
          width="100%"
          height="100%"
          minCols={26}
          minRows={50}
          licenseKey="non-commercial-and-evaluation"
          afterSelection={(row, col) => {
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
          afterChange={() => {
            // After a cell value is committed, hide the autocomplete and clean up
            hideAutocomplete();
            cleanupTextareaListener();
          }}
          afterDeselect={() => {
            // When focus moves away from the grid entirely
            hideAutocomplete();
            cleanupTextareaListener();
          }}
        />
        <FunctionAutocomplete
          isVisible={autocomplete.isVisible}
          filterText={autocomplete.filterText}
          position={autocomplete.position}
          onSelect={handleAutocompleteSelect}
          onHide={hideAutocomplete}
        />
      </div>
    </div>
  );
}
