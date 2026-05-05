# EJS Colorizer

Syntax highlighting for [EJS (Embedded JavaScript)](https://ejs.co/) templates in Visual Studio Code.

View on Visual Studio Marketplace [EJS Colorizer](https://marketplace.visualstudio.com/items?itemName=connorontheweb.ejs-colorizer)

## Features

- Colorizes all EJS tag variants with full theme compatibility
- Delegates JavaScript inside tags to VS Code's built-in JS grammar
- Delegates HTML outside tags to VS Code's built-in HTML grammar
- Works with any color theme
- Designed for extension composition — other grammars can inject into `text.html.ejs` or `meta.html-content.ejs`

## Tag Support

| Tag | Purpose |
|-----|---------|
| `<% %>` | Scriptlet — executes JavaScript, no output |
| `<%= %>` | Escaped output |
| `<%- %>` | Unescaped output |
| `<%# %>` | Comment — not executed, not rendered |
| `<%_ %>` | Whitespace-slurping scriptlet |
| `-%>` | Trims trailing newline |
| `_%>` | Trims trailing whitespace |

## Requirements

VS Code 1.116.0 or later. No additional dependencies.

## Extension Settings

This extension has no configurable settings.

## Extension Compatibility

This grammar uses the scope `text.html.ejs` as its root and wraps all HTML content under `meta.html-content.ejs`. Other extensions can inject into `.ejs` files using either scope as an `injectTo` target. HTML attribute scopes from `text.html.basic` (`entity.other.attribute-name.html`, `string.quoted.double.html`, etc.) are fully present and injectable.

## Known Issues

EJS tags inside HTML comments (`<!-- <%= value %> -->`) are not colorized. The HTML grammar applies a flat comment color across the entire comment region, which overrides EJS token colors. This is a limitation of how VS Code layers TextMate grammars and does not affect functionality.

EJS tags inside HTML attribute values (e.g. `<img src="<%= url %>">`) are not colorized as EJS — the HTML grammar claims the attribute string context first. This is a structural limitation of TextMate grammar layering.

When a `%>` closing tag is immediately followed by a `>` character with no space (e.g., `<%= val %>>`), the HTML grammar may misparse the sequence and color subsequent content incorrectly. Adding a space before the `>` resolves this. This is a known TextMate grammar layering edge case.

## Release Notes

### 1.1.0

HTML content is now wrapped under `meta.html-content.ejs` for stable extension injection targeting. See [Extension Compatibility](#extension-compatibility).

### 1.0.0

Initial release.