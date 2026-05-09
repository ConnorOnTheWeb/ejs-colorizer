/**
 * formattingProvider.ts
 *
 * DocumentFormattingEditProvider for EJS files.
 *
 * Uses the Prettier CLI found in the current workspace's node_modules or on
 * PATH to format the document.  Requires the `@prettier/plugin-ejs` package
 * for full EJS support.  Falls back to `--parser=html` if the plugin is not
 * installed, which at least formats the surrounding HTML.
 *
 * If no Prettier binary can be found, an informational message is shown.
 */

import * as vscode from 'vscode';
import * as cp from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function workspaceRoot(): string | undefined {
  return vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
}

function findPrettierBin(): string | undefined {
  const root = workspaceRoot();
  if (root) {
    const local = path.join(root, 'node_modules', '.bin', 'prettier');
    if (fs.existsSync(local)) { return local; }
  }
  // Try PATH
  try {
    const result = cp.execSync('command -v prettier', { encoding: 'utf8' }).trim();
    if (result) { return result; }
  } catch {
    // not on PATH
  }
  return undefined;
}

function hasEjsPlugin(root: string | undefined): boolean {
  if (!root) { return false; }
  const pluginDir = path.join(root, 'node_modules', '@prettier', 'plugin-ejs');
  return fs.existsSync(pluginDir);
}

/**
 * Run prettier with the given arguments, piping `input` to stdin.
 * Resolves with stdout on success, rejects with stderr on error.
 */
function runPrettier(
  prettierBin: string,
  args: string[],
  input: string,
  cwd: string | undefined,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const child = cp.spawn(prettierBin, args, {
      cwd,
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    const stdoutChunks: Buffer[] = [];
    const stderrChunks: Buffer[] = [];

    child.stdout.on('data', (chunk: Buffer) => stdoutChunks.push(chunk));
    child.stderr.on('data', (chunk: Buffer) => stderrChunks.push(chunk));

    child.on('close', (code) => {
      if (code === 0) {
        resolve(Buffer.concat(stdoutChunks).toString('utf8'));
      } else {
        reject(new Error(Buffer.concat(stderrChunks).toString('utf8') || `prettier exited with code ${code}`));
      }
    });

    child.on('error', reject);

    child.stdin.write(input, 'utf8');
    child.stdin.end();
  });
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export const ejsFormattingProvider: vscode.DocumentFormattingEditProvider = {
  async provideDocumentFormattingEdits(
    document: vscode.TextDocument,
    options: vscode.FormattingOptions,
  ): Promise<vscode.TextEdit[]> {
    const prettierBin = findPrettierBin();
    if (!prettierBin) {
      void vscode.window.showInformationMessage(
        'EJS Colorizer: Prettier not found. Install it in your project: ' +
        '`npm install --save-dev prettier @prettier/plugin-ejs`',
      );
      return [];
    }

    const root = workspaceRoot();
    const filePath = document.uri.fsPath;
    const text = document.getText();
    const tabWidth = String(options.tabSize);
    const useTabs = !options.insertSpaces ? 'true' : 'false';

    const args = [
      '--stdin-filepath', filePath,
      '--tab-width', tabWidth,
      '--use-tabs', useTabs,
    ];

    // Add EJS plugin if available so prettier uses the ejs parser
    if (hasEjsPlugin(root)) {
      args.push('--plugin', '@prettier/plugin-ejs');
    }
    // Otherwise prettier will infer the parser from the .ejs extension.
    // If the EJS plugin is absent, prettier will try html or fail gracefully.

    try {
      const formatted = await runPrettier(prettierBin, args, text, root);

      if (formatted === text) { return []; }

      const fullRange = document.validateRange(
        new vscode.Range(
          new vscode.Position(0, 0),
          new vscode.Position(document.lineCount, 0),
        ),
      );
      return [vscode.TextEdit.replace(fullRange, formatted)];
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);

      // If plugin missing, give a helpful hint
      if (message.includes('No parser') || message.includes('plugin')) {
        void vscode.window.showWarningMessage(
          'EJS Colorizer: Prettier could not format the file. ' +
          'Install `@prettier/plugin-ejs` for full EJS formatting support.',
        );
      } else {
        void vscode.window.showErrorMessage(
          `EJS Colorizer: Prettier error — ${message.split('\n')[0]}`,
        );
      }
      return [];
    }
  },
};
