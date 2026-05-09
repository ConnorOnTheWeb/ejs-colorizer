/**
 * extension.ts
 *
 * EJS Colorizer v2 — entry point.
 *
 * Registers:
 *   - DocumentSemanticTokensProvider       (full-document coloring)
 *   - DocumentRangeSemanticTokensProvider  (visible-range fast path)
 *   - FoldingRangeProvider                 (fold EJS blocks)
 *   - CompletionItemProvider               (EJS tag snippets)
 *   - HoverProvider                        (EJS delimiter documentation)
 *   - DiagnosticCollection                 (JS syntax errors in EJS blocks)
 */

import * as vscode from 'vscode';
import {
  LEGEND,
  ejsSemanticTokensProvider,
  ejsRangeSemanticTokensProvider,
} from './semanticTokenProvider';
import { provideFoldingRanges } from './foldingProvider';
import { ejsCompletionProvider } from './completionProvider';
import { ejsHoverProvider } from './hoverProvider';

const EJS_SELECTOR: vscode.DocumentSelector = { language: 'ejs' };

export function activate(context: vscode.ExtensionContext): void {
  // ── Semantic tokens — full document ────────────────────────────────────────
  context.subscriptions.push(
    vscode.languages.registerDocumentSemanticTokensProvider(
      EJS_SELECTOR,
      ejsSemanticTokensProvider,
      LEGEND,
    ),
  );

  // ── Semantic tokens — range (faster for large files) ──────────────────────
  context.subscriptions.push(
    vscode.languages.registerDocumentRangeSemanticTokensProvider(
      EJS_SELECTOR,
      ejsRangeSemanticTokensProvider,
      LEGEND,
    ),
  );

  // ── Folding ranges ─────────────────────────────────────────────────────────
  context.subscriptions.push(
    vscode.languages.registerFoldingRangeProvider(EJS_SELECTOR, {
      provideFoldingRanges,
    }),
  );

  // ── Completions — triggered by < and % ────────────────────────────────────
  context.subscriptions.push(
    vscode.languages.registerCompletionItemProvider(
      EJS_SELECTOR,
      ejsCompletionProvider,
      '<', '%',
    ),
  );

  // ── Hover — EJS delimiter documentation ───────────────────────────────────
  context.subscriptions.push(
    vscode.languages.registerHoverProvider(EJS_SELECTOR, ejsHoverProvider),
  );

}

export function deactivate(): void {
  // Nothing to clean up — subscriptions are disposed automatically
}

