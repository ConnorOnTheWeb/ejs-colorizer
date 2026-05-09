/**
 * documentLinkProvider.ts
 *
 * Makes every EJS include() path a clickable link that opens the referenced
 * file in the editor.
 *
 *   <%- include('./partials/header') %>
 *                ^^^^^^^^^^^^^^^^^ — Ctrl/Cmd+click opens the file
 *
 * Uses DocumentLinkProvider so VS Code renders the standard underline+tooltip
 * on hover and opens the file on click, consistent with HTML href / src links.
 *
 * resolveDocumentLink is implemented so VS Code can lazily resolve the target
 * URI only when the user actually hovers (better perf on large files).
 */

import * as vscode from 'vscode';
import { findIncludes } from './includeResolver';

export const ejsDocumentLinkProvider: vscode.DocumentLinkProvider = {
  provideDocumentLinks(
    document: vscode.TextDocument,
  ): vscode.DocumentLink[] {
    const text = document.getText();
    const includes = findIncludes(text, document.uri);

    return includes.map((inc) => {
      // Range covers only the path text inside the quotes (not the quotes themselves)
      const pathStart = document.positionAt(inc.quoteStart + 1);
      const pathEnd = document.positionAt(inc.quoteEnd - 1);
      const range = new vscode.Range(pathStart, pathEnd);

      const link = new vscode.DocumentLink(range, inc.resolvedUri);
      link.tooltip = `Open ${inc.rawPath}`;
      return link;
    });
  },

  resolveDocumentLink(link: vscode.DocumentLink): vscode.DocumentLink {
    // URI is already set in provideDocumentLinks; nothing more to resolve.
    return link;
  },
};
