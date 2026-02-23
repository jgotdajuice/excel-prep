import { describe, it, expect } from 'vitest';
import { buildExcelCompatEngine } from '../../engine/formulaEngine';
import type { Challenge } from '../../types';
import { beginnerChallenges } from './beginner';

/**
 * Engine-verification test suite for all challenge content.
 *
 * For each challenge:
 *   1. Build a fresh HyperFormula engine (Excel-compat config)
 *   2. Load seedData into sheet 0 with setCellContents
 *   3. Set the correctFormula into each answerCell position
 *   4. Evaluate the cell and assert result matches expectedValue (with tolerance)
 *
 * This ensures every expectedValue is a ground-truth engine output, not a manual estimate.
 */

/** Convert 0-indexed (row, col) to HyperFormula SimpleCellAddress */
function addr(row: number, col: number) {
  return { sheet: 0, row, col };
}

/**
 * Engine-verify a single challenge.
 * Returns an object with pass/fail per answer cell.
 */
function verifyChallenge(challenge: Challenge): { cellIndex: number; got: unknown; expected: unknown; pass: boolean }[] {
  const engine = buildExcelCompatEngine();

  // buildEmpty() creates no sheets — add one before loading data
  engine.addSheet('Sheet1');

  // Load seed data
  engine.setCellContents({ sheet: 0, row: 0, col: 0 }, challenge.seedData);

  const results = challenge.answerCells.map((ac, idx) => {
    // Set the formula into the answer cell
    engine.setCellContents(addr(ac.row, ac.col), [[challenge.correctFormula]]);

    const got = engine.getCellValue(addr(ac.row, ac.col));
    const expected = ac.expectedValue;
    const tolerance = ac.tolerance ?? 0.01;

    let pass: boolean;
    if (typeof expected === 'number' && typeof got === 'number') {
      pass = Math.abs(got - expected) <= tolerance;
    } else {
      pass = got === expected;
    }

    return { cellIndex: idx, got, expected, pass };
  });

  engine.destroy();
  return results;
}

describe('Beginner Challenge Engine Verification', () => {
  for (const challenge of beginnerChallenges) {
    it(`[${challenge.id}] ${challenge.title}`, () => {
      const results = verifyChallenge(challenge);
      for (const r of results) {
        expect(
          r.pass,
          `Cell[${r.cellIndex}]: expected ${JSON.stringify(r.expected)} but got ${JSON.stringify(r.got)}`,
        ).toBe(true);
      }
    });
  }
});
