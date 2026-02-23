import { DetailedCellError } from 'hyperformula';
import type { AnswerCell, GradeResult } from '../types';

/**
 * Grades a single cell value against an expected answer.
 *
 * Handles three cases:
 * - DetailedCellError: formula produced an Excel error (e.g. #VALUE!, #DIV/0!)
 * - Numeric: uses tolerance comparison (default 0.01) to handle float imprecision
 * - Exact match: string and boolean comparisons use strict equality
 */
export function gradeCell(
  cellValue: unknown,
  answerCell: AnswerCell,
): GradeResult {
  if (cellValue instanceof DetailedCellError) {
    return { status: 'error', errorCode: cellValue.value };
  }

  const { expectedValue, tolerance = 0.01 } = answerCell;

  if (typeof expectedValue === 'number' && typeof cellValue === 'number') {
    return Math.abs(cellValue - expectedValue) <= tolerance
      ? { status: 'correct' }
      : { status: 'incorrect', gotValue: cellValue, expectedValue };
  }

  return cellValue === expectedValue
    ? { status: 'correct' }
    : { status: 'incorrect', gotValue: cellValue as string | boolean, expectedValue };
}
