/**
 * completionProvider.ts
 *
 * Provides completions in EJS files:
 *
 *   1. EJS tag snippets — triggered by `<` or `%`
 *        <%= ... %>   Output (escaped)
 *        <%- ... %>   Output (unescaped)
 *        <%# ... %>   Comment
 *        <% ... %>    Scriptlet
 *        <%_ ... %>   Whitespace-slurp scriptlet
 *
 *   2. EJS closing snippets — triggered by `-` or `_` or `%`
 *        -%>  Trim-whitespace close
 *        _%>  Whitespace-slurp close
 *
 * HTML completions within non-EJS content are handled automatically by VS Code
 * because the file is registered as an HTML-based language (text.html.ejs).
 */

import * as vscode from 'vscode';
import { scanEjsBlocks } from './ejsScanner';

// ─── EJS tag snippets ─────────────────────────────────────────────────────────

interface EjsSnippet {
  label: string;
  insertText: string;
  detail: string;
  documentation: string;
  sortText: string;
}

const EJS_SNIPPETS: EjsSnippet[] = [
  {
    label: '<%= ... %>',
    insertText: '<%= ${1:expression} %>',
    detail: 'EJS output (HTML-escaped)',
    documentation: 'Outputs the value of the expression, HTML-escaped. Use for user-generated content.',
    sortText: '0a',
  },
  {
    label: '<%- ... %>',
    insertText: '<%- ${1:expression} %>',
    detail: 'EJS output (unescaped)',
    documentation: 'Outputs the raw value of the expression without HTML escaping. Use only with trusted content.',
    sortText: '0b',
  },
  {
    label: '<% ... %>',
    insertText: '<% ${1:code} %>',
    detail: 'EJS scriptlet',
    documentation: 'Executes JavaScript code. No output is generated.',
    sortText: '0c',
  },
  {
    label: '<%# ... %>',
    insertText: '<%# ${1:comment} %>',
    detail: 'EJS comment',
    documentation: 'A comment that is not included in the rendered output.',
    sortText: '0d',
  },
  {
    label: '<%_ ... %>',
    insertText: '<%_ ${1:code} %>',
    detail: 'EJS whitespace-slurp scriptlet',
    documentation: 'Like <% %> but strips all preceding whitespace on the line.',
    sortText: '0e',
  },
  {
    label: '<% if %>',
    insertText: '<% if (${1:condition}) { %>\n\t${2}\n<% } %>',
    detail: 'EJS if block',
    documentation: 'Conditional rendering block.',
    sortText: '1a',
  },
  {
    label: '<% if / else %>',
    insertText: '<% if (${1:condition}) { %>\n\t${2}\n<% } else { %>\n\t${3}\n<% } %>',
    detail: 'EJS if/else block',
    documentation: 'Conditional rendering block with else branch.',
    sortText: '1b',
  },
  {
    label: '<% for %>',
    insertText: '<% for (let ${1:i} = 0; ${1:i} < ${2:items}.length; ${1:i}++) { %>\n\t${3}\n<% } %>',
    detail: 'EJS for loop',
    documentation: 'Iterate with a classic for loop.',
    sortText: '1c',
  },
  {
    label: '<% forEach %>',
    insertText: '<% ${1:items}.forEach(function(${2:item}) { %>\n\t${3}\n<% }); %>',
    detail: 'EJS forEach loop',
    documentation: 'Iterate over an array with forEach.',
    sortText: '1d',
  },
  {
    label: '<% include %>',
    insertText: "<%- include('${1:path/to/partial}', { ${2} }) %>",
    detail: 'EJS include partial',
    documentation: "Include another EJS file. The included file has access to the same local variables plus any extras passed in the second argument.",
    sortText: '2a',
  },
];

// ─── Provider ─────────────────────────────────────────────────────────────────

export const ejsCompletionProvider: vscode.CompletionItemProvider = {
  provideCompletionItems(
    document: vscode.TextDocument,
    position: vscode.Position,
  ): vscode.CompletionItem[] {
    const lineText = document.lineAt(position).text;
    const textBefore = lineText.slice(0, position.character);

    // Only trigger inside non-EJS content or at the start of an EJS tag
    const blocks = scanEjsBlocks(document.getText());
    const offset = document.offsetAt(position);
    const insideEjs = blocks.some(
      (b) => offset > b.start + b.openLen && offset < b.end - b.closeLen,
    );

    if (insideEjs) {
      // Inside an EJS block — let VS Code's built-in JS completions handle it
      return [];
    }

    // Offer EJS snippets when the user types `<` or `<%`
    if (!textBefore.endsWith('<') && !textBefore.endsWith('<%')) {
      return [];
    }

    return EJS_SNIPPETS.map((snippet) => {
      const item = new vscode.CompletionItem(snippet.label, vscode.CompletionItemKind.Snippet);
      item.insertText = new vscode.SnippetString(
        // If user typed `<`, include the full tag; if they typed `<%`, skip the `<`
        textBefore.endsWith('<%') ? snippet.insertText.slice(1) : snippet.insertText,
      );
      item.detail = snippet.detail;
      item.documentation = new vscode.MarkdownString(snippet.documentation);
      item.sortText = snippet.sortText;
      item.filterText = snippet.label;
      return item;
    });
  },
};
