import type { Challenge } from '../../types';
import { beginnerChallenges } from './beginner';
import { intermediateChallenges } from './intermediate';
import { advancedChallenges } from './advanced';

/**
 * Aggregated challenges array for ExcelPrep.
 *
 * All expected values are engine-verified using buildExcelCompatEngine()
 * from src/engine/formulaEngine.ts (see challenges.test.ts).
 *
 * Tiers:
 * - beginner (24):     SUM, IF, IFERROR, VLOOKUP
 * - intermediate (24): SUMIFS, INDEX/MATCH, NPV, PMT
 * - advanced (18):     IRR, XLOOKUP, XNPV, OFFSET
 *
 * Total: 66 challenges
 */
export const challenges: Challenge[] = [
  ...beginnerChallenges,
  ...intermediateChallenges,
  ...advancedChallenges,
];
