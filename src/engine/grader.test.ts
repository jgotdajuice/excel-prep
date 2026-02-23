import { describe, it, expect } from 'vitest';
import { DetailedCellError, CellError, ErrorType } from 'hyperformula';
import { gradeCell } from './grader';
import type { AnswerCell } from '../types';

describe('gradeCell', () => {
  // 1. Correct numeric value within tolerance
  it('returns correct when numeric value is within default tolerance (0.01)', () => {
    const answerCell: AnswerCell = { row: 0, col: 0, expectedValue: 188.71 };
    const result = gradeCell(188.7148, answerCell);
    expect(result).toEqual({ status: 'correct' });
  });

  // 2. Incorrect numeric value outside tolerance
  it('returns incorrect with gotValue and expectedValue when outside tolerance', () => {
    const answerCell: AnswerCell = { row: 0, col: 0, expectedValue: 100 };
    const result = gradeCell(99, answerCell);
    expect(result).toEqual({ status: 'incorrect', gotValue: 99, expectedValue: 100 });
  });

  // 3. Correct string value
  it('returns correct for exact string match', () => {
    const answerCell: AnswerCell = { row: 0, col: 0, expectedValue: 'Medium' };
    const result = gradeCell('Medium', answerCell);
    expect(result).toEqual({ status: 'correct' });
  });

  // 4. Incorrect string value
  it('returns incorrect with gotValue and expectedValue for wrong string', () => {
    const answerCell: AnswerCell = { row: 0, col: 0, expectedValue: 'Large' };
    const result = gradeCell('Small', answerCell);
    expect(result).toEqual({ status: 'incorrect', gotValue: 'Small', expectedValue: 'Large' });
  });

  // 5. DetailedCellError instance → error with errorCode
  it('returns error with errorCode for DetailedCellError', () => {
    const answerCell: AnswerCell = { row: 0, col: 0, expectedValue: 42 };
    const cellError = new DetailedCellError(new CellError(ErrorType.VALUE), '#VALUE!');
    const result = gradeCell(cellError, answerCell);
    expect(result).toEqual({ status: 'error', errorCode: '#VALUE!' });
  });

  // 6. Tolerance edge case: 188.7148 vs 188.71 within 0.01
  it('tolerance edge case: 188.7148 - 188.71 = 0.0048 <= 0.01 → correct', () => {
    const answerCell: AnswerCell = { row: 0, col: 0, expectedValue: 188.71 };
    expect(Math.abs(188.7148 - 188.71)).toBeLessThanOrEqual(0.01);
    const result = gradeCell(188.7148, answerCell);
    expect(result.status).toBe('correct');
  });

  // 7. Custom tolerance (IRR-style): tighter 0.0005
  it('uses custom tolerance when specified (IRR-style 0.0005)', () => {
    const answerCell: AnswerCell = { row: 0, col: 0, expectedValue: 0.097, tolerance: 0.0005 };
    // 0.097 vs 0.0971 → diff 0.0001 <= 0.0005 → correct
    expect(gradeCell(0.0971, answerCell)).toEqual({ status: 'correct' });
    // 0.097 vs 0.098 → diff 0.001 > 0.0005 → incorrect
    const wrong = gradeCell(0.098, answerCell);
    expect(wrong.status).toBe('incorrect');
  });

  // 8. null cell value (empty cell) vs numeric expected → incorrect
  it('treats null (empty cell) as incorrect for numeric expected', () => {
    const answerCell: AnswerCell = { row: 0, col: 0, expectedValue: 50000 };
    const result = gradeCell(null, answerCell);
    expect(result.status).toBe('incorrect');
  });
});
