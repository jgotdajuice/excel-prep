import type { Challenge } from '../../types';

/**
 * Advanced-tier challenges for ExcelPrep.
 *
 * Functions covered: IRR (5), XLOOKUP (5), XNPV (4), OFFSET (4)
 * All expectedValues are engine-verified using buildExcelCompatEngine()
 *
 * NOTE: HyperFormula does not support XLOOKUP as of v3.2.
 * XLOOKUP challenges use a simulated approach: the correctFormula evaluates
 * to the expected result via INDEX/MATCH (which is XLOOKUP's equivalent),
 * and the drillAnswer teaches XLOOKUP syntax. The engine test verifies
 * INDEX/MATCH equivalence.
 *
 * Engine-verified expected values:
 *
 * IRR challenges:
 *   irr-01: IRR(B2:F2) = engine-verified (% return)
 *   irr-02: IRR(B2:E2) = engine-verified
 *   irr-03: IRR(B2:G2) = engine-verified
 *   irr-04: IRR(B2:F2) = engine-verified (negative IRR scenario)
 *   irr-05: IRR(B2:E2) = engine-verified (PE fund IRR)
 *
 * XLOOKUP challenges (correctFormula uses INDEX/MATCH for engine compat):
 *   xlookup-01: INDEX(C2:C5,MATCH(103,A2:A5,0)) = 105000
 *   xlookup-02: INDEX(D2:D6,MATCH("MSFT",A2:A6,0)) = 415.2
 *   xlookup-03: INDEX(B2:B5,MATCH("BB+",A2:A5,0)) = 0.085
 *   xlookup-04: INDEX(C2:C5,MATCH("Q4",A2:A5,0)) = 1100000
 *   xlookup-05: INDEX(B2:B6,MATCH("Technology",A2:A6,0)) = 350000
 *
 * XNPV challenges (date serial numbers):
 *   xnpv-01: XNPV(0.1,B2:E2,B3:E3) = engine-verified
 *   xnpv-02: XNPV(0.08,B2:D2,B3:D3) = engine-verified
 *   xnpv-03: XNPV(0.12,B2:F2,B3:F3) = engine-verified
 *   xnpv-04: XNPV(0.09,B2:E2,B3:E3) = engine-verified
 *
 * OFFSET challenges:
 *   offset-01: SUM(OFFSET(B2,0,0,3,1)) = engine-verified (dynamic sum)
 *   offset-02: OFFSET(A2,2,1) = engine-verified (single cell offset)
 *   offset-03: AVERAGE(OFFSET(B2,0,0,4,1)) = engine-verified
 *   offset-04: SUM(OFFSET(B2,0,0,MATCH(MAX(A2:A5),A2:A5,0),1)) = dynamic range
 */
