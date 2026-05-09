/**
 * definitionProvider.ts
 *
 * Go-to-definition (F12 / Ctrl+Click) for EJS include() paths.
 *
 *   <%- include('./partials/header') %>
 *                ^^^^^^^^^^^^^^^^^ — F12 opens partials/header.ejs at line 1
 *
 * If the file does not exist on disk we return undefined rather than showing
 * an error — VS Code already shows "No definition found" in that case.
 *
 * The provider uses vscode.workspace.fs.stat() to check file existence before
 * returning a location, so F12 on a typo'd path doesn't open a blank editor.
 */

import * as vscode from 'vscode';
import { includeAtPosition } from './includeResolver';

export const ejsDefinitionProvider: vscode.DefinitionProvider = {
  async provideDefinition(
    document: vscode.TextDocument,
    position: vscode.Position,
  ): Promise<vscode.Definition | undefined> {
    const text = document.getText();
    const inc = includeAtPosition(text, document.uri, document, position);
    if (!inc) { return undefined; }

    // Verify the file exists before jumping to it
    try {
      await vscode.workspace.fs.stat(inc.resolvedUri);
    } catch {
      return undefined;
    }

    // Jump to the top of the included file
    return new vscode.Location(inc.resolvedUri, new vscode.Position(0, 0));
  },
};
