/**
 * formatPrompt.ts
 *
 * Parses raw challenge prompt strings into structured sections for
 * display in the challenge panel. Splits a prompt into:
 *   - scenario: the context / setup text before the data block
 *   - data: a markdown table or bullet list containing structured data
 *   - task: the instruction telling the user what formula to write
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type PromptSection =
  | { type: 'scenario'; text: string }
  | { type: 'data'; text: string }
  | { type: 'task'; text: string };

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Returns true if a line is part of a markdown table (starts with |).
 */
function isTableLine(line: string): boolean {
  return line.trimStart().startsWith('|');
}

/**
 * Returns true if a line is a bullet data line.
 * Detects unicode bullet (•) or ASCII dash bullet (- ) with data patterns
 * (digits, $, slashes, or percentage signs indicating structured data).
 */
function isBulletDataLine(line: string): boolean {
  const trimmed = line.trim();
  // Unicode bullet data lines
  if (trimmed.startsWith('•')) {
    // Check for data-like content: numbers, $, /, or text/number pairs
    return /[\d$\/]/.test(trimmed) || /•\s*\w+/.test(trimmed);
  }
  // ASCII dash bullet data lines: "- Something / data"
  if (trimmed.startsWith('- ')) {
    return /[\d$\/]/.test(trimmed);
  }
  return false;
}

/**
 * Returns true if the line qualifies as a data-block line (table or bullet).
 */
function isDataLine(line: string): boolean {
  return isTableLine(line) || isBulletDataLine(line);
}

// ---------------------------------------------------------------------------
// Main parser
// ---------------------------------------------------------------------------

/**
 * Parses a raw challenge prompt string into structured sections.
 *
 * Algorithm:
 * 1. Split on newlines.
 * 2. Walk lines collecting scenario text until the first data line is found.
 * 3. Collect consecutive data lines into a single data block.
 * 4. Everything after the data block is the task instruction.
 * 5. If no data block is detected, return the whole string as a scenario.
 *
 * Blank lines between sections are trimmed from each section's text.
 */
export function formatPrompt(raw: string): PromptSection[] {
  const lines = raw.split('\n');

  // Find the index of the first data line
  let dataStart = -1;
  for (let i = 0; i < lines.length; i++) {
    if (isDataLine(lines[i])) {
      dataStart = i;
      break;
    }
  }

  // Edge case: no data block detected — return whole string as scenario
  if (dataStart === -1) {
    const scenarioText = raw.trim();
    if (!scenarioText) return [];
    return [{ type: 'scenario', text: scenarioText }];
  }

  // Find the end of the data block (last consecutive data line)
  let dataEnd = dataStart;
  for (let i = dataStart + 1; i < lines.length; i++) {
    if (isDataLine(lines[i])) {
      dataEnd = i;
    } else if (lines[i].trim() === '') {
      // Allow a single blank line within the block (some tables have dividers)
      // but stop if there's a non-data, non-blank line
      continue;
    } else {
      break;
    }
  }

  // Collect sections
  const scenarioLines = lines.slice(0, dataStart);
  const dataLines = lines.slice(dataStart, dataEnd + 1).filter(l => isDataLine(l));
  const taskLines = lines.slice(dataEnd + 1);

  const scenarioText = scenarioLines.join('\n').trim();
  const dataText = dataLines.join('\n').trim();
  const taskText = taskLines.join('\n').trim();

  const sections: PromptSection[] = [];

  if (scenarioText) {
    sections.push({ type: 'scenario', text: scenarioText });
  }

  if (dataText) {
    sections.push({ type: 'data', text: dataText });
  }

  if (taskText) {
    sections.push({ type: 'task', text: taskText });
  }

  // Fallback: if nothing was parsed, return whole string as scenario
  if (sections.length === 0) {
    return [{ type: 'scenario', text: raw.trim() }];
  }

  return sections;
}

// ---------------------------------------------------------------------------
// React component
// ---------------------------------------------------------------------------

import React from 'react';

/**
 * PromptDisplay renders an array of PromptSection values as structured JSX.
 *
 * - scenario: normal body copy (text-text-primary/80)
 * - data:     monospace code block with bg-base background and border
 * - task:     slightly emphasized with brand-dark color and font-medium weight
 */
export function PromptDisplay({ sections }: { sections: PromptSection[] }) {
  return React.createElement(
    'div',
    { className: 'flex flex-col gap-3' },
    sections.map((s, i) => {
      if (s.type === 'scenario') {
        return React.createElement(
          'p',
          { key: i, className: 'text-[13px] text-text-primary/80 leading-relaxed' },
          s.text,
        );
      }
      if (s.type === 'data') {
        return React.createElement(
          'pre',
          {
            key: i,
            className:
              'text-[12px] font-mono bg-base border border-border rounded-card px-3 py-2 overflow-x-auto whitespace-pre text-text-primary/90 leading-snug',
          },
          s.text,
        );
      }
      if (s.type === 'task') {
        return React.createElement(
          'p',
          { key: i, className: 'text-[13px] font-medium text-brand-dark leading-relaxed' },
          s.text,
        );
      }
      return null;
    }),
  );
}