export const advancedChallenges: Challenge[] = [
  // ── IRR ───────────────────────────────────────────────────────────────────

  {
    id: 'irr-01',
    title: 'LBO Investment Internal Rate of Return',
    tier: 'advanced',
    category: 'IRR',
    difficulty: 'advanced',
    hintFunction: 'IRR',
    prompt: `An LBO investment has the following cash flow profile in B2:F2:
• Year 0 (B2): -$500,000 (equity invested)
• Year 1 (C2): $50,000
• Year 2 (D2): $75,000
• Year 3 (E2): $100,000
• Year 4 (F2): $650,000 (operating CF + exit proceeds)

Calculate the IRR of this investment in B4.`,
    drillPrompt: 'LBO cash flows B2:F2: Year0=$-500k, Year1=$50k, Year2=$75k, Year3=$100k, Year4=$650k. Write =IRR(B2:F2) in B4.',
    correctFormula: '=IRR(B2:F2)',
    drillAnswer: '=IRR(B2:F2)',
    drillAnswerScope: 'formula',
    drillWrongOptions: ['=IRR(C2:F2)', '=NPV(0.1,C2:F2)+B2', '=IRR(B2:F2,0.1)'],
    explanation: `IRR(values, [guess]) returns the rate at which NPV = 0.

=IRR(B2:F2)
• Include ALL cash flows from Year 0 (initial outlay) through final exit
• The first value MUST be negative (initial investment)

Result: the discount rate at which the LBO equity investment breaks even.

Interview tip: IRR is the single most-cited metric in PE. It's the annualized return on equity capital. Key relationships:
- If IRR > hurdle rate (WACC), project creates value
- 2x MOIC over 5 years ≈ 15% IRR
- 3x MOIC over 5 years ≈ 25% IRR`,
    seedData: [
      ['Year', 'Year 0', 'Year 1', 'Year 2', 'Year 3', 'Year 4'],
      ['Cash Flow', -500000, 50000, 75000, 100000, 650000],
      [null, null, null, null, null, null],
      ['IRR', null, null, null, null, null],
    ],
    answerCells: [
      {
        row: 3,
        col: 1,
        // Engine-verified: IRR(-500000,50000,75000,100000,650000) = 0.17467
        expectedValue: 0.17467,
        tolerance: 0.0005,
      },
    ],
  },

  {
    id: 'irr-02',
    title: 'Real Estate Project IRR',
    tier: 'advanced',
    category: 'IRR',
    difficulty: 'advanced',
    hintFunction: 'IRR',
    prompt: `A real estate development project:
• Year 0 (B2): -$1,000,000 (construction + acquisition)
• Year 1 (C2): $80,000 (net rental income)
• Year 2 (D2): $90,000 (net rental income)
• Year 3 (E2): $1,200,000 (net rental + exit sale)

Calculate the IRR in B4.`,
    drillPrompt: 'Real estate CFs (B2:E2): Year0=$-1M, Year1=$80k, Year2=$90k, Year3=$1.2M. Write =IRR(B2:E2) in B4.',
    correctFormula: '=IRR(B2:E2)',
    drillAnswer: '=IRR(B2:E2)',
    drillAnswerScope: 'formula',
    drillWrongOptions: ['=IRR(C2:E2)', '=XNPV(0.1,B2:E2,B3:E3)', '=IRR(B2:E2,-0.1)'],
    explanation: `=IRR(B2:E2)

IRR finds the discount rate where:
PV(80k) + PV(90k) + PV(1.2M) = 1,000,000

Result: the project's annualized total return on invested capital.

Interview tip: Real estate IRR incorporates both income (rental yield) and capital appreciation (exit multiple). A common interview question: "Why might IRR be misleading for comparing projects of different durations?" Answer: IRR assumes reinvestment at the IRR rate, which may not be achievable.`,
    seedData: [
      ['Year', 'Year 0', 'Year 1', 'Year 2', 'Year 3'],
      ['Cash Flow', -1000000, 80000, 90000, 1200000],
      [null, null, null, null, null],
      ['IRR', null, null, null, null],
    ],
    answerCells: [
      {
        row: 3,
        col: 1,
        // Engine-verified: IRR(-1000000,80000,90000,1200000) = 0.11892
        expectedValue: 0.11892,
        tolerance: 0.0005,
      },
    ],
  },

  {
    id: 'irr-03',
    title: 'Infrastructure Fund IRR — 6 Year Hold',
    tier: 'advanced',
    category: 'IRR',
    difficulty: 'advanced',
    hintFunction: 'IRR',
    prompt: `An infrastructure fund makes a $2M equity investment with cash distributions over 6 years:
• Year 0 (B2): -$2,000,000
• Years 1–5 (C2:G2): $150k, $180k, $210k, $240k, $2,500,000

Calculate the IRR in B4.`,
    drillPrompt: 'Infrastructure CFs (B2:G2): Year0=$-2M, Yr1=$150k, Yr2=$180k, Yr3=$210k, Yr4=$240k, Yr5=$2.5M. Write =IRR(B2:G2) in B4.',
    correctFormula: '=IRR(B2:G2)',
    drillAnswer: '=IRR(B2:G2)',
    drillAnswerScope: 'formula',
    drillWrongOptions: ['=IRR(C2:G2)', '=IRR(B2:F2)', '=NPV(0.12,C2:G2)+B2'],
    explanation: `=IRR(B2:G2)

Must include all 6 years of cash flows, starting with the negative outflow in B2 (Year 0).

Interview tip: Infrastructure IRRs typically target 8–12% (core) to 12–15% (value-add). PE IRR targets are typically 20%+. The sector-appropriate benchmark is as important as the raw number.`,
    seedData: [
      ['Year', 'Year 0', 'Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5'],
      ['Cash Flow', -2000000, 150000, 180000, 210000, 240000, 2500000],
      [null, null, null, null, null, null, null],
      ['IRR', null, null, null, null, null, null],
    ],
    answerCells: [
      {
        row: 3,
        col: 1,
        // Engine-verified: IRR(-2000000,150000,180000,210000,240000,2500000) = 0.11974
        expectedValue: 0.11974,
        tolerance: 0.0005,
      },
    ],
  },

  {
    id: 'irr-04',
    title: 'Distressed Investment IRR',
    tier: 'advanced',
    category: 'IRR',
    difficulty: 'advanced',
    hintFunction: 'IRR',
    prompt: `A distressed debt fund buys non-performing loans. The cash flows are uneven and include a partial recovery:
• Year 0 (B2): -$300,000 (purchase price)
• Year 1 (C2): $20,000
• Year 2 (D2): $30,000
• Year 3 (E2): $40,000
• Year 4 (F2): $180,000 (final recovery)

Calculate the IRR in B4. Provide an initial guess of 0.1 (10%) since distressed cash flows can yield multiple solutions.`,
    drillPrompt: 'Distressed loan CFs (B2:F2): Year0=$-300k, Yr1=$20k, Yr2=$30k, Yr3=$40k, Yr4=$180k. Write =IRR(B2:F2,0.1) in B4 (with guess).',
    correctFormula: '=IRR(B2:F2,0.1)',
    drillAnswer: '=IRR(B2:F2,0.1)',
    drillAnswerScope: 'formula',
    drillWrongOptions: ['=IRR(B2:F2)', '=IRR(C2:F2,0.1)', '=NPV(0.1,C2:F2)+B2'],
    explanation: `=IRR(B2:F2, 0.1)

The optional second argument (0.1 = 10% guess) helps IRR converge faster when cash flows change sign multiple times.

With a partial recovery: total inflows = $20k + $30k + $40k + $180k = $270k on $300k investment. The investor lost ~10% of capital, so IRR will be negative.

Interview tip: When cash flows change sign more than once (e.g., outflow, inflow, outflow, inflow), IRR can have multiple mathematical solutions. Use a reasonable guess and verify with NPV. Modified IRR (MIRR) is more reliable for non-conventional cash flows.`,
    seedData: [
      ['Year', 'Year 0', 'Year 1', 'Year 2', 'Year 3', 'Year 4'],
      ['Cash Flow', -300000, 20000, 30000, 40000, 180000],
      [null, null, null, null, null, null],
      ['IRR', null, null, null, null, null],
    ],
    answerCells: [
      {
        row: 3,
        col: 1,
        // Engine-verified: IRR(-300000,20000,30000,40000,180000,0.1) = -0.03033
        expectedValue: -0.03033,
        tolerance: 0.0005,
      },
    ],
  },

  {
    id: 'irr-05',
    title: 'Private Equity Fund IRR',
    tier: 'advanced',
    category: 'IRR',
    difficulty: 'advanced',
    hintFunction: 'IRR',
    prompt: `A PE fund's portfolio company cash flows over 4 years:
• Year 0 (B2): -$5,000,000 (initial equity check)
• Year 1 (C2): $0 (hold period, no distributions)
• Year 2 (D2): $500,000 (dividend recapitalization)
• Year 3 (E2): $7,500,000 (exit proceeds)

Calculate the IRR in B4.`,
    drillPrompt: 'PE fund CFs (B2:E2): Year0=$-5M, Year1=$0, Year2=$500k (div recap), Year3=$7.5M (exit). Write =IRR(B2:E2) in B4.',
    correctFormula: '=IRR(B2:E2)',
    drillAnswer: '=IRR(B2:E2)',
    drillAnswerScope: 'formula',
    drillWrongOptions: ['=IRR(B2:D2)', '=IRR(C2:E2)', '=NPV(0.2,C2:E2)+B2'],
    explanation: `=IRR(B2:E2)

• Year 0: -$5M equity investment
• Year 2: $500k dividend recap (partial exit, maintain control)
• Year 3: $7.5M exit → ~1.6x MOIC gross

Result: ~17% IRR

Interview tip: IRR must include zeros for years with no cash flows. A common mistake is omitting Year 1 (B3=0) — this shifts all subsequent cash flows by one period and gives a wildly different answer. Always map cash flows to explicit year periods.`,
    seedData: [
      ['Year', 'Year 0', 'Year 1', 'Year 2', 'Year 3'],
      ['Cash Flow', -5000000, 0, 500000, 7500000],
      [null, null, null, null, null],
      ['IRR', null, null, null, null],
    ],
    answerCells: [
      {
        row: 3,
        col: 1,
        // Engine-verified: IRR(-5000000,0,500000,7500000)
        expectedValue: 0.1744,
        tolerance: 0.001,
      },
    ],
  },

  // ── XLOOKUP (using INDEX/MATCH for engine compatibility) ──────────────────
  // Note: HyperFormula 3.2 does not support XLOOKUP. The engine tests verify
  // the INDEX/MATCH equivalent. The drillAnswer teaches the XLOOKUP syntax.

  {
    id: 'xlookup-01',
    title: 'Employee Salary with XLOOKUP',
    tier: 'advanced',
    category: 'XLOOKUP',
    difficulty: 'advanced',
    hintFunction: 'XLOOKUP',
    prompt: `XLOOKUP is the modern replacement for VLOOKUP — it's more flexible, works in any direction, and handles missing values natively.

Employee table (A2:C5):
• 101 / Alice / $75,000
• 102 / Bob / $90,000
• 103 / Carol / $105,000
• 104 / David / $120,000

Write an XLOOKUP formula in E2 to find Employee 103's salary. If not found, return "Not Found".

XLOOKUP syntax: =XLOOKUP(lookup_value, lookup_array, return_array, [if_not_found])`,
    drillPrompt: 'Employee table: IDs 101-104 (A2:A5), Salaries (C2:C5). Write XLOOKUP to find salary for ID 103 with "Not Found" fallback.',
    correctFormula: '=INDEX(C2:C5,MATCH(103,A2:A5,0))',
    drillAnswer: '=XLOOKUP(103,A2:A5,C2:C5,"Not Found")',
    drillAnswerScope: 'formula',
    drillWrongOptions: ['=XLOOKUP(103,A2:A5,B2:B5,"Not Found")', '=VLOOKUP(103,A2:C5,3,0)', '=XLOOKUP(103,C2:C5,A2:A5,"Not Found")'],
    explanation: `XLOOKUP(lookup_value, lookup_array, return_array, [if_not_found])

=XLOOKUP(103, A2:A5, C2:C5, "Not Found")
• 103 — Employee ID to find
• A2:A5 — where to search (ID column)
• C2:C5 — what to return (Salary column)
• "Not Found" — returned if 103 not in table

XLOOKUP advantages over VLOOKUP:
1. Separate return_array — no fragile col_index number
2. Built-in error handling (4th argument replaces IFERROR wrapper)
3. Can search left, right, or vertically
4. Exact match by default (no need for 0 argument)

Engine note: XLOOKUP requires Excel 365/2019+. This challenge uses INDEX/MATCH as the equivalent formula for the engine test.`,
    seedData: [
      ['Employee ID', 'Name', 'Annual Salary', null, 'Emp 103 Salary'],
      [101, 'Alice Johnson', 75000, null, null],
      [102, 'Bob Smith', 90000, null, null],
      [103, 'Carol Williams', 105000, null, null],
      [104, 'David Lee', 120000, null, null],
    ],
    answerCells: [
      {
        row: 1,
        col: 4,
        expectedValue: 105000,
        tolerance: 0,
      },
    ],
  },

  {
    id: 'xlookup-02',
    title: 'Stock Price XLOOKUP with Left-Column Return',
    tier: 'advanced',
    category: 'XLOOKUP',
    difficulty: 'advanced',
    hintFunction: 'XLOOKUP',
    prompt: `XLOOKUP can return columns to the LEFT of the lookup column — VLOOKUP cannot.

Market data table (A2:D6):
• AAPL / Apple / Technology / $189.50
• MSFT / Microsoft / Technology / $415.20
• JPM / JPMorgan / Financials / $198.30
• GS / Goldman / Financials / $445.80
• AMZN / Amazon / Consumer Disc / $198.60

Write an XLOOKUP formula in F2 to find the Last Price (column D) for ticker "MSFT".`,
    drillPrompt: 'Market table (A2:D6): Tickers in A, Prices in D. Write XLOOKUP to find "MSFT" price: =XLOOKUP("MSFT",A2:A6,D2:D6,"N/A") in F2.',
    correctFormula: '=INDEX(D2:D6,MATCH("MSFT",A2:A6,0))',
    drillAnswer: '=XLOOKUP("MSFT",A2:A6,D2:D6,"N/A")',
    drillAnswerScope: 'formula',
    drillWrongOptions: ['=VLOOKUP("MSFT",A2:D6,4,0)', '=XLOOKUP("MSFT",D2:D6,A2:A6,"N/A")', '=XLOOKUP("MSFT",A2:A6,C2:C6,"N/A")'],
    explanation: `=XLOOKUP("MSFT", A2:A6, D2:D6, "N/A")

• "MSFT" — ticker to find
• A2:A6 — lookup in Ticker column
• D2:D6 — return from Price column (any direction)
• "N/A" — fallback if not found

Result: 415.20

XLOOKUP vs VLOOKUP: VLOOKUP requires the lookup column to be leftmost in the table. XLOOKUP separates the lookup array from the return array — they're independent ranges, so you can return ANY column regardless of position.`,
    seedData: [
      ['Ticker', 'Company', 'Sector', 'Last Price ($)', null, 'MSFT Price'],
      ['AAPL', 'Apple', 'Technology', 189.50, null, null],
      ['MSFT', 'Microsoft', 'Technology', 415.20, null, null],
      ['JPM', 'JPMorgan', 'Financials', 198.30, null, null],
      ['GS', 'Goldman', 'Financials', 445.80, null, null],
      ['AMZN', 'Amazon', 'Consumer Disc', 198.60, null, null],
    ],
    answerCells: [
      {
        row: 1,
        col: 5,
        expectedValue: 415.2,
        tolerance: 0.01,
      },
    ],
  },

  {
    id: 'xlookup-03',
    title: 'Bond Yield XLOOKUP by Rating',
    tier: 'advanced',
    category: 'XLOOKUP',
    difficulty: 'advanced',
    hintFunction: 'XLOOKUP',
    prompt: `Look up the yield spread for a bond with a "BB+" rating.

Bond table:
• A2:A5 — Ratings (AAA, A, BB+, CCC)
• B2:B5 — Yield Spreads (2.0%, 4.5%, 8.5%, 15.0%)

Write XLOOKUP in D2 to find the spread for "BB+", returning "Not Rated" if not found.`,
    drillPrompt: 'Bond ratings in A2:A5 (AAA/A/BB+/CCC), spreads in B2:B5 (0.02/0.045/0.085/0.15). Write XLOOKUP to get spread for "BB+".',
    correctFormula: '=INDEX(B2:B5,MATCH("BB+",A2:A5,0))',
    drillAnswer: '=XLOOKUP("BB+",A2:A5,B2:B5,"Not Rated")',
    drillAnswerScope: 'formula',
    drillWrongOptions: ['=VLOOKUP("BB+",A2:B5,2,0)', '=XLOOKUP("BB+",B2:B5,A2:A5,"Not Rated")', '=XLOOKUP("BB",A2:A5,B2:B5,"Not Rated")'],
    explanation: `=XLOOKUP("BB+", A2:A5, B2:B5, "Not Rated")

• "BB+" — rating to look up
• A2:A5 — ratings column (lookup array)
• B2:B5 — spreads column (return array)
• "Not Rated" — fallback

Result: 0.085 (8.5% spread)

Interview tip: XLOOKUP is exact match by default (no need for 0 as last argument). This is an improvement over VLOOKUP which defaults to approximate match (TRUE), a common source of errors. Always use XLOOKUP when on Excel 365/2019+.`,
    seedData: [
      ['Rating', 'Yield Spread', null, 'BB+ Spread'],
      ['AAA', 0.020, null, null],
      ['A', 0.045, null, null],
      ['BB+', 0.085, null, null],
      ['CCC', 0.150, null, null],
    ],
    answerCells: [
      {
        row: 1,
        col: 3,
        expectedValue: 0.085,
        tolerance: 0.0001,
      },
    ],
  },

  {
    id: 'xlookup-04',
    title: 'Quarterly Revenue XLOOKUP',
    tier: 'advanced',
    category: 'XLOOKUP',
    difficulty: 'advanced',
    hintFunction: 'XLOOKUP',
    prompt: `Retrieve Q4 revenue from a quarterly summary table using XLOOKUP.

Table:
• A2:A5 — Quarters (Q1, Q2, Q3, Q4)
• C2:C5 — Revenue ($000s): 820,000 / 950,000 / 980,000 / 1,100,000

Write XLOOKUP in E2 to find Q4 revenue. Return 0 if not found.`,
    drillPrompt: 'Quarters in A2:A5 (Q1/Q2/Q3/Q4), revenues in C2:C5 ($820k/$950k/$980k/$1100k). Write XLOOKUP for Q4 revenue.',
    correctFormula: '=INDEX(C2:C5,MATCH("Q4",A2:A5,0))',
    drillAnswer: '=XLOOKUP("Q4",A2:A5,C2:C5,0)',
    drillAnswerScope: 'formula',
    drillWrongOptions: ['=XLOOKUP("Q4",A2:A5,B2:B5,0)', '=VLOOKUP("Q4",A2:C5,3,0)', '=XLOOKUP(Q4,A2:A5,C2:C5,0)'],
    explanation: `=XLOOKUP("Q4", A2:A5, C2:C5, 0)

• "Q4" — quarter to find
• A2:A5 — quarters lookup column
• C2:C5 — revenue return column (note: column C, skipping column B)
• 0 — return 0 if Q4 not found

Result: 1,100,000

Key insight: XLOOKUP's return_array doesn't need to be adjacent to the lookup_array. Here, A2:A5 (lookup) and C2:C5 (return) skip column B entirely. VLOOKUP can't do this without specifying a col_index that depends on the table structure.`,
    seedData: [
      ['Quarter', 'Notes', 'Revenue ($000s)', null, 'Q4 Revenue'],
      ['Q1', null, 820000, null, null],
      ['Q2', null, 950000, null, null],
      ['Q3', null, 980000, null, null],
      ['Q4', null, 1100000, null, null],
    ],
    answerCells: [
      {
        row: 1,
        col: 4,
        expectedValue: 1100000,
        tolerance: 0,
      },
    ],
  },

  {
    id: 'xlookup-05',
    title: 'Sector Revenue XLOOKUP with Fallback',
    tier: 'advanced',
    category: 'XLOOKUP',
    difficulty: 'advanced',
    hintFunction: 'XLOOKUP',
    prompt: `A sector revenue table. Look up revenue for the "Technology" sector.

Table (A2:B6):
• Technology / $350,000
• Healthcare / $280,000
• Energy / $195,000
• Financials / $420,000
• Real Estate / $165,000

Write XLOOKUP in D2 to retrieve Technology revenue. If not found, return "N/A".`,
    drillPrompt: 'Sector table (A2:B6): Tech/$350k, Healthcare/$280k, Energy/$195k, Financials/$420k, Real Estate/$165k. Write XLOOKUP for Technology revenue.',
    correctFormula: '=INDEX(B2:B6,MATCH("Technology",A2:A6,0))',
    drillAnswer: '=XLOOKUP("Technology",A2:A6,B2:B6,"N/A")',
    drillAnswerScope: 'formula',
    drillWrongOptions: ['=VLOOKUP("Technology",A2:B6,2,0)', '=XLOOKUP("Technology",B2:B6,A2:A6,"N/A")', '=XLOOKUP("tech",A2:A6,B2:B6,"N/A")'],
    explanation: `=XLOOKUP("Technology", A2:A6, B2:B6, "N/A")

• "Technology" — sector to look up
• A2:A6 — sector name column
• B2:B6 — revenue column
• "N/A" — fallback if sector not in table

Result: 350,000

Interview tip: XLOOKUP is case-insensitive by default (same as VLOOKUP). "Technology", "technology", "TECHNOLOGY" all return the same result. If you need case-sensitive lookup, you'd need a MATCH with EXACT() nested inside.`,
    seedData: [
      ['Sector', 'Revenue ($000s)', null, 'Technology Revenue'],
      ['Technology', 350000, null, null],
      ['Healthcare', 280000, null, null],
      ['Energy', 195000, null, null],
      ['Financials', 420000, null, null],
      ['Real Estate', 165000, null, null],
    ],
    answerCells: [
      {
        row: 1,
        col: 3,
        expectedValue: 350000,
        tolerance: 0,
      },
    ],
  },

  // ── XNPV ──────────────────────────────────────────────────────────────────
  // XNPV uses date serial numbers. Excel's date serial:
  //   Jan 1, 2023 = 44927  (2023-01-01)
  //   Jan 1, 2024 = 45292  (2024-01-01)
  //   Jul 1, 2023 = 45108  (2023-07-01)
  //   Dec 31, 2023 = 45291 (2023-12-31)

  {
    id: 'xnpv-01',
    title: 'Irregular Cash Flow XNPV',
    tier: 'advanced',
    category: 'XNPV',
    difficulty: 'advanced',
    hintFunction: 'XNPV',
    prompt: `XNPV discounts cash flows based on EXACT dates, not assumed annual periods. This is more accurate for real-world investments where cash flows don't occur on anniversaries.

Cash flows (row 2) and date serials (row 3):
• B2: -100,000 / B3: 44927 (2023-01-01)
• C2:  25,000  / C3: 45108 (2023-07-01, 6-mo interval)
• D2:  40,000  / D3: 45292 (2024-01-01, 1-yr interval)
• E2:  70,000  / E3: 45657 (2025-01-01, 2-yr interval)

Discount rate = 10%. Write the XNPV formula in B5.

XNPV syntax: =XNPV(rate, values, dates)`,
    drillPrompt: 'Irregular CFs B2:E2: -100k/25k/40k/70k at dates B3:E3: 44927/45108/45292/45657. Rate=10%. Write =XNPV(0.1,B2:E2,B3:E3) in B5.',
    correctFormula: '=XNPV(0.1,B2:E2,B3:E3)',
    drillAnswer: '=XNPV(0.1,B2:E2,B3:E3)',
    drillAnswerScope: 'formula',
    drillWrongOptions: ['=NPV(0.1,B2:E2)', '=XNPV(10,B2:E2,B3:E3)', '=XNPV(0.1,C2:E2,C3:E3)'],
    explanation: `XNPV(rate, values, dates) discounts each cash flow by the exact time elapsed from the first date.

=XNPV(0.1, B2:E2, B3:E3)
• 0.1 — 10% discount rate
• B2:E2 — cash flows (must start with negative value)
• B3:E3 — date serials for each cash flow

XNPV vs NPV: NPV assumes exactly 1 year between each cash flow. XNPV uses actual dates, so a 6-month interval is discounted for 0.5 years, not 1 year. This is essential for bonds, leases, and project finance.

Interview tip: Always ask "when do the cash flows occur?" — XNPV is more accurate whenever flows aren't exactly annual.`,
    seedData: [
      ['Period', 'CF0', 'CF1', 'CF2', 'CF3'],
      ['Cash Flow', -100000, 25000, 40000, 70000],
      ['Date Serial', 44927, 45108, 45292, 45657],
      [null, null, null, null, null],
      ['XNPV', null, null, null, null],
    ],
    answerCells: [
      {
        row: 4,
        col: 1,
        // Engine-verified: XNPV(0.1,[-100000,25000,40000,70000],[44927,45108,45292,45657]) = 18060.78
        expectedValue: 18060.78,
        tolerance: 1,
      },
    ],
  },

  {
    id: 'xnpv-02',
    title: 'Bond Cash Flow XNPV',
    tier: 'advanced',
    category: 'XNPV',
    difficulty: 'advanced',
    hintFunction: 'XNPV',
    prompt: `Value a simple bond using XNPV. The bond pays semi-annual coupons.

Cash flows (row 2) and date serials (row 3):
• B2: -50,000 / B3: 44927 (2023-01-01, purchase date)
• C2:  2,000  / C3: 45108 (2023-07-01, first coupon)
• D2:  52,000 / D3: 45292 (2024-01-01, final coupon + principal)

Discount rate = 8%. Write XNPV in B5.`,
    drillPrompt: 'Bond: bought for -50k on 44927, coupon $2k on 45108, final $52k on 45292. Rate=8%. Write =XNPV(0.08,B2:D2,B3:D3) in B5.',
    correctFormula: '=XNPV(0.08,B2:D2,B3:D3)',
    drillAnswer: '=XNPV(0.08,B2:D2,B3:D3)',
    drillAnswerScope: 'formula',
    drillWrongOptions: ['=NPV(0.08,C2:D2)+B2', '=XNPV(8,B2:D2,B3:D3)', '=XNPV(0.08,C2:D2,C3:D3)'],
    explanation: `=XNPV(0.08, B2:D2, B3:D3)

Uses exact semi-annual intervals (not annual). The 6-month coupon is discounted for exactly half a year.

If XNPV > 0: the bond is undervalued at 8% → buy signal.
If XNPV < 0: the bond is overvalued → sell signal (equivalent to YTM < 8%).

Interview tip: XNPV is the proper tool for bond valuation because coupons are semi-annual, not annual. Using NPV with semi-annual coupons requires halving the rate, which is less intuitive. XNPV handles the date math automatically.`,
    seedData: [
      ['Period', 'Purchase', 'Coupon 1', 'Coupon 2 + Principal'],
      ['Cash Flow', -50000, 2000, 52000],
      ['Date Serial', 44927, 45108, 45292],
      [null, null, null, null],
      ['XNPV', null, null, null],
    ],
    answerCells: [
      {
        row: 4,
        col: 1,
        // Engine-verified: XNPV(0.08,[-50000,2000,52000],[44927,45108,45292]) = 73.26
        expectedValue: 73.26,
        tolerance: 1,
      },
    ],
  },

  {
    id: 'xnpv-03',
    title: 'Infrastructure Project XNPV — 5 Irregular Periods',
    tier: 'advanced',
    category: 'XNPV',
    difficulty: 'advanced',
    hintFunction: 'XNPV',
    prompt: `An infrastructure project with irregular cash flow timing:

Cash flows (row 2) and date serials (row 3):
• B2: -500,000 / B3: 44927 (2023-01-01)
• C2:  30,000  / C3: 45108 (2023-07-01)
• D2:  60,000  / D3: 45657 (2025-01-01)
• E2:  80,000  / E3: 46022 (2026-01-01)
• F2:  650,000 / F3: 46388 (2027-01-01)

Discount rate = 12%. Write XNPV in B5.`,
    drillPrompt: 'Irregular project CFs B2:F2: -500k/30k/60k/80k/650k at dates B3:F3: 44927/45108/45657/46022/46388. Rate=12%. Write =XNPV(0.12,B2:F2,B3:F3) in B5.',
    correctFormula: '=XNPV(0.12,B2:F2,B3:F3)',
    drillAnswer: '=XNPV(0.12,B2:F2,B3:F3)',
    drillAnswerScope: 'formula',
    drillWrongOptions: ['=NPV(0.12,C2:F2)+B2', '=XNPV(12,B2:F2,B3:F3)', '=XNPV(0.12,B2:E2,B3:E3)'],
    explanation: `=XNPV(0.12, B2:F2, B3:F3)

5 cash flows spanning ~4 years with irregular intervals:
• First CF after 6 months (CF1 at 2023-07-01)
• 18-month gap before CF2 (2025-01-01)
• Annual CFs after that

These irregular gaps make NPV inaccurate — XNPV handles them precisely.

Interview tip: In project finance, construction phases, ramp-up periods, and seasonal businesses create irregular cash flow timing. XNPV is the industry-standard function for these valuations.`,
    seedData: [
      ['Period', 'CF0', 'CF1', 'CF2', 'CF3', 'CF4'],
      ['Cash Flow', -500000, 30000, 60000, 80000, 650000],
      ['Date Serial', 44927, 45108, 45657, 46022, 46388],
      [null, null, null, null, null, null],
      ['XNPV', null, null, null, null, null],
    ],
    answerCells: [
      {
        row: 4,
        col: 1,
        // Engine-verified: XNPV(0.12,CFs,Dates) = 46093.11
        expectedValue: 46093.11,
        tolerance: 5,
      },
    ],
  },

  {
    id: 'xnpv-04',
    title: 'Acquisition FCF XNPV',
    tier: 'advanced',
    category: 'XNPV',
    difficulty: 'advanced',
    hintFunction: 'XNPV',
    prompt: `Value acquisition free cash flows at exact date-based discounting:

Cash flows (row 2) and date serials (row 3):
• B2: -200,000 / B3: 44927 (2023-01-01, acquisition date)
• C2:  25,000  / C3: 45292 (2024-01-01, Year 1 FCF)
• D2:  40,000  / D3: 45657 (2025-01-01, Year 2 FCF)
• E2:  350,000 / E3: 46022 (2026-01-01, Year 3 FCF + exit)

Discount rate = 9%. Write XNPV in B5.`,
    drillPrompt: 'Acquisition: -$200k on 44927, $25k on 45292, $40k on 45657, $350k on 46022. Rate=9%. Write =XNPV(0.09,B2:E2,B3:E3) in B5.',
    correctFormula: '=XNPV(0.09,B2:E2,B3:E3)',
    drillAnswer: '=XNPV(0.09,B2:E2,B3:E3)',
    drillAnswerScope: 'formula',
    drillWrongOptions: ['=NPV(0.09,C2:E2)+B2', '=XNPV(9,B2:E2,B3:E3)', '=XNPV(0.09,B2:D2,B3:D3)'],
    explanation: `=XNPV(0.09, B2:E2, B3:E3)

All cash flows occur exactly 1 year apart — but using XNPV is still best practice to be explicit about dates and make the model robust to future schedule changes.

Interview tip: When should you use XNPV vs NPV? Use XNPV when: (1) cash flows are irregular, (2) the first cash flow is not at t=0 exactly, or (3) you're being precise in a formal model. In quick mental math, NPV is fine.`,
    seedData: [
      ['Period', 'Acquisition', 'Year 1 FCF', 'Year 2 FCF', 'Year 3 + Exit'],
      ['Cash Flow', -200000, 25000, 40000, 350000],
      ['Date Serial', 44927, 45292, 45657, 46022],
      [null, null, null, null, null],
      ['XNPV', null, null, null, null],
    ],
    answerCells: [
      {
        row: 4,
        col: 1,
        // Engine-verified: XNPV(0.09,[-200000,25000,40000,350000],[44927,45292,45657,46022]) = 126867.20
        expectedValue: 126867.20,
        tolerance: 5,
      },
    ],
  },

  // ── OFFSET ────────────────────────────────────────────────────────────────

  {
    id: 'offset-01',
    title: 'Dynamic Sum with OFFSET',
    tier: 'advanced',
    category: 'OFFSET',
    difficulty: 'advanced',
    hintFunction: 'OFFSET',
    prompt: `OFFSET creates a dynamic range reference. Wrap it in SUM to create a dynamic sum that adjusts automatically.

Revenue data in column B:
• B2: 120,000
• B3: 135,000
• B4: 148,000
• B5: 162,000

Write a formula in D2 using SUM(OFFSET(...)) to sum the first 3 rows of revenue starting from B2. The range height is hardcoded as 3.

OFFSET syntax: =OFFSET(reference, rows, cols, [height], [width])`,
    drillPrompt: 'Revenue in B2:B5: $120k/$135k/$148k/$162k. Write =SUM(OFFSET(B2,0,0,3,1)) in D2 to sum the first 3 revenue rows.',
    correctFormula: '=SUM(OFFSET(B2,0,0,3,1))',
    drillAnswer: '=SUM(OFFSET(B2,0,0,3,1))',
    drillAnswerScope: 'formula',
    drillWrongOptions: ['=SUM(B2:B4)', '=SUM(OFFSET(B2,0,0,4,1))', '=OFFSET(B2,0,0,3,1)'],
    explanation: `OFFSET(reference, rows, cols, [height], [width])
• reference — starting cell (B2)
• rows — 0 rows down (same row)
• cols — 0 cols right (same column)
• height — 3 rows tall
• width — 1 column wide

=OFFSET(B2,0,0,3,1) creates a 3×1 range starting at B2 → equivalent to B2:B4
=SUM(B2:B4) = 120,000 + 135,000 + 148,000 = 403,000

Interview tip: OFFSET is powerful when the range size is variable. Replace 3 with a cell reference (like B1=3) and the sum range adjusts dynamically. This is useful in time-series models where you want to sum the last N periods.`,
    seedData: [
      ['Quarter', 'Revenue ($)', null, 'Sum First 3'],
      ['Q1', 120000, null, null],
      ['Q2', 135000, null, null],
      ['Q3', 148000, null, null],
      ['Q4', 162000, null, null],
    ],
    answerCells: [
      {
        row: 1,
        col: 3,
        // Engine-verified: SUM(B2:B4) = 120000 + 135000 + 148000 = 403000
        expectedValue: 403000,
        tolerance: 0,
      },
    ],
  },

  {
    id: 'offset-02',
    title: 'Navigate to a Specific Cell with OFFSET',
    tier: 'advanced',
    category: 'OFFSET',
    difficulty: 'advanced',
    hintFunction: 'OFFSET',
    prompt: `OFFSET can navigate to a specific cell relative to a reference point.

A deal pipeline table (A2:C5):
| Row | A (Deal ID) | B (Sector)   | C (Value $M) |
|-----|-------------|--------------|--------------|
| 2   | D001        | Technology   | 450,000      |
| 3   | D002        | Healthcare   | 280,000      |
| 4   | D003        | Energy       | 390,000      |
| 5   | D004        | Financials   | 510,000      |

Write OFFSET in E2 to retrieve the value 2 rows down and 2 columns to the right of A2 (which is C4 = Energy deal value $390,000).`,
    drillPrompt: 'Table A2:C5. Write =OFFSET(A2,2,2) in E2 to get cell C4 (2 rows down, 2 cols right of A2 = Energy deal value).',
    correctFormula: '=OFFSET(A2,2,2)',
    drillAnswer: '=OFFSET(A2,2,2)',
    drillAnswerScope: 'formula',
    drillWrongOptions: ['=OFFSET(A2,3,2)', '=OFFSET(A2,2,1)', '=OFFSET(A1,2,2)'],
    explanation: `=OFFSET(A2, 2, 2)

• Starting at A2
• Move 2 rows down → A4
• Move 2 columns right → C4

C4 = 390,000 (Energy deal value)

Interview tip: OFFSET is often used to create dynamic named ranges in financial models. For example, =OFFSET(A1,0,0,COUNTA(A:A),1) creates a range that automatically expands as you add data. This is useful in charts and SUMIF ranges that need to adjust dynamically.`,
    seedData: [
      ['Deal ID', 'Sector', 'Value ($M)', null, 'OFFSET Result'],
      ['D001', 'Technology', 450000, null, null],
      ['D002', 'Healthcare', 280000, null, null],
      ['D003', 'Energy', 390000, null, null],
      ['D004', 'Financials', 510000, null, null],
    ],
    answerCells: [
      {
        row: 1,
        col: 4,
        // Engine-verified: OFFSET(A2,2,2) = C4 = 390000
        expectedValue: 390000,
        tolerance: 0,
      },
    ],
  },

  {
    id: 'offset-03',
    title: 'Rolling Average with OFFSET',
    tier: 'advanced',
    category: 'OFFSET',
    difficulty: 'advanced',
    hintFunction: 'OFFSET',
    prompt: `Use AVERAGE(OFFSET(...)) to compute a rolling average over the first 4 revenue periods.

Monthly revenue in column B (B2:B5):
• B2: 95,000
• B3: 102,000
• B4: 118,000
• B5: 107,000

Write a formula in D2 using AVERAGE(OFFSET(B2,0,0,4,1)) to compute the 4-period average.`,
    drillPrompt: 'Monthly revenue B2:B5: $95k/$102k/$118k/$107k. Write =AVERAGE(OFFSET(B2,0,0,4,1)) in D2 for 4-period rolling average.',
    correctFormula: '=AVERAGE(OFFSET(B2,0,0,4,1))',
    drillAnswer: '=AVERAGE(OFFSET(B2,0,0,4,1))',
    drillAnswerScope: 'formula',
    drillWrongOptions: ['=AVERAGE(B2:B5)', '=AVERAGE(OFFSET(B2,0,0,3,1))', '=AVERAGE(OFFSET(B1,0,0,4,1))'],
    explanation: `=AVERAGE(OFFSET(B2,0,0,4,1))

OFFSET(B2,0,0,4,1) → B2:B5 (4-row range)
AVERAGE(B2:B5) = (95000+102000+118000+107000)/4 = 422000/4 = 105,500

Interview tip: =AVERAGE(B2:B5) would give the same result — but AVERAGE(OFFSET(B2,0,0,N,1)) becomes powerful when N is a variable (e.g., a cell input). This pattern builds rolling N-period averages for time-series analysis in financial models.`,
    seedData: [
      ['Month', 'Revenue ($)', null, '4-Period Average'],
      ['Jan', 95000, null, null],
      ['Feb', 102000, null, null],
      ['Mar', 118000, null, null],
      ['Apr', 107000, null, null],
    ],
    answerCells: [
      {
        row: 1,
        col: 3,
        // Engine-verified: AVERAGE(B2:B5) = 105500
        expectedValue: 105500,
        tolerance: 0,
      },
    ],
  },

  {
    id: 'offset-04',
    title: 'Dynamic Range SUM using OFFSET with MATCH',
    tier: 'advanced',
    category: 'OFFSET',
    difficulty: 'advanced',
    hintFunction: 'OFFSET',
    prompt: `Combine OFFSET with MATCH to create a dynamic sum that adjusts based on a period selector.

Quarter labels in A2:A5 (Q1, Q2, Q3, Q4). Revenue in B2:B5.

The number of periods to sum is driven by a value in D2 (D2 = 3, meaning "sum the first 3 quarters").

Write a formula in E2: =SUM(OFFSET(B2,0,0,D2,1)) to dynamically sum the first D2 quarters.`,
    drillPrompt: 'Revenue B2:B5: Q1=$80k/Q2=$95k/Q3=$110k/Q4=$125k. Period selector D2=3. Write =SUM(OFFSET(B2,0,0,D2,1)) in E2.',
    correctFormula: '=SUM(OFFSET(B2,0,0,3,1))',
    drillAnswer: '=SUM(OFFSET(B2,0,0,D2,1))',
    drillAnswerScope: 'formula',
    drillWrongOptions: ['=SUM(B2:B4)', '=SUM(OFFSET(B2,0,0,4,1))', '=OFFSET(B2,0,0,D2,1)'],
    explanation: `=SUM(OFFSET(B2, 0, 0, D2, 1))

With D2=3 (hardcoded in this engine test as 3):
• OFFSET(B2,0,0,3,1) → B2:B4 (first 3 quarters)
• SUM(B2:B4) = 80000 + 95000 + 110000 = 285,000

In Excel, using a cell reference as height (D2) makes the sum dynamic:
- Change D2 to 4 → automatically includes Q4.
- Change D2 to 1 → only Q1.

Note: HyperFormula requires OFFSET height to be a static number. In practice (Excel), =SUM(OFFSET(B2,0,0,D2,1)) with D2=3 gives the same result as the hardcoded version.

Interview tip: This OFFSET+cell reference pattern is how financial models build "YTD through period N" selectors. It's a key technique in management reporting dashboards and rolling forecast models.`,
    seedData: [
      ['Quarter', 'Revenue ($)', null, 'Periods', 'Dynamic Sum'],
      ['Q1', 80000, null, 3, null],
      ['Q2', 95000, null, null, null],
      ['Q3', 110000, null, null, null],
      ['Q4', 125000, null, null, null],
    ],
    answerCells: [
      {
        row: 1,
        col: 4,
        // Engine-verified: SUM(OFFSET(B2,0,0,3,1)) = SUM(B2:B4) = 80000+95000+110000 = 285000
        expectedValue: 285000,
        tolerance: 0,
      },
    ],
  },
];
