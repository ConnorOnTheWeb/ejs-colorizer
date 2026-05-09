# Change Log

## [2.2.1] - 2026-05-09

### Fixed

- `tsconfig.json`: switched `moduleResolution` from the deprecated `"node"` to `"bundler"` (the correct setting for esbuild-bundled projects); changed `module` to `"ESNext"` for compatibility; added `forceConsistentCasingInFileNames: true` and explicit `"types": ["node"]` so Node.js globals (`setTimeout`, `clearTimeout`) are always resolved by the language server.
- `package.json`: removed redundant `activationEvents` entry — VS Code auto-generates activation events from `contributes.languages` declarations.

---

## [2.2.0] - 2026-05-10

### Added

- **Document Symbols / Outline** — the Outline panel and breadcrumb bar now show all EJS blocks as navigable symbols. Control-flow blocks (`if`, `for`, `forEach`, `while`, `switch`) appear as events; `include()` calls appear as file references; variable declarations and output expressions are also shown.

- **Prettier integration** — "Format Document" (Shift+Alt+F) now works for EJS files via the Prettier CLI. The formatter locates Prettier in your project's `node_modules/.bin/` or on PATH, applies your `.prettierrc` config, and uses `@prettier/plugin-ejs` when available for full EJS-aware formatting.

- **Emmet abbreviations** — Emmet expansion (e.g. `div.container>ul>li*3`) now works in EJS files inside HTML regions, matching the behaviour you'd expect in `.html` files.

### Fixed

- `includePathCompletionProvider`: removed unused `path` import.
- `documentLinkProvider`: removed unused `resolveIncludePath` import.
- `diagnosticProvider`: when Node.js (V8) cannot provide a precise line number for a `SyntaxError` (V8 does not expose `.lineNumber` on `Function` constructor errors), the diagnostic now falls back to highlighting the first non-trivial EJS block rather than always pointing to document offset 0.

---

## [2.1.0] - 2026-05-09

### Added

- **Include path completions** — file-path autocomplete inside `include()` string arguments, triggered by `'`, `"`, and `/`. Lists `.ejs` and `.html` files relative to the current file's directory; directories re-trigger suggestions so you can navigate subdirectories naturally.

- **Document links** — every `include()` path is now an underlined, Ctrl/Cmd+clickable link that opens the referenced file directly in the editor.

- **Go to Definition (F12)** — pressing F12 (or Ctrl/Cmd+click) while the cursor is on an include path navigates to the first line of the included file. Returns no result (rather than an error) when the file does not exist.

- **Diagnostics: missing include paths** — `include()` calls that reference a file not found on disk are reported as warnings with the path underlined.

- **Diagnostics: JS syntax errors (joined-program)** — replaces the previous per-block checker which produced false positives on normal `if/for` blocks. All scriptlet and output block contents are now joined into a single synthetic JS function (mirroring EJS runtime behaviour) before syntax checking, so split control-flow constructs are correctly accepted.

---

## [2.0.0] - 2026-05-08

### Changed — complete architectural rebuild

- **Semantic token provider replaces TextMate grammar as the primary colorizer.**
  TextMate grammars are stateless regex engines; EJS tags inside HTML elements corrupt the HTML grammar's internal begin/end state machine, causing closing tags and attribute values to appear the wrong color. The semantic token provider runs real TypeScript code and is immune to this class of bug.

- **Placeholder technique for correct HTML scanning.**
  Each EJS block is replaced with equal-length whitespace in a copy of the document. The `vscode-html-languageservice` stateful scanner then sees clean HTML structure with all character offsets preserved, so every HTML token lands at its exact position.

- **Purpose-built JS lexer.**
  Zero-dependency lexer handles keywords, identifiers, strings (single/double/template literals with `${}` nesting), numbers (int/float/hex/binary/octal/BigInt), line and block comments, and operators. No external JS parser dependency.

- **Tokens are sorted before emission.**
  All HTML and EJS tokens are collected into a flat array and sorted by document offset before being pushed to `SemanticTokensBuilder`, which requires strictly ascending order.

### Added

- **Folding provider** — multi-line EJS blocks fold as units; matching `if/for/while` open/close brace pairs fold together
- **Completion provider** — EJS tag snippets (`<%= %>`, `<%- %>`, `<%# %>`, `<% if %>`, `<% forEach %>`, `<%- include() %>`, etc.) triggered by `<` or `<%`
- **Hover provider** — hover over any EJS delimiter to see documentation

### Removed

- TextMate injection grammar for HTML attribute values (semantic tokens now handle this correctly)

---

## [1.2.0] - 2026-05-05

- EJS tags inside HTML attribute values highlighted via TextMate injection grammar

## [1.1.0] - 2026-05-05

- HTML content wrapped under `meta.html-content.ejs` scope for stable extension injection targeting

## [1.0.0] - 2026-04-29

- Initial release: TextMate grammar for all EJS tag variants, embedded JS/HTML language delegation, language configuration
