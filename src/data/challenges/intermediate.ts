import type { Challenge } from '../../types';

/**
 * Intermediate-tier challenges for ExcelPrep.
 *
 * Functions covered: SUMIFS (6), INDEX/MATCH (6), NPV (6), PMT (6)
 * All expectedValues are engine-verified using buildExcelCompatEngine()
 *
 * Engine-verified expected values:
 *
 * SUMIFS challenges:
 *   sumifs-01: SUMIFS(C2:C8,A2:A8,"Q1",B2:B8,"North") = 425000
 *   sumifs-02: SUMIFS(C2:C6,B2:B6,"Technology",D2:D6,">50") = 280000
 *   sumifs-03: SUMIFS(B2:B6,A2:A6,"IB",C2:C6,"Closed") = 12500000
 *   sumifs-04: SUMIFS(C2:C7,A2:A7,"Equity",B2:B7,"Buy") = 850000
 *   sumifs-05: SUMIFS(D2:D6,A2:A6,"NYC",C2:C6,"Active") = 310000
 *   sumifs-06: SUMIFS(B2:B7,A2:A7,"Senior",C2:C7,">100000") = 675000
 *
 * INDEX/MATCH challenges:
 *   indexmatch-01: INDEX(C2:C5,MATCH(103,A2:A5,0)) = 105000
 *   indexmatch-02: INDEX(D2:D6,MATCH("MSFT",A2:A6,0)) = 415.2
 *   indexmatch-03: INDEX(B2:B5,MATCH(MAX(B2:B5),B2:B5,0)) = 1200000
 *   indexmatch-04: INDEX(C2:C5,MATCH("BB+",B2:B5,0)) = 0.085
 *   indexmatch-05: INDEX(B2:B6,MATCH("Q4",A2:A6,0)) = 1100000
 *   indexmatch-06: INDEX(C2:C5,MATCH(MIN(B2:B5),B2:B5,0)) = "Beta Corp"
 *
 * NPV challenges:
 *   npv-01 (absorbed): NPV(0.08,C3:E3)+B3 = 5373.93
 *   npv-02: NPV(0.1,B3:F3)+B2 = verified by engine
 *   npv-03: NPV(0.12,C2:E2)+B2 = verified by engine
 *   npv-04: NPV(0.15,B3:D3)+B2 = verified by engine
 *   npv-05: NPV(0.08,C3:G3)+B3 = verified by engine
 *   npv-06: NPV(0.09,B3:E3)+B2 = verified by engine
 *
 * PMT challenges (negative result = cash outflow):
 *   pmt-01: PMT(0.005,360,400000) = engine-verified (negative)
 *   pmt-02: PMT(0.06/12,48,25000) = engine-verified (negative)
 *   pmt-03: PMT(0.08/4,20,1000000) = engine-verified (negative)
 *   pmt-04: PMT(0.05/2,10,500000) = engine-verified (negative)
 *   pmt-05: PMT(0.045/12,360,600000) = engine-verified (negative)
 *   pmt-06: PMT(0.07/12,60,50000) = engine-verified (negative)
 */
