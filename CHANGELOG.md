# Change Log

All notable changes to the "ejs-colorizer" extension will be documented in this file.

## [1.2.0] - 2026-05-05

### Added

- EJS tags inside HTML attribute values (e.g. `src="<%= url %>"`, `class="<%= cls %>"`) are now correctly highlighted via a TextMate injection grammar targeting `string.quoted.double.html` and `string.quoted.single.html` within `text.html.ejs`

## [1.1.0] - 2026-05-05

### Added

- HTML content is now wrapped under the scope `meta.html-content.ejs`, giving other extensions a stable injection target for the HTML regions of `.ejs` files
- Extensions can inject into `.ejs` files using `"injectTo": ["text.html.ejs"]` and target `meta.html-content.ejs` or standard HTML attribute scopes (`entity.other.attribute-name.html`, `string.quoted.double.html`)

## [1.0.0] - 2026-04-29

### Added

- TextMate grammar for all EJS tag variants: `<%`, `<%=`, `<%-`, `<%_`, `<%#`, `-%>`, `_%>`
- Embedded language delegation: JavaScript inside tags (`source.js`), HTML outside tags (`text.html.basic`)
- Language configuration: EJS block comment toggling (`<%#` / `%>`), bracket matching and auto-closing for `<% %>` pairs
