/**
 * diagnosticProvider.ts
 *
 * Reports JavaScript syntax errors inside EJS blocks by reconstructing the
 * joined program that the EJS runtime would produce.
 *
 * Strategy
 * ────────
 * EJS concatenates all non-comment block contents into a single JS function.
 * Checking each block in isolation would always flag `if (x) {` as an error
 * because the closing `}` lives in a separate block. Instead we:
 *
 *   1. Collect every scriptlet / output block's JS content in document order,
 *      recording the document offset of each fragment's first character.
 *   2. Join the fragments with `;\n` separators to produce a synthetic JS
 *      program that mirrors what the EJS runtime does.
 *   3. Run `new Function(joined)` inside a try/catch. A SyntaxError means the
 *      overall program is invalid.
 *   4. Parse the error's line number against the synthetic program to identify
 *      which original fragment (and therefore which document range) is at fault.
 *
 * Additionally, unresolvable include() paths are reported as warnings.
 *
 * Diagnostics are debounced to avoid firing on every keystroke.
 */

import * as vscode from 'vscode';
import { scanEjsBlocks } from './ejsScanner';
import { findIncludes } from './includeResolver';

const DEBOUNCE_MS = 600;

const timers = new Map<string, ReturnType<typeof setTimeout>>();

// ─── Public API ───────────────────────────────────────────────────────────────

export function createDiagnosticProvider(
  context: vscode.ExtensionContext,
): vscode.DiagnosticCollection {
  const collection = vscode.languages.createDiagnosticCollection('ejs-colorizer');
  context.subscriptions.push(collection);

  const schedule = (doc: vscode.TextDocument) => {
    if (doc.languageId !== 'ejs') { return; }
    const key = doc.uri.toString();
    const existing = timers.get(key);
    if (existing !== undefined) { clearTimeout(existing); }
    timers.set(key, setTimeout(() => {
      timers.delete(key);
      updateDiagnostics(doc, collection);
    }, DEBOUNCE_MS));
  };

  // Run on already-open EJS documents
  for (const doc of vscode.workspace.textDocuments) {
    if (doc.languageId === 'ejs') { schedule(doc); }
  }

  context.subscriptions.push(vscode.workspace.onDidOpenTextDocument(schedule));
  context.subscriptions.push(vscode.workspace.onDidChangeTextDocument(({ document }) => schedule(document)));
  context.subscriptions.push(vscode.workspace.onDidCloseTextDocument((doc) => {
    collection.delete(doc.uri);
    const key = doc.uri.toString();
    const t = timers.get(key);
    if (t !== undefined) { clearTimeout(t); timers.delete(key); }
  }));

  return collection;
}

// ─── Core ─────────────────────────────────────────────────────────────────────

async function updateDiagnostics(
  document: vscode.TextDocument,
  collection: vscode.DiagnosticCollection,
): Promise<void> {
  const text = document.getText();
  const diagnostics: vscode.Diagnostic[] = [];

  // ── 1. JS syntax check via joined program ──────────────────────────────────
  checkJsSyntax(text, document, diagnostics);

  // ── 2. Include path existence check ───────────────────────────────────────
  await checkIncludes(text, document, diagnostics);

  // ── 3. Broken EJS comment detection ───────────────────────────────────────
  checkBrokenEjsComments(text, document, diagnostics);

  collection.set(document.uri, diagnostics);
}

// ─── JS syntax (joined program) ───────────────────────────────────────────────

interface Fragment {
  code: string;
  /** Offset in the document where this fragment's first character lives. */
  docOffset: number;
}

function checkJsSyntax(
  text: string,
  document: vscode.TextDocument,
  diagnostics: vscode.Diagnostic[],
): void {
  const blocks = scanEjsBlocks(text);

  // Collect executable fragments in document order (skip comments)
  const fragments: Fragment[] = [];
  for (const block of blocks) {
    if (block.type === 'comment') { continue; }
    const contentStart = block.start + block.openLen;
    const contentEnd = block.end - block.closeLen;
    const code = text.slice(contentStart, contentEnd);
    if (code.trim().length === 0) { continue; }
    fragments.push({ code, docOffset: contentStart });
  }

  if (fragments.length === 0) { return; }

  // Build a synthetic joined program, tracking which document offset each
  // line of the synthetic program corresponds to.
  //
  // Structure:
  //   (function(){
  //     <fragment 0 line 0>
  //     <fragment 0 line 1>
  //     ...
  //     <fragment 1 line 0>
  //     ...
  //   })
  //
  // Line 0 is the wrapper open — line index within the synthetic program
  // starts at 1 for the first real content line.

  const syntheticLines: Array<{ docOffset: number }> = [];
  syntheticLines.push({ docOffset: 0 }); // line 0: wrapper open (not real content)

  const parts: string[] = ['(function(){\n'];

  for (const frag of fragments) {
    const fragLines = frag.code.split('\n');
    let lineOffset = 0;
    for (let li = 0; li < fragLines.length; li++) {
      syntheticLines.push({ docOffset: frag.docOffset + lineOffset });
      lineOffset += fragLines[li].length + 1;
    }
    parts.push(frag.code);
    parts.push('\n;\n');
    // The `;\n` separator occupies one line in the synthetic program that has
    // no corresponding document position — use the end of the last fragment.
    syntheticLines.push({ docOffset: frag.docOffset + frag.code.length });
  }

  parts.push('})');
  const joined = parts.join('');

  const error = trySyntaxCheck(joined);
  if (!error) { return; }

  // V8 (Node.js) does not expose .lineNumber on SyntaxError from new Function().
  // If it is available (e.g. SpiderMonkey), use it to map into the synthetic
  // program. Otherwise fall back to highlighting the first EJS block that
  // contains non-trivial JS content — that is more useful than line 0.
  let errorDocOffset = 0;
  if (error.lineNumber !== undefined) {
    const synLine = error.lineNumber - 1; // 1-based → 0-based
    const entry = syntheticLines[Math.min(synLine, syntheticLines.length - 1)];
    errorDocOffset = entry?.docOffset ?? 0;
  } else {
    // Fall back to the first fragment that isn't just a brace
    const firstMeaningful = fragments.find(
      (f) => f.code.trim().length > 1,
    );
    errorDocOffset = firstMeaningful?.docOffset ?? fragments[0]?.docOffset ?? 0;
  }

  const errorPos = document.positionAt(errorDocOffset);
  // Underline the entire line at the error position for visibility
  const errorLine = document.lineAt(errorPos.line);
  const range = new vscode.Range(
    new vscode.Position(errorPos.line, errorLine.firstNonWhitespaceCharacterIndex),
    errorLine.range.end,
  );

  const diag = new vscode.Diagnostic(
    range,
    `EJS JS syntax error: ${error.message}`,
    vscode.DiagnosticSeverity.Error,
  );
  diag.source = 'ejs-colorizer';
  diagnostics.push(diag);
}

