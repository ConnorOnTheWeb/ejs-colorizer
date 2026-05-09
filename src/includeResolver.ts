/**
 * includeResolver.ts
 *
 * Shared utilities for locating and parsing EJS include() calls inside a
 * document. Used by the completion, document-link, definition, and diagnostic
 * providers.
 *
 * EJS include syntax (both forms are supported):
 *   <%- include('path/to/partial') %>
 *   <%- include('path/to/partial', { key: value }) %>
 *   <%- include("path/to/partial") %>
 *
 * Paths are resolved relative to the including file's directory, mirroring
 * the EJS runtime behaviour. The `.ejs` extension is optional — EJS appends
 * it automatically when absent.
 */

import * as vscode from 'vscode';
import * as path from 'path';

// ─── Regex ────────────────────────────────────────────────────────────────────

/**
 * Matches any EJS include call.
 *
 * Capture groups:
 *   1 — quote character (' or ")
 *   2 — the raw path string
 *
 * The regex is intentionally lenient about whitespace and does not require the
 * call to sit inside a specific tag type — EJS technically allows include()
 * inside any scriptlet tag.
 */
export const INCLUDE_RE = /include\s*\(\s*(['"])(.*?)\1/g;

// ─── Types ────────────────────────────────────────────────────────────────────

export interface EjsInclude {
  /** The raw path string as written in the source (e.g. `./partials/header`) */
  rawPath: string;
  /** Start offset of the opening quote character in the document */
  quoteStart: number;
  /** End offset of the closing quote character (exclusive) */
  quoteEnd: number;
  /** Absolute URI of the resolved file (may not exist on disk) */
  resolvedUri: vscode.Uri;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Resolve an EJS include path to an absolute URI.
 *
 * EJS rules:
 *   - Relative to the including file's directory
 *   - `.ejs` is appended if the path has no extension
 */
export function resolveIncludePath(rawPath: string, documentUri: vscode.Uri): vscode.Uri {
  const documentDir = vscode.Uri.joinPath(documentUri, '..');
  const withExt = path.extname(rawPath) === '' ? rawPath + '.ejs' : rawPath;
  return vscode.Uri.joinPath(documentDir, withExt);
}

/**
 * Scan `text` for all EJS include() calls and return structured metadata.
 */
export function findIncludes(text: string, documentUri: vscode.Uri): EjsInclude[] {
  const includes: EjsInclude[] = [];
  INCLUDE_RE.lastIndex = 0;

  let match: RegExpExecArray | null;
  while ((match = INCLUDE_RE.exec(text)) !== null) {
    const quote = match[1];
    const rawPath = match[2];

    // Offset of the path string content (after the opening quote)
    const quoteStart = match.index + match[0].indexOf(quote);
    const quoteEnd = quoteStart + rawPath.length + 2; // +2 for both quotes

    includes.push({
      rawPath,
      quoteStart,
      quoteEnd,
      resolvedUri: resolveIncludePath(rawPath, documentUri),
    });
  }

  return includes;
}

/**
 * Return the range of the path string (including surrounding quotes) at a
 * given document position, or undefined if the position is not inside an
 * include path string.
 */
export function includeAtPosition(
  text: string,
  documentUri: vscode.Uri,
  document: vscode.TextDocument,
  position: vscode.Position,
): EjsInclude | undefined {
  const offset = document.offsetAt(position);
  const includes = findIncludes(text, documentUri);
  return includes.find((inc) => offset >= inc.quoteStart && offset <= inc.quoteEnd);
}
