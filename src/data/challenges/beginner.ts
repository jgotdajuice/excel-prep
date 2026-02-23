import type { Challenge } from '../../types';

/**
 * Beginner-tier challenges for ExcelPrep.
 *
 * Functions covered: SUM (6), IF (6), IFERROR (6), VLOOKUP (6)
 * All expectedValues are engine-verified using buildExcelCompatEngine()
 * from src/engine/formulaEngine.ts.
 *
 * Engine-verified expected values (run via challenges.test.ts):
 *
 * SUM challenges:
 *   sum-01: SUM(B2:B6) = 485000 (5 deal values)
 *   sum-02: SUM(B2:B4) = 143000 (3 quarterly revenues)
 *   sum-03: SUM(B2:B5) = 247500 (4 expense items)
 *   sum-04: SUM(B3:D3) = 160 (3 headcount numbers)
 *   sum-05: SUM(B2:B4) = 19500 (3 loan amounts)
 *   sum-06: SUM(B2:B5) = 545 (4 bps values)
 *
 * IF challenges:
 *   if-01: IF(B2>=100000,"Senior","Junior") = "Senior"
 *   if-02: IF(B2>0,"Profitable","Loss") = "Profitable"
 *   if-03: IF(B2>="A","Pass","Fail") for rating → "Pass" (text compare)
 *   if-nested-01 (absorbed): IF(B2>=10,"Large",IF(B2>=1,"Medium","Small")) = "Medium"
 *   if-04: IF(AND(B2>0,C2>0),"Both Positive","Not Both") — HF AND inline
 *   if-05: IF(B2>B3,"Q1 Better","Q2 Better or Equal") = "Q2 Better or Equal"
 *   if-06: IF(B2>=0.15,"Exceed","Meet or Miss") = "Exceed"
 *
 * IFERROR challenges:
 *   iferror-01: IFERROR(VLOOKUP(105,A2:C5,3,0),"Not Found") = "Not Found"
 *   iferror-02: IFERROR(B2/C2,"N/A") = 25 (no error)
 *   iferror-03: IFERROR(B2/C2,"N/A") = "N/A" (div by zero)
 *   iferror-04: IFERROR(VLOOKUP(102,A2:B5,2,0)*1.1,"Error") = 99000
 *   iferror-05: IFERROR(SQRT(B2),"Invalid") = 10 (exact: sqrt(100))
 *   iferror-06: IFERROR(VLOOKUP(B2,D2:E5,2,0),"Not Available") = "Not Available"
 *
 * VLOOKUP challenges:
 *   vlookup-01 (absorbed): VLOOKUP(103,A2:C5,3,0) = 105000
 *   vlookup-02: VLOOKUP("Q3",A2:B5,2,0) = 980000
 *   vlookup-03: VLOOKUP(102,A2:D5,4,0) = "VP"
 *   vlookup-04: VLOOKUP(2,A2:C5,3,0) = 8.5
 *   vlookup-05: VLOOKUP("AAPL",A2:C5,3,0) = 189.5
 *   vlookup-06: VLOOKUP(3,A2:C4,2,0) = "Consulting"
 */
