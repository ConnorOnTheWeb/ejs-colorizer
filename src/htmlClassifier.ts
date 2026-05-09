/**
 * htmlClassifier.ts
 *
 * Uses vscode-html-languageservice's stateful HTML scanner on the
 * "placeholder document" (EJS blocks replaced with equal-length spaces).
 *
 * Emits semantic token ranges for:
 *   - HTML tag names (start and end tags)
 *   - HTML attribute names
 *   - HTML attribute values (non-EJS portions only)
 *   - HTML comments
 *   - DOCTYPE tokens
 *
 * Tokens are "split" around any EJS blocks that fall inside them (e.g. an
 * attribute value that contains EJS), so that the JS classifier can overlay
 * EJS delimiter and JS tokens on those ranges without overlap.
 */

import { createScanner } from 'vscode-html-languageservice/lib/esm/parser/htmlScanner';
import type { EjsBlock } from './ejsScanner';

/** Mirror of vscode-html-languageservice TokenType — avoids pulling in vscode-languageserver-types. */
const enum TokenType {
  StartCommentTag  = 0,
  Comment          = 1,
  EndCommentTag    = 2,
  StartTagOpen     = 3,
  StartTagClose    = 4,
  StartTagSelfClose = 5,
  StartTag         = 6,
  EndTagOpen       = 7,
  EndTagClose      = 8,
  EndTag           = 9,
  DelimiterAssign  = 10,
  AttributeName    = 11,
  AttributeValue   = 12,
  StartDoctypeTag  = 13,
  Doctype          = 14,
  EndDoctypeTag    = 15,
  Content          = 16,
  Whitespace       = 17,
  Unknown          = 18,
  Script           = 19,
  Styles           = 20,
  EOS              = 21,
}

/** Token type names — must match TOKEN_TYPES order in semanticTokenProvider.ts */
const TN_STRING = 'string';
const TN_COMMENT = 'comment';
const TN_HTML_TAG = 'htmlTagName';
const TN_HTML_ATTR = 'htmlAttributeName';

/** A collected token to be sorted and pushed to the builder in document order. */
export interface PendingToken {
  offset: number;
  length: number;
  typeName: string;
}

/**
 * Slice `[rangeStart, rangeEnd)` into sub-ranges that avoid any EJS blocks.
 * Returns only the non-EJS portions.
 */
function nonEjsParts(
  rangeStart: number,
  rangeEnd: number,
  blocks: EjsBlock[],
): Array<{ start: number; end: number }> {
  // Collect overlapping blocks, sorted by start
  const overlapping = blocks.filter(
    (b) => b.start < rangeEnd && b.end > rangeStart,
  );

  if (overlapping.length === 0) {
    return [{ start: rangeStart, end: rangeEnd }];
  }

  const parts: Array<{ start: number; end: number }> = [];
  let pos = rangeStart;

  for (const block of overlapping) {
    const blockStart = Math.max(block.start, rangeStart);
    const blockEnd = Math.min(block.end, rangeEnd);
    if (blockStart > pos) {
      parts.push({ start: pos, end: blockStart });
    }
    pos = blockEnd;
  }

  if (pos < rangeEnd) {
    parts.push({ start: pos, end: rangeEnd });
  }

  return parts;
}

/**
 * Collect semantic tokens for all HTML structure visible in the placeholder
 * document into `tokens`. EJS block ranges are skipped so the JS classifier
 * can overlay EJS delimiter and JS tokens on those ranges without overlap.
 *
 * Tokens are NOT pushed to a builder here — the caller sorts them by offset
 * first, ensuring the SemanticTokensBuilder receives them in document order.
 */
export function classifyHtml(
  placeholderText: string,
  blocks: EjsBlock[],
  tokens: PendingToken[],
): void {
  const scanner = createScanner(placeholderText, 0);

  let tokenType: number = scanner.scan() as number;

  while (tokenType !== TokenType.EOS) {
    const offset = scanner.getTokenOffset();
    const length = scanner.getTokenLength();
    const tokenEnd = offset + length;

    switch (tokenType) {
      // ── Tag names ──────────────────────────────────────────────────────────
      case TokenType.StartTag:
      case TokenType.EndTag: {
        emitSplit(offset, tokenEnd, TN_HTML_TAG, blocks, placeholderText, tokens);
        break;
      }

      // ── Attribute names ────────────────────────────────────────────────────
      case TokenType.AttributeName: {
        emitSplit(offset, tokenEnd, TN_HTML_ATTR, blocks, placeholderText, tokens);
        break;
      }

      // ── Attribute values (includes surrounding quotes) ─────────────────────
      case TokenType.AttributeValue: {
        emitSplit(offset, tokenEnd, TN_STRING, blocks, placeholderText, tokens);
        break;
      }

      // ── HTML comments: emit entire <!--...comment...-->'s inner text ────────
      case TokenType.StartCommentTag: // <!--
      case TokenType.Comment:         // comment text
      case TokenType.EndCommentTag: { // -->
        emitSplit(offset, tokenEnd, TN_COMMENT, blocks, placeholderText, tokens);
        break;
      }

      // ── DOCTYPE ────────────────────────────────────────────────────────────
      case TokenType.StartDoctypeTag: // <!DOCTYPE
      case TokenType.Doctype:         // doctype value
      case TokenType.EndDoctypeTag: { // >
        emitSplit(offset, tokenEnd, TN_HTML_TAG, blocks, placeholderText, tokens);
        break;
      }

      // Content, whitespace, delimiters, script/style content — not emitted
      // (left to TextMate grammar fallback or default theme color)
      default:
        break;
    }

    tokenType = scanner.scan() as number;
  }
}

/**
 * Collect a semantic token for [start, end) with the given type name into
 * `tokens`, splitting around any EJS blocks that overlap the range.
 * Multi-line parts are skipped (theme fallback handles them).
 */
function emitSplit(
  start: number,
  end: number,
  typeName: string,
  blocks: EjsBlock[],
  placeholderText: string,
  tokens: PendingToken[],
): void {
  const parts = nonEjsParts(start, end, blocks);
  for (const part of parts) {
    const partLen = part.end - part.start;
    if (partLen <= 0) { continue; }
    // Skip multi-line tokens (theme fallback handles them)
    if (placeholderText.slice(part.start, part.end).includes('\n')) { continue; }
    tokens.push({ offset: part.start, length: partLen, typeName });
  }
}
