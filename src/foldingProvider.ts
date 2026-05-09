/**
 * foldingProvider.ts
 *
 * Provides folding ranges for EJS documents.
 *
 * Foldable regions:
 *   - Matched pairs of block-opening and block-closing EJS scriptlet tags
 *     e.g. `<% if (x) { %>` ... `<% } %>` or `<% for (...) { %>` ... `<% } %>`
 *   - Multi-line EJS blocks (a single EJS tag that spans multiple lines)
 *   - Standard HTML folding is handled natively by VS Code's HTML folding
 *     (enabled because EJS is registered as an HTML-based language)
 */

import * as vscode from 'vscode';
import { scanEjsBlocks } from './ejsScanner';

/**
 * Simple heuristic: if a scriptlet tag's JS content ends with `{` (after
 * trimming comments and whitespace) it opens a fold. If it's `}` (or `};`)
 * it closes one.
 */
function endsWithOpenBrace(jsContent: string): boolean {
  const stripped = jsContent.replace(/\/\/[^\n]*/g, '').replace(/\/\*[\s\S]*?\*\//g, '').trim();
  return stripped.endsWith('{');
}

function endsWithCloseBrace(jsContent: string): boolean {
  const stripped = jsContent.replace(/\/\/[^\n]*/g, '').replace(/\/\*[\s\S]*?\*\//g, '').trim();
  return stripped === '}' || stripped === '};' || stripped === '} else {' ||
    /^\}\s*else\s*(if\s*\(.*\)\s*)?\{$/.test(stripped);
}

export function provideFoldingRanges(
  document: vscode.TextDocument,
  _context: vscode.FoldingContext,
  _token: vscode.CancellationToken,
): vscode.FoldingRange[] {
  const text = document.getText();
  const blocks = scanEjsBlocks(text);
  const ranges: vscode.FoldingRange[] = [];

  const openStack: number[] = []; // stack of start lines

  for (const block of blocks) {
    // Multi-line single block
    const blockStart = document.positionAt(block.start);
    const blockEnd = document.positionAt(block.end - 1);
    if (blockEnd.line > blockStart.line) {
      ranges.push(new vscode.FoldingRange(blockStart.line, blockEnd.line));
      continue;
    }

    if (block.type !== 'scriptlet' && block.type !== 'output-escaped' &&
      block.type !== 'output-unescaped' && block.type !== 'whitespace-slurp') {
      continue;
    }

    const contentStart = block.start + block.openLen;
    const contentEnd = block.end - block.closeLen;
    const jsContent = text.slice(contentStart, contentEnd);
    const line = blockStart.line;

    if (endsWithOpenBrace(jsContent)) {
      openStack.push(line);
    } else if (endsWithCloseBrace(jsContent) && openStack.length > 0) {
      const openLine = openStack.pop()!;
      if (line > openLine) {
        ranges.push(new vscode.FoldingRange(openLine, line));
      }
    }
  }

  return ranges;
}
