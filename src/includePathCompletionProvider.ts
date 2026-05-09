/**
 * includePathCompletionProvider.ts
 *
 * Provides file-path completions inside EJS include() string arguments.
 *
 *   <%- include('|')  →  autocomplete with .ejs files relative to the
 *                         current file's directory
 *
 * Triggered by the `/` character (directory navigation) and also by the
 * opening quote so completions appear immediately when the string is created.
 *
 * Uses vscode.workspace.fs for directory listing — the async VS Code API that
 * works correctly with all file system providers (local disk, WSL, SSH, etc.).
 */

import * as vscode from 'vscode';
import * as path from 'path';
import { resolveIncludePath } from './includeResolver';

/** Regex to find an in-progress include path the cursor is inside. */
const INCLUDE_PREFIX_RE = /include\s*\(\s*(['"])((?:[^'"]*\/)?)([^'"]*)?$/;

export const ejsIncludePathCompletionProvider: vscode.CompletionItemProvider = {
  async provideCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position,
  ): Promise<vscode.CompletionItem[] | undefined> {
    const lineText = document.lineAt(position).text;
    const textBeforeCursor = lineText.slice(0, position.character);

    const match = INCLUDE_PREFIX_RE.exec(textBeforeCursor);
    if (!match) { return undefined; }

    const dirPart = match[2];   // everything up to the last `/` (may be empty)
    const filePart = match[3] ?? ''; // partial filename being typed

    // Resolve the directory to scan
    const documentDir = vscode.Uri.joinPath(document.uri, '..');
    const targetDir = dirPart
      ? vscode.Uri.joinPath(documentDir, dirPart)
      : documentDir;

    // List entries in the target directory
    let entries: [string, vscode.FileType][];
    try {
      entries = await vscode.workspace.fs.readDirectory(targetDir);
    } catch {
      return undefined;
    }

    const items: vscode.CompletionItem[] = [];

    for (const [name, fileType] of entries) {
      // Skip hidden files/dirs
      if (name.startsWith('.')) { continue; }

      if (fileType === vscode.FileType.Directory) {
        const item = new vscode.CompletionItem(name + '/', vscode.CompletionItemKind.Folder);
        item.insertText = name + '/';
        // Keep the completion menu open after selecting a directory
        item.command = {
          command: 'editor.action.triggerSuggest',
          title: 'Re-trigger completions',
        };
        items.push(item);
      } else if (fileType === vscode.FileType.File && (name.endsWith('.ejs') || name.endsWith('.html'))) {
        // Strip .ejs extension to match EJS runtime behaviour (it adds it back)
        const label = name.endsWith('.ejs') ? name.slice(0, -4) : name;
        const item = new vscode.CompletionItem(label, vscode.CompletionItemKind.File);
        item.insertText = label;
        item.detail = name;

        // Resolve and show the absolute path in the documentation
        const resolved = resolveIncludePath(dirPart + label, document.uri);
        item.documentation = new vscode.MarkdownString(
          `\`${vscode.workspace.asRelativePath(resolved)}\``,
        );
        items.push(item);
      }
    }

    // Replace the partial filename the user has typed so far
    if (filePart) {
      const replaceStart = position.translate(0, -filePart.length);
      const replaceRange = new vscode.Range(replaceStart, position);
      for (const item of items) {
        item.range = replaceRange;
      }
    }

    return items;
  },
};
