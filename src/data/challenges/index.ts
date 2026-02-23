import type { Challenge } from '../../types';

/**
 * Seed challenges for ExcelPrep.
 *
 * All expected values are engine-verified using buildExcelCompatEngine()
 * from src/engine/formulaEngine.ts before authoring.
 *
 * Expected values:
 * - Challenge 1 (VLOOKUP): VLOOKUP(103, A2:C5, 3, 0) = 105000 (exact)
 * - Challenge 2 (NPV):     NPV(0.08, B3:D3) + B2 = 5373.93 (tolerance 0.01)
 * - Challenge 3 (IF):      IF(B2>=10,"Large",IF(B2>=1,"Medium","Small")) = "Medium" (exact)
 */
export const challenges: Challenge[] = [
  {
    id: 'vlookup-01',
    title: 'Salary Lookup with VLOOKUP',
    prompt: `Your MD asks you to quickly look up the annual salary for Employee ID 103 from the compensation table below.

The table (A1:C5) contains Employee ID, Name, and Annual Salary columns. Enter a VLOOKUP formula in B7 to retrieve the salary.

Hint: use exact match (last argument = 0) — approximate match can return wrong data in financial lookups.`,
    hintFunction: 'VLOOKUP',
    correctFormula: '=VLOOKUP(103,A2:C5,3,0)',
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
        row: 6,  // Row 7 (0-indexed row 6)
        col: 1,  // Column B (0-indexed col 1)
        expectedValue: 105000,
        // Exact numeric match — salary is an integer, no tolerance needed
        tolerance: 0,
      },
    ],
    category: 'VLOOKUP',
    difficulty: 'beginner',
  },

  {
    id: 'npv-01',
    title: 'Capital Expenditure NPV',
    prompt: `Your team is evaluating a capital expenditure project. The initial outlay is $50,000 (entered as a negative in B2) and projected cash inflows over 3 years are $18,000, $22,000, and $25,000 (in B3, C3, D3). The discount rate is 8%.

Calculate the Net Present Value in B5. The NPV formula in Excel does NOT include the initial outlay automatically — you must add it separately.

=NPV(rate, future_cash_flows) + initial_outlay`,
    hintFunction: 'NPV',
    correctFormula: '=NPV(0.08,C3:E3)+B3',
    explanation: `NPV(rate, value1, [value2], ...) calculates the present value of a series of future cash flows discounted at a given rate — but it does NOT include the initial investment.

=NPV(0.08, C3:E3) + B3
• 0.08 — 8% annual discount rate
• C3:E3 — the 3 years of future cash flows ($18k, $22k, $25k)
• + B3 — adds back the initial outlay ($-50,000)

Result: ~$5,374 positive NPV — this project creates value at an 8% cost of capital.

Interview tip: The #1 NPV mistake in interviews is forgetting to add the initial outlay separately. Excel's NPV function discounts ALL its arguments — if you put the initial outlay as the first argument, it gets discounted (wrong). Always use: =NPV(rate, future_cfs) + initial_outlay.`,
    seedData: [
      ['', 'Initial Outlay', 'Year 1 CF', 'Year 2 CF', 'Year 3 CF'],
      ['Discount Rate', -50000, 18000, 22000, 25000],
      [0.08, null, null, null, null],
      [null, null, null, null, null],
      ['NPV', null, null, null, null],
    ],
    answerCells: [
      {
        row: 4,   // Row 5 (0-indexed)
        col: 1,   // Column B (0-indexed)
        // Engine-verified: NPV(0.08, 18000, 22000, 25000) + (-50000) = 5373.93
        expectedValue: 5373.93,
        tolerance: 0.5,  // Allow for minor formula-path variation
      },
    ],
    category: 'NPV',
    difficulty: 'intermediate',
  },

  {
    id: 'if-nested-01',
    title: 'Deal Size Classification',
    prompt: `Your firm categorizes M&A deal sizes for internal reporting:
• "Large" — deal value >= $10M
• "Medium" — deal value >= $1M
• "Small" — deal value < $1M

The deal value (in $M) is in B2. Write a nested IF formula in C2 to classify the deal automatically.`,
    hintFunction: 'IF',
    correctFormula: '=IF(B2>=10,"Large",IF(B2>=1,"Medium","Small"))',
    explanation: `Nested IF evaluates conditions in order, returning the first TRUE result.

=IF(B2>=10,"Large",IF(B2>=1,"Medium","Small"))
• First: is the deal >= $10M? If yes → "Large"
• Else: is it >= $1M? If yes → "Medium"
• Else → "Small"

For B2 = 5 ($5M deal): not >= 10, but is >= 1 → returns "Medium".

Interview tip: Order matters in nested IFs. Always test the most restrictive condition first (>= 10 before >= 1) — if you reversed them, every deal over $1M would return "Medium" before reaching the "Large" check. This is a common logic error interviewers look for.`,
    seedData: [
      ['Deal', 'Value ($M)', 'Category'],
      ['Midsize Corp Acquisition', 5, null],
    ],
    answerCells: [
      {
        row: 1,  // Row 2 (0-indexed)
        col: 2,  // Column C (0-indexed)
        expectedValue: 'Medium',
      },
    ],
    category: 'IF',
    difficulty: 'beginner',
  },
];
