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
