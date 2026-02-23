export interface CellAddress {
  sheet: number;
  row: number;
  col: number;
}

export interface SelectedCellState {
  row: number;
  col: number;
  formula: string | undefined;
  value: number | string | boolean | null;
}

export type CellContent = string | number | boolean | null;

export interface AnswerCell {
  row: number;
  col: number;
  expectedValue: number | string | boolean;
  /** Tolerance for numeric comparison. Default 0.01. Use 0.0005 for IRR. */
  tolerance?: number;
}

export interface Challenge {
  id: string;
  title: string;
  /** Finance scenario prompt shown in right panel */
  prompt: string;
  /** Function name revealed by "Show hint" button */
  hintFunction: string;
  /** Correct formula string shown in explanation */
  correctFormula: string;
  /** Explanation text (may include interview tips) */
  explanation: string;
  /** 2D array of seed data (same format as HyperFormula RawCellContent) */
  seedData: (string | number | boolean | null)[][];
  /** Answer cells that the user edits */
  answerCells: AnswerCell[];
  /** Optional function category tag */
  category?: string;
  /** Optional difficulty tag */
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
}

export type ChallengeStatus = 'unattempted' | 'correct' | 'incorrect' | 'skipped';

export interface GradeResult {
  status: 'correct' | 'incorrect' | 'error';
  /** For incorrect: the computed value */
  gotValue?: number | string | boolean;
  /** For incorrect: the expected value */
  expectedValue?: number | string | boolean;
  /** For error: the Excel error string, e.g. '#VALUE!' */
  errorCode?: string;
}

// ── Keyboard Shortcut Types ─────────────────────────────────────────────────

export type ShortcutCategory =
  | 'navigation'
  | 'formula-entry'
  | 'formatting'
  | 'selection-editing';

export interface ShortcutKeys {
  /** Key array for Windows, e.g. ['Ctrl', 'D'] or ['F4'] or ['Alt', '='] */
  windows: string[];
  /** Key array for Mac, e.g. ['Cmd', 'D'] or ['F4'] */
  mac: string[];
}

export interface Shortcut {
  id: string;
  /** What the shortcut does, e.g. "Fill Down" */
  action: string;
  keys: ShortcutKeys;
  category: ShortcutCategory;
  /** Brief IB workflow context for why this shortcut matters */
  financeContext: string;
  /** true = cannot be captured in browser (Ctrl+W, Ctrl+T, Ctrl+N) */
  browserBlocked?: boolean;
  /** true = sequential ribbon sequence (Alt+H+B), cannot be drilled as chord */
  sequentialOnly?: boolean;
}

export interface DrillResult {
  shortcut: Shortcut;
  correct: boolean;
  /** Milliseconds from question shown to answer submitted */
  responseMs: number;
}

export type OSMode = 'windows' | 'mac';

export type DrillMode = 'practice' | 'timed';

/** Action→Keys: user presses the key combo; Keys→Action: user picks correct action (multiple choice) */
export type DrillDirection = 'action-to-keys' | 'keys-to-action';

export type DrillState = 'idle' | 'drilling' | 'feedback' | 'summary';
