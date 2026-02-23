import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { HyperFormula } from 'hyperformula';
import { buildExcelCompatEngine } from './formulaEngine';

/**
 * HyperFormula Excel compatibility smoke test suite.
 * Verifies all 12 GRID-02 finance functions produce outputs matching known Excel values.
 *
 * Each test creates a fresh engine instance, loads known inputs, evaluates a formula,
 * and asserts the result matches the known Excel output.
 *
 * Notes on discrepancies vs plan:
 * - VLOOKUP: HyperFormula requires numeric 0 for exact match (not boolean FALSE literal).
 *   This is consistent with Excel behavior — VLOOKUP(2,A1:B3,2,0) is valid Excel syntax.
 * - NPV: NPV(0.10, 300,400,400)+(-1000) = -96.17 (not 9.99 from research doc).
 *   Research doc used different inputs (NPV(A1,B1:E1) with B1=-1000 as first cash flow).
 *   When initial outlay is first cash flow argument, NPV discounts it — that gives different result.
 *   Correct pattern: NPV(rate, future_cfs) + initial_outlay. Verified: -96.17 matches Excel.
 * - XNPV: HyperFormula returns 1092.62 (not ~1106). Verified against XNPV formula math —
 *   1092.62 is the correct Excel-compatible output for the given date serials.
 */

// Helper: create a fresh engine + single sheet for each test
function makeEngine(): HyperFormula {
  const hf = buildExcelCompatEngine();
  hf.addSheet('Sheet1');
  return hf;
}

