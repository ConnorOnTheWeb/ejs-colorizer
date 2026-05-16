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
 *   - CompletionItemProvider               (include() path completions)
 *   - DocumentLinkProvider                 (clickable include() paths)
 *   - DefinitionProvider                   (F12 on include() paths)
 *   - HoverProvider                        (EJS delimiter documentation)
 *   - DiagnosticCollection                 (JS syntax + missing includes)
 *   - DocumentSymbolProvider               (Outline panel / breadcrumbs)
 *   - DocumentFormattingEditProvider       (Prettier integration)
 */

import * as vscode from 'vscode';
import {
  LEGEND,
  ejsSemanticTokensProvider,
  ejsRangeSemanticTokensProvider,
} from './semanticTokenProvider';
import { provideFoldingRanges } from './foldingProvider';
import { ejsCompletionProvider } from './completionProvider';
import { ejsIncludePathCompletionProvider } from './includePathCompletionProvider';
import { ejsDocumentLinkProvider } from './documentLinkProvider';
import { ejsDefinitionProvider } from './definitionProvider';
import { ejsHoverProvider } from './hoverProvider';
import { createDiagnosticProvider } from './diagnosticProvider';
import { ejsDocumentSymbolProvider } from './documentSymbolProvider';
import { ejsFormattingProvider } from './formattingProvider';

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

  // ── Completions — EJS tag snippets (triggered by < and %) ─────────────────
  context.subscriptions.push(
    vscode.languages.registerCompletionItemProvider(
      EJS_SELECTOR,
      ejsCompletionProvider,
      '<', '%',
    ),
  );

  // ── Completions — include() file paths (triggered by ' " /) ───────────────
  context.subscriptions.push(
    vscode.languages.registerCompletionItemProvider(
      EJS_SELECTOR,
      ejsIncludePathCompletionProvider,
      "'", '"', '/',
    ),
  );

  // ── Document links — clickable include() paths ─────────────────────────────
  context.subscriptions.push(
    vscode.languages.registerDocumentLinkProvider(EJS_SELECTOR, ejsDocumentLinkProvider),
  );

  // ── Definition — F12 / Go to Definition on include() paths ────────────────
  context.subscriptions.push(
    vscode.languages.registerDefinitionProvider(EJS_SELECTOR, ejsDefinitionProvider),
  );

  // ── Hover — EJS delimiter documentation ───────────────────────────────────
  context.subscriptions.push(
    vscode.languages.registerHoverProvider(EJS_SELECTOR, ejsHoverProvider),
  );

  // ── Diagnostics — joined-program JS syntax + missing include paths ─────────
  createDiagnosticProvider(context);

  // ── Document symbols — Outline panel / breadcrumbs ────────────────────────
  context.subscriptions.push(
    vscode.languages.registerDocumentSymbolProvider(
      EJS_SELECTOR,
      ejsDocumentSymbolProvider,
    ),
  );

  // ── Formatting — Prettier integration ─────────────────────────────────────
  context.subscriptions.push(
    vscode.languages.registerDocumentFormattingEditProvider(
      EJS_SELECTOR,
      ejsFormattingProvider,
    ),
  );

  // ── EJS comment toggle (Cmd+/) ────────────────────────────────────────────
  // Each selected line is wrapped with <%# … %> (or unwrapped if all lines are
  // already commented). Operates on full lines; indentation is preserved.
  // The broken-comment diagnostic will warn if any toggled line contains a
  // nested EJS tag that would cause the comment to terminate early.
  context.subscriptions.push(
    vscode.commands.registerTextEditorCommand(
      'ejsColorizer.toggleLineComment',
      (editor: vscode.TextEditor, edit: vscode.TextEditorEdit): void => {
        const doc = editor.document;
        const sel = editor.selection;
        const startLine = sel.start.line;
        // A selection ending at col 0 visually excludes that line
        const endLine =
          !sel.isEmpty && sel.end.character === 0
            ? sel.end.line - 1
            : sel.end.line;
        const lastLine = Math.max(startLine, endLine);

        const lineTexts: string[] = [];
        for (let i = startLine; i <= lastLine; i++) {
          lineTexts.push(doc.lineAt(i).text);
        }

        // Uncomment if every non-empty line is already <%# … %>
        const allCommented = lineTexts
          .filter(t => t.trim().length > 0)
          .every(t => t.trim().startsWith('<%#') && t.trim().endsWith('%>'));

        for (let i = startLine; i <= lastLine; i++) {
          const line = doc.lineAt(i);
          const trimmed = line.text.trim();
          if (!trimmed) { continue; }
          const indent = line.text.substring(
            0,
            line.text.length - line.text.trimStart().length,
          );

          if (allCommented) {
            // Strip <%# prefix and %> suffix — content is never modified
            const inner = trimmed.slice(3, -2).trim();
            edit.replace(line.range, `${indent}${inner}`);
          } else {
            edit.replace(line.range, `${indent}<%# ${trimmed} %>`);
          }
        }
      },
    ),
  );
}
export function deactivate(): void {
  // Nothing to clean up — subscriptions are disposed automatically
}


