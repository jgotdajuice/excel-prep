import { HyperFormula } from 'hyperformula';

/**
 * Creates a HyperFormula engine instance configured for Excel compatibility.
 *
 * Critical config for correct finance formula results:
 * - evaluateNullToZero: Excel treats empty cells as 0 in arithmetic
 * - leapYear1900: Excel's documented 1900 leap-year bug (Lotus 1-2-3 compatibility)
 * - nullDate: Excel's date baseline (Jan 0, 1900 = Dec 31, 1899)
 * - licenseKey: Required when used with Handsontable's formulas plugin
 *
 * Source: https://hyperformula.handsontable.com/guide/compatibility-with-microsoft-excel.html
 */
export function buildExcelCompatEngine(): HyperFormula {
  return HyperFormula.buildEmpty({
    licenseKey: 'internal-use-in-handsontable',
    evaluateNullToZero: true,
    leapYear1900: true,
    nullDate: { year: 1899, month: 12, day: 31 },
    localeLang: 'en-US',
    functionArgSeparator: ',',
    decimalSeparator: '.',
    thousandSeparator: '',
    caseSensitive: false,
    useWildcards: true,
    useRegularExpressions: false,
    smartRounding: true,
  });
}

/** Finance functions supported in the grid (GRID-02 scope) */
export const FINANCE_FUNCTIONS = [
  'SUM',
  'AVERAGE',
  'COUNT',
  'COUNTIF',
  'VLOOKUP',
  'INDEX',
  'MATCH',
  'SUMIFS',
  'IF',
  'IFERROR',
  'NPV',
  'IRR',
  'PMT',
  'XNPV',
] as const;

export type FinanceFunction = (typeof FINANCE_FUNCTIONS)[number];