describe('HyperFormula Excel compatibility — GRID-02 functions', () => {
  let hf: HyperFormula;

  beforeEach(() => {
    hf = makeEngine();
  });

  afterEach(() => {
    hf.destroy();
  });

  // ── Aggregate functions ────────────────────────────────────────────────────

  it('SUM: =SUM(A1:A3) with [10,20,30] → 60', () => {
    hf.setCellContents({ sheet: 0, row: 0, col: 0 }, [[10], [20], [30]]);
    hf.setCellContents({ sheet: 0, row: 0, col: 1 }, [['=SUM(A1:A3)']]);
    const result = hf.getCellValue({ sheet: 0, row: 0, col: 1 });
    expect(result).toBe(60);
  });

  it('AVERAGE: =AVERAGE(A1:A3) with [10,20,30] → 20', () => {
    hf.setCellContents({ sheet: 0, row: 0, col: 0 }, [[10], [20], [30]]);
    hf.setCellContents({ sheet: 0, row: 0, col: 1 }, [['=AVERAGE(A1:A3)']]);
    const result = hf.getCellValue({ sheet: 0, row: 0, col: 1 });
    expect(result).toBe(20);
  });

  it('COUNT: =COUNT(A1:A3) with [10,20,30] → 3', () => {
    // COUNT counts numeric values. Using purely numeric range for clarity.
    hf.setCellContents({ sheet: 0, row: 0, col: 0 }, [[10], [20], [30]]);
    hf.setCellContents({ sheet: 0, row: 0, col: 1 }, [['=COUNT(A1:A3)']]);
    const result = hf.getCellValue({ sheet: 0, row: 0, col: 1 });
    expect(result).toBe(3);
  });

  it('COUNTIF: =COUNTIF(A1:A4,">15") with [10,20,30,5] → 2', () => {
    hf.setCellContents({ sheet: 0, row: 0, col: 0 }, [[10], [20], [30], [5]]);
    hf.setCellContents({ sheet: 0, row: 0, col: 1 }, [['=COUNTIF(A1:A4,">15")']]);
    const result = hf.getCellValue({ sheet: 0, row: 0, col: 1 });
    expect(result).toBe(2);
  });

  // ── Lookup functions ───────────────────────────────────────────────────────

  it('VLOOKUP: =VLOOKUP(2,A1:B3,2,0) → "Banana"', () => {
    // Note: HyperFormula requires 0 (numeric) for exact match, not boolean FALSE.
    // This is valid Excel syntax — VLOOKUP(lookup,range,col,0) works in Excel too.
    hf.setCellContents({ sheet: 0, row: 0, col: 0 }, [
      [1, 'Apple'],
      [2, 'Banana'],
      [3, 'Cherry'],
    ]);
    hf.setCellContents({ sheet: 0, row: 0, col: 2 }, [['=VLOOKUP(2,A1:B3,2,0)']]);
    const result = hf.getCellValue({ sheet: 0, row: 0, col: 2 });
    expect(result).toBe('Banana');
  });

  it('INDEX/MATCH: =INDEX(B1:B3,MATCH(2,A1:A3,0)) → "Banana"', () => {
    hf.setCellContents({ sheet: 0, row: 0, col: 0 }, [
      [1, 'Apple'],
      [2, 'Banana'],
      [3, 'Cherry'],
    ]);
    hf.setCellContents({ sheet: 0, row: 0, col: 2 }, [['=INDEX(B1:B3,MATCH(2,A1:A3,0))']]);
    const result = hf.getCellValue({ sheet: 0, row: 0, col: 2 });
    expect(result).toBe('Banana');
  });

  // ── Conditional aggregate ──────────────────────────────────────────────────

  it('SUMIFS: =SUMIFS(B1:B4,A1:A4,"East") → 250', () => {
    hf.setCellContents({ sheet: 0, row: 0, col: 0 }, [
      ['East', 100],
      ['West', 200],
      ['East', 150],
      ['North', 50],
    ]);
    hf.setCellContents({ sheet: 0, row: 0, col: 2 }, [['=SUMIFS(B1:B4,A1:A4,"East")']]);
    const result = hf.getCellValue({ sheet: 0, row: 0, col: 2 });
    expect(result).toBe(250);
  });

  // ── Logical functions ──────────────────────────────────────────────────────

  it('IF (simple): =IF(A1>50,"Pass","Fail") with A1=75 → "Pass"', () => {
    hf.setCellContents({ sheet: 0, row: 0, col: 0 }, [[75]]);
    hf.setCellContents({ sheet: 0, row: 0, col: 1 }, [['=IF(A1>50,"Pass","Fail")']]);
    const result = hf.getCellValue({ sheet: 0, row: 0, col: 1 });
    expect(result).toBe('Pass');
  });

  it('IF (nested): =IF(A1>=90,"A",IF(A1>=80,"B",IF(A1>=70,"C","F"))) with A1=85 → "B"', () => {
    hf.setCellContents({ sheet: 0, row: 0, col: 0 }, [[85]]);
    hf.setCellContents({ sheet: 0, row: 0, col: 1 }, [
      ['=IF(A1>=90,"A",IF(A1>=80,"B",IF(A1>=70,"C","F")))'],
    ]);
    const result = hf.getCellValue({ sheet: 0, row: 0, col: 1 });
    expect(result).toBe('B');
  });

  // ── Finance functions ──────────────────────────────────────────────────────

  it('NPV: =NPV(A1,C1:E1)+B1 with rate=0.10, initial=-1000, cf=[300,400,400] → ~-96.17', () => {
    // NPV(10%, 300, 400, 400) + (-1000)
    // = 300/1.1 + 400/1.21 + 400/1.331 - 1000
    // = 272.73 + 330.58 + 300.53 - 1000 = -96.17
    //
    // Note: The research doc cited "9.99" which corresponds to a different cash flow pattern.
    // The pattern here matches the standard Excel NPV: NPV(rate, future_cfs) + initial_outlay.
    // HyperFormula returns -96.17, which is the correct Excel-compatible output.
    hf.setCellContents({ sheet: 0, row: 0, col: 0 }, [[0.10, -1000, 300, 400, 400]]);
    hf.setCellContents({ sheet: 0, row: 1, col: 0 }, [['=NPV(A1,C1:E1)+B1']]);
    const result = hf.getCellValue({ sheet: 0, row: 1, col: 0 }) as number;
    expect(result).toBeCloseTo(-96.17, 0);
  });

  it('IRR: =IRR(A1:A4) with [-1000,400,400,400] → ~9.70%', () => {
    hf.setCellContents({ sheet: 0, row: 0, col: 0 }, [[-1000], [400], [400], [400]]);
    hf.setCellContents({ sheet: 0, row: 0, col: 1 }, [['=IRR(A1:A4)']]);
    const result = hf.getCellValue({ sheet: 0, row: 0, col: 1 }) as number;
    // Known Excel output: ~9.70% (0.0970)
    expect(result).toBeCloseTo(0.0970, 2);
  });

  it('PMT: =PMT(A1,B1,C1) with rate=0.05/12, nper=60, pv=-10000 → ~188.71', () => {
    hf.setCellContents({ sheet: 0, row: 0, col: 0 }, [[0.05 / 12, 60, -10000]]);
    hf.setCellContents({ sheet: 0, row: 0, col: 3 }, [['=PMT(A1,B1,C1)']]);
    const result = hf.getCellValue({ sheet: 0, row: 0, col: 3 }) as number;
    // Known Excel output: 188.71 (monthly payment on 10k loan, 5% annual, 5 years)
    expect(result).toBeCloseTo(188.71, 2);
  });

  it('XNPV: =XNPV(rate,values,dates) with rate=10%, cash flows and date serials → ~1092.62', () => {
    // XNPV with rate=0.1
    // Cash flows: -10000 on 2020-01-01, 2750 on 2020-06-01, 4250 on 2021-01-01, 5250 on 2021-06-01
    // Excel date serial numbers (1900 date system, leapYear1900 bug included):
    // 2020-01-01 = 43831, 2020-06-01 = 43983, 2021-01-01 = 44197, 2021-06-01 = 44348
    //
    // HyperFormula XNPV returns ~1092.62 for these inputs (verified by running the engine).
    // This is the correct Excel-compatible output — the "~1106" in the plan was an approximation.
    hf.setCellContents({ sheet: 0, row: 0, col: 0 }, [[0.1]]);
    // Values in col A (rows 1-4)
    hf.setCellContents({ sheet: 0, row: 1, col: 0 }, [[-10000], [2750], [4250], [5250]]);
    // Date serials in col B (rows 1-4)
    hf.setCellContents({ sheet: 0, row: 1, col: 1 }, [[43831], [43983], [44197], [44348]]);
    // XNPV formula: rate in A1, values in A2:A5, dates in B2:B5
    hf.setCellContents({ sheet: 0, row: 0, col: 2 }, [['=XNPV(A1,A2:A5,B2:B5)']]);
    const result = hf.getCellValue({ sheet: 0, row: 0, col: 2 });
    expect(typeof result).toBe('number');
    expect(result as number).toBeCloseTo(1092.62, 0);
  });
});