interface ParsedSyntaxError {
  message: string;
  lineNumber?: number;
}

function trySyntaxCheck(code: string): ParsedSyntaxError | null {
  try {
    // new Function() parses (but does not execute) the code
    // eslint-disable-next-line no-new-func
    new Function(code);
    return null;
  } catch (e) {
    if (e instanceof SyntaxError) {
      return {
        message: e.message,
        lineNumber: (e as { lineNumber?: number }).lineNumber,
      };
    }
    return null;
  }
}

// ─── Include path existence ───────────────────────────────────────────────────

async function checkIncludes(
  text: string,
  document: vscode.TextDocument,
  diagnostics: vscode.Diagnostic[],
): Promise<void> {
  const includes = findIncludes(text, document.uri);

  await Promise.all(includes.map(async (inc) => {
    let exists = false;
    try {
      await vscode.workspace.fs.stat(inc.resolvedUri);
      exists = true;
    } catch {
      exists = false;
    }

    if (!exists) {
      const pathStart = document.positionAt(inc.quoteStart + 1);
      const pathEnd = document.positionAt(inc.quoteEnd - 1);
      const diag = new vscode.Diagnostic(
        new vscode.Range(pathStart, pathEnd),
        `Cannot find EJS partial: '${inc.rawPath}'`,
        vscode.DiagnosticSeverity.Warning,
      );
      diag.source = 'ejs-colorizer';
      diagnostics.push(diag);
    }
  }));
}

// ─── Broken EJS comment detection ────────────────────────────────────────────
//
// A <%# %> comment closes at the first %> the EJS parser encounters.  If the
// intended comment content contains another EJS tag (e.g. <%= value %>), the
// comment terminates inside that tag and the rest of the line is emitted as
// raw output.
//
// Detection heuristic: after each comment block ends, look at the remaining
// text on the same line.  If %> appears before any <%, those are orphaned
// closing delimiters — the comment terminated early.
//
// This avoids false positives like `<%# Use the <%= tag syntax %>` where the
// first %> IS the intended comment closer (no orphaned %> follows it).

function checkBrokenEjsComments(
  text: string,
  document: vscode.TextDocument,
  diagnostics: vscode.Diagnostic[],
): void {
  const blocks = scanEjsBlocks(text);

  for (const block of blocks) {
    if (block.type !== 'comment') { continue; }

    // Find the end of the line on which this block closes
    const endPos = document.positionAt(block.end);
    const lineEnd = document.lineAt(endPos.line).range.end;
    const lineEndOffset = document.offsetAt(lineEnd);

    if (block.end >= lineEndOffset) { continue; } // nothing left on the line

    const afterText = text.slice(block.end, lineEndOffset);

    const closerIdx = afterText.indexOf('%>');
    const openerIdx = afterText.indexOf('<%');

    // Orphaned %> found before any new <% opener → comment terminated early
    if (closerIdx < 0 || (openerIdx >= 0 && openerIdx < closerIdx)) { continue; }

    // Highlight from the start of the comment to the orphaned %>
    const orphanEnd = document.positionAt(block.end + closerIdx + 2);
    const range = new vscode.Range(document.positionAt(block.start), orphanEnd);

    const diag = new vscode.Diagnostic(
      range,
      'EJS comment terminates early: the `%>` inside closes the comment before the intended end. ' +
        'Lines containing EJS tags cannot be fully commented with `<%# %>`. ' +
        'Use `<% if (false) { %>` … `<% } %>` instead.',
      vscode.DiagnosticSeverity.Warning,
    );
    diag.source = 'ejs-colorizer';
    diagnostics.push(diag);
  }
}
