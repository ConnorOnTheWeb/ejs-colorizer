/**
 * hoverProvider.ts
 *
 * Shows documentation when hovering over EJS tag delimiters.
 *
 *   <%=   → Escaped output
 *   <%-   → Unescaped output
 *   <%#   → Comment
 *   <%_   → Whitespace-slurp scriptlet
 *   <%    → Scriptlet
 *   -%>   → Trim whitespace on close
 *   _%>   → Whitespace-slurp close
 *   %>    → Close tag
 */

import * as vscode from 'vscode';
import { scanEjsBlocks } from './ejsScanner';

interface EjsTagDoc {
  pattern: RegExp;
  title: string;
  body: string;
}

const TAG_DOCS: EjsTagDoc[] = [
  {
    pattern: /^<%= ?/,
    title: '`<%= %>` — Escaped Output',
    body: 'Evaluates the expression and inserts the result into the HTML output, **HTML-escaped** (e.g. `<` becomes `&lt;`). Use this for any user-supplied data to prevent XSS.',
  },
  {
    pattern: /^<%- ?/,
    title: '`<%- %>` — Unescaped Output',
    body: 'Evaluates the expression and inserts the result **without** HTML escaping. Only use with trusted content (e.g. pre-rendered HTML from your own code).',
  },
  {
    pattern: /^<%# ?/,
    title: '`<%# %>` — EJS Comment',
    body: 'A server-side comment. The content is **not** included in the rendered HTML output — unlike `<!-- -->` HTML comments which are sent to the browser.',
  },
  {
    pattern: /^<%_ ?/,
    title: '`<%_ %>` — Whitespace-Slurp Scriptlet',
    body: "Like `<% %>` but strips all whitespace (spaces, tabs) that precede the tag on the same line. Useful for keeping templates readable without extra blank lines in output.",
  },
  {
    pattern: /^<% ?/,
    title: '`<% %>` — Scriptlet',
    body: 'Executes the JavaScript code but produces **no output**. Use for control flow (`if`, `for`, `while`) and variable assignments.',
  },
  {
    pattern: /^-%>/,
    title: '`-%>` — Newline-Slurp Close',
    body: 'Closes the EJS tag and removes the **newline** immediately after it. Keeps the rendered HTML compact.',
  },
  {
    pattern: /^_%>/,
    title: '`_%>` — Whitespace-Slurp Close',
    body: 'Closes the EJS tag and removes all **trailing whitespace** (including newline) after it.',
  },
  {
    pattern: /^%>/,
    title: '`%>` — Close Tag',
    body: 'Closes an EJS scriptlet or output tag.',
  },
];

export const ejsHoverProvider: vscode.HoverProvider = {
  provideHover(
    document: vscode.TextDocument,
    position: vscode.Position,
  ): vscode.Hover | undefined {
    const text = document.getText();
    const offset = document.offsetAt(position);

    // Find an EJS block whose delimiter spans the hover position
    const blocks = scanEjsBlocks(text);

    for (const block of blocks) {
      // Check opening delimiter
      const openEnd = block.start + block.openLen;
      if (offset >= block.start && offset < openEnd) {
        const tag = text.slice(block.start, openEnd);
        const doc = TAG_DOCS.find((d) => d.pattern.test(tag));
        if (doc) {
          return new vscode.Hover(
            new vscode.MarkdownString(`**${doc.title}**\n\n${doc.body}`),
            new vscode.Range(
              document.positionAt(block.start),
              document.positionAt(openEnd),
            ),
          );
        }
      }

      // Check closing delimiter
      const closeStart = block.end - block.closeLen;
      if (offset >= closeStart && offset < block.end) {
        const tag = text.slice(closeStart, block.end);
        const doc = TAG_DOCS.find((d) => d.pattern.test(tag));
        if (doc) {
          return new vscode.Hover(
            new vscode.MarkdownString(`**${doc.title}**\n\n${doc.body}`),
            new vscode.Range(
              document.positionAt(closeStart),
              document.positionAt(block.end),
            ),
          );
        }
      }
    }

    return undefined;
  },
};
