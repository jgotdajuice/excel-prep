import { useState } from 'react';

interface Feature {
  name: string;
  shortcut: string;
  desc: string;
}

interface Group {
  name: string;
  features: Feature[];
}

interface Tab {
  id: string;
  name: string;
  desc: string;
  tip?: string;
  groups: Group[];
}

// ── Fluent UI icon mapping (via Iconify CDN) ────────────────────────────────
// Maps feature names to fluent icon IDs. Features not listed here get an
// auto-generated abbreviation badge instead.

const ICON_MAP: Record<string, string> = {
  // Home > Clipboard
  'Paste': 'fluent:clipboard-paste-24-regular',
  'Cut / Copy': 'fluent:cut-24-regular',
  'Format Painter': 'fluent:paint-brush-24-regular',
  // Home > Font
  'Font & Size': 'fluent:text-font-size-24-regular',
  'Bold / Italic / Underline': 'fluent:text-bold-24-regular',
  'Fill Color': 'fluent:paint-bucket-24-regular',
  'Font Color': 'fluent:text-color-24-regular',
  'Borders': 'fluent:border-all-24-regular',
  // Home > Alignment
  'Merge & Center': 'fluent:table-cells-merge-24-regular',
  'Wrap Text': 'fluent:text-wrap-24-regular',
  'Indent': 'fluent:text-indent-increase-24-regular',
  'Horizontal/Vertical Align': 'fluent:text-align-center-24-regular',
  // Home > Number
  'Number Format Dropdown': 'fluent:number-symbol-24-regular',
  // Home > Styles
  'Conditional Formatting': 'fluent:data-bar-vertical-24-regular',
  'Format as Table': 'fluent:table-simple-24-regular',
  // Home > Cells
  'Insert / Delete': 'fluent:add-circle-24-regular',
  // Home > Editing
  'AutoSum': 'fluent:math-formula-24-regular',
  'Clear': 'fluent:eraser-24-regular',
  'Sort & Filter': 'fluent:filter-24-regular',
  'Find & Select': 'fluent:search-24-regular',
  'Fill': 'fluent:arrow-download-24-regular',

  // Insert > Tables
  'PivotTable': 'fluent:pivot-24-regular',
  'Table': 'fluent:table-24-regular',
  // Insert > Charts
  'Recommended Charts': 'fluent:data-pie-24-regular',
  'Insert Chart (specific)': 'fluent:chart-multiple-24-regular',
  // Insert > Illustrations
  'Pictures': 'fluent:image-24-regular',
  'Shapes': 'fluent:shapes-24-regular',
  'Icons / SmartArt': 'fluent:design-ideas-24-regular',
  // Insert > Sparklines
  'Line / Column / Win-Loss': 'fluent:data-line-24-regular',
  // Insert > Filters
  'Slicer': 'fluent:options-24-regular',
  'Timeline': 'fluent:timeline-24-regular',
  // Insert > Links & Text
  'Hyperlink': 'fluent:link-24-regular',
  'Text Box': 'fluent:textbox-24-regular',
  'Header & Footer': 'fluent:document-header-24-regular',

  // Page Layout > Themes
  'Themes': 'fluent:color-24-regular',
  'Colors / Fonts / Effects': 'fluent:paint-brush-24-regular',
  // Page Layout > Page Setup
  'Margins': 'fluent:padding-left-24-regular',
  'Orientation': 'fluent:phone-landscape-24-regular',
  'Size': 'fluent:document-24-regular',
  'Print Area': 'fluent:select-all-on-24-regular',
  'Breaks': 'fluent:line-horizontal-1-24-regular',
  'Background': 'fluent:image-24-regular',
  'Print Titles': 'fluent:document-header-24-regular',
  // Page Layout > Scale to Fit
  'Width / Height / Scale': 'fluent:resize-24-regular',
  // Page Layout > Sheet Options
  'Gridlines': 'fluent:grid-24-regular',
  'Headings': 'fluent:text-header-1-24-regular',

  // Formulas > Function Library
  'Insert Function': 'fluent:math-formula-24-regular',
  'Recently Used': 'fluent:history-24-regular',
  'Category Buttons': 'fluent:library-24-regular',
  // Formulas > Defined Names
  'Name Manager': 'fluent:tag-24-regular',
  'Define Name': 'fluent:rename-24-regular',
  'Create from Selection': 'fluent:select-object-24-regular',
  // Formulas > Formula Auditing
  'Trace Precedents': 'fluent:arrow-routing-24-regular',
  'Trace Dependents': 'fluent:arrow-routing-rectangle-multiple-24-regular',
  'Show Formulas': 'fluent:code-24-regular',
  'Error Checking': 'fluent:warning-24-regular',
  'Evaluate Formula': 'fluent:bug-24-regular',
  // Formulas > Calculation
  'Calculation Options': 'fluent:calculator-24-regular',
  'Calculate Now': 'fluent:play-24-regular',

  // Data > Get & Transform
  'Get Data': 'fluent:database-24-regular',
  'Refresh All': 'fluent:arrow-sync-24-regular',
  // Data > Sort & Filter
  'Sort A\u2192Z / Z\u2192A': 'fluent:text-sort-ascending-24-regular',
  'Custom Sort': 'fluent:arrow-sort-24-regular',
  'Filter': 'fluent:filter-24-regular',
  'Advanced Filter': 'fluent:filter-add-24-regular',
  // Data > Data Tools
  'Text to Columns': 'fluent:split-vertical-24-regular',
  'Remove Duplicates': 'fluent:copy-select-24-regular',
  'Data Validation': 'fluent:checkmark-circle-24-regular',
  'Consolidate': 'fluent:table-stack-24-regular',
  'What-If Analysis': 'fluent:lightbulb-24-regular',
  // Data > Outline
  'Group / Ungroup': 'fluent:group-24-regular',
  'Subtotal': 'fluent:calculator-24-regular',

  // Review > Proofing
  'Spelling': 'fluent:text-proofing-tools-24-regular',
  'Thesaurus': 'fluent:book-24-regular',
  // Review > Comments & Notes
  'New Comment / Note': 'fluent:comment-24-regular',
  'Show All Comments': 'fluent:comment-multiple-24-regular',
  // Review > Protect
  'Protect Sheet': 'fluent:lock-closed-24-regular',
  'Protect Workbook': 'fluent:shield-24-regular',
  'Allow Edit Ranges': 'fluent:lock-open-24-regular',
  // Review > Track Changes
  'Track Changes': 'fluent:history-24-regular',
  'Accept / Reject Changes': 'fluent:checkmark-24-regular',

  // View > Workbook Views
  'Normal': 'fluent:document-one-page-24-regular',
  'Page Break Preview': 'fluent:document-page-break-24-regular',
  'Page Layout View': 'fluent:slide-layout-24-regular',
  'Custom Views': 'fluent:eye-24-regular',
  // View > Show
  'Ruler': 'fluent:ruler-24-regular',
  'Formula Bar': 'fluent:text-field-24-regular',
  // View > Zoom
  'Zoom': 'fluent:zoom-in-24-regular',
  '100%': 'fluent:full-screen-maximize-24-regular',
  'Zoom to Selection': 'fluent:zoom-fit-24-regular',
  // View > Window
  'New Window': 'fluent:window-new-24-regular',
  'Arrange All': 'fluent:app-recent-24-regular',
  'Freeze Panes': 'fluent:lock-closed-24-regular',
  'Split': 'fluent:split-horizontal-24-regular',
  'Hide / Unhide': 'fluent:eye-off-24-regular',
  'Switch Windows': 'fluent:window-multiple-24-regular',
  // View > Macros
  'View / Record Macro': 'fluent:record-24-regular',

  // Developer > Code
  'Visual Basic (VBA)': 'fluent:code-24-regular',
  'Macros': 'fluent:play-24-regular',
  'Record Macro': 'fluent:record-24-regular',
  'Use Relative References': 'fluent:cursor-24-regular',
  // Developer > Controls
  'Insert (Form Controls)': 'fluent:form-24-regular',
  'Design Mode': 'fluent:design-ideas-24-regular',
  'Properties': 'fluent:settings-24-regular',
  // Developer > XML
  'XML Source / Map': 'fluent:code-24-regular',
  // Developer > Add-ins
  'Add-ins / COM Add-ins': 'fluent:puzzle-piece-24-regular',

  // File > Info
  'Inspect Document': 'fluent:document-search-24-regular',
  'Manage Workbook': 'fluent:folder-24-regular',
  // File > Save & Export
  'Save As': 'fluent:save-24-regular',
  'Export \u2192 PDF': 'fluent:document-pdf-24-regular',
  // File > Print
  'Print': 'fluent:print-24-regular',
  'Print Active Sheets / Entire Workbook': 'fluent:document-multiple-24-regular',
  // File > Options
  'General': 'fluent:settings-24-regular',
  'Formulas': 'fluent:math-formula-24-regular',
  'Proofing': 'fluent:text-proofing-tools-24-regular',
  'Save': 'fluent:save-24-regular',
  'Advanced': 'fluent:wrench-24-regular',
  'Customize Ribbon': 'fluent:ribbon-24-regular',
  'Quick Access Toolbar': 'fluent:star-24-regular',
  'Trust Center': 'fluent:shield-checkmark-24-regular',
};

