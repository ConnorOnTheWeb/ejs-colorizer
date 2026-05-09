/**
 * documentSymbolProvider.ts
 *
 * Populates the Outline panel and breadcrumbs for EJS files.
 *
 * Surfaced symbols:
 *   - Control-flow scriptlet blocks: if / else if / else / for / forEach /
 *     while / switch
 *   - Variable declarations: const / let / var
 *   - include() calls
 *   - Generic multi-word scriptlets (shown as a trimmed preview)
 *   - Output expressions: <%= ... %>  and  <%- ... %>
 *
 * The heuristics here intentionally favour legibility over completeness —
 * the goal is useful navigation landmarks, not a full JS AST.
 */

import * as vscode from 'vscode';
import { scanEjsBlocks } from './ejsScanner';
import type { EjsBlock } from './ejsScanner';

// ─── Heuristics ───────────────────────────────────────────────────────────────

interface SymbolSpec {
  name: string;
  detail: string;
  kind: vscode.SymbolKind;
}

const CONTROL_FLOW_RE =
  /^\s*(if|else\s*if|else|for|forEach|while|switch|try|catch|finally)\b/;
const VAR_DECL_RE = /^\s*(const|let|var)\s+(\w+)/;
const INCLUDE_RE = /include\s*\(\s*['"]([^'"]+)['"]/;

function classifyBlock(block: EjsBlock, jsContent: string): SymbolSpec | null {
  const trimmed = jsContent.trim();
  if (!trimmed) { return null; }

  // include()
  const includeMatch = INCLUDE_RE.exec(trimmed);
  if (includeMatch) {
    return {
      name: `include('${includeMatch[1]}')`,
      detail: '',
      kind: vscode.SymbolKind.File,
    };
  }

  // output tags: <%= ... %>  /  <%- ... %>
  if (block.type === 'output-escaped' || block.type === 'output-unescaped') {
    const preview = trimmed.length > 40 ? trimmed.slice(0, 40) + '…' : trimmed;
    const sigil = block.type === 'output-escaped' ? '=' : '-';
    return {
      name: `<%${sigil} ${preview} %>`,
      detail: block.type === 'output-escaped' ? 'escaped output' : 'unescaped output',
      kind: vscode.SymbolKind.Variable,
    };
  }

  // Control-flow
  const cfMatch = CONTROL_FLOW_RE.exec(trimmed);
  if (cfMatch) {
    // Grab a one-line preview (first line, max 60 chars)
    const firstLine = trimmed.split('\n')[0].trim();
    const preview = firstLine.length > 60 ? firstLine.slice(0, 60) + '…' : firstLine;
    return {
      name: preview,
      detail: cfMatch[1],
      kind: vscode.SymbolKind.Event,
    };
  }

  // Variable declarations
  const varMatch = VAR_DECL_RE.exec(trimmed);
  if (varMatch) {
    return {
      name: varMatch[2],
      detail: varMatch[1],
      kind: vscode.SymbolKind.Variable,
    };
  }

  // Generic scriptlet — only surface if it has at least 3 non-whitespace chars
  // to avoid cluttering the outline with `}` close blocks.
  if (trimmed.length >= 3 && trimmed !== '};' && !/^\}/.test(trimmed)) {
    const preview = trimmed.split('\n')[0].trim();
    const short = preview.length > 50 ? preview.slice(0, 50) + '…' : preview;
    return {
      name: short,
      detail: 'scriptlet',
      kind: vscode.SymbolKind.Module,
    };
  }

  return null;
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export const ejsDocumentSymbolProvider: vscode.DocumentSymbolProvider = {
  provideDocumentSymbols(
    document: vscode.TextDocument,
  ): vscode.DocumentSymbol[] {
    const text = document.getText();
    const blocks = scanEjsBlocks(text);
    const symbols: vscode.DocumentSymbol[] = [];

    for (const block of blocks) {
      if (block.type === 'comment') { continue; }

      const contentStart = block.start + block.openLen;
      const contentEnd = block.end - block.closeLen;
      const jsContent = text.slice(contentStart, contentEnd);

      const spec = classifyBlock(block, jsContent);
      if (!spec) { continue; }

      const startPos = document.positionAt(block.start);
      const endPos = document.positionAt(block.end);
      const fullRange = new vscode.Range(startPos, endPos);

      // selectionRange covers just the opening delimiter for a clean highlight
      const selectionRange = new vscode.Range(
        startPos,
        document.positionAt(block.start + block.openLen),
      );

      symbols.push(new vscode.DocumentSymbol(
        spec.name,
        spec.detail,
        spec.kind,
        fullRange,
        selectionRange,
      ));
    }

    return symbols;
  },
};
