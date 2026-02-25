export type Tier = 'beginner' | 'intermediate' | 'advanced';

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
  /** Optional difficulty tag — alias for tier; use tier for authoritative value */
  difficulty?: Tier;
  /** Authoritative learning path tier */
  tier: Tier;
  /** Short prompt for drill mode with inline data (no grid references). Falls back to prompt if absent. */
  drillPrompt?: string;
  /** Exact expected answer string in drill mode */
  drillAnswer: string;
  /** Whether drill asks for full formula or just function name */
  drillAnswerScope: 'formula' | 'function';
  /** 3 wrong options for multiple choice mode */
  drillWrongOptions: string[];
}

export interface DrillQuestion {
  challengeId: string;
  prompt: string;
  correctAnswer: string;
  answerScope: 'formula' | 'function';
  wrongOptions: string[];
  tier: Tier;
  category: string;
  explanation: string;
  correctFormula: string;
}

export function challengeToDrillQuestion(c: Challenge): DrillQuestion {
  return {
    challengeId: c.id,
    prompt: c.drillPrompt ?? c.prompt,
    correctAnswer: c.drillAnswer,
    answerScope: c.drillAnswerScope,
    wrongOptions: c.drillWrongOptions,
    tier: c.tier,
    category: c.category ?? 'General',
    explanation: c.explanation,
    correctFormula: c.correctFormula,
  };
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

// ── Function Reference Types ────────────────────────────────────────────────

export interface FunctionParameter {
  name: string;
  description: string;
  optional?: boolean;
}

export interface FunctionReference {
  name: string;
  syntax: string;
  description: string;
  parameters: FunctionParameter[];
  example: { scenario: string; formula: string; result: string };
  whenToUse: string;
  tier: Tier;
  category: string;
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