// Abbreviation overrides for features that should show a specific badge
// rather than an auto-generated one (e.g. symbols that are more recognizable)
const BADGE_OVERRIDES: Record<string, string> = {
  'Accounting Format': '$',
  'Percent Style': '%',
  'Comma Style': ',',
  'Increase/Decrease Decimal': '.0',
  'Cell Styles': 'Aa',
  'Format': 'FMT',
};

/** Generate a 2-3 letter abbreviation from a feature name */
function abbrev(name: string): string {
  if (BADGE_OVERRIDES[name]) return BADGE_OVERRIDES[name];
  // Take first letter of each significant word, up to 3
  const words = name
    .replace(/[^a-zA-Z\s]/g, '')
    .split(/\s+/)
    .filter((w) => w.length > 0 && !['the', 'a', 'an', 'and', 'or', 'to', 'of', 'in', 'for'].includes(w.toLowerCase()));
  if (words.length === 0) return name.slice(0, 2).toUpperCase();
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return words
    .slice(0, 3)
    .map((w) => w[0].toUpperCase())
    .join('');
}

/** Renders either a Fluent icon or an abbreviation badge */
function FeatureIcon({ name }: { name: string }) {
  const icon = ICON_MAP[name];
  if (icon) {
    return (
      <span className="w-[18px] h-[18px] flex items-center justify-center shrink-0 text-[#6b9e7a]">
        {/* @ts-expect-error iconify-icon is a web component loaded via CDN */}
        <iconify-icon icon={icon} width="16" height="16" />
      </span>
    );
  }
  return (
    <span className="w-[18px] h-[18px] flex items-center justify-center shrink-0 rounded bg-[#1e2a20] text-[#5a9a6e] text-[8px] font-mono font-bold leading-none">
      {abbrev(name)}
    </span>
  );
}

