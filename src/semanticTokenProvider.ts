/**
 * semanticTokenProvider.ts
 *
 * Core semantic token provider for EJS documents.
 *
 * Pipeline per document:
 *   1. ejsScanner  → locate all EJS blocks (offsets)
 *   2. buildPlaceholderDoc → HTML with EJS replaced by spaces
 *   3. htmlClassifier → emit tokens for tag names, attrs, comments
 *   4. For each EJS block:
 *        a. emit ejsDelimiter for the opening delimiter
 *        b. jsClassifier → emit tokens for JS content
 *        c. emit ejsDelimiter for the closing delimiter
 *
 * Results are cached by document version so repeated requests for the same
 * unchanged document are free.
 */

import * as vscode from 'vscode';
import { scanEjsBlocks, buildPlaceholderDoc } from './ejsScanner';
import { classifyHtml } from './htmlClassifier';
import type { PendingToken } from './htmlClassifier';
import { tokenizeJs } from './jsClassifier';
import type { EjsBlock } from './ejsScanner';

// ─── Token type legend ────────────────────────────────────────────────────────
//
// Standard types (no package.json declaration needed):
//   keyword, variable, string, number, regexp, comment, operator
//
// Custom types (declared in package.json semanticTokenTypes):
//   ejsDelimiter, htmlTagName, htmlAttributeName

export const TOKEN_TYPES = [
  'keyword',           // 0
  'variable',          // 1
  'string',            // 2
  'number',            // 3
  'regexp',            // 4
  'comment',           // 5
  'operator',          // 6
  'ejsDelimiter',      // 7
  'htmlTagName',       // 8
  'htmlAttributeName', // 9
];

export const TOKEN_MODIFIERS: string[] = [];

export const LEGEND = new vscode.SemanticTokensLegend(TOKEN_TYPES, TOKEN_MODIFIERS);

// ─── Cache ────────────────────────────────────────────────────────────────────

interface CachedTokens {
  version: number;
  tokens: vscode.SemanticTokens;
}

const cache = new Map<string, CachedTokens>();

// ─── Provider ─────────────────────────────────────────────────────────────────

export const ejsSemanticTokensProvider: vscode.DocumentSemanticTokensProvider = {
  provideDocumentSemanticTokens(
    document: vscode.TextDocument,
    _token: vscode.CancellationToken,
  ): vscode.SemanticTokens {
    const key = document.uri.toString();
    const cached = cache.get(key);
    if (cached && cached.version === document.version) {
      return cached.tokens;
    }

    const text = document.getText();
    const tokens = buildTokens(text, document);

    cache.set(key, { version: document.version, tokens });

    // Evict stale entries to prevent unbounded growth
    if (cache.size > 50) {
      const firstKey = cache.keys().next().value;
      if (firstKey !== undefined) {
        cache.delete(firstKey);
      }
    }

    return tokens;
  },
};

// ─── Range provider (incremental re-tokenize for visible range) ───────────────

export const ejsRangeSemanticTokensProvider: vscode.DocumentRangeSemanticTokensProvider = {
  provideDocumentRangeSemanticTokens(
    document: vscode.TextDocument,
    _range: vscode.Range,
    _token: vscode.CancellationToken,
  ): vscode.SemanticTokens {
    // The full-document result is already built and cached by
    // ejsSemanticTokensProvider. Re-use it here so that scrolling a large
    // file never triggers a redundant full rescan. If the cache misses (e.g.
    // the range provider fires before the full provider), compute and cache
    // the result so the full provider's next call is also free.
    const key = document.uri.toString();
    const cached = cache.get(key);
    if (cached && cached.version === document.version) {
      return cached.tokens;
    }

    const text = document.getText();
    const tokens = buildTokens(text, document);

    cache.set(key, { version: document.version, tokens });

    if (cache.size > 50) {
      const firstKey = cache.keys().next().value;
      if (firstKey !== undefined) {
        cache.delete(firstKey);
      }
    }

    return tokens;
  },
};

// ─── Core build function ──────────────────────────────────────────────────────

function buildTokens(
  text: string,
  document: vscode.TextDocument,
): vscode.SemanticTokens {
  const builder = new vscode.SemanticTokensBuilder(LEGEND);

  // 1. Locate all EJS blocks
  const blocks = scanEjsBlocks(text);

  // 2. Build placeholder document (EJS → spaces)
  const placeholderText = buildPlaceholderDoc(text, blocks);

  // 3 & 4. Collect HTML and EJS tokens into a flat array, then sort by
  //         document offset. SemanticTokensBuilder requires strictly
  //         ascending order — mixing HTML and EJS passes would corrupt it.
  const pending: PendingToken[] = [];

  classifyHtml(placeholderText, blocks, pending);

  for (const block of blocks) {
    collectEjsBlock(block, text, pending);
  }

  // Sort ascending by offset so builder receives tokens in document order
  pending.sort((a, b) => a.offset - b.offset);

  for (const tok of pending) {
    pushToken(tok.offset, tok.length, tok.typeName, document, builder);
  }

  return builder.build();
}

// ─── EJS block token collector ───────────────────────────────────────────────

function collectEjsBlock(
  block: EjsBlock,
  text: string,
  pending: PendingToken[],
): void {
  // Opening delimiter  e.g. <%=  <%#  <%
  pending.push({ offset: block.start, length: block.openLen, typeName: 'ejsDelimiter' });

  // Content between delimiters
  const contentStart = block.start + block.openLen;
  const contentEnd = block.end - block.closeLen;
  const jsCode = text.slice(contentStart, contentEnd);

  if (block.type === 'comment') {
    // EJS comment: color the entire content as a comment
    if (contentEnd > contentStart) {
      pending.push({ offset: contentStart, length: contentEnd - contentStart, typeName: 'comment' });
    }
  } else {
    // Scriptlet / output: tokenize as JS
    const jsTokens = tokenizeJs(jsCode);
    for (const jsTok of jsTokens) {
      pending.push({ offset: contentStart + jsTok.start, length: jsTok.length, typeName: jsTok.type });
    }
  }

  // Closing delimiter  e.g. %>  -%>  _%>
  pending.push({ offset: block.end - block.closeLen, length: block.closeLen, typeName: 'ejsDelimiter' });
}

// ─── Helper ───────────────────────────────────────────────────────────────────

function pushToken(
  offset: number,
  length: number,
  typeName: string,
  document: vscode.TextDocument,
  builder: vscode.SemanticTokensBuilder,
): void {
  if (length <= 0) { return; }
  const startPos = document.positionAt(offset);
  const endPos = document.positionAt(offset + length);
  // Only emit single-line tokens; multi-line content (e.g. block comments) is
  // handled line-by-line by splitting — skip for now, theme fallback covers it
  if (startPos.line !== endPos.line) {
    // Emit a token per line for multi-line ranges
    for (let line = startPos.line; line <= endPos.line; line++) {
      const lineStart = line === startPos.line
        ? offset
        : document.offsetAt(new vscode.Position(line, 0));
      const lineEnd = line === endPos.line
        ? offset + length
        : document.offsetAt(new vscode.Position(line + 1, 0)) - 1;
      const lineLen = lineEnd - lineStart;
      if (lineLen > 0) {
        builder.push(
          new vscode.Range(
            document.positionAt(lineStart),
            document.positionAt(lineEnd),
          ),
          typeName,
          [],
        );
      }
    }
    return;
  }
  builder.push(new vscode.Range(startPos, endPos), typeName, []);
}
