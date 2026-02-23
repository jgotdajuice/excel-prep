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
