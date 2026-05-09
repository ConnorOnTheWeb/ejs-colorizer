# EJS Colorizer

Complete EJS language support for Visual Studio Code — built on the [Semantic Tokens API](https://code.visualstudio.com/api/language-extensions/semantic-highlight-guide) so every token is colored correctly regardless of how complex the template gets.

[![Visual Studio Marketplace](https://img.shields.io/visual-studio-marketplace/v/connorontheweb.ejs-colorizer?label=VS%20Marketplace)](https://marketplace.visualstudio.com/items?itemName=connorontheweb.ejs-colorizer)

## Why v2

Previous versions used TextMate grammars. TextMate grammars are stateless regex engines — when EJS tags appear inside HTML elements, the HTML grammar's internal state machine gets corrupted and downstream tokens (closing tags, attribute values, etc.) end up the wrong color. The only real fix is to step outside the TextMate system.

v2 replaces that with a full semantic token provider: a stateful HTML scanner runs over a "placeholder" version of the document (EJS blocks replaced with equal-length spaces so offsets are preserved), then a purpose-built JS lexer handles the content inside each EJS block. Every token is placed at its exact document offset. `</p>` is always the right color.

## Features

**Accurate syntax highlighting**
- All EJS tag types: `<%`, `<%=`, `<%-`, `<%#`, `<%_`, `-%>`, `_%>`
- HTML — tag names, attribute names, attribute values, comments, DOCTYPE
- JavaScript inside EJS blocks — keywords, strings, numbers, comments, operators
- Works correctly at every nesting level and with EJS inside attribute values

**Outline / Document Symbols**
- The Outline panel and breadcrumbs show all EJS blocks as navigable symbols: control-flow blocks, `include()` calls, variable declarations, and output expressions

**Emmet abbreviations**
- Emmet expansion works inside HTML regions of EJS files (`div.container>ul>li*3` → full HTML structure)

**Prettier formatting**
- Format Document (Shift+Alt+F) uses the Prettier CLI from your project's `node_modules` (or PATH)
- Respects your `.prettierrc`; use `@prettier/plugin-ejs` for full EJS-aware formatting

**Include navigation**
- File-path completions inside `include()` — lists `.ejs`/`.html` files relative to the current file, with directory traversal
- Clickable document links on every `include()` path (Ctrl/Cmd+click)
- Go to Definition (F12) jumps to the first line of the included file
- Warning diagnostic when an `include()` path does not exist on disk

**JS syntax diagnostics**
- Joins all scriptlet/output block contents into a single synthetic program (matching EJS runtime behaviour) before checking syntax — so split `if/for/while` constructs spanning multiple blocks are accepted correctly

**Folding**
- Multi-line EJS blocks fold as a unit
- Matching `if/for/while` open-blocks (`{`) fold to their corresponding `}` close-block

**Completions**
- EJS tag snippets triggered by `<` or `<%`
- Includes `if`, `if/else`, `for`, `forEach`, and `include` block templates

**Hover documentation**
- Hover over any EJS delimiter to see what it does

## Tag Reference

| Tag | Purpose |
|-----|---------|
| `<% %>` | Scriptlet — executes JS, no output |
| `<%= %>` | Output, HTML-escaped |
| `<%- %>` | Output, unescaped (trusted content only) |
| `<%# %>` | Server-side comment — not sent to browser |
| `<%_ %>` | Whitespace-slurp scriptlet |
| `-%>` | Trims the trailing newline |
| `_%>` | Trims all trailing whitespace |

## Requirements

VS Code 1.116.0 or later. No other dependencies — `vscode-html-languageservice` is bundled.

## Extension Settings

No configurable settings. Semantic highlighting is automatically enabled for EJS files.
