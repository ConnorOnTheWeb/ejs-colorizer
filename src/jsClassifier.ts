/**
 * jsClassifier.ts
 *
 * A complete lexical tokenizer for JavaScript / modern ES syntax.
 * Handles: keywords, identifiers, string literals (single, double, template),
 * numbers (int, float, hex, binary, octal, bigint), line and block comments,
 * and operators/punctuation.
 *
 * Used to colorize the JS content inside EJS blocks. No external dependencies.
 */

export type JsTokenType =
  | 'keyword'
  | 'variable'
  | 'string'
  | 'number'
  | 'regexp'
  | 'comment'
  | 'operator';

export interface JsToken {
  type: JsTokenType;
  /** Offset within the JS code string passed to tokenizeJs() */
  start: number;
  length: number;
}

const KEYWORDS = new Set([
  'break', 'case', 'catch', 'class', 'const', 'continue', 'debugger',
  'default', 'delete', 'do', 'else', 'export', 'extends', 'false',
  'finally', 'for', 'function', 'if', 'import', 'in', 'instanceof',
  'let', 'new', 'null', 'of', 'return', 'static', 'super', 'switch',
  'this', 'throw', 'true', 'try', 'typeof', 'undefined', 'var', 'void',
  'while', 'with', 'yield', 'async', 'await', 'from', 'as', 'get', 'set',
]);

// Three-character operators, longest-match first
const OPS3 = new Set(['===', '!==', '>>>', '**=', '>>=', '<<=', '||=', '&&=', '??=']);
// Two-character operators
const OPS2 = new Set([
  '==', '!=', '<=', '>=', '=>', '**', '++', '--',
  '+=', '-=', '*=', '/=', '%=', '&=', '|=', '^=',
  '&&', '||', '??', '?.', '::', '<<', '>>', '->', '**',
]);

function isIdentStart(ch: string): boolean {
  return (ch >= 'a' && ch <= 'z') ||
    (ch >= 'A' && ch <= 'Z') ||
    ch === '_' || ch === '$';
}

function isIdentPart(ch: string): boolean {
  return isIdentStart(ch) || (ch >= '0' && ch <= '9');
}

function isDigit(ch: string): boolean {
  return ch >= '0' && ch <= '9';
}

/**
 * Tokenizes a JavaScript string and returns all meaningful tokens.
 * Whitespace and unknown characters are silently skipped.
 */
export function tokenizeJs(code: string): JsToken[] {
  const tokens: JsToken[] = [];
  let i = 0;
  const len = code.length;

  while (i < len) {
    const ch = code[i];

    // ── Whitespace ───────────────────────────────────────────────────────────
    if (ch === ' ' || ch === '\t' || ch === '\r' || ch === '\n') {
      i++;
      continue;
    }

    // ── Line comment  // ─────────────────────────────────────────────────────
    if (ch === '/' && code[i + 1] === '/') {
      const start = i;
      i += 2;
      while (i < len && code[i] !== '\n') { i++; }
      tokens.push({ type: 'comment', start, length: i - start });
      continue;
    }

    // ── Block comment  /* */ ─────────────────────────────────────────────────
    if (ch === '/' && code[i + 1] === '*') {
      const start = i;
      i += 2;
      while (i < len - 1 && !(code[i] === '*' && code[i + 1] === '/')) { i++; }
      if (i < len - 1) { i += 2; } else { i = len; }
      tokens.push({ type: 'comment', start, length: i - start });
      continue;
    }

    // ── Template literal  ` ─────────────────────────────────────────────────
    if (ch === '`') {
      const start = i;
      i++;
      let depth = 0; // track ${...} nesting
      while (i < len) {
        const c = code[i];
        if (c === '\\') { i += 2; continue; }
        if (c === '$' && code[i + 1] === '{') { depth++; i += 2; continue; }
        if (c === '}' && depth > 0) { depth--; i++; continue; }
        if (c === '`' && depth === 0) { i++; break; }
        i++;
      }
      tokens.push({ type: 'string', start, length: i - start });
      continue;
    }

    // ── Single-quoted string  ' ──────────────────────────────────────────────
    if (ch === "'") {
      const start = i;
      i++;
      while (i < len) {
        const c = code[i];
        if (c === '\\') { i += 2; continue; }
        if (c === "'" || c === '\n') { if (c === "'") { i++; } break; }
        i++;
      }
      tokens.push({ type: 'string', start, length: i - start });
      continue;
    }

    // ── Double-quoted string  " ──────────────────────────────────────────────
    if (ch === '"') {
      const start = i;
      i++;
      while (i < len) {
        const c = code[i];
        if (c === '\\') { i += 2; continue; }
        if (c === '"' || c === '\n') { if (c === '"') { i++; } break; }
        i++;
      }
      tokens.push({ type: 'string', start, length: i - start });
      continue;
    }

    // ── Numeric literal ──────────────────────────────────────────────────────
    const nextCh = i + 1 < len ? code[i + 1] : '';
    if (isDigit(ch) || (ch === '.' && isDigit(nextCh))) {
      const start = i;

      if (ch === '0' && (nextCh === 'x' || nextCh === 'X')) {
        // Hexadecimal
        i += 2;
        while (i < len && /[0-9a-fA-F_]/.test(code[i])) { i++; }
      } else if (ch === '0' && (nextCh === 'b' || nextCh === 'B')) {
        // Binary
        i += 2;
        while (i < len && (code[i] === '0' || code[i] === '1' || code[i] === '_')) { i++; }
      } else if (ch === '0' && (nextCh === 'o' || nextCh === 'O')) {
        // Octal
        i += 2;
        while (i < len && /[0-7_]/.test(code[i])) { i++; }
      } else {
        // Decimal / float
        while (i < len && (isDigit(code[i]) || code[i] === '_')) { i++; }
        if (i < len && code[i] === '.') {
          i++;
          while (i < len && (isDigit(code[i]) || code[i] === '_')) { i++; }
        }
        if (i < len && (code[i] === 'e' || code[i] === 'E')) {
          i++;
          if (i < len && (code[i] === '+' || code[i] === '-')) { i++; }
          while (i < len && isDigit(code[i])) { i++; }
        }
        if (i < len && code[i] === 'n') { i++; } // BigInt suffix
      }

      tokens.push({ type: 'number', start, length: i - start });
      continue;
    }

    // ── Identifier or keyword ────────────────────────────────────────────────
    if (isIdentStart(ch)) {
      const start = i;
      while (i < len && isIdentPart(code[i])) { i++; }
      const word = code.slice(start, i);
      tokens.push({
        type: KEYWORDS.has(word) ? 'keyword' : 'variable',
        start,
        length: i - start,
      });
      continue;
    }

    // ── Operators (longest match first) ─────────────────────────────────────
    const s3 = code.slice(i, i + 3);
    if (OPS3.has(s3)) {
      tokens.push({ type: 'operator', start: i, length: 3 });
      i += 3;
      continue;
    }

    const s2 = code.slice(i, i + 2);
    if (OPS2.has(s2)) {
      tokens.push({ type: 'operator', start: i, length: 2 });
      i += 2;
      continue;
    }

    // ── Single-character operator / punctuation ──────────────────────────────
    if ('+-*/<>=!&|^~%?:.;,()[]{}@#'.includes(ch)) {
      tokens.push({ type: 'operator', start: i, length: 1 });
      i++;
      continue;
    }

    // Unknown character — skip silently
    i++;
  }

  return tokens;
}