const TABS: Tab[] = [
  {
    id: 'home',
    name: 'Home',
    desc: 'Your most-used tab. Covers formatting, alignment, number style, and basic editing \u2014 80% of what the assessment tested.',
    tip: 'Most of the SkillCheck questions lived here. Master this tab first.',
    groups: [
      {
        name: 'Clipboard',
        features: [
          { name: 'Paste', shortcut: 'Ctrl+V', desc: 'Paste copied content. Dropdown gives Paste Special options (values only, formatting only, transpose).' },
          { name: 'Cut / Copy', shortcut: 'Ctrl+X/C', desc: 'Cut or copy selected cells.' },
          { name: 'Format Painter', shortcut: 'Alt+H+F+P', desc: 'Copy formatting from one cell and apply it to another with one click. Double-click to apply to multiple areas.' },
        ],
      },
      {
        name: 'Font',
        features: [
          { name: 'Font & Size', shortcut: 'Ctrl+Shift+F', desc: 'Change typeface and font size for selected cells.' },
          { name: 'Bold / Italic / Underline', shortcut: 'Ctrl+B/I/U', desc: 'Apply text styling.' },
          { name: 'Fill Color', shortcut: 'Alt+H+H', desc: 'Highlight cell background with a color.' },
          { name: 'Font Color', shortcut: 'Alt+H+F+C', desc: 'Change text color.' },
          { name: 'Borders', shortcut: 'Alt+H+B', desc: 'Add borders around or inside selected cells. Dropdown has all border styles (all, outside, thick box, etc.).' },
        ],
      },
      {
        name: 'Alignment',
        features: [
          { name: 'Merge & Center', shortcut: 'Alt+H+M+C', desc: 'Merge selected cells into one and center the content. Common for headers.' },
          { name: 'Wrap Text', shortcut: 'Alt+H+W', desc: 'Makes long text visible by wrapping within the cell instead of overflowing.' },
          { name: 'Indent', shortcut: 'Alt+H+6/5', desc: 'Increase or decrease text indent within a cell.' },
          { name: 'Horizontal/Vertical Align', shortcut: '', desc: 'Align text left, center, right, top, middle, or bottom within the cell.' },
        ],
      },
      {
        name: 'Number',
        features: [
          { name: 'Number Format Dropdown', shortcut: 'Ctrl+1', desc: 'Switch between General, Number, Currency, Accounting, Date, Percentage, Fraction, etc.' },
          { name: 'Accounting Format', shortcut: 'Alt+H+A+N', desc: 'Adds $ sign and aligns decimals \u2014 standard for financial data.' },
          { name: 'Percent Style', shortcut: 'Ctrl+Shift+%', desc: 'Formats number as a percentage (0.25 \u2192 25%).' },
          { name: 'Comma Style', shortcut: 'Ctrl+Shift+1', desc: 'Adds thousands separator (1000 \u2192 1,000).' },
          { name: 'Increase/Decrease Decimal', shortcut: 'Alt+H+0/9', desc: 'Add or remove decimal places from a number.' },
        ],
      },
      {
        name: 'Styles',
        features: [
          { name: 'Conditional Formatting', shortcut: 'Alt+H+L', desc: 'Format cells automatically based on rules (e.g., red text if value < 100). Highlight Cells Rules is most common.' },
          { name: 'Format as Table', shortcut: 'Ctrl+T', desc: 'Convert a range to a structured table with banded rows, filter arrows, and auto-expansion.' },
          { name: 'Cell Styles', shortcut: '', desc: 'Apply preset formatting themes (Good, Bad, Neutral, Heading, etc.).' },
        ],
      },
      {
        name: 'Cells',
        features: [
          { name: 'Insert / Delete', shortcut: 'Ctrl++ / Ctrl+-', desc: 'Insert or delete rows, columns, or cells. Dropdown lets you specify shift direction.' },
          { name: 'Format', shortcut: 'Alt+H+O', desc: 'Access row height, column width, hide/unhide, rename sheet, move sheet, and protect sheet \u2014 all from one dropdown.' },
        ],
      },
      {
        name: 'Editing',
        features: [
          { name: 'AutoSum', shortcut: 'Alt+=', desc: 'One-click SUM formula in the cell below a column. Also has avg, count, max, min in dropdown.' },
          { name: 'Fill', shortcut: 'Ctrl+D/R', desc: 'Fill Down (Ctrl+D) or Right (Ctrl+R) copies a formula or value to adjacent cells.' },
          { name: 'Clear', shortcut: 'Delete', desc: 'Clear contents, formatting, or both from selected cells.' },
          { name: 'Sort & Filter', shortcut: 'Alt+H+S+S', desc: 'Sort data A\u2192Z, Z\u2192A, or by custom rules. Add filter dropdowns to column headers.' },
          { name: 'Find & Select', shortcut: 'Ctrl+F / Ctrl+H', desc: 'Find (Ctrl+F) or Find & Replace (Ctrl+H) text in the workbook.' },
        ],
      },
    ],
  },
  {
    id: 'insert',
    name: 'Insert',
    desc: 'Add objects to your workbook: charts, tables, pivot tables, images, shapes, sparklines, and more.',
    tip: 'PivotTable and Chart inserts are common interview/assessment tasks.',
    groups: [
      {
        name: 'Tables',
        features: [
          { name: 'PivotTable', shortcut: 'Alt+N+V', desc: 'Insert a pivot table. Click inside data first \u2014 Excel auto-detects the range. Just click OK for defaults.' },
          { name: 'Table', shortcut: 'Ctrl+T', desc: 'Convert a range to an Excel Table with automatic filters, banding, and structured references.' },
        ],
      },
      {
        name: 'Charts',
        features: [
          { name: 'Recommended Charts', shortcut: 'Alt+N+R', desc: 'Excel suggests chart types based on your selected data.' },
          { name: 'Insert Chart (specific)', shortcut: '', desc: 'Choose from Bar, Column, Line, Pie, Scatter, etc. directly from the Charts group icons.' },
        ],
      },
      {
        name: 'Illustrations',
        features: [
          { name: 'Pictures', shortcut: '', desc: 'Insert image from file, online source, or screenshot.' },
          { name: 'Shapes', shortcut: '', desc: 'Insert lines, arrows, rectangles, callouts, and other shapes.' },
          { name: 'Icons / SmartArt', shortcut: '', desc: 'Insert visual graphics or process diagrams.' },
        ],
      },
      {
        name: 'Sparklines',
        features: [
          { name: 'Line / Column / Win-Loss', shortcut: '', desc: 'Tiny charts that live inside a single cell \u2014 great for showing trends inline with data.' },
        ],
      },
      {
        name: 'Filters',
        features: [
          { name: 'Slicer', shortcut: 'Alt+N+SF', desc: 'Visual filter buttons for PivotTables. Click Insert Slicer from PivotTable Analyze or here.' },
          { name: 'Timeline', shortcut: '', desc: 'Date-based visual slicer for filtering PivotTables by time period.' },
        ],
      },
      {
        name: 'Links & Text',
        features: [
          { name: 'Hyperlink', shortcut: 'Ctrl+K', desc: 'Insert a clickable link to a URL, file, or another cell.' },
          { name: 'Text Box', shortcut: '', desc: 'Insert a floating text box anywhere on the sheet.' },
          { name: 'Header & Footer', shortcut: '', desc: 'Add header/footer to print layout. Found in Insert or Page Layout.' },
        ],
      },
    ],
  },
  {
    id: 'pagelayout',
    name: 'Page Layout',
    desc: 'Controls how the workbook looks when printed: margins, orientation, print area, gridlines, and scaling.',
    tip: 'Set Print Area was directly on the assessment \u2014 Page Layout \u2192 Print Area \u2192 Set Print Area.',
    groups: [
      {
        name: 'Themes',
        features: [
          { name: 'Themes', shortcut: '', desc: 'Apply a color/font/effect theme to the entire workbook at once.' },
          { name: 'Colors / Fonts / Effects', shortcut: '', desc: 'Customize individual theme components without changing the overall theme.' },
        ],
      },
      {
        name: 'Page Setup',
        features: [
          { name: 'Margins', shortcut: 'Alt+P+M', desc: 'Set page margins: Normal, Wide, Narrow, or Custom.' },
          { name: 'Orientation', shortcut: 'Alt+P+O', desc: 'Portrait or Landscape mode for printing.' },
          { name: 'Size', shortcut: 'Alt+P+SZ', desc: 'Set paper size (Letter, Legal, A4, etc.).' },
          { name: 'Print Area', shortcut: 'Alt+P+R', desc: 'Set Print Area: only selected cells print. Clear Print Area removes the restriction.' },
          { name: 'Breaks', shortcut: '', desc: 'Insert or remove page breaks \u2014 controls where pages split when printing.' },
          { name: 'Background', shortcut: '', desc: 'Set a background image for the sheet (display only, doesn\'t print).' },
          { name: 'Print Titles', shortcut: '', desc: 'Repeat specific rows/columns on every printed page (e.g., column headers).' },
        ],
      },
      {
        name: 'Scale to Fit',
        features: [
          { name: 'Width / Height / Scale', shortcut: '', desc: 'Scale the printout to fit 1 page wide, 1 page tall, or a custom percentage.' },
        ],
      },
      {
        name: 'Sheet Options',
        features: [
          { name: 'Gridlines', shortcut: '', desc: 'Toggle gridline visibility on screen or in print.' },
          { name: 'Headings', shortcut: '', desc: 'Show/hide row numbers and column letters on screen or in print.' },
        ],
      },
    ],
  },
  {
    id: 'formulas',
    name: 'Formulas',
    desc: 'Insert functions, name cells/ranges, audit formula logic, and control calculation settings.',
    tip: 'Use Name Manager to create named ranges \u2014 makes formulas like =SUM(Revenue) readable.',
    groups: [
      {
        name: 'Function Library',
        features: [
          { name: 'Insert Function', shortcut: 'Shift+F3', desc: 'Opens the function wizard \u2014 search any function by name or category.' },
          { name: 'AutoSum', shortcut: 'Alt+=', desc: 'Same as Home tab. SUM, Average, Count, Max, Min dropdown.' },
          { name: 'Recently Used', shortcut: '', desc: 'Quick access to your last-used functions.' },
          { name: 'Category Buttons', shortcut: '', desc: 'Organized by: Financial, Logical, Text, Date & Time, Lookup & Reference, Math & Trig, More Functions.' },
        ],
      },
      {
        name: 'Defined Names',
        features: [
          { name: 'Name Manager', shortcut: 'Ctrl+F3', desc: 'View, create, edit, and delete named ranges across the workbook.' },
          { name: 'Define Name', shortcut: 'Ctrl+Shift+F3', desc: 'Assign a name to a selected range for use in formulas.' },
          { name: 'Create from Selection', shortcut: '', desc: 'Auto-creates named ranges using row/column header labels.' },
        ],
      },
      {
        name: 'Formula Auditing',
        features: [
          { name: 'Trace Precedents', shortcut: 'Alt+M+P', desc: 'Draws arrows showing which cells feed into the selected formula.' },
          { name: 'Trace Dependents', shortcut: 'Alt+M+D', desc: 'Shows which cells depend on the selected cell\'s value.' },
          { name: 'Show Formulas', shortcut: 'Ctrl+`', desc: 'Toggle between showing formula text vs. calculated values across the sheet.' },
          { name: 'Error Checking', shortcut: '', desc: 'Find and step through formula errors in the sheet.' },
          { name: 'Evaluate Formula', shortcut: 'Alt+M+V', desc: 'Step through a formula\'s logic one calculation at a time \u2014 great for debugging.' },
        ],
      },
      {
        name: 'Calculation',
        features: [
          { name: 'Calculation Options', shortcut: '', desc: 'Set to Automatic (default), Automatic Except Tables, or Manual.' },
          { name: 'Calculate Now', shortcut: 'F9', desc: 'Force recalculate all formulas when in Manual mode.' },
        ],
      },
    ],
  },
  {
    id: 'data',
    name: 'Data',
    desc: 'Import external data, sort/filter, remove duplicates, validate inputs, and run What-If analysis.',
    tip: 'Data Validation and Remove Duplicates are frequently tested in assessments.',
    groups: [
      {
        name: 'Get & Transform Data',
        features: [
          { name: 'Get Data', shortcut: '', desc: 'Import from: Excel file, CSV/text, database, web, SharePoint, and more via Power Query.' },
          { name: 'Refresh All', shortcut: 'Ctrl+Alt+F5', desc: 'Refresh all external data connections and pivot tables at once.' },
        ],
      },
      {
        name: 'Sort & Filter',
        features: [
          { name: 'Sort A\u2192Z / Z\u2192A', shortcut: 'Alt+A+S+A', desc: 'Quick single-column sort ascending or descending.' },
          { name: 'Custom Sort', shortcut: 'Alt+A+S+S', desc: 'Multi-level sort \u2014 sort by column A, then by column B, etc.' },
          { name: 'Filter', shortcut: 'Ctrl+Shift+L', desc: 'Toggle filter dropdowns on column headers to show/hide rows by criteria.' },
          { name: 'Advanced Filter', shortcut: '', desc: 'Filter by complex criteria or copy filtered results to another location.' },
        ],
      },
      {
        name: 'Data Tools',
        features: [
          { name: 'Text to Columns', shortcut: 'Alt+A+E', desc: 'Split a single column of text into multiple columns by delimiter (comma, space, etc.).' },
          { name: 'Remove Duplicates', shortcut: 'Alt+A+M', desc: 'Delete rows with duplicate values in specified columns.' },
          { name: 'Data Validation', shortcut: 'Alt+A+V+V', desc: 'Restrict cell input to a list, number range, date, or custom formula. Can show error alerts.' },
          { name: 'Consolidate', shortcut: '', desc: 'Combine values from multiple ranges into one summary table.' },
          { name: 'What-If Analysis', shortcut: '', desc: 'Includes Scenario Manager, Goal Seek, and Data Table for modeling different outcomes.' },
        ],
      },
      {
        name: 'Outline',
        features: [
          { name: 'Group / Ungroup', shortcut: 'Alt+Shift+Right/Left', desc: 'Group rows or columns so they can be collapsed/expanded with a click.' },
          { name: 'Subtotal', shortcut: '', desc: 'Auto-insert subtotals into sorted data grouped by a category.' },
        ],
      },
    ],
  },
  {
    id: 'review',
    name: 'Review',
    desc: 'Proofing tools, comments, track changes, and workbook/sheet protection.',
    tip: 'Protect Sheet is commonly tested \u2014 prevents unauthorized edits to cell data or structure.',
    groups: [
      {
        name: 'Proofing',
        features: [
          { name: 'Spelling', shortcut: 'F7', desc: 'Run spell check on the entire sheet or selected range.' },
          { name: 'Thesaurus', shortcut: 'Shift+F7', desc: 'Find synonyms for selected word.' },
        ],
      },
      {
        name: 'Comments & Notes',
        features: [
          { name: 'New Comment / Note', shortcut: 'Shift+F2', desc: 'Comments are threaded (for collaboration). Notes are the classic pop-up sticky note. Both attach to a cell.' },
          { name: 'Show All Comments', shortcut: '', desc: 'Toggle visibility of all comments on the sheet.' },
        ],
      },
      {
        name: 'Protect',
        features: [
          { name: 'Protect Sheet', shortcut: 'Alt+R+P+S', desc: 'Lock sheet so cells can\'t be edited without a password. Set specific allowed actions (sort, format, etc.).' },
          { name: 'Protect Workbook', shortcut: 'Alt+R+P+W', desc: 'Prevent adding, deleting, hiding, or renaming sheets.' },
          { name: 'Allow Edit Ranges', shortcut: '', desc: 'Let specific users edit only certain unlocked ranges even when the sheet is protected.' },
        ],
      },
      {
        name: 'Track Changes',
        features: [
          { name: 'Track Changes', shortcut: '', desc: 'Highlight edits made to the workbook \u2014 useful in shared/collaborative environments.' },
          { name: 'Accept / Reject Changes', shortcut: '', desc: 'Approve or reject tracked changes one at a time or all at once.' },
        ],
      },
    ],
  },
  {
    id: 'view',
    name: 'View',
    desc: 'Control what\'s visible on screen: freeze panes, split views, zoom, gridlines, and multiple windows.',
    tip: 'Freeze Panes is extremely common in assessments and real-world use.',
    groups: [
      {
        name: 'Workbook Views',
        features: [
          { name: 'Normal', shortcut: 'Alt+W+L', desc: 'Default editing view.' },
          { name: 'Page Break Preview', shortcut: 'Alt+W+I', desc: 'Shows and lets you drag page break lines \u2014 useful before printing.' },
          { name: 'Page Layout View', shortcut: 'Alt+W+P', desc: 'WYSIWYG print preview \u2014 see headers, footers, and margins while editing.' },
          { name: 'Custom Views', shortcut: '', desc: 'Save and switch between different display/print settings configurations.' },
        ],
      },
      {
        name: 'Show',
        features: [
          { name: 'Ruler', shortcut: '', desc: 'Toggle ruler in Page Layout view.' },
          { name: 'Gridlines', shortcut: 'Alt+W+VG', desc: 'Toggle the cell gridlines on screen (same as Page Layout tab option).' },
          { name: 'Formula Bar', shortcut: 'Ctrl+Shift+U', desc: 'Show/hide the formula bar above the sheet.' },
          { name: 'Headings', shortcut: '', desc: 'Show/hide row numbers and column letters.' },
        ],
      },
      {
        name: 'Zoom',
        features: [
          { name: 'Zoom', shortcut: 'Alt+W+Q', desc: 'Set a custom zoom percentage.' },
          { name: '100%', shortcut: '', desc: 'Reset zoom to 100%.' },
          { name: 'Zoom to Selection', shortcut: 'Alt+W+G', desc: 'Zoom in to fit only the selected cells on screen.' },
        ],
      },
      {
        name: 'Window',
        features: [
          { name: 'New Window', shortcut: '', desc: 'Open a second window for the same workbook \u2014 view two sheets side by side.' },
          { name: 'Arrange All', shortcut: '', desc: 'Tile or cascade multiple open workbook windows.' },
          { name: 'Freeze Panes', shortcut: 'Alt+W+F', desc: 'Freeze top row, first column, or a custom pane \u2014 keeps headers visible while scrolling. Unfreeze from same menu.' },
          { name: 'Split', shortcut: 'Alt+W+S', desc: 'Split the sheet into 2 or 4 independent scrolling panes.' },
          { name: 'Hide / Unhide', shortcut: '', desc: 'Hide the current workbook window from view.' },
          { name: 'Switch Windows', shortcut: 'Ctrl+Tab', desc: 'Jump between open workbooks.' },
        ],
      },
      {
        name: 'Macros',
        features: [
          { name: 'View / Record Macro', shortcut: 'Alt+W+M', desc: 'Record a sequence of actions as a reusable macro, or open the VBA editor.' },
        ],
      },
    ],
  },
  {
    id: 'developer',
    name: 'Developer',
    desc: 'Hidden by default. Enable via File \u2192 Options \u2192 Customize Ribbon. Used for macros, VBA, form controls, and XML.',
    tip: 'Enabling the Developer tab was literally one of the assessment questions.',
    groups: [
      {
        name: 'Code',
        features: [
          { name: 'Visual Basic (VBA)', shortcut: 'Alt+F11', desc: 'Open the VBA editor to write or edit macros.' },
          { name: 'Macros', shortcut: 'Alt+F8', desc: 'View, run, edit, or delete macros in the workbook.' },
          { name: 'Record Macro', shortcut: '', desc: 'Start recording your actions as a macro without writing any code.' },
          { name: 'Use Relative References', shortcut: '', desc: 'Toggle whether recorded macros use relative or absolute cell references.' },
        ],
      },
      {
        name: 'Controls',
        features: [
          { name: 'Insert (Form Controls)', shortcut: '', desc: 'Add buttons, checkboxes, dropdowns, and other form controls to the sheet.' },
          { name: 'Design Mode', shortcut: '', desc: 'Toggle design mode to edit controls without triggering them.' },
          { name: 'Properties', shortcut: '', desc: 'Edit properties of a selected control.' },
        ],
      },
      {
        name: 'XML',
        features: [
          { name: 'XML Source / Map', shortcut: '', desc: 'Import and map XML data to the worksheet.' },
        ],
      },
      {
        name: 'Add-ins',
        features: [
          { name: 'Add-ins / COM Add-ins', shortcut: '', desc: 'Manage installed Excel add-ins and third-party integrations.' },
        ],
      },
    ],
  },
  {
    id: 'file',
    name: 'File (Backstage)',
    desc: 'The backstage view: save, open, print, share, export, account settings, and Excel options. Not a traditional tab \u2014 clicking File opens a full-screen menu.',
    tip: 'Inspect Document and Customize Ribbon (for Developer tab) are both accessed via File \u2192 Info/Options.',
    groups: [
      {
        name: 'Info',
        features: [
          { name: 'Protect Workbook', shortcut: '', desc: 'Encrypt with password, restrict editing, mark as final, or add digital signature.' },
          { name: 'Inspect Document', shortcut: '', desc: 'Scan for hidden data: hidden rows/columns, comments, personal info, invisible content. Assessment question!' },
          { name: 'Manage Workbook', shortcut: '', desc: 'Recover unsaved versions of the file.' },
          { name: 'Properties', shortcut: '', desc: 'View/edit file metadata: title, author, tags, subject.' },
        ],
      },
      {
        name: 'Save & Export',
        features: [
          { name: 'Save As', shortcut: 'F12', desc: 'Save with a new name, location, or file format (.xlsx, .csv, .pdf, etc.).' },
          { name: 'Export \u2192 PDF', shortcut: '', desc: 'Save the workbook or current sheet as a PDF directly from Excel.' },
        ],
      },
      {
        name: 'Print',
        features: [
          { name: 'Print', shortcut: 'Ctrl+P', desc: 'Print preview + settings: printer, copies, which sheets, orientation, scaling.' },
          { name: 'Print Active Sheets / Entire Workbook', shortcut: '', desc: 'Switch in the Print pane dropdown. Active Sheets is default; change to Entire Workbook to print all tabs.' },
        ],
      },
      {
        name: 'Options',
        features: [
          { name: 'General', shortcut: '', desc: 'Username, default file location, startup settings.' },
          { name: 'Formulas', shortcut: '', desc: 'Error-checking rules, R1C1 reference style, calculation settings.' },
          { name: 'Proofing', shortcut: '', desc: 'AutoCorrect and spell-check settings.' },
          { name: 'Save', shortcut: '', desc: 'AutoSave interval, default format, offline cache.' },
          { name: 'Advanced', shortcut: '', desc: 'Editing options, display settings, formula behavior, compatibility.' },
          { name: 'Customize Ribbon', shortcut: '', desc: 'Add/remove tabs and groups. This is where you enable the Developer tab.' },
          { name: 'Quick Access Toolbar', shortcut: '', desc: 'Add frequently used commands to the toolbar above/below the ribbon.' },
          { name: 'Trust Center', shortcut: '', desc: 'Macro security settings, trusted locations, protected view options.' },
        ],
      },
    ],
  },
];

