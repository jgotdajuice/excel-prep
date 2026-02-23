import type { Shortcut, ShortcutCategory } from '../../types';

export const shortcuts: Shortcut[] = [
  // ── Navigation ─────────────────────────────────────────────────────────────

  {
    id: 'nav-ctrl-arrow-down',
    action: 'Jump to bottom edge of data region',
    keys: { windows: ['Ctrl', 'ArrowDown'], mac: ['Cmd', 'ArrowDown'] },
    category: 'navigation',
    financeContext:
      'Jump to the bottom of a column in a DCF or LBO model to find the last row instantly',
  },
  {
    id: 'nav-ctrl-arrow-up',
    action: 'Jump to top edge of data region',
    keys: { windows: ['Ctrl', 'ArrowUp'], mac: ['Cmd', 'ArrowUp'] },
    category: 'navigation',
    financeContext:
      'Jump to the top of a data column — useful when reviewing assumptions in a large model',
  },
  {
    id: 'nav-ctrl-home',
    action: 'Go to cell A1',
    keys: { windows: ['Ctrl', 'Home'], mac: ['Cmd', 'Home'] },
    category: 'navigation',
    financeContext:
      'Return to the top of any model to start reviewing from the beginning',
  },
  {
    id: 'nav-ctrl-end',
    action: 'Go to last used cell',
    keys: { windows: ['Ctrl', 'End'], mac: ['Cmd', 'End'] },
    category: 'navigation',
    financeContext:
      "Quickly find where a model's data ends to check model size",
  },
  {
    id: 'nav-f5',
    action: 'Open Go To dialog',
    keys: { windows: ['F5'], mac: ['F5'] },
    category: 'navigation',
    financeContext:
      'Navigate directly to a specific cell address (e.g., jump to B47 in a large model)',
    // Note: F5 may trigger browser refresh — preventDefault tested separately in Plan 02
  },
  {
    id: 'nav-ctrl-pgdn',
    action: 'Move to next worksheet tab',
    keys: { windows: ['Ctrl', 'PageDown'], mac: ['Ctrl', 'PageDown'] },
    category: 'navigation',
    financeContext:
      'Navigate between the Income Statement, Balance Sheet, and Cash Flow tabs without a mouse',
  },
  {
    id: 'nav-ctrl-pgup',
    action: 'Move to previous worksheet tab',
    keys: { windows: ['Ctrl', 'PageUp'], mac: ['Ctrl', 'PageUp'] },
    category: 'navigation',
    financeContext:
      'Navigate back between model tabs without lifting hands from keyboard',
  },

  // ── Formula Entry ───────────────────────────────────────────────────────────

  {
    id: 'formula-f4',
    action: 'Toggle absolute/relative cell reference ($A$1 ↔ A$1 ↔ $A1 ↔ A1)',
    keys: { windows: ['F4'], mac: ['F4'] },
    category: 'formula-entry',
    financeContext:
      'Lock a cell reference when building a formula that references a fixed assumption (e.g., discount rate)',
  },
  {
    id: 'formula-f2',
    action: 'Edit cell (enter edit mode)',
    keys: { windows: ['F2'], mac: ['F2'] },
    category: 'formula-entry',
    financeContext:
      'Edit an existing formula in a cell without retyping from scratch',
  },
  {
    id: 'formula-alt-equals',
    action: 'AutoSum selected range',
    keys: { windows: ['Alt', '='], mac: ['Cmd', 'Shift', 'T'] },
    category: 'formula-entry',
    financeContext:
      'Instantly sum a column of revenue or expense figures in a P&L',
  },
  {
    id: 'formula-ctrl-backtick',
    action: 'Toggle show formulas (instead of values)',
    keys: { windows: ['Ctrl', '`'], mac: ['Ctrl', '`'] },
    category: 'formula-entry',
    financeContext:
      'Audit a model by revealing all formulas at once — standard due diligence step',
  },
  {
    id: 'formula-f9',
    action: 'Recalculate all formulas',
    keys: { windows: ['F9'], mac: ['F9'] },
    category: 'formula-entry',
    financeContext:
      'Force recalculation after changing assumptions in a model with circular references',
  },
  {
    id: 'formula-shift-f3',
    action: 'Open Insert Function dialog',
    keys: { windows: ['Shift', 'F3'], mac: ['Shift', 'F3'] },
    category: 'formula-entry',
    financeContext:
      'Look up function syntax while building a complex formula',
  },
  {
    id: 'formula-ctrl-shift-enter',
    action: 'Enter array formula',
    keys: { windows: ['Ctrl', 'Shift', 'Enter'], mac: ['Cmd', 'Shift', 'Enter'] },
    category: 'formula-entry',
    financeContext:
      'Enter multi-cell array calculations — used in advanced sensitivity analysis',
  },

  // ── Formatting ──────────────────────────────────────────────────────────────

  {
    id: 'fmt-ctrl-1',
    action: 'Open Format Cells dialog',
    keys: { windows: ['Ctrl', '1'], mac: ['Cmd', '1'] },
    category: 'formatting',
    financeContext:
      'Access full cell formatting options — number format, borders, alignment in one dialog',
  },
  {
    id: 'fmt-ctrl-b',
    action: 'Bold',
    keys: { windows: ['Ctrl', 'B'], mac: ['Cmd', 'B'] },
    category: 'formatting',
    financeContext:
      'Bold total rows and headers in financial models — standard presentation convention',
  },
  {
    id: 'fmt-ctrl-shift-bang',
    action: 'Apply number format (comma separator, 2 decimals)',
    keys: { windows: ['Ctrl', 'Shift', '!'], mac: ['Cmd', 'Shift', '!'] },
    category: 'formatting',
    financeContext:
      'Format revenue and expense numbers as 1,234.56 for professional financial presentations',
  },
  {
    id: 'fmt-ctrl-shift-percent',
    action: 'Apply percentage format',
    keys: { windows: ['Ctrl', 'Shift', '%'], mac: ['Cmd', 'Shift', '%'] },
    category: 'formatting',
    financeContext:
      'Display discount rates, margins, and growth rates as percentages',
  },
  {
    id: 'fmt-ctrl-shift-hash',
    action: 'Apply date format',
    keys: { windows: ['Ctrl', 'Shift', '#'], mac: ['Cmd', 'Shift', '#'] },
    category: 'formatting',
    financeContext:
      'Format cells containing date values in deal timelines and capital structures',
  },
  {
    id: 'fmt-ctrl-9',
    action: 'Hide rows',
    keys: { windows: ['Ctrl', '9'], mac: ['Cmd', '9'] },
    category: 'formatting',
    financeContext:
      'Hide detail rows to present a summary view of a financial model',
  },
  {
    id: 'fmt-ctrl-shift-9',
    action: 'Unhide rows',
    keys: { windows: ['Ctrl', 'Shift', '9'], mac: ['Cmd', 'Shift', '9'] },
    category: 'formatting',
    financeContext:
      'Reveal hidden detail rows when auditing model structure',
  },
  {
    id: 'fmt-alt-h-b',
    action: 'Open borders menu (ribbon sequence: Alt → H → B)',
    keys: { windows: ['Alt', 'H', 'B'], mac: ['Alt', 'H', 'B'] },
    category: 'formatting',
    financeContext:
      'Apply borders to total rows — standard in IB financial models (press keys in sequence, not simultaneously)',
    sequentialOnly: true,
  },

  // ── Selection & Editing ─────────────────────────────────────────────────────

  {
    id: 'sel-ctrl-shift-arrow',
    action: 'Extend selection to edge of data',
    keys: { windows: ['Ctrl', 'Shift', 'ArrowDown'], mac: ['Cmd', 'Shift', 'ArrowDown'] },
    category: 'selection-editing',
    financeContext:
      'Select an entire column of revenue figures to sum, format, or copy at once',
  },
  {
    id: 'sel-ctrl-d',
    action: 'Fill down (copy cell above into selection)',
    keys: { windows: ['Ctrl', 'D'], mac: ['Cmd', 'D'] },
    category: 'selection-editing',
    financeContext:
      'Propagate a formula from the first year to all subsequent years in a DCF',
  },
  {
    id: 'sel-ctrl-r',
    action: 'Fill right (copy leftmost cell across selection)',
    keys: { windows: ['Ctrl', 'R'], mac: ['Cmd', 'R'] },
    category: 'selection-editing',
    financeContext:
      'Copy a formula from one column across all years in a multi-year model',
  },
  {
    id: 'sel-ctrl-z',
    action: 'Undo',
    keys: { windows: ['Ctrl', 'Z'], mac: ['Cmd', 'Z'] },
    category: 'selection-editing',
    financeContext:
      'Revert accidental changes — essential when editing live models',
  },
  {
    id: 'sel-ctrl-shift-l',
    action: 'Toggle AutoFilter',
    keys: { windows: ['Ctrl', 'Shift', 'L'], mac: ['Cmd', 'Shift', 'L'] },
    category: 'selection-editing',
    financeContext:
      'Add or remove filter dropdowns on a data table for quick analysis',
  },
  {
    id: 'sel-ctrl-minus',
    action: 'Delete selected cells/rows/columns',
    keys: { windows: ['Ctrl', '-'], mac: ['Cmd', '-'] },
    category: 'selection-editing',
    financeContext:
      'Remove rows or columns cleanly when restructuring a model',
  },
  {
    id: 'sel-alt-enter',
    action: 'Insert line break within cell',
    keys: { windows: ['Alt', 'Enter'], mac: ['Cmd', 'Alt', 'Enter'] },
    category: 'selection-editing',
    financeContext:
      'Add multi-line labels in header cells of complex financial tables',
  },
  {
    id: 'sel-ctrl-a',
    action: 'Select all cells in range / entire sheet',
    keys: { windows: ['Ctrl', 'A'], mac: ['Cmd', 'A'] },
    category: 'selection-editing',
    financeContext:
      'Select all data at once for bulk formatting or copying',
  },

  // ── Browser-blocked (reference only — NOT drilled) ──────────────────────────

  {
    id: 'blocked-ctrl-w',
    action: 'Close active workbook/window',
    keys: { windows: ['Ctrl', 'W'], mac: ['Cmd', 'W'] },
    category: 'navigation',
    financeContext:
      'Close the current Excel workbook (important in multi-file analysis workflows)',
    browserBlocked: true,
  },
  {
    id: 'blocked-ctrl-t',
    action: 'Create table (convert range to Excel Table)',
    keys: { windows: ['Ctrl', 'T'], mac: ['Cmd', 'T'] },
    category: 'formatting',
    financeContext:
      'Convert data ranges to structured Excel Tables with auto-expanding formulas',
    browserBlocked: true,
  },
  {
    id: 'blocked-ctrl-n',
    action: 'Create new workbook',
    keys: { windows: ['Ctrl', 'N'], mac: ['Cmd', 'N'] },
    category: 'navigation',
    financeContext:
      'Open a blank Excel workbook for quick calculations',
    browserBlocked: true,
  },
];

/** Shortcuts safe to include in the drill queue (excludes browser-blocked and sequential-only) */
export const drillableShortcuts = shortcuts.filter(
  (s) => !s.browserBlocked && !s.sequentialOnly,
);

/** Shortcuts that cannot be captured in the browser — shown in reference section only */
export const browserBlockedShortcuts = shortcuts.filter((s) => s.browserBlocked);

/** Shortcuts that are sequential key sequences — shown in reference section only */
export const sequentialOnlyShortcuts = shortcuts.filter((s) => s.sequentialOnly);

/** All drillable shortcuts filtered by category */
export const shortcutsByCategory = (category: ShortcutCategory): Shortcut[] =>
  drillableShortcuts.filter((s) => s.category === category);
