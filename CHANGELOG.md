# Change Log

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