function GroupCard({ group }: { group: Group }) {
  return (
    <div className="bg-[#161618] border border-[#2a2a2e] rounded-[10px] p-5 hover:border-[#3a3a42] transition-colors">
      <div className="font-mono text-[10px] font-semibold text-[#00c853] tracking-[1.5px] uppercase mb-3.5 pb-2.5 border-b border-[#2a2a2e]">
        {group.name}
      </div>
      <ul className="list-none flex flex-col gap-2.5">
        {group.features.map((f) => (
          <li
            key={f.name}
            className="rounded-md px-2.5 py-2 hover:bg-[#1e1e22] transition-colors"
          >
            <div className="flex items-center gap-2 mb-0.5">
              <FeatureIcon name={f.name} />
              <span className="text-[13px] font-semibold text-[#e8e8ea]">
                {f.name}
              </span>
              {f.shortcut && (
                <span className="ml-auto font-mono text-[10px] bg-[#1e2a20] text-[#00c853] border border-[#2a4030] px-1.5 py-px rounded whitespace-nowrap">
                  {f.shortcut}
                </span>
              )}
            </div>
            <div className="text-[11px] text-[#6b6b72] leading-relaxed pl-[26px]">
              {f.desc}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function RibbonGuidePage() {
  const [activeTab, setActiveTab] = useState(TABS[0].id);
  const current = TABS.find((t) => t.id === activeTab)!;

  return (
    <div className="flex flex-col h-full bg-[#0d0d0f] text-[#e8e8ea] overflow-hidden">
      {/* Header */}
      <div className="border-b border-[#2a2a2e] px-10 py-5 flex items-end gap-4 shrink-0">
        <div className="w-9 h-9 bg-[#217346] rounded-md flex items-center justify-center font-mono text-lg font-semibold text-white shrink-0">
          X
        </div>
        <h1 className="text-[22px] font-semibold tracking-tight">
          Excel Ribbon Guide
        </h1>
        <span className="font-mono text-xs text-[#6b6b72] ml-auto pb-0.5">
          Click any feature to see details
        </span>
      </div>

      {/* Tab bar */}
      <div className="flex gap-0.5 px-10 pt-4 border-b border-[#2a2a2e] overflow-x-auto shrink-0 scrollbar-hide">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-[18px] py-2 pb-2.5 border-none bg-transparent text-[13px] font-semibold cursor-pointer border-b-2 transition-all whitespace-nowrap tracking-wide ${
              activeTab === tab.id
                ? 'text-[#00c853] border-b-[#00c853]'
                : 'text-[#6b6b72] border-b-transparent hover:text-[#e8e8ea]'
            }`}
          >
            {tab.name}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-10 py-8">
        <div className="max-w-[1100px]">
          <div className="mb-6">
            <h2 className="text-[26px] font-light tracking-tight mb-1.5">
              {current.name} Tab
            </h2>
            <p className="text-[#6b6b72] text-[13px] leading-relaxed max-w-[560px]">
              {current.desc}
            </p>
          </div>

          {current.tip && (
            <div className="bg-[#1a2e22] border border-[#2a4030] rounded-lg px-4 py-3 mb-6 text-xs text-[#7ec89a] flex gap-2 items-start">
              <strong className="text-[#00c853]">Tip:</strong>
              <span>{current.tip}</span>
            </div>
          )}

          <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4">
            {current.groups.map((g) => (
              <GroupCard key={g.name} group={g} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