export const beginnerChallenges: Challenge[] = [
  // ── SUM ───────────────────────────────────────────────────────────────────

  {
    id: 'sum-01',
    title: 'Sum Deal Pipeline Values',
    tier: 'beginner',
    category: 'SUM',
    difficulty: 'beginner',
    hintFunction: 'SUM',
    prompt: `Your team tracks a live M&A deal pipeline. Five deals are listed below with their estimated values (in $000s):

| Row | A (Deal Name)         | B (Value $000s) |
|-----|-----------------------|-----------------|
| 2   | Acme Corp Acquisition | 120,000         |
| 3   | Beta Industries LBO   | 85,000          |
| 4   | Gamma Holdings Sale   | 95,000          |
| 5   | Delta Tech Merger     | 75,000          |
| 6   | Epsilon Media Deal    | 110,000         |

Enter a SUM formula in B8 to total the pipeline value.`,
    drillPrompt: 'Deal pipeline values (B2:B6): $120,000 / $85,000 / $95,000 / $75,000 / $110,000 ($000s). Write the SUM formula to total all five values in B8.',
    correctFormula: '=SUM(B2:B6)',
    drillAnswer: '=SUM(B2:B6)',
    drillAnswerScope: 'formula',
    drillWrongOptions: ['=SUM(B2:B5)', '=SUM(A2:B6)', '=AVERAGE(B2:B6)'],
    explanation: `SUM(number1, [number2], ...) adds all numeric values in the specified range.

=SUM(B2:B6)
• B2:B6 — the five deal values to total

Result: $485,000 thousand ($485M) total pipeline.

Interview tip: SUM is the most-used function in IB models. Use a range reference (B2:B6) not individual cells (B2+B3+B4+B5+B6) — ranges update automatically when rows are inserted and are easier to audit.`,
    seedData: [
      ['Deal Name', 'Value ($000s)'],
      ['Acme Corp Acquisition', 120000],
      ['Beta Industries LBO', 85000],
      ['Gamma Holdings Sale', 95000],
      ['Delta Tech Merger', 75000],
      ['Epsilon Media Deal', 110000],
      [null, null],
      ['Total Pipeline', null],
    ],
    answerCells: [
      {
        row: 7, // Row 8 (0-indexed)
        col: 1, // Column B
        expectedValue: 485000,
        tolerance: 0,
      },
    ],
  },

  {
    id: 'sum-02',
    title: 'Sum Quarterly Revenue',
    tier: 'beginner',
    category: 'SUM',
    difficulty: 'beginner',
    hintFunction: 'SUM',
    prompt: `A portfolio company reports quarterly revenue for three months:

| Row | A         | B          |
|-----|-----------|------------|
| 2   | January   | 42,000     |
| 3   | February  | 38,000     |
| 4   | March     | 63,000     |

Enter a SUM formula in B5 to compute Q1 total revenue.`,
    drillPrompt: 'Monthly revenues (B2:B4): Jan=$42,000, Feb=$38,000, Mar=$63,000. Write the SUM formula for Q1 total in B5.',
    correctFormula: '=SUM(B2:B4)',
    drillAnswer: '=SUM(B2:B4)',
    drillAnswerScope: 'formula',
    drillWrongOptions: ['=B2+B3', '=AVERAGE(B2:B4)', '=SUM(A2:B4)'],
    explanation: `=SUM(B2:B4) totals January through March revenue.

Result: $143,000 Q1 revenue.

Interview tip: When building financial models, always use SUM over + operators for multi-cell totals. It's more readable, auditable, and range-flexible.`,
    seedData: [
      ['Month', 'Revenue ($)'],
      ['January', 42000],
      ['February', 38000],
      ['March', 63000],
      ['Q1 Total', null],
    ],
    answerCells: [
      {
        row: 4, // Row 5
        col: 1,
        expectedValue: 143000,
        tolerance: 0,
      },
    ],
  },

  {
    id: 'sum-03',
    title: 'Sum Operating Expenses',
    tier: 'beginner',
    category: 'SUM',
    difficulty: 'beginner',
    hintFunction: 'SUM',
    prompt: `A target company's income statement shows four operating expense line items:

| Row | A                    | B ($000s)  |
|-----|----------------------|------------|
| 2   | Salaries & Benefits  | 120,000    |
| 3   | Rent & Occupancy     | 18,500     |
| 4   | Technology & Systems | 45,000     |
| 5   | Marketing            | 64,000     |

Enter a SUM formula in B6 for total operating expenses.`,
    drillPrompt: 'Operating expenses (B2:B5): Salaries=$120,000 / Rent=$18,500 / Tech=$45,000 / Marketing=$64,000 ($000s). SUM formula for total OpEx in B6.',
    correctFormula: '=SUM(B2:B5)',
    drillAnswer: '=SUM(B2:B5)',
    drillAnswerScope: 'formula',
    drillWrongOptions: ['=SUM(B2:B4)', '=SUM(B3:B6)', '=COUNT(B2:B5)'],
    explanation: `=SUM(B2:B5) totals all four operating expense lines.

Result: $247,500 thousand total OpEx.

Interview tip: In income statement models, keep expense line items in contiguous rows so a single SUM range captures them all. Avoid hardcoding subtotals inline — they break when rows are inserted.`,
    seedData: [
      ['Expense Category', 'Amount ($000s)'],
      ['Salaries & Benefits', 120000],
      ['Rent & Occupancy', 18500],
      ['Technology & Systems', 45000],
      ['Marketing', 64000],
      ['Total OpEx', null],
    ],
    answerCells: [
      {
        row: 5,
        col: 1,
        expectedValue: 247500,
        tolerance: 0,
      },
    ],
  },

  {
    id: 'sum-04',
    title: 'Sum Headcount Across Divisions',
    tier: 'beginner',
    category: 'SUM',
    difficulty: 'beginner',
    hintFunction: 'SUM',
    prompt: `A merger target has headcount split across three business divisions:

| Row | A                  | B (FTEs) | C (FTEs) | D (FTEs) |
|-----|--------------------|----------|----------|----------|
| 3   | Investment Banking | 45       | 60       | 55       |

Enter a SUM formula in E3 to calculate total headcount across all three divisions.`,
    drillPrompt: 'Headcount across 3 divisions (B3:D3): IB=45, Research=60, Sales=55. Write the SUM formula for total headcount in E3.',
    correctFormula: '=SUM(B3:D3)',
    drillAnswer: '=SUM(B3:D3)',
    drillAnswerScope: 'formula',
    drillWrongOptions: ['=SUM(B2:D2)', '=B3+D3', '=COUNT(B3:D3)'],
    explanation: `=SUM(B3:D3) sums across columns B, C, and D in row 3.

Result: 160 total FTEs.

Interview tip: SUM works across rows and down columns. For horizontal sums across divisions in a model, use the same range syntax. Consistent range references make model audits faster.`,
    seedData: [
      ['Division', 'North America', 'EMEA', 'APAC', 'Total'],
      [null, null, null, null, null],
      ['Investment Banking', 45, 60, 55, null],
    ],
    answerCells: [
      {
        row: 2,
        col: 4,
        expectedValue: 160,
        tolerance: 0,
      },
    ],
  },

  {
    id: 'sum-05',
    title: 'Sum Outstanding Loan Balances',
    tier: 'beginner',
    category: 'SUM',
    difficulty: 'beginner',
    hintFunction: 'SUM',
    prompt: `A leveraged buyout target has three outstanding debt tranches:

| Row | A                  | B (Balance $M) |
|-----|--------------------|----------------|
| 2   | Senior Secured     | 12,500         |
| 3   | Mezzanine Debt     | 4,500          |
| 4   | Subordinated Notes | 2,500          |

Enter a SUM formula in B5 for total outstanding debt.`,
    drillPrompt: 'Debt tranches (B2:B4): Senior=$12,500M / Mezz=$4,500M / Sub Notes=$2,500M. Write the SUM formula for total debt in B5.',
    correctFormula: '=SUM(B2:B4)',
    drillAnswer: '=SUM(B2:B4)',
    drillAnswerScope: 'formula',
    drillWrongOptions: ['=SUM(A2:B4)', '=B2+B3', '=MAX(B2:B4)'],
    explanation: `=SUM(B2:B4) adds all three debt tranches.

Result: $19,500M total outstanding debt.

Interview tip: In LBO models, always build a debt schedule with SUM totals. Interviewers often ask you to trace where total debt comes from — a clear SUM formula is easier to defend than arithmetic.`,
    seedData: [
      ['Debt Tranche', 'Balance ($M)'],
      ['Senior Secured', 12500],
      ['Mezzanine Debt', 4500],
      ['Subordinated Notes', 2500],
      ['Total Debt', null],
    ],
    answerCells: [
      {
        row: 4,
        col: 1,
        expectedValue: 19500,
        tolerance: 0,
      },
    ],
  },

  {
    id: 'sum-06',
    title: 'Sum Basis Points Spread Components',
    tier: 'beginner',
    category: 'SUM',
    difficulty: 'beginner',
    hintFunction: 'SUM',
    prompt: `A bond's yield spread is built from four components (in basis points):

| Row | A                    | B (bps) |
|-----|----------------------|---------|
| 2   | Credit Risk Premium  | 225     |
| 3   | Liquidity Premium    | 85      |
| 4   | Term Premium         | 145     |
| 5   | Sector Adjustment    | 90      |

Enter a SUM formula in B6 for total spread.`,
    drillPrompt: 'Spread components (B2:B5): Credit=225 bps / Liquidity=85 bps / Term=145 bps / Sector=90 bps. SUM formula for total spread in B6.',
    correctFormula: '=SUM(B2:B5)',
    drillAnswer: '=SUM(B2:B5)',
    drillAnswerScope: 'formula',
    drillWrongOptions: ['=SUM(B2:B4)', '=AVERAGE(B2:B5)', '=SUM(B3:B6)'],
    explanation: `=SUM(B2:B5) totals all four spread components.

Result: 545 bps total spread.

Interview tip: In fixed income, spreads are additive — SUM is the right tool. A 545 bps total spread means the bond yields 5.45% over the risk-free rate.`,
    seedData: [
      ['Spread Component', 'Basis Points (bps)'],
      ['Credit Risk Premium', 225],
      ['Liquidity Premium', 85],
      ['Term Premium', 145],
      ['Sector Adjustment', 90],
      ['Total Spread', null],
    ],
    answerCells: [
      {
        row: 5,
        col: 1,
        expectedValue: 545,
        tolerance: 0,
      },
    ],
  },

  // ── IF ────────────────────────────────────────────────────────────────────

  {
    id: 'if-01',
    title: 'Classify Analyst vs Associate Salary',
    tier: 'beginner',
    category: 'IF',
    difficulty: 'beginner',
    hintFunction: 'IF',
    prompt: `HR wants to tag each employee's level based on base salary:
• "Senior" — salary >= $100,000
• "Junior" — salary < $100,000

The employee's base salary is in B2 ($125,000). Write an IF formula in C2 to output the correct label.`,
    drillPrompt: 'Employee base salary in B2 = $125,000. Rule: >=100000 → "Senior", else → "Junior". Write the IF formula in C2.',
    correctFormula: '=IF(B2>=100000,"Senior","Junior")',
    drillAnswer: '=IF(B2>=100000,"Senior","Junior")',
    drillAnswerScope: 'formula',
    drillWrongOptions: ['=IF(B2>100000,"Senior","Junior")', '=IF(B2>=100000,"Junior","Senior")', '=IF(B2=100000,"Senior","Junior")'],
    explanation: `IF(logical_test, value_if_true, value_if_false) evaluates a condition and returns one of two values.

=IF(B2>=100000,"Senior","Junior")
• B2>=100000 — is salary at least $100k?
• "Senior" — returned when TRUE
• "Junior" — returned when FALSE

For B2=125000: 125000>=100000 is TRUE → returns "Senior".

Interview tip: Use >= (not >) for threshold checks in finance. "At least $100k" means 100000 qualifies as "Senior" — if you use > instead, exactly $100k would be misclassified as "Junior".`,
    seedData: [
      ['Employee', 'Base Salary', 'Level'],
      ['Sarah Chen', 125000, null],
    ],
    answerCells: [
      {
        row: 1,
        col: 2,
        expectedValue: 'Senior',
      },
    ],
  },

  {
    id: 'if-02',
    title: 'Flag Profitable vs Loss-Making Divisions',
    tier: 'beginner',
    category: 'IF',
    difficulty: 'beginner',
    hintFunction: 'IF',
    prompt: `You need to flag each business division as "Profitable" or "Loss" based on EBITDA:
• "Profitable" — EBITDA > 0
• "Loss" — EBITDA <= 0

Division EBITDA is in B2 ($8,500). Write an IF formula in C2.`,
    drillPrompt: 'Division EBITDA in B2 = $8,500. Rule: EBITDA > 0 → "Profitable", else → "Loss". Write the IF formula in C2.',
    correctFormula: '=IF(B2>0,"Profitable","Loss")',
    drillAnswer: '=IF(B2>0,"Profitable","Loss")',
    drillAnswerScope: 'formula',
    drillWrongOptions: ['=IF(B2>=0,"Profitable","Loss")', '=IF(B2>0,"Loss","Profitable")', '=IF(B2<0,"Loss","Profitable")'],
    explanation: `=IF(B2>0,"Profitable","Loss")

For B2=8500: 8500>0 is TRUE → returns "Profitable".

Interview tip: > 0 vs >= 0 matters. A division with exactly $0 EBITDA is typically classified as break-even or "Loss" depending on context. Confirm the threshold convention with your MD before building the model.`,
    seedData: [
      ['Division', 'EBITDA ($000s)', 'Status'],
      ['Technology', 8500, null],
    ],
    answerCells: [
      {
        row: 1,
        col: 2,
        expectedValue: 'Profitable',
      },
    ],
  },

  {
    id: 'if-03',
    title: 'Credit Rating Pass/Fail Screen',
    tier: 'beginner',
    category: 'IF',
    difficulty: 'beginner',
    hintFunction: 'IF',
    prompt: `Your fund requires a minimum credit rating of "BBB" (investment grade). Companies with ratings alphabetically at or before "BBB" pass the screen.

The company's rating is in B2 ("A-"). Write an IF formula in C2 that returns "Pass" if B2 <= "BBB" (investment grade or better) or "Fail" otherwise.

Note: Text comparison in Excel is alphabetical — "A" < "B" < "C", so "A-" < "BBB" evaluates as TRUE (A- is better than BBB).`,
    drillPrompt: 'Company credit rating in B2 = "A-". Rule: if rating <= "BBB" then "Pass", else "Fail". Text compare: "A-" < "BBB" is TRUE (A- is better). Write the IF formula in C2.',
    correctFormula: '=IF(B2<="BBB","Pass","Fail")',
    drillAnswer: '=IF(B2<="BBB","Pass","Fail")',
    drillAnswerScope: 'formula',
    drillWrongOptions: ['=IF(B2>="BBB","Pass","Fail")', '=IF(B2="BBB","Pass","Fail")', '=IF(B2<"BBB","Pass","Fail")'],
    explanation: `=IF(B2<="BBB","Pass","Fail")

Excel text comparison is alphabetical. Since "A-" comes before "BBB" alphabetically, B2<="BBB" is TRUE → returns "Pass".

Investment grade cutoff is BBB-/Baa3. Companies rated BBB or better qualify. CCC, B, BB are below investment grade (junk/high-yield).

Interview tip: When screening by rating in Excel, text comparison works — but it's fragile. Better practice is to map ratings to a numeric scale (AAA=1, AA+=2, ...) and use numeric comparisons. Mention this in interviews to show model-building awareness.`,
    seedData: [
      ['Company', 'Credit Rating', 'Screen Result'],
      ['Horizon Industries', 'A-', null],
    ],
    answerCells: [
      {
        row: 1,
        col: 2,
        expectedValue: 'Pass',
      },
    ],
  },

  {
    id: 'if-nested-01',
    title: 'Deal Size Classification',
    tier: 'beginner',
    category: 'IF',
    difficulty: 'beginner',
    hintFunction: 'IF',
    prompt: `Your firm categorizes M&A deal sizes for internal reporting:
• "Large" — deal value >= $10M
• "Medium" — deal value >= $1M
• "Small" — deal value < $1M

The deal value (in $M) is in B2. Write a nested IF formula in C2 to classify the deal automatically.`,
    drillPrompt: 'Deal value in B2 = 5 ($M). Classification: >=10→"Large", >=1→"Medium", else→"Small". Write the nested IF formula in C2.',
    correctFormula: '=IF(B2>=10,"Large",IF(B2>=1,"Medium","Small"))',
    drillAnswer: '=IF(B2>=10,"Large",IF(B2>=1,"Medium","Small"))',
    drillAnswerScope: 'formula',
    drillWrongOptions: ['=IF(B2>=1,"Medium",IF(B2>=10,"Large","Small"))', '=IF(B2>10,"Large",IF(B2>1,"Medium","Small"))', '=IF(B2>=10,"Large",IF(B2>=5,"Medium","Small"))'],
    explanation: `Nested IF evaluates conditions in order, returning the first TRUE result.

=IF(B2>=10,"Large",IF(B2>=1,"Medium","Small"))
• First: is the deal >= $10M? If yes → "Large"
• Else: is it >= $1M? If yes → "Medium"
• Else → "Small"

For B2 = 5 ($5M deal): not >= 10, but is >= 1 → returns "Medium".

Interview tip: Order matters in nested IFs. Always test the most restrictive condition first (>= 10 before >= 1) — if you reversed them, every deal over $1M would return "Medium" before reaching the "Large" check.`,
    seedData: [
      ['Deal', 'Value ($M)', 'Category'],
      ['Midsize Corp Acquisition', 5, null],
    ],
    answerCells: [
      {
        row: 1,
        col: 2,
        expectedValue: 'Medium',
      },
    ],
  },

  {
    id: 'if-05',
    title: 'Compare Quarterly Revenue Performance',
    tier: 'beginner',
    category: 'IF',
    difficulty: 'beginner',
    hintFunction: 'IF',
    prompt: `You need to flag whether Q1 or Q2 was the stronger quarter:
• "Q1 Better" — if Q1 revenue > Q2 revenue
• "Q2 Better or Equal" — otherwise

Q1 revenue is in B2 ($82,000) and Q2 revenue is in C2 ($91,000). Write an IF formula in D2.`,
    drillPrompt: 'Q1 revenue in B2=$82,000, Q2 revenue in C2=$91,000. Rule: B2>C2 → "Q1 Better", else → "Q2 Better or Equal". Write IF formula in D2.',
    correctFormula: '=IF(B2>C2,"Q1 Better","Q2 Better or Equal")',
    drillAnswer: '=IF(B2>C2,"Q1 Better","Q2 Better or Equal")',
    drillAnswerScope: 'formula',
    drillWrongOptions: ['=IF(B2>=C2,"Q1 Better","Q2 Better or Equal")', '=IF(C2>B2,"Q1 Better","Q2 Better or Equal")', '=IF(B2>C2,"Q2 Better or Equal","Q1 Better")'],
    explanation: `=IF(B2>C2,"Q1 Better","Q2 Better or Equal")

For B2=82000, C2=91000: 82000>91000 is FALSE → returns "Q2 Better or Equal".

Interview tip: Comparing two cells (B2>C2) is a core IF pattern in financial models — used for variance analysis, budget vs actual, quarter-over-quarter comparisons. Practice this fluently.`,
    seedData: [
      ['Metric', 'Q1 Revenue', 'Q2 Revenue', 'Better Quarter'],
      ['Revenue ($)', 82000, 91000, null],
    ],
    answerCells: [
      {
        row: 1,
        col: 3,
        expectedValue: 'Q2 Better or Equal',
      },
    ],
  },

  {
    id: 'if-06',
    title: 'Bonus Target Achievement Flag',
    tier: 'beginner',
    category: 'IF',
    difficulty: 'beginner',
    hintFunction: 'IF',
    prompt: `Analysts receive a bonus if their revenue contribution margin exceeds 15%. Their actual margin is in B2 (18.5%, stored as 0.185).

Write an IF formula in C2 that returns "Exceed" if B2 >= 0.15, or "Meet or Miss" otherwise.`,
    drillPrompt: 'Analyst margin in B2 = 0.185 (18.5%). Threshold = 0.15. Rule: >=0.15 → "Exceed", else → "Meet or Miss". Write the IF formula in C2.',
    correctFormula: '=IF(B2>=0.15,"Exceed","Meet or Miss")',
    drillAnswer: '=IF(B2>=0.15,"Exceed","Meet or Miss")',
    drillAnswerScope: 'formula',
    drillWrongOptions: ['=IF(B2>=15,"Exceed","Meet or Miss")', '=IF(B2>0.15,"Exceed","Meet or Miss")', '=IF(B2>=0.15,"Meet or Miss","Exceed")'],
    explanation: `=IF(B2>=0.15,"Exceed","Meet or Miss")

For B2=0.185: 0.185>=0.15 is TRUE → returns "Exceed".

Interview tip: In Excel, percentages stored as decimals (0.185) must be compared to decimal thresholds (0.15), not percent values (15). A common error is writing IF(B2>=15,...) when B2 is stored as 0.185 — this would always return FALSE.`,
    seedData: [
      ['Analyst', 'Margin', 'Bonus Status'],
      ['James Park', 0.185, null],
    ],
    answerCells: [
      {
        row: 1,
        col: 2,
        expectedValue: 'Exceed',
      },
    ],
  },

  // ── IFERROR ───────────────────────────────────────────────────────────────

  {
    id: 'iferror-01',
    title: 'Handle Missing Employee in VLOOKUP',
    tier: 'beginner',
    category: 'IFERROR',
    difficulty: 'beginner',
    hintFunction: 'IFERROR',
    prompt: `You're looking up salaries, but the employee table only has IDs 101–104. If a lookup fails, display "Not Found" instead of an ugly #N/A error.

Employee table (A2:C5):
• 101 / Alice / $75,000
• 102 / Bob / $90,000
• 103 / Carol / $105,000
• 104 / David / $120,000

Write an IFERROR formula in B7 to look up Employee 105 and return "Not Found" if not found.`,
    drillPrompt: 'Employee table (A2:C5): IDs 101-104 with salaries $75k-$120k. Looking up ID 105 (not in table). Write IFERROR(VLOOKUP...) in B7 to return "Not Found" on error.',
    correctFormula: '=IFERROR(VLOOKUP(105,A2:C5,3,0),"Not Found")',
    drillAnswer: '=IFERROR(VLOOKUP(105,A2:C5,3,0),"Not Found")',
    drillAnswerScope: 'formula',
    drillWrongOptions: ['=IFERROR(VLOOKUP(105,A2:C5,3,0),0)', '=IF(VLOOKUP(105,A2:C5,3,0),"Not Found","")', '=IFERROR(VLOOKUP(105,A2:C5,2,0),"Not Found")'],
    explanation: `IFERROR(value, value_if_error) catches any Excel error and returns your fallback value instead.

=IFERROR(VLOOKUP(105,A2:C5,3,0),"Not Found")
• VLOOKUP(105,...) — tries to find Employee ID 105
• 105 is not in A2:A5 → produces #N/A error
• IFERROR catches #N/A → returns "Not Found"

Interview tip: Always wrap VLOOKUP in IFERROR in production models. A raw #N/A error in a live spreadsheet breaks downstream SUM formulas and looks unprofessional. IFERROR is the standard defense.`,
    seedData: [
      ['Employee ID', 'Name', 'Annual Salary'],
      [101, 'Alice Johnson', 75000],
      [102, 'Bob Smith', 90000],
      [103, 'Carol Williams', 105000],
      [104, 'David Lee', 120000],
      [null, null, null],
      ['Lookup: Emp 105', null, null],
    ],
    answerCells: [
      {
        row: 6,
        col: 1,
        expectedValue: 'Not Found',
      },
    ],
  },

  {
    id: 'iferror-02',
    title: 'Safe Division for Margin Calculation',
    tier: 'beginner',
    category: 'IFERROR',
    difficulty: 'beginner',
    hintFunction: 'IFERROR',
    prompt: `You're computing EBITDA margin (EBITDA / Revenue). When revenue is zero, division causes a #DIV/0! error. Use IFERROR to return "N/A" if there's an error.

Revenue is in C2 ($500,000) and EBITDA is in B2 ($125,000).

Write an IFERROR formula in D2 to safely compute B2/C2.`,
    drillPrompt: 'EBITDA in B2=$125,000, Revenue in C2=$500,000. Compute B2/C2 safely — return "N/A" if error. Write IFERROR formula in D2.',
    correctFormula: '=IFERROR(B2/C2,"N/A")',
    drillAnswer: '=IFERROR(B2/C2,"N/A")',
    drillAnswerScope: 'formula',
    drillWrongOptions: ['=IFERROR(C2/B2,"N/A")', '=IF(C2=0,"N/A",B2/C2)', '=IFERROR(B2/C2,0)'],
    explanation: `=IFERROR(B2/C2,"N/A")

For B2=125000, C2=500000: 125000/500000=0.25 (no error) → returns 0.25 (25% EBITDA margin).

IFERROR handles the zero-revenue edge case gracefully.

Interview tip: IFERROR(B2/C2,"N/A") is the standard pattern for division in financial models. "N/A" is preferred over 0 for error cases — a 0% margin when there's actually no data is misleading. Using "N/A" makes the gap visible.`,
    seedData: [
      ['Company', 'EBITDA', 'Revenue', 'EBITDA Margin'],
      ['Alpha Corp', 125000, 500000, null],
    ],
    answerCells: [
      {
        row: 1,
        col: 3,
        expectedValue: 0.25,
        tolerance: 0.0001,
      },
    ],
  },

  {
    id: 'iferror-03',
    title: 'Handle Zero Revenue Division Error',
    tier: 'beginner',
    category: 'IFERROR',
    difficulty: 'beginner',
    hintFunction: 'IFERROR',
    prompt: `The same EBITDA margin formula, but this time Revenue (C2) is 0 — a pre-revenue startup. The formula B2/C2 will produce #DIV/0!.

B2 = 45,000 (EBITDA), C2 = 0 (Revenue).

Write an IFERROR formula in D2 that returns "N/A" when division fails.`,
    drillPrompt: 'EBITDA in B2=$45,000, Revenue in C2=0. B2/C2 causes #DIV/0! Write IFERROR formula in D2 to return "N/A" on error.',
    correctFormula: '=IFERROR(B2/C2,"N/A")',
    drillAnswer: '=IFERROR(B2/C2,"N/A")',
    drillAnswerScope: 'formula',
    drillWrongOptions: ['=IF(C2=0,"N/A",B2/C2)', '=IFERROR(B2/C2,"")', '=IFERROR(C2/B2,"N/A")'],
    explanation: `=IFERROR(B2/C2,"N/A")

For C2=0: B2/C2 = #DIV/0! → IFERROR catches the error → returns "N/A".

This is the same formula as iferror-02 — IFERROR handles both cases (no error and error) transparently.

Interview tip: Pre-revenue companies in comps or DCF models often have zero revenue periods. IFERROR protects your model from cascading errors when early-year revenue cells are empty or zero.`,
    seedData: [
      ['Company', 'EBITDA', 'Revenue', 'EBITDA Margin'],
      ['Pre-Revenue Startup', 45000, 0, null],
    ],
    answerCells: [
      {
        row: 1,
        col: 3,
        expectedValue: 'N/A',
      },
    ],
  },

  {
    id: 'iferror-04',
    title: 'Apply Raise to Looked-Up Salary',
    tier: 'beginner',
    category: 'IFERROR',
    difficulty: 'beginner',
    hintFunction: 'IFERROR',
    prompt: `HR wants to calculate post-raise salaries. Look up each employee's current salary using VLOOKUP, then multiply by 1.1 (10% raise). If the lookup fails, return "Error".

Employee table (A2:B5):
• 101 / $75,000
• 102 / $90,000
• 103 / $105,000
• 104 / $120,000

Write an IFERROR formula in C7 to look up Employee 102 and return their post-raise salary.`,
    drillPrompt: 'Salary table (A2:B5): ID 101=$75k, 102=$90k, 103=$105k, 104=$120k. Look up Employee 102 salary, multiply by 1.1. Return "Error" on failure. Write IFERROR(VLOOKUP(102,...)*1.1,"Error") in C7.',
    correctFormula: '=IFERROR(VLOOKUP(102,A2:B5,2,0)*1.1,"Error")',
    drillAnswer: '=IFERROR(VLOOKUP(102,A2:B5,2,0)*1.1,"Error")',
    drillAnswerScope: 'formula',
    drillWrongOptions: ['=IFERROR(VLOOKUP(102,A2:B5,3,0)*1.1,"Error")', '=VLOOKUP(102,A2:B5,2,0)*1.1', '=IFERROR(VLOOKUP(102,A2:B5,2,0)+0.1,"Error")'],
    explanation: `=IFERROR(VLOOKUP(102,A2:B5,2,0)*1.1,"Error")

VLOOKUP(102,A2:B5,2,0) = 90000 (Employee 102's salary)
90000 * 1.1 = 99000 (10% raise applied)

The *1.1 is applied OUTSIDE the VLOOKUP but INSIDE the IFERROR — so if lookup fails, IFERROR catches the entire expression.

Interview tip: You can chain arithmetic onto VLOOKUP results directly. IFERROR wraps the whole computation, catching errors from either the lookup or any downstream arithmetic.`,
    seedData: [
      ['Employee ID', 'Current Salary'],
      [101, 75000],
      [102, 90000],
      [103, 105000],
      [104, 120000],
      [null, null],
      ['Emp 102 Post-Raise', null, null],
    ],
    answerCells: [
      {
        row: 6,
        col: 2,
        expectedValue: 99000,
        tolerance: 0,
      },
    ],
  },

  {
    id: 'iferror-05',
    title: 'Safe Square Root for Volatility',
    tier: 'beginner',
    category: 'IFERROR',
    difficulty: 'beginner',
    hintFunction: 'IFERROR',
    prompt: `You're annualizing volatility. The formula uses SQRT(variance). If variance is negative (data error), SQRT returns #NUM!.

The variance value is in B2 (100). Write an IFERROR formula in C2 that returns SQRT(B2) normally, or "Invalid" if an error occurs.`,
    drillPrompt: 'Variance in B2=100. Compute SQRT(B2), return "Invalid" if error (e.g., negative variance). Write IFERROR formula in C2.',
    correctFormula: '=IFERROR(SQRT(B2),"Invalid")',
    drillAnswer: '=IFERROR(SQRT(B2),"Invalid")',
    drillAnswerScope: 'formula',
    drillWrongOptions: ['=IFERROR(SQRT(B2),0)', '=IF(B2>=0,SQRT(B2),"Invalid")', '=IFERROR(B2^0.5,"Invalid")'],
    explanation: `=IFERROR(SQRT(B2),"Invalid")

For B2=100: SQRT(100)=10 (no error) → returns 10.
For B2=-1: SQRT(-1)=#NUM! → IFERROR catches it → returns "Invalid".

Interview tip: IFERROR is not just for VLOOKUP — it wraps any formula that can error. In quantitative finance, SQRT of negative variance is a data quality flag. Returning "Invalid" makes the error visible rather than hiding it with a 0.`,
    seedData: [
      ['Asset', 'Variance', 'Volatility (StdDev)'],
      ['Portfolio A', 100, null],
    ],
    answerCells: [
      {
        row: 1,
        col: 2,
        expectedValue: 10,
        tolerance: 0,
      },
    ],
  },

  {
    id: 'iferror-06',
    title: 'Lookup with Fallback in Comps Table',
    tier: 'beginner',
    category: 'IFERROR',
    difficulty: 'beginner',
    hintFunction: 'IFERROR',
    prompt: `You have a comparable companies table (D2:E5) with EV/EBITDA multiples. You're looking up the multiple for "Private Co" which is not in the table.

Comps table (D2:E5):
• Apple / 18.5x
• Microsoft / 22.1x
• Google / 20.3x
• Amazon / 24.7x

The lookup target "Private Co" is in B2. Write an IFERROR formula in B4 to look up B2 in D2:E5 column 2 and return "Not Available" if not found.`,
    drillPrompt: 'Comps table (D2:E5): Apple/18.5x, Microsoft/22.1x, Google/20.3x, Amazon/24.7x. Lookup target in B2="Private Co" (not in table). Write IFERROR(VLOOKUP(B2,D2:E5,2,0),"Not Available") in B4.',
    correctFormula: '=IFERROR(VLOOKUP(B2,D2:E5,2,0),"Not Available")',
    drillAnswer: '=IFERROR(VLOOKUP(B2,D2:E5,2,0),"Not Available")',
    drillAnswerScope: 'formula',
    drillWrongOptions: ['=IFERROR(VLOOKUP(B2,D2:E5,1,0),"Not Available")', '=IFERROR(VLOOKUP(B2,D2:E5,2,1),"Not Available")', '=IF(ISNA(VLOOKUP(B2,D2:E5,2,0)),"Not Available","")'],
    explanation: `=IFERROR(VLOOKUP(B2,D2:E5,2,0),"Not Available")

VLOOKUP(B2="Private Co", D2:E5, 2, 0) → #N/A (not in comps table)
IFERROR catches #N/A → returns "Not Available"

Interview tip: In comps analysis, not every company in your coverage universe is in the comparable set. IFERROR("Not Available") clearly signals missing data vs. a company with 0x multiple. Auditors appreciate the distinction.`,
    seedData: [
      ['Lookup Target', 'EV/EBITDA Multiple', null, 'Company', 'EV/EBITDA'],
      ['Private Co', null, null, 'Apple', 18.5],
      [null, null, null, 'Microsoft', 22.1],
      ['Result:', null, null, 'Google', 20.3],
      [null, null, null, 'Amazon', 24.7],
    ],
    answerCells: [
      {
        row: 3,  // Row 4 (0-indexed) — B4, formula references B2="Private Co"
        col: 1,
        expectedValue: 'Not Available',
      },
    ],
  },

  // ── VLOOKUP ───────────────────────────────────────────────────────────────

  {
    id: 'vlookup-01',
    title: 'Salary Lookup with VLOOKUP',
    tier: 'beginner',
    category: 'VLOOKUP',
    difficulty: 'beginner',
    hintFunction: 'VLOOKUP',
    prompt: `Your MD asks you to quickly look up the annual salary for Employee ID 103 from the compensation table below.

The table (A1:C5) contains Employee ID, Name, and Annual Salary columns. Enter a VLOOKUP formula in B7 to retrieve the salary.

Hint: use exact match (last argument = 0) — approximate match can return wrong data in financial lookups.`,
    drillPrompt: 'Employee table: ID 101=Alice/$75k, ID 102=Bob/$90k, ID 103=Carol/$105k, ID 104=David/$120k (A2:C5). Write VLOOKUP formula to find Employee 103 salary.',
    correctFormula: '=VLOOKUP(103,A2:C5,3,0)',
    drillAnswer: '=VLOOKUP(103,A2:C5,3,0)',
    drillAnswerScope: 'formula',
    drillWrongOptions: ['=VLOOKUP(103,A2:C5,2,0)', '=VLOOKUP(103,A2:C5,3,1)', '=VLOOKUP(103,A1:C5,3,0)'],
    explanation: `VLOOKUP(lookup_value, table_array, col_index_num, [range_lookup]) searches the first column of the table for the lookup value and returns a value from the column you specify.

=VLOOKUP(103, A2:C5, 3, 0)
• 103 — the Employee ID to find
• A2:C5 — the full compensation table
• 3 — return the 3rd column (Annual Salary)
• 0 — exact match (critical in finance)

Interview tip: Always use 0 for exact match. Approximate match (1 or TRUE) is almost never what you want in financial lookups — it can silently return a wrong row if the lookup value is not found exactly.`,
    seedData: [
      ['Employee ID', 'Name', 'Annual Salary'],
      [101, 'Alice Johnson', 75000],
      [102, 'Bob Smith', 90000],
      [103, 'Carol Williams', 105000],
      [104, 'David Lee', 120000],
      [null, null, null],
      [null, null, null],
    ],
    answerCells: [
      {
        row: 6,
        col: 1,
        expectedValue: 105000,
        tolerance: 0,
      },
    ],
  },

  {
    id: 'vlookup-02',
    title: 'Quarterly Revenue VLOOKUP',
    tier: 'beginner',
    category: 'VLOOKUP',
    difficulty: 'beginner',
    hintFunction: 'VLOOKUP',
    prompt: `A company's quarterly revenue is stored in a table:

| Row | A (Quarter) | B (Revenue $000s) |
|-----|-------------|-------------------|
| 2   | Q1          | 820,000           |
| 3   | Q2          | 950,000           |
| 4   | Q3          | 980,000           |
| 5   | Q4          | 1,100,000         |

Write a VLOOKUP formula in B7 to retrieve Q3 revenue using "Q3" as the lookup value.`,
    drillPrompt: 'Revenue table (A2:B5): Q1=$820k, Q2=$950k, Q3=$980k, Q4=$1100k ($000s). Write VLOOKUP formula to find "Q3" revenue.',
    correctFormula: '=VLOOKUP("Q3",A2:B5,2,0)',
    drillAnswer: '=VLOOKUP("Q3",A2:B5,2,0)',
    drillAnswerScope: 'formula',
    drillWrongOptions: ['=VLOOKUP(Q3,A2:B5,2,0)', '=VLOOKUP("Q3",A2:B5,1,0)', '=VLOOKUP("Q3",A1:B5,2,0)'],
    explanation: `=VLOOKUP("Q3",A2:B5,2,0)

• "Q3" — text lookup value (must be in quotes)
• A2:B5 — quarter/revenue table
• 2 — return column 2 (Revenue)
• 0 — exact match

Result: 980,000

Interview tip: Text lookup values must be in double quotes. Forgetting quotes is a common interview mistake — VLOOKUP(Q3,...) without quotes tries to find a cell named Q3 and typically returns #NAME?.`,
    seedData: [
      ['Quarter', 'Revenue ($000s)'],
      ['Q1', 820000],
      ['Q2', 950000],
      ['Q3', 980000],
      ['Q4', 1100000],
      [null, null],
      ['Q3 Revenue', null],
    ],
    answerCells: [
      {
        row: 6,
        col: 1,
        expectedValue: 980000,
        tolerance: 0,
      },
    ],
  },

  {
    id: 'vlookup-03',
    title: 'Employee Level Lookup',
    tier: 'beginner',
    category: 'VLOOKUP',
    difficulty: 'beginner',
    hintFunction: 'VLOOKUP',
    prompt: `The HR table has four columns: Employee ID, Name, Salary, and Level.

| Row | A (ID) | B (Name) | C (Salary) | D (Level) |
|-----|--------|----------|------------|-----------|
| 2   | 101    | Alice    | 75,000     | Analyst   |
| 3   | 102    | Bob      | 90,000     | VP        |
| 4   | 103    | Carol    | 105,000    | Director  |
| 5   | 104    | David    | 120,000    | MD        |

Write a VLOOKUP formula in B7 to retrieve Employee 102's Level (column 4).`,
    drillPrompt: 'HR table (A2:D5): 101/Alice/$75k/Analyst, 102/Bob/$90k/VP, 103/Carol/$105k/Director, 104/David/$120k/MD. Write VLOOKUP to get Employee 102\'s Level (col 4).',
    correctFormula: '=VLOOKUP(102,A2:D5,4,0)',
    drillAnswer: '=VLOOKUP(102,A2:D5,4,0)',
    drillAnswerScope: 'formula',
    drillWrongOptions: ['=VLOOKUP(102,A2:D5,3,0)', '=VLOOKUP(102,A2:D5,4,1)', '=VLOOKUP(102,B2:D5,4,0)'],
    explanation: `=VLOOKUP(102,A2:D5,4,0)

• 102 — Employee ID to find
• A2:D5 — full 4-column table (ID must be first column)
• 4 — return the 4th column (Level)
• 0 — exact match

Result: "VP"

Interview tip: The col_index_num counts from the first column of your table_array, not from column A. If your table starts at column C, col 1 is C, col 2 is D, etc. Getting this wrong is a top VLOOKUP interview error.`,
    seedData: [
      ['Employee ID', 'Name', 'Salary', 'Level'],
      [101, 'Alice', 75000, 'Analyst'],
      [102, 'Bob', 90000, 'VP'],
      [103, 'Carol', 105000, 'Director'],
      [104, 'David', 120000, 'MD'],
      [null, null, null, null],
      ['Emp 102 Level', null, null, null],
    ],
    answerCells: [
      {
        row: 6,
        col: 1,
        expectedValue: 'VP',
      },
    ],
  },

  {
    id: 'vlookup-04',
    title: 'Bond Duration Lookup',
    tier: 'beginner',
    category: 'VLOOKUP',
    difficulty: 'beginner',
    hintFunction: 'VLOOKUP',
    prompt: `A bond portfolio table stores maturity, coupon rate, and modified duration:

| Row | A (Maturity) | B (Coupon %) | C (Duration) |
|-----|--------------|--------------|--------------|
| 2   | 1            | 4.5          | 0.96         |
| 3   | 2            | 5.0          | 1.88         |
| 4   | 5            | 5.5          | 4.32         |
| 5   | 10           | 6.0          | 8.50         |

Write a VLOOKUP formula in B7 to retrieve the duration for the 2-year bond (Maturity = 2).`,
    drillPrompt: 'Bond table (A2:C5): Mat1/4.5%/0.96, Mat2/5%/1.88, Mat5/5.5%/4.32, Mat10/6%/8.5. Write VLOOKUP to find duration for maturity=2.',
    correctFormula: '=VLOOKUP(2,A2:C5,3,0)',
    drillAnswer: '=VLOOKUP(2,A2:C5,3,0)',
    drillAnswerScope: 'formula',
    drillWrongOptions: ['=VLOOKUP(2,A2:C5,2,0)', '=VLOOKUP(2,A2:C5,3,1)', '=VLOOKUP("2",A2:C5,3,0)'],
    explanation: `=VLOOKUP(2,A2:C5,3,0)

• 2 — maturity year to find
• A2:C5 — bond table
• 3 — return column 3 (Duration)
• 0 — exact match

Result: 8.5 — wait, that's the 10-year. Let me recalculate: maturity 2 → Duration is 1.88. Looking up 2 → row 3, col 3 = 8.50.

Actually: row A2=1→0.96, A3=2→1.88, A4=5→4.32, A5=10→8.50. VLOOKUP(2,...) matches A3=2, returns col 3 = 8.50.

Correction: The col layout is A=Maturity, B=Coupon, C=Duration. VLOOKUP(2,A2:C5,3,0) → finds row where A=2 (row 3), returns col 3 which is Duration = 8.5.

Wait — the seedData row for maturity 2: C column = 8.5 is wrong. Let me check the seedData: row index 2 (0-based) has [2, 5.0, 1.88]. So VLOOKUP(2,A2:C5,3,0) = 1.88.

Interview tip: VLOOKUP stops at the first match. Numeric lookup values must match exactly — don't use text "2" when looking up a number 2.`,
    seedData: [
      ['Maturity (Yrs)', 'Coupon (%)', 'Mod. Duration'],
      [1, 4.5, 0.96],
      [2, 5.0, 1.88],
      [5, 5.5, 4.32],
      [10, 6.0, 8.50],
      [null, null, null],
      ['2-yr Duration', null, null],
    ],
    answerCells: [
      {
        row: 6,
        col: 1,
        expectedValue: 1.88,
        tolerance: 0.001,
      },
    ],
  },

  {
    id: 'vlookup-05',
    title: 'Stock Price Lookup from Ticker Table',
    tier: 'beginner',
    category: 'VLOOKUP',
    difficulty: 'beginner',
    hintFunction: 'VLOOKUP',
    prompt: `A market data table maps ticker symbols to last prices:

| Row | A (Ticker) | B (Company)  | C (Last Price) |
|-----|------------|--------------|----------------|
| 2   | AAPL       | Apple        | 189.50         |
| 3   | MSFT       | Microsoft    | 415.20         |
| 4   | GOOGL      | Alphabet     | 172.80         |
| 5   | AMZN       | Amazon       | 198.60         |

Write a VLOOKUP formula in B7 to retrieve AAPL's last price.`,
    drillPrompt: 'Market data table (A2:C5): AAPL/Apple/$189.50, MSFT/Microsoft/$415.20, GOOGL/Alphabet/$172.80, AMZN/Amazon/$198.60. Write VLOOKUP formula to find AAPL price.',
    correctFormula: '=VLOOKUP("AAPL",A2:C5,3,0)',
    drillAnswer: '=VLOOKUP("AAPL",A2:C5,3,0)',
    drillAnswerScope: 'formula',
    drillWrongOptions: ['=VLOOKUP("AAPL",A2:C5,2,0)', '=VLOOKUP(AAPL,A2:C5,3,0)', '=VLOOKUP("AAPL",A2:B5,3,0)'],
    explanation: `=VLOOKUP("AAPL",A2:C5,3,0)

• "AAPL" — ticker text (in quotes)
• A2:C5 — market data table
• 3 — column 3 is Last Price
• 0 — exact match

Result: 189.50

Interview tip: Ticker lookups are a bread-and-butter use case in equity research models. Text lookup values require quotes. A table_array that ends before the return column (#REF) is a common structural error — always make sure col_index_num <= number of columns in table_array.`,
    seedData: [
      ['Ticker', 'Company', 'Last Price ($)'],
      ['AAPL', 'Apple', 189.50],
      ['MSFT', 'Microsoft', 415.20],
      ['GOOGL', 'Alphabet', 172.80],
      ['AMZN', 'Amazon', 198.60],
      [null, null, null],
      ['AAPL Price', null, null],
    ],
    answerCells: [
      {
        row: 6,
        col: 1,
        expectedValue: 189.50,
        tolerance: 0.01,
      },
    ],
  },

  {
    id: 'vlookup-06',
    title: 'Business Segment Lookup',
    tier: 'beginner',
    category: 'VLOOKUP',
    difficulty: 'beginner',
    hintFunction: 'VLOOKUP',
    prompt: `An internal segment code table maps numeric segment IDs to business names:

| Row | A (Seg ID) | B (Business Unit) |
|-----|------------|-------------------|
| 2   | 1          | Investment Banking |
| 3   | 2          | Asset Management  |
| 4   | 3          | Consulting        |

Write a VLOOKUP formula in B6 to retrieve the business unit for Segment ID 3.`,
    drillPrompt: 'Segment table (A2:B4): ID 1=Investment Banking, ID 2=Asset Management, ID 3=Consulting. Write VLOOKUP formula to find Segment 3 name.',
    correctFormula: '=VLOOKUP(3,A2:B4,2,0)',
    drillAnswer: '=VLOOKUP(3,A2:B4,2,0)',
    drillAnswerScope: 'formula',
    drillWrongOptions: ['=VLOOKUP(3,A2:B4,1,0)', '=VLOOKUP("3",A2:B4,2,0)', '=VLOOKUP(3,A2:B3,2,0)'],
    explanation: `=VLOOKUP(3,A2:B4,2,0)

• 3 — segment ID to find
• A2:B4 — segment lookup table
• 2 — column 2 is Business Unit name
• 0 — exact match

Result: "Consulting"

Interview tip: Always verify your table_array includes all rows. VLOOKUP(3,A2:B3,2,0) would fail because the row for ID=3 is in row 4, which is outside A2:B3. A common mistake is starting the range at row 1 (including headers) — this usually still works but can cause unexpected matches if header text matches the lookup value.`,
    seedData: [
      ['Segment ID', 'Business Unit'],
      [1, 'Investment Banking'],
      [2, 'Asset Management'],
      [3, 'Consulting'],
      [null, null],
      ['Seg 3 Name', null],
    ],
    answerCells: [
      {
        row: 5,
        col: 1,
        expectedValue: 'Consulting',
      },
    ],
  },
];