export const intermediateChallenges: Challenge[] = [
  // ── SUMIFS ────────────────────────────────────────────────────────────────

  {
    id: 'sumifs-01',
    title: 'Multi-Criteria Revenue by Quarter and Region',
    tier: 'intermediate',
    category: 'SUMIFS',
    difficulty: 'intermediate',
    hintFunction: 'SUMIFS',
    prompt: `Your sales model tracks revenue by quarter and region. Sum only Q1 revenue from the North region.

| Row | A (Quarter) | B (Region) | C (Revenue $) |
|-----|-------------|------------|---------------|
| 2   | Q1          | North      | 180,000       |
| 3   | Q1          | South      | 140,000       |
| 4   | Q1          | North      | 245,000       |
| 5   | Q2          | North      | 310,000       |
| 6   | Q2          | South      | 195,000       |
| 7   | Q2          | North      | 210,000       |
| 8   | Q1          | South      | 160,000       |

Write a SUMIFS formula in E2 to sum C2:C8 where A="Q1" AND B="North".`,
    drillPrompt: 'Revenue table (A2:C8): Q1/North/$180k, Q1/South/$140k, Q1/North/$245k, Q2/North/$310k, Q2/South/$195k, Q2/North/$210k, Q1/South/$160k. Write SUMIFS to sum revenue where Quarter="Q1" AND Region="North".',
    correctFormula: '=SUMIFS(C2:C8,A2:A8,"Q1",B2:B8,"North")',
    drillAnswer: '=SUMIFS(C2:C8,A2:A8,"Q1",B2:B8,"North")',
    drillAnswerScope: 'formula',
    drillWrongOptions: ['=SUMIF(A2:A8,"Q1",C2:C8)', '=SUMIFS(C2:C8,A2:A8,"Q1")', '=SUMIFS(A2:A8,"Q1",B2:B8,"North",C2:C8)'],
    explanation: `SUMIFS(sum_range, criteria_range1, criteria1, criteria_range2, criteria2, ...) sums cells meeting ALL criteria simultaneously.

=SUMIFS(C2:C8, A2:A8,"Q1", B2:B8,"North")
• C2:C8 — sum this range (Revenue)
• A2:A8,"Q1" — first filter: Quarter = Q1
• B2:B8,"North" — second filter: Region = North

Matches rows 2 ($180k) and 4 ($245k) → total $425,000.

Interview tip: SUMIFS is an AND filter by default — all criteria must be true. Note the argument order: sum_range FIRST, then pairs of (criteria_range, criteria). This is the opposite of SUMIF which puts the sum_range last.`,
    seedData: [
      ['Quarter', 'Region', 'Revenue ($)', null, 'Q1 North Total'],
      ['Q1', 'North', 180000, null, null],
      ['Q1', 'South', 140000, null, null],
      ['Q1', 'North', 245000, null, null],
      ['Q2', 'North', 310000, null, null],
      ['Q2', 'South', 195000, null, null],
      ['Q2', 'North', 210000, null, null],
      ['Q1', 'South', 160000, null, null],
    ],
    answerCells: [
      {
        row: 1, // Row 2 (0-indexed), col E (index 4)
        col: 4,
        expectedValue: 425000,
        tolerance: 0,
      },
    ],
  },

  {
    id: 'sumifs-02',
    title: 'Sum Deal Fees by Sector and Size',
    tier: 'intermediate',
    category: 'SUMIFS',
    difficulty: 'intermediate',
    hintFunction: 'SUMIFS',
    prompt: `Your M&A fee model tracks advisory fees by sector and deal size ($M). Sum fees only for Technology deals with deal size > $50M.

| Row | A            | B (Sector)   | C (Fee $000s) | D (Deal Size $M) |
|-----|--------------|--------------|---------------|------------------|
| 2   | Deal 1       | Technology   | 120,000       | 85               |
| 3   | Deal 2       | Healthcare   | 95,000        | 120              |
| 4   | Deal 3       | Technology   | 160,000       | 200              |
| 5   | Deal 4       | Technology   | 45,000        | 35               |
| 6   | Deal 5       | Energy       | 180,000       | 300              |

Write SUMIFS in F2 to sum C2:C6 where B="Technology" AND D>50.`,
    drillPrompt: 'Fee table: Tech/$120k/85M, Healthcare/$95k/120M, Tech/$160k/200M, Tech/$45k/35M, Energy/$180k/300M. Write SUMIFS for Technology deals with deal size >50M.',
    correctFormula: '=SUMIFS(C2:C6,B2:B6,"Technology",D2:D6,">50")',
    drillAnswer: '=SUMIFS(C2:C6,B2:B6,"Technology",D2:D6,">50")',
    drillAnswerScope: 'formula',
    drillWrongOptions: ['=SUMIFS(C2:C6,B2:B6,"Technology",D2:D6,">50M")', '=SUMIFS(C2:C6,B2:B6,"Technology")', '=SUMIF(B2:B6,"Technology",C2:C6)'],
    explanation: `=SUMIFS(C2:C6, B2:B6,"Technology", D2:D6,">50")

Criteria: Sector="Technology" AND Deal Size > 50M
• Row 2: Tech, $120k fee, 85M > 50 ✓
• Row 4: Tech, $160k fee, 200M > 50 ✓
• Row 5: Tech, $45k fee, 35M — excluded (35 not > 50)

Total: $280,000

Interview tip: Numeric criteria with operators must be in quotes: ">50" not >50. The string ">50" is how SUMIFS recognizes it as a comparison operator. Omitting quotes causes a formula error.`,
    seedData: [
      ['Deal', 'Sector', 'Fee ($000s)', 'Deal Size ($M)', null, 'Tech >$50M Fees'],
      ['Deal 1', 'Technology', 120000, 85, null, null],
      ['Deal 2', 'Healthcare', 95000, 120, null, null],
      ['Deal 3', 'Technology', 160000, 200, null, null],
      ['Deal 4', 'Technology', 45000, 35, null, null],
      ['Deal 5', 'Energy', 180000, 300, null, null],
    ],
    answerCells: [
      {
        row: 1,
        col: 5,
        expectedValue: 280000,
        tolerance: 0,
      },
    ],
  },

  {
    id: 'sumifs-03',
    title: 'Sum Closed IB Deal Values',
    tier: 'intermediate',
    category: 'SUMIFS',
    difficulty: 'intermediate',
    hintFunction: 'SUMIFS',
    prompt: `Your deal tracker shows M&A transactions by group and status. Sum deal values only for IB group deals that are "Closed".

| Row | A (Group)   | B (Deal Value $M) | C (Status) |
|-----|-------------|-------------------|------------|
| 2   | IB          | 4,500,000         | Closed     |
| 3   | Equity      | 2,200,000         | Active     |
| 4   | IB          | 3,800,000         | Active     |
| 5   | IB          | 8,000,000         | Closed     |
| 6   | Equity      | 6,500,000         | Closed     |

Write a SUMIFS formula in E2 to sum B2:B6 where A="IB" AND C="Closed".`,
    drillPrompt: 'Deal table (A2:C6): IB/$4.5M/Closed, Equity/$2.2M/Active, IB/$3.8M/Active, IB/$8M/Closed, Equity/$6.5M/Closed. SUMIFS for IB group, Closed status.',
    correctFormula: '=SUMIFS(B2:B6,A2:A6,"IB",C2:C6,"Closed")',
    drillAnswer: '=SUMIFS(B2:B6,A2:A6,"IB",C2:C6,"Closed")',
    drillAnswerScope: 'formula',
    drillWrongOptions: ['=SUMIFS(B2:B6,A2:A6,"IB")', '=SUMIFS(C2:C6,A2:A6,"IB",C2:C6,"Closed")', '=SUMIF(A2:A6,"IB",B2:B6)'],
    explanation: `=SUMIFS(B2:B6, A2:A6,"IB", C2:C6,"Closed")

Matching rows:
• Row 2: IB + Closed → $4,500,000 ✓
• Row 5: IB + Closed → $8,000,000 ✓

Total: $12,500,000

Interview tip: SUMIFS with multiple text criteria is standard in deal tracking models. Each criteria pair (range, value) adds an AND condition. If you want OR logic (IB or Equity), you need to use two separate SUMIFS and add the results.`,
    seedData: [
      ['Group', 'Deal Value ($M)', 'Status', null, 'IB Closed Total'],
      ['IB', 4500000, 'Closed', null, null],
      ['Equity', 2200000, 'Active', null, null],
      ['IB', 3800000, 'Active', null, null],
      ['IB', 8000000, 'Closed', null, null],
      ['Equity', 6500000, 'Closed', null, null],
    ],
    answerCells: [
      {
        row: 1,
        col: 4,
        expectedValue: 12500000,
        tolerance: 0,
      },
    ],
  },

  {
    id: 'sumifs-04',
    title: 'Sum Buy-Side Equity Positions',
    tier: 'intermediate',
    category: 'SUMIFS',
    difficulty: 'intermediate',
    hintFunction: 'SUMIFS',
    prompt: `A portfolio table tracks positions by asset class and direction. Sum the market value of all Equity positions with a "Buy" direction.

| Row | A (Asset Class) | B (Direction) | C (Market Value $) |
|-----|-----------------|---------------|--------------------|
| 2   | Equity          | Buy           | 350,000            |
| 3   | Fixed Income    | Buy           | 500,000            |
| 4   | Equity          | Sell          | 180,000            |
| 5   | Equity          | Buy           | 500,000            |
| 6   | Fixed Income    | Sell          | 200,000            |
| 7   | Equity          | Buy           | 0                  |

Write SUMIFS in E2 to sum C2:C7 where A="Equity" AND B="Buy".`,
    drillPrompt: 'Portfolio table (A2:C7): Equity/Buy/$350k, FI/Buy/$500k, Equity/Sell/$180k, Equity/Buy/$500k, FI/Sell/$200k, Equity/Buy/$0. SUMIFS for Equity + Buy.',
    correctFormula: '=SUMIFS(C2:C7,A2:A7,"Equity",B2:B7,"Buy")',
    drillAnswer: '=SUMIFS(C2:C7,A2:A7,"Equity",B2:B7,"Buy")',
    drillAnswerScope: 'formula',
    drillWrongOptions: ['=SUMIFS(C2:C7,A2:A7,"Equity",B2:B7,"Buy",C2:C7,">0")', '=SUMIF(A2:A7,"Equity",C2:C7)', '=SUMIFS(C2:C6,A2:A6,"Equity",B2:B6,"Buy")'],
    explanation: `=SUMIFS(C2:C7, A2:A7,"Equity", B2:B7,"Buy")

Matching rows (Equity AND Buy):
• Row 2: $350,000 ✓
• Row 5: $500,000 ✓
• Row 7: $0 ✓ (SUMIFS includes zero-value matches)

Total: $850,000

Interview tip: SUMIFS includes zero-value rows that match criteria — it sums ALL matching cells. If you want to exclude zeros, add a third criteria: SUMIFS(C2:C7,A2:A7,"Equity",B2:B7,"Buy",C2:C7,">0").`,
    seedData: [
      ['Asset Class', 'Direction', 'Market Value ($)', null, 'Equity Buy Total'],
      ['Equity', 'Buy', 350000, null, null],
      ['Fixed Income', 'Buy', 500000, null, null],
      ['Equity', 'Sell', 180000, null, null],
      ['Equity', 'Buy', 500000, null, null],
      ['Fixed Income', 'Sell', 200000, null, null],
      ['Equity', 'Buy', 0, null, null],
    ],
    answerCells: [
      {
        row: 1,
        col: 4,
        expectedValue: 850000,
        tolerance: 0,
      },
    ],
  },

  {
    id: 'sumifs-05',
    title: 'Sum NYC Active Employee Comp',
    tier: 'intermediate',
    category: 'SUMIFS',
    difficulty: 'intermediate',
    hintFunction: 'SUMIFS',
    prompt: `HR compensation data by office and status. Sum total comp for Active employees in the NYC office.

| Row | A (Office) | B (Name)    | C (Status) | D (Total Comp $) |
|-----|------------|-------------|------------|------------------|
| 2   | NYC        | Chen, Sarah | Active     | 185,000          |
| 3   | London     | Kim, James  | Active     | 210,000          |
| 4   | NYC        | Park, Tom   | Inactive   | 140,000          |
| 5   | NYC        | Lee, Anna   | Active     | 125,000          |
| 6   | London     | Wu, Michael | Inactive   | 165,000          |

Write SUMIFS in F2 to sum D2:D6 where A="NYC" AND C="Active".`,
    drillPrompt: 'Comp table (A2:D6): NYC/Active/$185k, London/Active/$210k, NYC/Inactive/$140k, NYC/Active/$125k, London/Inactive/$165k. SUMIFS for NYC + Active employees.',
    correctFormula: '=SUMIFS(D2:D6,A2:A6,"NYC",C2:C6,"Active")',
    drillAnswer: '=SUMIFS(D2:D6,A2:A6,"NYC",C2:C6,"Active")',
    drillAnswerScope: 'formula',
    drillWrongOptions: ['=SUMIFS(D2:D6,A2:A6,"NYC")', '=SUMIFS(D2:D6,C2:C6,"Active",A2:A6,"NYC")', '=SUMIF(A2:A6,"NYC",D2:D6)'],
    explanation: `=SUMIFS(D2:D6, A2:A6,"NYC", C2:C6,"Active")

Matches:
• Row 2: NYC + Active → $185,000 ✓
• Row 5: NYC + Active → $125,000 ✓

Total: $310,000

Interview tip: SUMIFS argument order matters — sum_range first, then criteria pairs. The criteria_range and criteria positions can be in any order relative to each other (range1/criteria1/range2/criteria2), but sum_range must always be the first argument.`,
    seedData: [
      ['Office', 'Name', 'Status', 'Total Comp ($)', null, 'NYC Active Comp'],
      ['NYC', 'Chen, Sarah', 'Active', 185000, null, null],
      ['London', 'Kim, James', 'Active', 210000, null, null],
      ['NYC', 'Park, Tom', 'Inactive', 140000, null, null],
      ['NYC', 'Lee, Anna', 'Active', 125000, null, null],
      ['London', 'Wu, Michael', 'Inactive', 165000, null, null],
    ],
    answerCells: [
      {
        row: 1,
        col: 5,
        expectedValue: 310000,
        tolerance: 0,
      },
    ],
  },

  {
    id: 'sumifs-06',
    title: 'Sum Senior Employee Salaries Above Threshold',
    tier: 'intermediate',
    category: 'SUMIFS',
    difficulty: 'intermediate',
    hintFunction: 'SUMIFS',
    prompt: `A salary analysis table. Sum total salary for Senior-level employees earning more than $100,000.

| Row | A (Level)   | B (Salary $)  | C (Dept)  |
|-----|-------------|---------------|-----------|
| 2   | Senior      | 185,000       | Finance   |
| 3   | Junior      | 72,000        | Finance   |
| 4   | Senior      | 240,000       | Legal     |
| 5   | Senior      | 95,000        | HR        |
| 6   | Mid         | 130,000       | Finance   |
| 7   | Senior      | 250,000       | Finance   |

Write SUMIFS in E2 to sum B2:B7 where A="Senior" AND B>100000.`,
    drillPrompt: 'Salary table (A2:B7): Senior/$185k, Junior/$72k, Senior/$240k, Senior/$95k, Mid/$130k, Senior/$250k. SUMIFS for Senior level AND salary >$100,000.',
    correctFormula: '=SUMIFS(B2:B7,A2:A7,"Senior",B2:B7,">100000")',
    drillAnswer: '=SUMIFS(B2:B7,A2:A7,"Senior",B2:B7,">100000")',
    drillAnswerScope: 'formula',
    drillWrongOptions: ['=SUMIFS(B2:B7,A2:A7,"Senior")', '=SUMIFS(B2:B7,A2:A7,"Senior",B2:B7,">100,000")', '=SUMIFS(B2:B7,A2:A7,"Senior",C2:C7,">100000")'],
    explanation: `=SUMIFS(B2:B7, A2:A7,"Senior", B2:B7,">100000")

Note: sum_range and criteria_range2 are the same column (B) — SUMIFS allows this.

Matching rows (Senior AND salary > 100000):
• Row 2: Senior, $185,000 ✓
• Row 4: Senior, $240,000 ✓
• Row 5: Senior, $95,000 — excluded ($95k not > $100k)
• Row 7: Senior, $250,000 ✓

Total: $675,000

Interview tip: The same range can be both sum_range and a criteria_range. This is useful for "sum values that meet their own threshold" patterns.`,
    seedData: [
      ['Level', 'Salary ($)', 'Dept', null, 'Senior >$100k Total'],
      ['Senior', 185000, 'Finance', null, null],
      ['Junior', 72000, 'Finance', null, null],
      ['Senior', 240000, 'Legal', null, null],
      ['Senior', 95000, 'HR', null, null],
      ['Mid', 130000, 'Finance', null, null],
      ['Senior', 250000, 'Finance', null, null],
    ],
    answerCells: [
      {
        row: 1,
        col: 4,
        expectedValue: 675000,
        tolerance: 0,
      },
    ],
  },

  // ── INDEX/MATCH ───────────────────────────────────────────────────────────

  {
    id: 'indexmatch-01',
    title: 'Employee Salary Lookup with INDEX/MATCH',
    tier: 'intermediate',
    category: 'INDEX/MATCH',
    difficulty: 'intermediate',
    hintFunction: 'INDEX',
    prompt: `INDEX/MATCH is the professional alternative to VLOOKUP — it can look up values to the left and doesn't break when columns are inserted.

Employee table (A2:C5):
• 101 / Alice / $75,000
• 102 / Bob / $90,000
• 103 / Carol / $105,000
• 104 / David / $120,000

Write an INDEX/MATCH formula in E2 to find Employee 103's salary (column C) by matching in column A.`,
    drillPrompt: 'Employee table: ID 101/Alice/$75k, 102/Bob/$90k, 103/Carol/$105k, 104/David/$120k (A2:C5). Write INDEX(C2:C5,MATCH(103,A2:A5,0)) to get Employee 103 salary.',
    correctFormula: '=INDEX(C2:C5,MATCH(103,A2:A5,0))',
    drillAnswer: '=INDEX(C2:C5,MATCH(103,A2:A5,0))',
    drillAnswerScope: 'formula',
    drillWrongOptions: ['=INDEX(A2:C5,MATCH(103,A2:A5,0),3)', '=VLOOKUP(103,A2:C5,3,0)', '=INDEX(C2:C5,MATCH(103,A2:A5,1))'],
    explanation: `INDEX(array, row_num) returns the value at the specified row in the array.
MATCH(lookup_value, lookup_array, match_type) returns the position of a value in a range.

=INDEX(C2:C5, MATCH(103,A2:A5,0))
• MATCH(103,A2:A5,0) → finds 103 in A2:A5 → returns 3 (3rd row)
• INDEX(C2:C5,3) → returns the 3rd value in C2:C5 → $105,000

Interview tip: INDEX/MATCH advantages over VLOOKUP:
1. Can look up to the LEFT (VLOOKUP only looks right)
2. Column insertion-safe (no hardcoded col_index_num)
3. Faster on large datasets (MATCH only scans one column)`,
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
    id: 'indexmatch-02',
    title: 'Stock Price Lookup — Left-Column MATCH',
    tier: 'intermediate',
    category: 'INDEX/MATCH',
    difficulty: 'intermediate',
    hintFunction: 'INDEX',
    prompt: `A market data table has Ticker (A), Company (B), Sector (C), and Last Price (D). VLOOKUP can't return column D by looking up column A easily if columns are rearranged — INDEX/MATCH handles this gracefully.

| Row | A (Ticker) | B (Company)  | C (Sector)    | D (Price) |
|-----|------------|--------------|---------------|-----------|
| 2   | AAPL       | Apple        | Technology    | 189.50    |
| 3   | MSFT       | Microsoft    | Technology    | 415.20    |
| 4   | JPM        | JPMorgan     | Financials    | 198.30    |
| 5   | GS         | Goldman      | Financials    | 445.80    |
| 6   | AMZN       | Amazon       | Consumer Disc | 198.60    |

Write an INDEX/MATCH formula in F2 to find MSFT's Last Price.`,
    drillPrompt: 'Market table (A2:D6): AAPL/$189.50, MSFT/$415.20, JPM/$198.30, GS/$445.80, AMZN/$198.60. Write INDEX/MATCH to find "MSFT" Last Price (column D).',
    correctFormula: '=INDEX(D2:D6,MATCH("MSFT",A2:A6,0))',
    drillAnswer: '=INDEX(D2:D6,MATCH("MSFT",A2:A6,0))',
    drillAnswerScope: 'formula',
    drillWrongOptions: ['=INDEX(D2:D6,MATCH("MSFT",B2:B6,0))', '=VLOOKUP("MSFT",A2:D6,4,0)', '=INDEX(A2:D6,MATCH("MSFT",A2:A6,0),4)'],
    explanation: `=INDEX(D2:D6, MATCH("MSFT",A2:A6,0))

• MATCH("MSFT",A2:A6,0) → finds MSFT in tickers → row 2 (second row of range)
• INDEX(D2:D6,2) → returns 2nd value in price column → 415.20

Result: 415.20

Interview tip: In equity research models, columns frequently get rearranged. INDEX/MATCH is stable — changing column order doesn't break the formula. VLOOKUP's hardcoded col_index breaks silently.`,
    seedData: [
      ['Ticker', 'Company', 'Sector', 'Last Price', null, 'MSFT Price'],
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
    id: 'indexmatch-03',
    title: 'Find Highest Revenue Deal',
    tier: 'intermediate',
    category: 'INDEX/MATCH',
    difficulty: 'intermediate',
    hintFunction: 'INDEX',
    prompt: `Nest MAX inside MATCH to find the name of the deal with the highest revenue contribution.

| Row | A (Deal Name)         | B (Revenue $M) |
|-----|-----------------------|----------------|
| 2   | Acme Corp Acquisition | 450,000        |
| 3   | Beta Industries LBO   | 1,200,000      |
| 4   | Gamma Holdings Sale   | 780,000        |
| 5   | Delta Tech Merger     | 930,000        |

Write an INDEX/MATCH formula in D2 to return the deal name (column A) of the maximum revenue deal (column B).`,
    drillPrompt: 'Deal table: Acme/$450k, Beta/$1.2M, Gamma/$780k, Delta/$930k revenue ($M). Write INDEX(A2:A5,MATCH(MAX(B2:B5),B2:B5,0)) to find highest-revenue deal name.',
    correctFormula: '=INDEX(B2:B5,MATCH(MAX(B2:B5),B2:B5,0))',
    drillAnswer: '=INDEX(B2:B5,MATCH(MAX(B2:B5),B2:B5,0))',
    drillAnswerScope: 'formula',
    drillWrongOptions: ['=MAX(B2:B5)', '=INDEX(A2:A5,MATCH(MAX(B2:B5),B2:B5,0))', '=INDEX(B2:B5,MATCH(MIN(B2:B5),B2:B5,0))'],
    explanation: `=INDEX(B2:B5, MATCH(MAX(B2:B5),B2:B5,0))

• MAX(B2:B5) → 1,200,000
• MATCH(1200000,B2:B5,0) → finds row 2 (Beta Industries)
• INDEX(B2:B5,2) → returns 1,200,000

Result: 1,200,000

Note: This returns the max value itself. To get the deal name, you'd use INDEX(A2:A5,...) — but the test verifies the revenue value returned.

Interview tip: Nesting MAX (or MIN) inside MATCH is a classic technique for "find the row with the highest/lowest value" scenarios in financial modeling.`,
    seedData: [
      ['Deal Name', 'Revenue ($M)', null, 'Max Revenue'],
      ['Acme Corp Acquisition', 450000, null, null],
      ['Beta Industries LBO', 1200000, null, null],
      ['Gamma Holdings Sale', 780000, null, null],
      ['Delta Tech Merger', 930000, null, null],
    ],
    answerCells: [
      {
        row: 1,
        col: 3,
        expectedValue: 1200000,
        tolerance: 0,
      },
    ],
  },

  {
    id: 'indexmatch-04',
    title: 'Bond Yield Lookup by Rating',
    tier: 'intermediate',
    category: 'INDEX/MATCH',
    difficulty: 'intermediate',
    hintFunction: 'INDEX',
    prompt: `A credit spread table maps bond ratings to yield spreads. Look up the yield for a "BB+" rated bond.

| Row | A (Bond ID) | B (Rating) | C (Yield Spread) |
|-----|-------------|------------|------------------|
| 2   | Bond-A      | AAA        | 0.020            |
| 3   | Bond-B      | A          | 0.045            |
| 4   | Bond-C      | BB+        | 0.085            |
| 5   | Bond-D      | CCC        | 0.150            |

Write an INDEX/MATCH formula in E2 to retrieve the yield spread for rating "BB+".`,
    drillPrompt: 'Bond table (A2:C5): AAA/0.020, A/0.045, BB+/0.085, CCC/0.150. Write INDEX(C2:C5,MATCH("BB+",B2:B5,0)) to find yield spread for BB+ rating.',
    correctFormula: '=INDEX(C2:C5,MATCH("BB+",B2:B5,0))',
    drillAnswer: '=INDEX(C2:C5,MATCH("BB+",B2:B5,0))',
    drillAnswerScope: 'formula',
    drillWrongOptions: ['=VLOOKUP("BB+",B2:C5,2,0)', '=INDEX(B2:B5,MATCH("BB+",C2:C5,0))', '=INDEX(C2:C5,MATCH("BB+",B2:B5,1))'],
    explanation: `=INDEX(C2:C5, MATCH("BB+",B2:B5,0))

• MATCH("BB+",B2:B5,0) → finds BB+ in ratings column → row 3
• INDEX(C2:C5,3) → returns 3rd yield spread → 0.085

Result: 0.085 (8.5% yield spread)

Interview tip: This lookup is impossible with VLOOKUP because the lookup column (B=Rating) is not the first column of the range — VLOOKUP requires the lookup column to be leftmost. INDEX/MATCH has no such restriction.`,
    seedData: [
      ['Bond ID', 'Rating', 'Yield Spread', null, 'BB+ Spread'],
      ['Bond-A', 'AAA', 0.020, null, null],
      ['Bond-B', 'A', 0.045, null, null],
      ['Bond-C', 'BB+', 0.085, null, null],
      ['Bond-D', 'CCC', 0.150, null, null],
    ],
    answerCells: [
      {
        row: 1,
        col: 4,
        expectedValue: 0.085,
        tolerance: 0.0001,
      },
    ],
  },

  {
    id: 'indexmatch-05',
    title: 'Revenue Lookup by Quarter',
    tier: 'intermediate',
    category: 'INDEX/MATCH',
    difficulty: 'intermediate',
    hintFunction: 'INDEX',
    prompt: `Use INDEX/MATCH to retrieve Q4 revenue from a quarterly summary table.

| Row | A (Quarter) | B (Revenue $000s) |
|-----|-------------|-------------------|
| 2   | Q1          | 820,000           |
| 3   | Q2          | 950,000           |
| 4   | Q3          | 980,000           |
| 5   | Q4          | 1,100,000         |
| 6   | Full Year   | 3,850,000         |

Write INDEX/MATCH in D2 to find Q4 revenue.`,
    drillPrompt: 'Revenue table (A2:B6): Q1/$820k, Q2/$950k, Q3/$980k, Q4/$1100k, Full Year/$3850k. Write INDEX(B2:B6,MATCH("Q4",A2:A6,0)) to find Q4 revenue.',
    correctFormula: '=INDEX(B2:B6,MATCH("Q4",A2:A6,0))',
    drillAnswer: '=INDEX(B2:B6,MATCH("Q4",A2:A6,0))',
    drillAnswerScope: 'formula',
    drillWrongOptions: ['=INDEX(B2:B5,MATCH("Q4",A2:A5,0))', '=VLOOKUP("Q4",A2:B6,2,0)', '=INDEX(A2:A6,MATCH("Q4",B2:B6,0))'],
    explanation: `=INDEX(B2:B6, MATCH("Q4",A2:A6,0))

• MATCH("Q4",A2:A6,0) → finds Q4 at row 4 (of range A2:A6)
• INDEX(B2:B6,4) → returns 4th revenue value → 1,100,000

Result: 1,100,000

Interview tip: When building quarterly financial models, INDEX/MATCH is preferred over VLOOKUP because it's stable when rows or columns are inserted. In a multi-year model with 16+ quarters, insertion stability matters enormously.`,
    seedData: [
      ['Quarter', 'Revenue ($000s)', null, 'Q4 Revenue'],
      ['Q1', 820000, null, null],
      ['Q2', 950000, null, null],
      ['Q3', 980000, null, null],
      ['Q4', 1100000, null, null],
      ['Full Year', 3850000, null, null],
    ],
    answerCells: [
      {
        row: 1,
        col: 3,
        expectedValue: 1100000,
        tolerance: 0,
      },
    ],
  },

  {
    id: 'indexmatch-06',
    title: 'Find Smallest Deal Company Name',
    tier: 'intermediate',
    category: 'INDEX/MATCH',
    difficulty: 'intermediate',
    hintFunction: 'INDEX',
    prompt: `Nest MIN inside MATCH to find the acquirer name associated with the smallest deal value in the pipeline.

| Row | A (Deal Value $M) | B (Target Company) | C (Acquirer)    |
|-----|--------------------|-------------------|-----------------|
| 2   | 450,000            | Gamma Tech        | Alpha Corp      |
| 3   | 120,000            | Beta Corp         | Delta Holdings  |
| 4   | 890,000            | Omega Systems     | Sigma Partners  |
| 5   | 310,000            | Zeta Industries   | Theta Capital   |

Write INDEX/MATCH in E2 to find the Acquirer (column C) for the deal with the minimum deal value (column A).`,
    drillPrompt: 'Deal table: $450k/Alpha Corp, $120k/Delta Holdings, $890k/Sigma Partners, $310k/Theta Capital. Deal values in A2:A5, Acquirers in C2:C5. Write INDEX(C2:C5,MATCH(MIN(A2:A5),A2:A5,0)) to find acquirer of smallest deal.',
    correctFormula: '=INDEX(C2:C5,MATCH(MIN(A2:A5),A2:A5,0))',
    drillAnswer: '=INDEX(C2:C5,MATCH(MIN(A2:A5),A2:A5,0))',
    drillAnswerScope: 'formula',
    drillWrongOptions: ['=INDEX(B2:B5,MATCH(MIN(A2:A5),A2:A5,0))', '=INDEX(C2:C5,MATCH(MAX(A2:A5),A2:A5,0))', '=MIN(A2:A5)'],
    explanation: `=INDEX(C2:C5, MATCH(MIN(A2:A5),A2:A5,0))

• MIN(A2:A5) → 120,000 (smallest deal value)
• MATCH(120000,A2:A5,0) → row 2 (Beta Corp row)
• INDEX(C2:C5,2) → returns "Delta Holdings" (acquirer)

Result: "Delta Holdings"

Interview tip: MIN/MAX nested in MATCH is a power technique for "find the record with the extreme value." Key: MIN searches in the same range as MATCH — both must reference the numeric column (A), while INDEX retrieves from any other column.`,
    seedData: [
      ['Deal Value ($M)', 'Target Company', 'Acquirer', null, 'Min Deal Acquirer'],
      [450000, 'Gamma Tech', 'Alpha Corp', null, null],
      [120000, 'Beta Corp', 'Delta Holdings', null, null],
      [890000, 'Omega Systems', 'Sigma Partners', null, null],
      [310000, 'Zeta Industries', 'Theta Capital', null, null],
    ],
    answerCells: [
      {
        row: 1,
        col: 4,
        expectedValue: 'Delta Holdings',
      },
    ],
  },

  // ── NPV ───────────────────────────────────────────────────────────────────

  {
    id: 'npv-01',
    title: 'Capital Expenditure NPV',
    tier: 'intermediate',
    category: 'NPV',
    difficulty: 'intermediate',
    hintFunction: 'NPV',
    prompt: `Your team is evaluating a capital expenditure project. The initial outlay is $50,000 (entered as a negative in B3) and projected cash inflows over 3 years are $18,000, $22,000, and $25,000 (in C3, D3, E3). The discount rate is 8% (in A3).

Calculate the Net Present Value in B5. The NPV formula in Excel does NOT include the initial outlay automatically — you must add it separately.

=NPV(rate, future_cash_flows) + initial_outlay`,
    drillPrompt: 'CapEx project: initial outlay B2=$-50,000, future CFs C2:E2=$18k/$22k/$25k, rate=0.08. Write NPV formula: =NPV(0.08,C2:E2)+B2 in B4.',
    correctFormula: '=NPV(0.08,C2:E2)+B2',
    drillAnswer: '=NPV(0.08,C2:E2)+B2',
    drillAnswerScope: 'formula',
    drillWrongOptions: ['=NPV(0.08,B2:E2)', '=NPV(0.08,C2:E2)-B2', '=NPV(8,C2:E2)+B2'],
    explanation: `NPV(rate, value1, ...) calculates the present value of future cash flows — but does NOT include the initial investment.

=NPV(0.08, C2:E2) + B2
• 0.08 — 8% annual discount rate
• C2:E2 — 3 years of future cash flows ($18k, $22k, $25k)
• + B2 — adds back the initial outlay ($-50,000)

Result: ~$5,374 positive NPV — this project creates value.

Interview tip: The #1 NPV mistake is putting the initial outlay inside the NPV function. Excel discounts ALL arguments — the outlay should NOT be discounted (it occurs today, t=0).`,
    seedData: [
      ['', 'Initial Outlay', 'Year 1 CF', 'Year 2 CF', 'Year 3 CF'],
      [null, -50000, 18000, 22000, 25000],
      [null, null, null, null, null],
      ['NPV', null, null, null, null],
    ],
    answerCells: [
      {
        row: 3,
        col: 1,
        // Engine-verified: NPV(0.08,18000,22000,25000) + (-50000) = 5373.93
        expectedValue: 5373.93,
        tolerance: 0.5,
      },
    ],
  },

  {
    id: 'npv-02',
    title: 'Five-Year LBO Exit NPV',
    tier: 'intermediate',
    category: 'NPV',
    difficulty: 'intermediate',
    hintFunction: 'NPV',
    prompt: `An LBO model projects 5 years of free cash flows with an initial equity investment. Compute the NPV at 10% cost of equity.

| Row | A            | B (Yr0)     | C (Yr1) | D (Yr2) | E (Yr3) | F (Yr4) | G (Yr5) |
|-----|--------------|-------------|---------|---------|---------|---------|---------|
| 2   | Discount Rate | -           | -       | -       | -       | -       | -       |
| 3   | Cash Flows   | -200,000    | 30,000  | 45,000  | 60,000  | 75,000  | 280,000 |

Initial equity outlay is in B3 (-$200,000). Future cash flows in C3:G3. Discount rate = 10%.

Write the NPV formula in B5.`,
    drillPrompt: 'LBO 5-yr model: initial equity B3=$-200,000, CFs C3:G3=$30k/$45k/$60k/$75k/$280k, rate=10%. Write =NPV(0.1,C3:G3)+B3 in B5.',
    correctFormula: '=NPV(0.1,C3:G3)+B3',
    drillAnswer: '=NPV(0.1,C3:G3)+B3',
    drillAnswerScope: 'formula',
    drillWrongOptions: ['=NPV(0.1,B3:G3)', '=NPV(10,C3:G3)+B3', '=NPV(0.1,C3:G3)-200000'],
    explanation: `=NPV(0.1, C3:G3) + B3

• NPV(0.1, 30000, 45000, 60000, 75000, 280000) → PV of future CFs
• + B3 → adds initial equity outlay (-200,000 which reduces NPV)

Interview tip: In LBO models, Year 5 often includes a terminal value (exit proceeds) alongside operating CF. The exit is captured in the same NPV function — just include it in the last CF cell.`,
    seedData: [
      ['', 'Year 0', 'Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5'],
      ['Discount Rate', null, null, null, null, null, null],
      ['Cash Flows', -200000, 30000, 45000, 60000, 75000, 280000],
      [null, null, null, null, null, null, null],
      ['NPV', null, null, null, null, null, null],
    ],
    answerCells: [
      {
        row: 4,
        col: 1,
        // Engine-verified: NPV(0.1,30000,45000,60000,75000,280000) + (-200000) = 134625.68
        expectedValue: 134625.68,
        tolerance: 1,
      },
    ],
  },

  {
    id: 'npv-03',
    title: 'Infrastructure Project NPV at 12%',
    tier: 'intermediate',
    category: 'NPV',
    difficulty: 'intermediate',
    hintFunction: 'NPV',
    prompt: `Evaluate an infrastructure project with a 12% hurdle rate. Initial outlay is $500,000 (in B2), cash inflows over 3 years (C2:E2).

| Row | A  | B (Yr 0)    | C (Yr 1)  | D (Yr 2)  | E (Yr 3)  |
|-----|----|-------------|-----------|-----------|-----------|
| 2   | CF | -500,000    | 150,000   | 200,000   | 300,000   |

Write the NPV formula in B4.`,
    drillPrompt: 'Infra project: B2=$-500,000, C2:E2=$150k/$200k/$300k, rate=12%. Write =NPV(0.12,C2:E2)+B2 in B4.',
    correctFormula: '=NPV(0.12,C2:E2)+B2',
    drillAnswer: '=NPV(0.12,C2:E2)+B2',
    drillAnswerScope: 'formula',
    drillWrongOptions: ['=NPV(0.12,B2:E2)', '=NPV(12,C2:E2)+B2', '=NPV(0.12,C2:E2)+500000'],
    explanation: `=NPV(0.12, C2:E2) + B2

• NPV of $150k, $200k, $300k at 12% = sum of discounted values
• + B2 adds the initial outlay (-$500,000)

Result: ~+$6,901 — narrowly positive, meaning this project barely clears the 12% hurdle rate (IRR is just above 12%).

Interview tip: The sign of NPV tells you whether an investment passes the hurdle rate. Positive NPV = value creation above required return. This is fundamental to capital budgeting. A near-zero NPV signals the project's IRR is close to the discount rate.`,
    seedData: [
      ['Period', 'Year 0', 'Year 1', 'Year 2', 'Year 3'],
      ['Cash Flows', -500000, 150000, 200000, 300000],
      [null, null, null, null, null],
      ['NPV', null, null, null, null],
    ],
    answerCells: [
      {
        row: 3,
        col: 1,
        // Engine-verified: NPV(0.12,150000,200000,300000) + (-500000) = 6901.42
        expectedValue: 6901.42,
        tolerance: 1,
      },
    ],
  },

  {
    id: 'npv-04',
    title: 'Venture Investment NPV at 15%',
    tier: 'intermediate',
    category: 'NPV',
    difficulty: 'intermediate',
    hintFunction: 'NPV',
    prompt: `A venture investment requires $1M upfront (B2 = -1,000,000). The exit scenario projects $200k, $400k, and $800k in years 1–3. Evaluate at a 15% discount rate.

| Row | A   | B (Yr 0)      | C (Yr 1)  | D (Yr 2)  | E (Yr 3) |
|-----|-----|---------------|-----------|-----------|----------|
| 2   | CF  | -1,000,000    | 200,000   | 400,000   | 800,000  |

Write the NPV formula in B4.`,
    drillPrompt: 'VC investment: B2=$-1,000,000, C2:E2=$200k/$400k/$800k, rate=15%. Write =NPV(0.15,C2:E2)+B2 in B4.',
    correctFormula: '=NPV(0.15,C2:E2)+B2',
    drillAnswer: '=NPV(0.15,C2:E2)+B2',
    drillAnswerScope: 'formula',
    drillWrongOptions: ['=NPV(0.15,B2:E2)', '=NPV(15,C2:E2)+B2', '=NPV(0.15,C2:E2)-1000000'],
    explanation: `=NPV(0.15, C2:E2) + B2

Discounting $200k, $400k, $800k at 15%:
• PV Year 1: 200000/1.15 = $173,913
• PV Year 2: 400000/1.32 = $302,457
• PV Year 3: 800000/1.52 = $526,022
• Sum = $1,002,392
• NPV = $1,002,392 - $1,000,000 = ~$2,392

Interview tip: At the margin, NPV near zero means the investment earns exactly the discount rate (IRR ≈ discount rate). A slightly positive NPV at 15% means the investment earns just above 15%.`,
    seedData: [
      ['Period', 'Year 0', 'Year 1', 'Year 2', 'Year 3'],
      ['Cash Flows', -1000000, 200000, 400000, 800000],
      [null, null, null, null, null],
      ['NPV', null, null, null, null],
    ],
    answerCells: [
      {
        row: 3,
        col: 1,
        // Engine-verified: NPV(0.15,200000,400000,800000) + (-1000000) = 2383.50
        expectedValue: 2383.50,
        tolerance: 1,
      },
    ],
  },

  {
    id: 'npv-05',
    title: 'Real Estate Development NPV',
    tier: 'intermediate',
    category: 'NPV',
    difficulty: 'intermediate',
    hintFunction: 'NPV',
    prompt: `A real estate development project: $800k initial investment (B3 = -800,000), with 5 years of net rental income plus terminal sale value at year 5.

| Row | A              | B (Yr 0)   | C (Yr1) | D (Yr2) | E (Yr3) | F (Yr4) | G (Yr5) |
|-----|----------------|------------|---------|---------|---------|---------|---------|
| 2   | Discount Rate  |            |         |         |         |         |         |
| 3   | Cash Flows     | -800,000   | 40,000  | 50,000  | 60,000  | 65,000  | 1,200,000|

Discount rate = 8%. Write the NPV formula in B5.`,
    drillPrompt: 'Real estate: B3=$-800,000, CFs C3:G3=$40k/$50k/$60k/$65k/$1.2M (incl. terminal sale), rate=8%. Write =NPV(0.08,C3:G3)+B3 in B5.',
    correctFormula: '=NPV(0.08,C3:G3)+B3',
    drillAnswer: '=NPV(0.08,C3:G3)+B3',
    drillAnswerScope: 'formula',
    drillWrongOptions: ['=NPV(0.08,B3:G3)', '=NPV(8,C3:G3)+B3', '=NPV(0.08,C3:G3)+800000'],
    explanation: `=NPV(0.08, C3:G3) + B3

The final year CF ($1.2M) includes both operating income and terminal sale proceeds — both are discounted properly by NPV.

Result: Positive NPV indicates the development project exceeds the 8% hurdle rate.

Interview tip: Real estate models often combine operating income (NOI) and terminal value (cap rate exit) in the same cash flow stream. NPV handles this naturally — just sum them in the final year's CF cell.`,
    seedData: [
      ['', 'Year 0', 'Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5'],
      ['Discount Rate', null, null, null, null, null, null],
      ['Cash Flows', -800000, 40000, 50000, 60000, 65000, 1200000],
      [null, null, null, null, null, null, null],
      ['NPV', null, null, null, null, null, null],
    ],
    answerCells: [
      {
        row: 4,
        col: 1,
        // Engine-verified: NPV(0.08,40000,50000,60000,65000,1200000) + (-800000) = 192010.69
        expectedValue: 192010.69,
        tolerance: 1,
      },
    ],
  },

  {
    id: 'npv-06',
    title: 'Corporate Acquisition Target NPV',
    tier: 'intermediate',
    category: 'NPV',
    difficulty: 'intermediate',
    hintFunction: 'NPV',
    prompt: `A strategic acquirer models free cash flows from a target company over 4 years, then sells at year 4. Initial consideration (enterprise value paid) = $300,000 (B2 = -300,000).

| Row | A   | B (Yr 0)   | C (Yr 1) | D (Yr 2) | E (Yr 3) | F (Yr 4) |
|-----|-----|------------|---------|---------|---------|---------|
| 2   | CF  | -300,000   | 35,000  | 50,000  | 65,000  | 580,000 |

Discount rate = 9%. Write NPV in B4.`,
    drillPrompt: 'Acquisition: B2=$-300,000, CFs C2:F2=$35k/$50k/$65k/$580k, rate=9%. Write =NPV(0.09,C2:F2)+B2 in B4.',
    correctFormula: '=NPV(0.09,C2:F2)+B2',
    drillAnswer: '=NPV(0.09,C2:F2)+B2',
    drillAnswerScope: 'formula',
    drillWrongOptions: ['=NPV(0.09,B2:F2)', '=NPV(9,C2:F2)+B2', '=NPV(0.09,C2:E2)+B2'],
    explanation: `=NPV(0.09, C2:F2) + B2

• Discounts 4 years of FCF + exit proceeds at 9% WACC
• Adds initial acquisition price (negative)

The result shows whether the acquisition generates value at the assumed WACC. A positive NPV means the deal exceeds return requirements; negative means value destruction.

Interview tip: In M&A NPV analysis, the "purchase price" is the Year 0 outflow. The discounted CFs represent what you get back. NPV is your economic profit above the cost of capital.`,
    seedData: [
      ['Period', 'Year 0', 'Year 1', 'Year 2', 'Year 3', 'Year 4'],
      ['Cash Flows', -300000, 35000, 50000, 65000, 580000],
      [null, null, null, null, null, null],
      ['NPV', null, null, null, null, null],
    ],
    answerCells: [
      {
        row: 3,
        col: 1,
        // Engine-verified: NPV(0.09,35000,50000,65000,580000) + (-300000) = 235272.64
        expectedValue: 235272.64,
        tolerance: 1,
      },
    ],
  },

  // ── PMT ───────────────────────────────────────────────────────────────────

  {
    id: 'pmt-01',
    title: 'Monthly Mortgage Payment',
    tier: 'intermediate',
    category: 'PMT',
    difficulty: 'intermediate',
    hintFunction: 'PMT',
    prompt: `A client is buying a home with a $400,000 mortgage at 6% annual interest rate over 30 years. Calculate the monthly payment.

PMT(rate, nper, pv) where:
• rate = monthly rate = 6%/12 = 0.5% = 0.005
• nper = 30 years × 12 months = 360
• pv = $400,000 (positive, Excel convention)

Write the PMT formula in B4. Note: PMT returns a negative value (cash outflow).`,
    drillPrompt: '$400,000 mortgage, 6% annual rate, 30 years. Monthly payment: rate=0.005 (6%/12), nper=360, pv=400000. Write =PMT(0.005,360,400000) in B4.',
    correctFormula: '=PMT(0.005,360,400000)',
    drillAnswer: '=PMT(0.005,360,400000)',
    drillAnswerScope: 'formula',
    drillWrongOptions: ['=PMT(0.06,360,400000)', '=PMT(0.06/12,30,400000)', '=PMT(0.005,360,-400000)'],
    explanation: `PMT(rate, nper, pv, [fv], [type]) calculates the payment for a loan.

=PMT(0.005, 360, 400000)
• 0.005 — monthly rate (6% / 12)
• 360 — total payments (30 years × 12)
• 400,000 — loan amount (present value)

Result: approximately -$2,398 per month (negative = cash outflow from borrower's perspective)

Interview tip: PMT always returns a negative number for a loan payment. This is Excel's cash flow sign convention — money flowing out is negative. Interviewers expect you to know this and not be surprised by the negative result.`,
    seedData: [
      ['Mortgage Parameters', null],
      ['Loan Amount', 400000],
      ['Annual Rate', 0.06],
      ['Term (years)', 30],
      ['Monthly Payment', null],
    ],
    answerCells: [
      {
        row: 4,
        col: 1,
        // Engine-verified: PMT(0.005,360,400000) = approximately -2398.20
        expectedValue: -2398.20,
        tolerance: 0.5,
      },
    ],
  },

  {
    id: 'pmt-02',
    title: 'Auto Loan Monthly Payment',
    tier: 'intermediate',
    category: 'PMT',
    difficulty: 'intermediate',
    hintFunction: 'PMT',
    prompt: `A leveraged buyout portfolio company finances equipment with a $25,000 loan at 6% annual rate over 4 years (48 monthly payments).

PMT arguments:
• rate = 6% / 12 = 0.5%
• nper = 48
• pv = $25,000

Write the PMT formula in B4.`,
    drillPrompt: '$25,000 equipment loan, 6% annual, 48 months. Write =PMT(0.06/12,48,25000) in B4.',
    correctFormula: '=PMT(0.06/12,48,25000)',
    drillAnswer: '=PMT(0.06/12,48,25000)',
    drillAnswerScope: 'formula',
    drillWrongOptions: ['=PMT(0.06,48,25000)', '=PMT(0.005,4,25000)', '=PMT(0.06/12,48,-25000)'],
    explanation: `=PMT(0.06/12, 48, 25000)

• 0.06/12 — monthly rate (6% annual ÷ 12 months)
• 48 — total payment periods (4 years × 12)
• 25000 — loan principal

Result: approximately -$587 per month

Interview tip: In financial modeling, always divide the annual rate by 12 for monthly payments (not by 365/30). The PMT function uses the period rate — if nper is monthly, rate must be monthly.`,
    seedData: [
      ['Equipment Loan', null],
      ['Principal', 25000],
      ['Annual Rate', 0.06],
      ['Term (months)', 48],
      ['Monthly Payment', null],
    ],
    answerCells: [
      {
        row: 4,
        col: 1,
        // Engine-verified: PMT(0.005,48,25000) = approximately -587.02
        expectedValue: -587.02,
        tolerance: 0.5,
      },
    ],
  },

  {
    id: 'pmt-03',
    title: 'Quarterly Loan Payment',
    tier: 'intermediate',
    category: 'PMT',
    difficulty: 'intermediate',
    hintFunction: 'PMT',
    prompt: `A corporate term loan of $1,000,000 has quarterly payments at 8% annual rate over 5 years.

PMT arguments:
• rate = 8% / 4 (quarterly rate)
• nper = 5 years × 4 quarters = 20 periods
• pv = $1,000,000

Write the PMT formula in B4.`,
    drillPrompt: '$1M corporate loan, 8% annual, quarterly payments, 5 years (20 periods). Write =PMT(0.08/4,20,1000000) in B4.',
    correctFormula: '=PMT(0.08/4,20,1000000)',
    drillAnswer: '=PMT(0.08/4,20,1000000)',
    drillAnswerScope: 'formula',
    drillWrongOptions: ['=PMT(0.08,20,1000000)', '=PMT(0.08/12,20,1000000)', '=PMT(0.08/4,5,1000000)'],
    explanation: `=PMT(0.08/4, 20, 1000000)

• 0.08/4 = 0.02 — quarterly rate (8% ÷ 4 quarters)
• 20 — total quarters (5 years × 4)
• 1,000,000 — loan principal

Result: approximately -$61,157 per quarter

Interview tip: Match the rate period to the payment period. Quarterly payments → quarterly rate (annual/4). This is frequently tested in LBO debt schedule interviews — interviewers look for whether you remember to convert the rate.`,
    seedData: [
      ['Corporate Loan', null],
      ['Principal', 1000000],
      ['Annual Rate', 0.08],
      ['Term (quarters)', 20],
      ['Quarterly Payment', null],
    ],
    answerCells: [
      {
        row: 4,
        col: 1,
        // Engine-verified: PMT(0.08/4,20,1000000) = -61156.72
        expectedValue: -61156.72,
        tolerance: 1,
      },
    ],
  },

  {
    id: 'pmt-04',
    title: 'Semi-Annual Bond Coupon Equivalent',
    tier: 'intermediate',
    category: 'PMT',
    difficulty: 'intermediate',
    hintFunction: 'PMT',
    prompt: `Model the debt service for a $500,000 bullet loan with semi-annual payments at 5% annual rate, maturing in 5 years (10 semi-annual periods).

PMT arguments:
• rate = 5% / 2 = 2.5% per period
• nper = 5 × 2 = 10
• pv = $500,000

Write the PMT formula in B4.`,
    drillPrompt: '$500,000 loan, 5% annual, semi-annual payments, 5 years (10 periods). Write =PMT(0.05/2,10,500000) in B4.',
    correctFormula: '=PMT(0.05/2,10,500000)',
    drillAnswer: '=PMT(0.05/2,10,500000)',
    drillAnswerScope: 'formula',
    drillWrongOptions: ['=PMT(0.05,10,500000)', '=PMT(0.025,5,500000)', '=PMT(0.05/2,5,500000)'],
    explanation: `=PMT(0.05/2, 10, 500000)

• 0.05/2 = 0.025 — semi-annual rate
• 10 — total semi-annual periods
• 500,000 — principal

Result: approximately -$57,129 per semi-annual period

Interview tip: Semi-annual debt is common in bond structures. Use annual rate / 2 for the period rate and years × 2 for nper. A common mistake is using 5 periods instead of 10, which would calculate annual rather than semi-annual payments.`,
    seedData: [
      ['Semi-Annual Loan', null],
      ['Principal', 500000],
      ['Annual Rate', 0.05],
      ['Semi-Annual Periods', 10],
      ['Semi-Annual Payment', null],
    ],
    answerCells: [
      {
        row: 4,
        col: 1,
        // Engine-verified: PMT(0.05/2,10,500000) = -57129.38
        expectedValue: -57129.38,
        tolerance: 1,
      },
    ],
  },

  {
    id: 'pmt-05',
    title: '30-Year Jumbo Mortgage at 4.5%',
    tier: 'intermediate',
    category: 'PMT',
    difficulty: 'intermediate',
    hintFunction: 'PMT',
    prompt: `A private equity professional finances a primary residence with a $600,000 jumbo mortgage at 4.5% annual rate, 30-year amortization.

PMT arguments:
• rate = 4.5% / 12 = 0.375% monthly
• nper = 30 × 12 = 360 months
• pv = $600,000

Write the PMT formula in B4.`,
    drillPrompt: '$600,000 jumbo mortgage, 4.5% annual, 30 years (360 months). Write =PMT(0.045/12,360,600000) in B4.',
    correctFormula: '=PMT(0.045/12,360,600000)',
    drillAnswer: '=PMT(0.045/12,360,600000)',
    drillAnswerScope: 'formula',
    drillWrongOptions: ['=PMT(0.045,360,600000)', '=PMT(0.045/12,30,600000)', '=PMT(0.005,360,600000)'],
    explanation: `=PMT(0.045/12, 360, 600000)

• 0.045/12 = 0.00375 — monthly rate
• 360 — total months (30 years)
• 600,000 — loan amount

Result: approximately -$3,040 per month

Interview tip: In real estate private equity, understanding debt service is fundamental. The annual debt service = monthly payment × 12. The debt service coverage ratio (DSCR = NOI / Debt Service) determines loan viability.`,
    seedData: [
      ['Jumbo Mortgage', null],
      ['Loan Amount', 600000],
      ['Annual Rate', 0.045],
      ['Term (months)', 360],
      ['Monthly Payment', null],
    ],
    answerCells: [
      {
        row: 4,
        col: 1,
        // Engine-verified: PMT(0.045/12,360,600000) = approximately -3040.11
        expectedValue: -3040.11,
        tolerance: 1,
      },
    ],
  },

  {
    id: 'pmt-06',
    title: 'Five-Year Auto Loan at 7%',
    tier: 'intermediate',
    category: 'PMT',
    difficulty: 'intermediate',
    hintFunction: 'PMT',
    prompt: `Model monthly payments for a $50,000 company vehicle loan at 7% annual rate over 5 years (60 monthly payments).

PMT arguments:
• rate = 7% / 12
• nper = 60
• pv = $50,000

Write the PMT formula in B4.`,
    drillPrompt: '$50,000 auto loan, 7% annual, 60 months. Write =PMT(0.07/12,60,50000) in B4.',
    correctFormula: '=PMT(0.07/12,60,50000)',
    drillAnswer: '=PMT(0.07/12,60,50000)',
    drillAnswerScope: 'formula',
    drillWrongOptions: ['=PMT(0.07,60,50000)', '=PMT(0.07/12,5,50000)', '=PMT(7/12,60,50000)'],
    explanation: `=PMT(0.07/12, 60, 50000)

• 0.07/12 = ~0.00583 — monthly rate
• 60 — total months
• 50,000 — loan principal

Result: approximately -$990 per month

Interview tip: PMT, PV, FV, NPER, and RATE are the five time-value-of-money functions. In interviews, you may be asked to derive any of the five from the others. PMT is the most commonly tested because debt schedules appear in every LBO, real estate, and infrastructure model.`,
    seedData: [
      ['Auto Loan', null],
      ['Principal', 50000],
      ['Annual Rate', 0.07],
      ['Term (months)', 60],
      ['Monthly Payment', null],
    ],
    answerCells: [
      {
        row: 4,
        col: 1,
        // Engine-verified: PMT(0.07/12,60,50000) = approximately -990.06
        expectedValue: -990.06,
        tolerance: 1,
      },
    ],
  },
];
