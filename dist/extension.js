"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// node_modules/@vscode/l10n/dist/main.js
var require_main = __commonJS({
  "node_modules/@vscode/l10n/dist/main.js"(exports2, module2) {
    "use strict";
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc2 = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp2 = Object.prototype.hasOwnProperty;
    var __export2 = (target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps2 = (to, from, except, desc) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp2.call(to, key) && key !== except)
            __defProp2(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc2(from, key)) || desc.enumerable });
      }
      return to;
    };
    var __toCommonJS2 = (mod) => __copyProps2(__defProp2({}, "__esModule", { value: true }), mod);
    var main_exports = {};
    __export2(main_exports, {
      config: () => config,
      t: () => t2
    });
    module2.exports = __toCommonJS2(main_exports);
    var import_fs = require("fs");
    var import_promises = require("fs/promises");
    async function readFileFromUri(uri) {
      if (uri.protocol === "file:") {
        return await (0, import_promises.readFile)(uri, "utf8");
      }
      if (uri.protocol === "http:" || uri.protocol === "https:") {
        const res = await fetch(uri.toString(), {
          headers: {
            "Accept-Encoding": "gzip, deflate",
            "Accept": "application/json"
          },
          redirect: "follow"
        });
        if (!res.ok) {
          let error = `Unexpected ${res.status} response while trying to read ${uri}`;
          try {
            error += `: ${await res.text()}`;
          } catch {
          }
          throw new Error(error);
        }
        const decoded = await res.text();
        return decoded;
      }
      throw new Error("Unsupported protocol");
    }
    function readFileFromFsPath(fsPath) {
      return (0, import_fs.readFileSync)(fsPath, "utf8");
    }
    var bundle;
    function config(config2) {
      if ("contents" in config2) {
        if (typeof config2.contents === "string") {
          bundle = JSON.parse(config2.contents);
        } else {
          bundle = config2.contents;
        }
        return;
      }
      if ("fsPath" in config2) {
        const fileContent = readFileFromFsPath(config2.fsPath);
        const content = JSON.parse(fileContent);
        bundle = isBuiltinExtension(content) ? content.contents.bundle : content;
        return;
      }
      if (config2.uri) {
        let uri = config2.uri;
        if (typeof config2.uri === "string") {
          uri = new URL(config2.uri);
        }
        return new Promise((resolve, reject) => {
          readFileFromUri(uri).then((uriContent) => {
            try {
              const content = JSON.parse(uriContent);
              bundle = isBuiltinExtension(content) ? content.contents.bundle : content;
              resolve();
            } catch (err) {
              reject(err);
            }
          }).catch((err) => {
            reject(err);
          });
        });
      }
    }
    function t2(...args) {
      const firstArg = args[0];
      let key;
      let message;
      let formatArgs;
      if (typeof firstArg === "string") {
        key = firstArg;
        message = firstArg;
        args.splice(0, 1);
        formatArgs = !args || typeof args[0] !== "object" ? args : args[0];
      } else if (firstArg instanceof Array) {
        const replacements = args.slice(1);
        if (firstArg.length !== replacements.length + 1) {
          throw new Error("expected a string as the first argument to l10n.t");
        }
        let str = firstArg[0];
        for (let i = 1; i < firstArg.length; i++) {
          str += `{${i - 1}}` + firstArg[i];
        }
        return t2(str, ...replacements);
      } else {
        message = firstArg.message;
        key = message;
        if (firstArg.comment && firstArg.comment.length > 0) {
          key += `/${Array.isArray(firstArg.comment) ? firstArg.comment.join("") : firstArg.comment}`;
        }
        formatArgs = firstArg.args ?? {};
      }
      const messageFromBundle = bundle?.[key];
      if (!messageFromBundle) {
        return format(message, formatArgs);
      }
      if (typeof messageFromBundle === "string") {
        return format(messageFromBundle, formatArgs);
      }
      if (messageFromBundle.comment) {
        return format(messageFromBundle.message, formatArgs);
      }
      return format(message, formatArgs);
    }
    var _format2Regexp = /{([^}]+)}/g;
    function format(template, values) {
      if (Object.keys(values).length === 0) {
        return template;
      }
      return template.replace(_format2Regexp, (match, group) => values[group] ?? match);
    }
    function isBuiltinExtension(json) {
      return !!(typeof json?.contents?.bundle === "object" && typeof json?.version === "string");
    }
  }
});

// src/extension.ts
var extension_exports = {};
__export(extension_exports, {
  activate: () => activate,
  deactivate: () => deactivate
});
module.exports = __toCommonJS(extension_exports);
var vscode12 = __toESM(require("vscode"));

// src/semanticTokenProvider.ts
var vscode = __toESM(require("vscode"));

// src/ejsScanner.ts
var EJS_BLOCK_RE = /<%([#=\-_]?)([\s\S]*?)([-_])?%>/g;
function scanEjsBlocks(text) {
  const blocks = [];
  EJS_BLOCK_RE.lastIndex = 0;
  let match;
  while ((match = EJS_BLOCK_RE.exec(text)) !== null) {
    const openMarker = match[1];
    const closeMarker = match[3];
    const type = openMarker === "#" ? "comment" : openMarker === "=" ? "output-escaped" : openMarker === "-" ? "output-unescaped" : openMarker === "_" ? "whitespace-slurp" : "scriptlet";
    const openLen = openMarker ? 3 : 2;
    const closeLen = closeMarker ? 3 : 2;
    blocks.push({
      type,
      start: match.index,
      end: match.index + match[0].length,
      openLen,
      closeLen
    });
  }
  return blocks;
}
function buildPlaceholderDoc(text, blocks) {
  if (blocks.length === 0) {
    return text;
  }
  const parts = [];
  let pos = 0;
  for (const block of blocks) {
    if (block.start > pos) {
      parts.push(text.slice(pos, block.start));
    }
    parts.push(" ".repeat(block.end - block.start));
    pos = block.end;
  }
  if (pos < text.length) {
    parts.push(text.slice(pos));
  }
  return parts.join("");
}

// node_modules/vscode-html-languageservice/lib/esm/parser/htmlScanner.js
var l10n = __toESM(require_main());

// node_modules/vscode-languageserver-types/lib/esm/main.js
var DocumentUri;
(function(DocumentUri2) {
  function is(value) {
    return typeof value === "string";
  }
  DocumentUri2.is = is;
})(DocumentUri || (DocumentUri = {}));
var URI;
(function(URI2) {
  function is(value) {
    return typeof value === "string";
  }
  URI2.is = is;
})(URI || (URI = {}));
var integer;
(function(integer2) {
  integer2.MIN_VALUE = -2147483648;
  integer2.MAX_VALUE = 2147483647;
  function is(value) {
    return typeof value === "number" && integer2.MIN_VALUE <= value && value <= integer2.MAX_VALUE;
  }
  integer2.is = is;
})(integer || (integer = {}));
var uinteger;
(function(uinteger2) {
  uinteger2.MIN_VALUE = 0;
  uinteger2.MAX_VALUE = 2147483647;
  function is(value) {
    return typeof value === "number" && uinteger2.MIN_VALUE <= value && value <= uinteger2.MAX_VALUE;
  }
  uinteger2.is = is;
})(uinteger || (uinteger = {}));
var Position;
(function(Position6) {
  function create(line, character) {
    if (line === Number.MAX_VALUE) {
      line = uinteger.MAX_VALUE;
    }
    if (character === Number.MAX_VALUE) {
      character = uinteger.MAX_VALUE;
    }
    return { line, character };
  }
  Position6.create = create;
  function is(value) {
    let candidate = value;
    return Is.objectLiteral(candidate) && Is.uinteger(candidate.line) && Is.uinteger(candidate.character);
  }
  Position6.is = is;
})(Position || (Position = {}));
var Range;
(function(Range9) {
  function create(one, two, three, four) {
    if (Is.uinteger(one) && Is.uinteger(two) && Is.uinteger(three) && Is.uinteger(four)) {
      return { start: Position.create(one, two), end: Position.create(three, four) };
    } else if (Position.is(one) && Position.is(two)) {
      return { start: one, end: two };
    } else {
      throw new Error(`Range#create called with invalid arguments[${one}, ${two}, ${three}, ${four}]`);
    }
  }
  Range9.create = create;
  function is(value) {
    let candidate = value;
    return Is.objectLiteral(candidate) && Position.is(candidate.start) && Position.is(candidate.end);
  }
  Range9.is = is;
})(Range || (Range = {}));
var Location;
(function(Location3) {
  function create(uri, range) {
    return { uri, range };
  }
  Location3.create = create;
  function is(value) {
    let candidate = value;
    return Is.objectLiteral(candidate) && Range.is(candidate.range) && (Is.string(candidate.uri) || Is.undefined(candidate.uri));
  }
  Location3.is = is;
})(Location || (Location = {}));
var LocationLink;
(function(LocationLink2) {
  function create(targetUri, targetRange, targetSelectionRange, originSelectionRange) {
    return { targetUri, targetRange, targetSelectionRange, originSelectionRange };
  }
  LocationLink2.create = create;
  function is(value) {
    let candidate = value;
    return Is.objectLiteral(candidate) && Range.is(candidate.targetRange) && Is.string(candidate.targetUri) && Range.is(candidate.targetSelectionRange) && (Range.is(candidate.originSelectionRange) || Is.undefined(candidate.originSelectionRange));
  }
  LocationLink2.is = is;
})(LocationLink || (LocationLink = {}));
var Color;
(function(Color2) {
  function create(red, green, blue, alpha) {
    return {
      red,
      green,
      blue,
      alpha
    };
  }
  Color2.create = create;
  function is(value) {
    const candidate = value;
    return Is.objectLiteral(candidate) && Is.numberRange(candidate.red, 0, 1) && Is.numberRange(candidate.green, 0, 1) && Is.numberRange(candidate.blue, 0, 1) && Is.numberRange(candidate.alpha, 0, 1);
  }
  Color2.is = is;
})(Color || (Color = {}));
var ColorInformation;
(function(ColorInformation2) {
  function create(range, color) {
    return {
      range,
      color
    };
  }
  ColorInformation2.create = create;
  function is(value) {
    const candidate = value;
    return Is.objectLiteral(candidate) && Range.is(candidate.range) && Color.is(candidate.color);
  }
  ColorInformation2.is = is;
})(ColorInformation || (ColorInformation = {}));
var ColorPresentation;
(function(ColorPresentation2) {
  function create(label, textEdit, additionalTextEdits) {
    return {
      label,
      textEdit,
      additionalTextEdits
    };
  }
  ColorPresentation2.create = create;
  function is(value) {
    const candidate = value;
    return Is.objectLiteral(candidate) && Is.string(candidate.label) && (Is.undefined(candidate.textEdit) || TextEdit.is(candidate)) && (Is.undefined(candidate.additionalTextEdits) || Is.typedArray(candidate.additionalTextEdits, TextEdit.is));
  }
  ColorPresentation2.is = is;
})(ColorPresentation || (ColorPresentation = {}));
var FoldingRangeKind;
(function(FoldingRangeKind2) {
  FoldingRangeKind2.Comment = "comment";
  FoldingRangeKind2.Imports = "imports";
  FoldingRangeKind2.Region = "region";
})(FoldingRangeKind || (FoldingRangeKind = {}));
var FoldingRange;
(function(FoldingRange3) {
  function create(startLine, endLine, startCharacter, endCharacter, kind, collapsedText) {
    const result = {
      startLine,
      endLine
    };
    if (Is.defined(startCharacter)) {
      result.startCharacter = startCharacter;
    }
    if (Is.defined(endCharacter)) {
      result.endCharacter = endCharacter;
    }
    if (Is.defined(kind)) {
      result.kind = kind;
    }
    if (Is.defined(collapsedText)) {
      result.collapsedText = collapsedText;
    }
    return result;
  }
  FoldingRange3.create = create;
  function is(value) {
    const candidate = value;
    return Is.objectLiteral(candidate) && Is.uinteger(candidate.startLine) && Is.uinteger(candidate.startLine) && (Is.undefined(candidate.startCharacter) || Is.uinteger(candidate.startCharacter)) && (Is.undefined(candidate.endCharacter) || Is.uinteger(candidate.endCharacter)) && (Is.undefined(candidate.kind) || Is.string(candidate.kind));
  }
  FoldingRange3.is = is;
})(FoldingRange || (FoldingRange = {}));
var DiagnosticRelatedInformation;
(function(DiagnosticRelatedInformation2) {
  function create(location, message) {
    return {
      location,
      message
    };
  }
  DiagnosticRelatedInformation2.create = create;
  function is(value) {
    let candidate = value;
    return Is.defined(candidate) && Location.is(candidate.location) && Is.string(candidate.message);
  }
  DiagnosticRelatedInformation2.is = is;
})(DiagnosticRelatedInformation || (DiagnosticRelatedInformation = {}));
var DiagnosticSeverity;
(function(DiagnosticSeverity3) {
  DiagnosticSeverity3.Error = 1;
  DiagnosticSeverity3.Warning = 2;
  DiagnosticSeverity3.Information = 3;
  DiagnosticSeverity3.Hint = 4;
})(DiagnosticSeverity || (DiagnosticSeverity = {}));
var DiagnosticTag;
(function(DiagnosticTag2) {
  DiagnosticTag2.Unnecessary = 1;
  DiagnosticTag2.Deprecated = 2;
})(DiagnosticTag || (DiagnosticTag = {}));
var CodeDescription;
(function(CodeDescription2) {
  function is(value) {
    const candidate = value;
    return Is.objectLiteral(candidate) && Is.string(candidate.href);
  }
  CodeDescription2.is = is;
})(CodeDescription || (CodeDescription = {}));
var Diagnostic;
(function(Diagnostic3) {
  function create(range, message, severity, code, source, relatedInformation) {
    let result = { range, message };
    if (Is.defined(severity)) {
      result.severity = severity;
    }
    if (Is.defined(code)) {
      result.code = code;
    }
    if (Is.defined(source)) {
      result.source = source;
    }
    if (Is.defined(relatedInformation)) {
      result.relatedInformation = relatedInformation;
    }
    return result;
  }
  Diagnostic3.create = create;
  function is(value) {
    var _a;
    let candidate = value;
    return Is.defined(candidate) && Range.is(candidate.range) && Is.string(candidate.message) && (Is.number(candidate.severity) || Is.undefined(candidate.severity)) && (Is.integer(candidate.code) || Is.string(candidate.code) || Is.undefined(candidate.code)) && (Is.undefined(candidate.codeDescription) || Is.string((_a = candidate.codeDescription) === null || _a === void 0 ? void 0 : _a.href)) && (Is.string(candidate.source) || Is.undefined(candidate.source)) && (Is.undefined(candidate.relatedInformation) || Is.typedArray(candidate.relatedInformation, DiagnosticRelatedInformation.is));
  }
  Diagnostic3.is = is;
})(Diagnostic || (Diagnostic = {}));
var Command;
(function(Command2) {
  function create(title, command, ...args) {
    let result = { title, command };
    if (Is.defined(args) && args.length > 0) {
      result.arguments = args;
    }
    return result;
  }
  Command2.create = create;
  function is(value) {
    let candidate = value;
    return Is.defined(candidate) && Is.string(candidate.title) && Is.string(candidate.command);
  }
  Command2.is = is;
})(Command || (Command = {}));
var TextEdit;
(function(TextEdit3) {
  function replace(range, newText) {
    return { range, newText };
  }
  TextEdit3.replace = replace;
  function insert(position, newText) {
    return { range: { start: position, end: position }, newText };
  }
  TextEdit3.insert = insert;
  function del(range) {
    return { range, newText: "" };
  }
  TextEdit3.del = del;
  function is(value) {
    const candidate = value;
    return Is.objectLiteral(candidate) && Is.string(candidate.newText) && Range.is(candidate.range);
  }
  TextEdit3.is = is;
})(TextEdit || (TextEdit = {}));
var ChangeAnnotation;
(function(ChangeAnnotation2) {
  function create(label, needsConfirmation, description) {
    const result = { label };
    if (needsConfirmation !== void 0) {
      result.needsConfirmation = needsConfirmation;
    }
    if (description !== void 0) {
      result.description = description;
    }
    return result;
  }
  ChangeAnnotation2.create = create;
  function is(value) {
    const candidate = value;
    return Is.objectLiteral(candidate) && Is.string(candidate.label) && (Is.boolean(candidate.needsConfirmation) || candidate.needsConfirmation === void 0) && (Is.string(candidate.description) || candidate.description === void 0);
  }
  ChangeAnnotation2.is = is;
})(ChangeAnnotation || (ChangeAnnotation = {}));
var ChangeAnnotationIdentifier;
(function(ChangeAnnotationIdentifier2) {
  function is(value) {
    const candidate = value;
    return Is.string(candidate);
  }
  ChangeAnnotationIdentifier2.is = is;
})(ChangeAnnotationIdentifier || (ChangeAnnotationIdentifier = {}));
var AnnotatedTextEdit;
(function(AnnotatedTextEdit2) {
  function replace(range, newText, annotation) {
    return { range, newText, annotationId: annotation };
  }
  AnnotatedTextEdit2.replace = replace;
  function insert(position, newText, annotation) {
    return { range: { start: position, end: position }, newText, annotationId: annotation };
  }
  AnnotatedTextEdit2.insert = insert;
  function del(range, annotation) {
    return { range, newText: "", annotationId: annotation };
  }
  AnnotatedTextEdit2.del = del;
  function is(value) {
    const candidate = value;
    return TextEdit.is(candidate) && (ChangeAnnotation.is(candidate.annotationId) || ChangeAnnotationIdentifier.is(candidate.annotationId));
  }
  AnnotatedTextEdit2.is = is;
})(AnnotatedTextEdit || (AnnotatedTextEdit = {}));
var TextDocumentEdit;
(function(TextDocumentEdit2) {
  function create(textDocument, edits) {
    return { textDocument, edits };
  }
  TextDocumentEdit2.create = create;
  function is(value) {
    let candidate = value;
    return Is.defined(candidate) && OptionalVersionedTextDocumentIdentifier.is(candidate.textDocument) && Array.isArray(candidate.edits);
  }
  TextDocumentEdit2.is = is;
})(TextDocumentEdit || (TextDocumentEdit = {}));
var CreateFile;
(function(CreateFile2) {
  function create(uri, options, annotation) {
    let result = {
      kind: "create",
      uri
    };
    if (options !== void 0 && (options.overwrite !== void 0 || options.ignoreIfExists !== void 0)) {
      result.options = options;
    }
    if (annotation !== void 0) {
      result.annotationId = annotation;
    }
    return result;
  }
  CreateFile2.create = create;
  function is(value) {
    let candidate = value;
    return candidate && candidate.kind === "create" && Is.string(candidate.uri) && (candidate.options === void 0 || (candidate.options.overwrite === void 0 || Is.boolean(candidate.options.overwrite)) && (candidate.options.ignoreIfExists === void 0 || Is.boolean(candidate.options.ignoreIfExists))) && (candidate.annotationId === void 0 || ChangeAnnotationIdentifier.is(candidate.annotationId));
  }
  CreateFile2.is = is;
})(CreateFile || (CreateFile = {}));
var RenameFile;
(function(RenameFile2) {
  function create(oldUri, newUri, options, annotation) {
    let result = {
      kind: "rename",
      oldUri,
      newUri
    };
    if (options !== void 0 && (options.overwrite !== void 0 || options.ignoreIfExists !== void 0)) {
      result.options = options;
    }
    if (annotation !== void 0) {
      result.annotationId = annotation;
    }
    return result;
  }
  RenameFile2.create = create;
  function is(value) {
    let candidate = value;
    return candidate && candidate.kind === "rename" && Is.string(candidate.oldUri) && Is.string(candidate.newUri) && (candidate.options === void 0 || (candidate.options.overwrite === void 0 || Is.boolean(candidate.options.overwrite)) && (candidate.options.ignoreIfExists === void 0 || Is.boolean(candidate.options.ignoreIfExists))) && (candidate.annotationId === void 0 || ChangeAnnotationIdentifier.is(candidate.annotationId));
  }
  RenameFile2.is = is;
})(RenameFile || (RenameFile = {}));
var DeleteFile;
(function(DeleteFile2) {
  function create(uri, options, annotation) {
    let result = {
      kind: "delete",
      uri
    };
    if (options !== void 0 && (options.recursive !== void 0 || options.ignoreIfNotExists !== void 0)) {
      result.options = options;
    }
    if (annotation !== void 0) {
      result.annotationId = annotation;
    }
    return result;
  }
  DeleteFile2.create = create;
  function is(value) {
    let candidate = value;
    return candidate && candidate.kind === "delete" && Is.string(candidate.uri) && (candidate.options === void 0 || (candidate.options.recursive === void 0 || Is.boolean(candidate.options.recursive)) && (candidate.options.ignoreIfNotExists === void 0 || Is.boolean(candidate.options.ignoreIfNotExists))) && (candidate.annotationId === void 0 || ChangeAnnotationIdentifier.is(candidate.annotationId));
  }
  DeleteFile2.is = is;
})(DeleteFile || (DeleteFile = {}));
var WorkspaceEdit;
(function(WorkspaceEdit2) {
  function is(value) {
    let candidate = value;
    return candidate && (candidate.changes !== void 0 || candidate.documentChanges !== void 0) && (candidate.documentChanges === void 0 || candidate.documentChanges.every((change) => {
      if (Is.string(change.kind)) {
        return CreateFile.is(change) || RenameFile.is(change) || DeleteFile.is(change);
      } else {
        return TextDocumentEdit.is(change);
      }
    }));
  }
  WorkspaceEdit2.is = is;
})(WorkspaceEdit || (WorkspaceEdit = {}));
var TextDocumentIdentifier;
(function(TextDocumentIdentifier2) {
  function create(uri) {
    return { uri };
  }
  TextDocumentIdentifier2.create = create;
  function is(value) {
    let candidate = value;
    return Is.defined(candidate) && Is.string(candidate.uri);
  }
  TextDocumentIdentifier2.is = is;
})(TextDocumentIdentifier || (TextDocumentIdentifier = {}));
var VersionedTextDocumentIdentifier;
(function(VersionedTextDocumentIdentifier2) {
  function create(uri, version) {
    return { uri, version };
  }
  VersionedTextDocumentIdentifier2.create = create;
  function is(value) {
    let candidate = value;
    return Is.defined(candidate) && Is.string(candidate.uri) && Is.integer(candidate.version);
  }
  VersionedTextDocumentIdentifier2.is = is;
})(VersionedTextDocumentIdentifier || (VersionedTextDocumentIdentifier = {}));
var OptionalVersionedTextDocumentIdentifier;
(function(OptionalVersionedTextDocumentIdentifier2) {
  function create(uri, version) {
    return { uri, version };
  }
  OptionalVersionedTextDocumentIdentifier2.create = create;
  function is(value) {
    let candidate = value;
    return Is.defined(candidate) && Is.string(candidate.uri) && (candidate.version === null || Is.integer(candidate.version));
  }
  OptionalVersionedTextDocumentIdentifier2.is = is;
})(OptionalVersionedTextDocumentIdentifier || (OptionalVersionedTextDocumentIdentifier = {}));
var TextDocumentItem;
(function(TextDocumentItem2) {
  function create(uri, languageId, version, text) {
    return { uri, languageId, version, text };
  }
  TextDocumentItem2.create = create;
  function is(value) {
    let candidate = value;
    return Is.defined(candidate) && Is.string(candidate.uri) && Is.string(candidate.languageId) && Is.integer(candidate.version) && Is.string(candidate.text);
  }
  TextDocumentItem2.is = is;
})(TextDocumentItem || (TextDocumentItem = {}));
var MarkupKind;
(function(MarkupKind2) {
  MarkupKind2.PlainText = "plaintext";
  MarkupKind2.Markdown = "markdown";
  function is(value) {
    const candidate = value;
    return candidate === MarkupKind2.PlainText || candidate === MarkupKind2.Markdown;
  }
  MarkupKind2.is = is;
})(MarkupKind || (MarkupKind = {}));
var MarkupContent;
(function(MarkupContent2) {
  function is(value) {
    const candidate = value;
    return Is.objectLiteral(value) && MarkupKind.is(candidate.kind) && Is.string(candidate.value);
  }
  MarkupContent2.is = is;
})(MarkupContent || (MarkupContent = {}));
var CompletionItemKind;
(function(CompletionItemKind4) {
  CompletionItemKind4.Text = 1;
  CompletionItemKind4.Method = 2;
  CompletionItemKind4.Function = 3;
  CompletionItemKind4.Constructor = 4;
  CompletionItemKind4.Field = 5;
  CompletionItemKind4.Variable = 6;
  CompletionItemKind4.Class = 7;
  CompletionItemKind4.Interface = 8;
  CompletionItemKind4.Module = 9;
  CompletionItemKind4.Property = 10;
  CompletionItemKind4.Unit = 11;
  CompletionItemKind4.Value = 12;
  CompletionItemKind4.Enum = 13;
  CompletionItemKind4.Keyword = 14;
  CompletionItemKind4.Snippet = 15;
  CompletionItemKind4.Color = 16;
  CompletionItemKind4.File = 17;
  CompletionItemKind4.Reference = 18;
  CompletionItemKind4.Folder = 19;
  CompletionItemKind4.EnumMember = 20;
  CompletionItemKind4.Constant = 21;
  CompletionItemKind4.Struct = 22;
  CompletionItemKind4.Event = 23;
  CompletionItemKind4.Operator = 24;
  CompletionItemKind4.TypeParameter = 25;
})(CompletionItemKind || (CompletionItemKind = {}));
var InsertTextFormat;
(function(InsertTextFormat2) {
  InsertTextFormat2.PlainText = 1;
  InsertTextFormat2.Snippet = 2;
})(InsertTextFormat || (InsertTextFormat = {}));
var CompletionItemTag;
(function(CompletionItemTag2) {
  CompletionItemTag2.Deprecated = 1;
})(CompletionItemTag || (CompletionItemTag = {}));
var InsertReplaceEdit;
(function(InsertReplaceEdit2) {
  function create(newText, insert, replace) {
    return { newText, insert, replace };
  }
  InsertReplaceEdit2.create = create;
  function is(value) {
    const candidate = value;
    return candidate && Is.string(candidate.newText) && Range.is(candidate.insert) && Range.is(candidate.replace);
  }
  InsertReplaceEdit2.is = is;
})(InsertReplaceEdit || (InsertReplaceEdit = {}));
var InsertTextMode;
(function(InsertTextMode2) {
  InsertTextMode2.asIs = 1;
  InsertTextMode2.adjustIndentation = 2;
})(InsertTextMode || (InsertTextMode = {}));
var CompletionItemLabelDetails;
(function(CompletionItemLabelDetails2) {
  function is(value) {
    const candidate = value;
    return candidate && (Is.string(candidate.detail) || candidate.detail === void 0) && (Is.string(candidate.description) || candidate.description === void 0);
  }
  CompletionItemLabelDetails2.is = is;
})(CompletionItemLabelDetails || (CompletionItemLabelDetails = {}));
var CompletionItem;
(function(CompletionItem4) {
  function create(label) {
    return { label };
  }
  CompletionItem4.create = create;
})(CompletionItem || (CompletionItem = {}));
var CompletionList;
(function(CompletionList2) {
  function create(items, isIncomplete) {
    return { items: items ? items : [], isIncomplete: !!isIncomplete };
  }
  CompletionList2.create = create;
})(CompletionList || (CompletionList = {}));
var MarkedString;
(function(MarkedString2) {
  function fromPlainText(plainText) {
    return plainText.replace(/[\\`*_{}[\]()#+\-.!]/g, "\\$&");
  }
  MarkedString2.fromPlainText = fromPlainText;
  function is(value) {
    const candidate = value;
    return Is.string(candidate) || Is.objectLiteral(candidate) && Is.string(candidate.language) && Is.string(candidate.value);
  }
  MarkedString2.is = is;
})(MarkedString || (MarkedString = {}));
var Hover;
(function(Hover3) {
  function is(value) {
    let candidate = value;
    return !!candidate && Is.objectLiteral(candidate) && (MarkupContent.is(candidate.contents) || MarkedString.is(candidate.contents) || Is.typedArray(candidate.contents, MarkedString.is)) && (value.range === void 0 || Range.is(value.range));
  }
  Hover3.is = is;
})(Hover || (Hover = {}));
var ParameterInformation;
(function(ParameterInformation2) {
  function create(label, documentation) {
    return documentation ? { label, documentation } : { label };
  }
  ParameterInformation2.create = create;
})(ParameterInformation || (ParameterInformation = {}));
var SignatureInformation;
(function(SignatureInformation2) {
  function create(label, documentation, ...parameters) {
    let result = { label };
    if (Is.defined(documentation)) {
      result.documentation = documentation;
    }
    if (Is.defined(parameters)) {
      result.parameters = parameters;
    } else {
      result.parameters = [];
    }
    return result;
  }
  SignatureInformation2.create = create;
})(SignatureInformation || (SignatureInformation = {}));
var DocumentHighlightKind;
(function(DocumentHighlightKind2) {
  DocumentHighlightKind2.Text = 1;
  DocumentHighlightKind2.Read = 2;
  DocumentHighlightKind2.Write = 3;
})(DocumentHighlightKind || (DocumentHighlightKind = {}));
var DocumentHighlight;
(function(DocumentHighlight2) {
  function create(range, kind) {
    let result = { range };
    if (Is.number(kind)) {
      result.kind = kind;
    }
    return result;
  }
  DocumentHighlight2.create = create;
})(DocumentHighlight || (DocumentHighlight = {}));
var SymbolKind;
(function(SymbolKind3) {
  SymbolKind3.File = 1;
  SymbolKind3.Module = 2;
  SymbolKind3.Namespace = 3;
  SymbolKind3.Package = 4;
  SymbolKind3.Class = 5;
  SymbolKind3.Method = 6;
  SymbolKind3.Property = 7;
  SymbolKind3.Field = 8;
  SymbolKind3.Constructor = 9;
  SymbolKind3.Enum = 10;
  SymbolKind3.Interface = 11;
  SymbolKind3.Function = 12;
  SymbolKind3.Variable = 13;
  SymbolKind3.Constant = 14;
  SymbolKind3.String = 15;
  SymbolKind3.Number = 16;
  SymbolKind3.Boolean = 17;
  SymbolKind3.Array = 18;
  SymbolKind3.Object = 19;
  SymbolKind3.Key = 20;
  SymbolKind3.Null = 21;
  SymbolKind3.EnumMember = 22;
  SymbolKind3.Struct = 23;
  SymbolKind3.Event = 24;
  SymbolKind3.Operator = 25;
  SymbolKind3.TypeParameter = 26;
})(SymbolKind || (SymbolKind = {}));
var SymbolTag;
(function(SymbolTag2) {
  SymbolTag2.Deprecated = 1;
})(SymbolTag || (SymbolTag = {}));
var SymbolInformation;
(function(SymbolInformation2) {
  function create(name, kind, range, uri, containerName) {
    let result = {
      name,
      kind,
      location: { uri, range }
    };
    if (containerName) {
      result.containerName = containerName;
    }
    return result;
  }
  SymbolInformation2.create = create;
})(SymbolInformation || (SymbolInformation = {}));
var WorkspaceSymbol;
(function(WorkspaceSymbol2) {
  function create(name, kind, uri, range) {
    return range !== void 0 ? { name, kind, location: { uri, range } } : { name, kind, location: { uri } };
  }
  WorkspaceSymbol2.create = create;
})(WorkspaceSymbol || (WorkspaceSymbol = {}));
var DocumentSymbol;
(function(DocumentSymbol3) {
  function create(name, detail, kind, range, selectionRange, children) {
    let result = {
      name,
      detail,
      kind,
      range,
      selectionRange
    };
    if (children !== void 0) {
      result.children = children;
    }
    return result;
  }
  DocumentSymbol3.create = create;
  function is(value) {
    let candidate = value;
    return candidate && Is.string(candidate.name) && Is.number(candidate.kind) && Range.is(candidate.range) && Range.is(candidate.selectionRange) && (candidate.detail === void 0 || Is.string(candidate.detail)) && (candidate.deprecated === void 0 || Is.boolean(candidate.deprecated)) && (candidate.children === void 0 || Array.isArray(candidate.children)) && (candidate.tags === void 0 || Array.isArray(candidate.tags));
  }
  DocumentSymbol3.is = is;
})(DocumentSymbol || (DocumentSymbol = {}));
var CodeActionKind;
(function(CodeActionKind2) {
  CodeActionKind2.Empty = "";
  CodeActionKind2.QuickFix = "quickfix";
  CodeActionKind2.Refactor = "refactor";
  CodeActionKind2.RefactorExtract = "refactor.extract";
  CodeActionKind2.RefactorInline = "refactor.inline";
  CodeActionKind2.RefactorRewrite = "refactor.rewrite";
  CodeActionKind2.Source = "source";
  CodeActionKind2.SourceOrganizeImports = "source.organizeImports";
  CodeActionKind2.SourceFixAll = "source.fixAll";
})(CodeActionKind || (CodeActionKind = {}));
var CodeActionTriggerKind;
(function(CodeActionTriggerKind2) {
  CodeActionTriggerKind2.Invoked = 1;
  CodeActionTriggerKind2.Automatic = 2;
})(CodeActionTriggerKind || (CodeActionTriggerKind = {}));
var CodeActionContext;
(function(CodeActionContext2) {
  function create(diagnostics, only, triggerKind) {
    let result = { diagnostics };
    if (only !== void 0 && only !== null) {
      result.only = only;
    }
    if (triggerKind !== void 0 && triggerKind !== null) {
      result.triggerKind = triggerKind;
    }
    return result;
  }
  CodeActionContext2.create = create;
  function is(value) {
    let candidate = value;
    return Is.defined(candidate) && Is.typedArray(candidate.diagnostics, Diagnostic.is) && (candidate.only === void 0 || Is.typedArray(candidate.only, Is.string)) && (candidate.triggerKind === void 0 || candidate.triggerKind === CodeActionTriggerKind.Invoked || candidate.triggerKind === CodeActionTriggerKind.Automatic);
  }
  CodeActionContext2.is = is;
})(CodeActionContext || (CodeActionContext = {}));
var CodeAction;
(function(CodeAction2) {
  function create(title, kindOrCommandOrEdit, kind) {
    let result = { title };
    let checkKind = true;
    if (typeof kindOrCommandOrEdit === "string") {
      checkKind = false;
      result.kind = kindOrCommandOrEdit;
    } else if (Command.is(kindOrCommandOrEdit)) {
      result.command = kindOrCommandOrEdit;
    } else {
      result.edit = kindOrCommandOrEdit;
    }
    if (checkKind && kind !== void 0) {
      result.kind = kind;
    }
    return result;
  }
  CodeAction2.create = create;
  function is(value) {
    let candidate = value;
    return candidate && Is.string(candidate.title) && (candidate.diagnostics === void 0 || Is.typedArray(candidate.diagnostics, Diagnostic.is)) && (candidate.kind === void 0 || Is.string(candidate.kind)) && (candidate.edit !== void 0 || candidate.command !== void 0) && (candidate.command === void 0 || Command.is(candidate.command)) && (candidate.isPreferred === void 0 || Is.boolean(candidate.isPreferred)) && (candidate.edit === void 0 || WorkspaceEdit.is(candidate.edit));
  }
  CodeAction2.is = is;
})(CodeAction || (CodeAction = {}));
var CodeLens;
(function(CodeLens2) {
  function create(range, data) {
    let result = { range };
    if (Is.defined(data)) {
      result.data = data;
    }
    return result;
  }
  CodeLens2.create = create;
  function is(value) {
    let candidate = value;
    return Is.defined(candidate) && Range.is(candidate.range) && (Is.undefined(candidate.command) || Command.is(candidate.command));
  }
  CodeLens2.is = is;
})(CodeLens || (CodeLens = {}));
var FormattingOptions;
(function(FormattingOptions2) {
  function create(tabSize, insertSpaces) {
    return { tabSize, insertSpaces };
  }
  FormattingOptions2.create = create;
  function is(value) {
    let candidate = value;
    return Is.defined(candidate) && Is.uinteger(candidate.tabSize) && Is.boolean(candidate.insertSpaces);
  }
  FormattingOptions2.is = is;
})(FormattingOptions || (FormattingOptions = {}));
var DocumentLink;
(function(DocumentLink3) {
  function create(range, target, data) {
    return { range, target, data };
  }
  DocumentLink3.create = create;
  function is(value) {
    let candidate = value;
    return Is.defined(candidate) && Range.is(candidate.range) && (Is.undefined(candidate.target) || Is.string(candidate.target));
  }
  DocumentLink3.is = is;
})(DocumentLink || (DocumentLink = {}));
var SelectionRange;
(function(SelectionRange2) {
  function create(range, parent) {
    return { range, parent };
  }
  SelectionRange2.create = create;
  function is(value) {
    let candidate = value;
    return Is.objectLiteral(candidate) && Range.is(candidate.range) && (candidate.parent === void 0 || SelectionRange2.is(candidate.parent));
  }
  SelectionRange2.is = is;
})(SelectionRange || (SelectionRange = {}));
var SemanticTokenTypes;
(function(SemanticTokenTypes2) {
  SemanticTokenTypes2["namespace"] = "namespace";
  SemanticTokenTypes2["type"] = "type";
  SemanticTokenTypes2["class"] = "class";
  SemanticTokenTypes2["enum"] = "enum";
  SemanticTokenTypes2["interface"] = "interface";
  SemanticTokenTypes2["struct"] = "struct";
  SemanticTokenTypes2["typeParameter"] = "typeParameter";
  SemanticTokenTypes2["parameter"] = "parameter";
  SemanticTokenTypes2["variable"] = "variable";
  SemanticTokenTypes2["property"] = "property";
  SemanticTokenTypes2["enumMember"] = "enumMember";
  SemanticTokenTypes2["event"] = "event";
  SemanticTokenTypes2["function"] = "function";
  SemanticTokenTypes2["method"] = "method";
  SemanticTokenTypes2["macro"] = "macro";
  SemanticTokenTypes2["keyword"] = "keyword";
  SemanticTokenTypes2["modifier"] = "modifier";
  SemanticTokenTypes2["comment"] = "comment";
  SemanticTokenTypes2["string"] = "string";
  SemanticTokenTypes2["number"] = "number";
  SemanticTokenTypes2["regexp"] = "regexp";
  SemanticTokenTypes2["operator"] = "operator";
  SemanticTokenTypes2["decorator"] = "decorator";
})(SemanticTokenTypes || (SemanticTokenTypes = {}));
var SemanticTokenModifiers;
(function(SemanticTokenModifiers2) {
  SemanticTokenModifiers2["declaration"] = "declaration";
  SemanticTokenModifiers2["definition"] = "definition";
  SemanticTokenModifiers2["readonly"] = "readonly";
  SemanticTokenModifiers2["static"] = "static";
  SemanticTokenModifiers2["deprecated"] = "deprecated";
  SemanticTokenModifiers2["abstract"] = "abstract";
  SemanticTokenModifiers2["async"] = "async";
  SemanticTokenModifiers2["modification"] = "modification";
  SemanticTokenModifiers2["documentation"] = "documentation";
  SemanticTokenModifiers2["defaultLibrary"] = "defaultLibrary";
})(SemanticTokenModifiers || (SemanticTokenModifiers = {}));
var SemanticTokens;
(function(SemanticTokens2) {
  function is(value) {
    const candidate = value;
    return Is.objectLiteral(candidate) && (candidate.resultId === void 0 || typeof candidate.resultId === "string") && Array.isArray(candidate.data) && (candidate.data.length === 0 || typeof candidate.data[0] === "number");
  }
  SemanticTokens2.is = is;
})(SemanticTokens || (SemanticTokens = {}));
var InlineValueText;
(function(InlineValueText2) {
  function create(range, text) {
    return { range, text };
  }
  InlineValueText2.create = create;
  function is(value) {
    const candidate = value;
    return candidate !== void 0 && candidate !== null && Range.is(candidate.range) && Is.string(candidate.text);
  }
  InlineValueText2.is = is;
})(InlineValueText || (InlineValueText = {}));
var InlineValueVariableLookup;
(function(InlineValueVariableLookup2) {
  function create(range, variableName, caseSensitiveLookup) {
    return { range, variableName, caseSensitiveLookup };
  }
  InlineValueVariableLookup2.create = create;
  function is(value) {
    const candidate = value;
    return candidate !== void 0 && candidate !== null && Range.is(candidate.range) && Is.boolean(candidate.caseSensitiveLookup) && (Is.string(candidate.variableName) || candidate.variableName === void 0);
  }
  InlineValueVariableLookup2.is = is;
})(InlineValueVariableLookup || (InlineValueVariableLookup = {}));
var InlineValueEvaluatableExpression;
(function(InlineValueEvaluatableExpression2) {
  function create(range, expression) {
    return { range, expression };
  }
  InlineValueEvaluatableExpression2.create = create;
  function is(value) {
    const candidate = value;
    return candidate !== void 0 && candidate !== null && Range.is(candidate.range) && (Is.string(candidate.expression) || candidate.expression === void 0);
  }
  InlineValueEvaluatableExpression2.is = is;
})(InlineValueEvaluatableExpression || (InlineValueEvaluatableExpression = {}));
var InlineValueContext;
(function(InlineValueContext2) {
  function create(frameId, stoppedLocation) {
    return { frameId, stoppedLocation };
  }
  InlineValueContext2.create = create;
  function is(value) {
    const candidate = value;
    return Is.defined(candidate) && Range.is(value.stoppedLocation);
  }
  InlineValueContext2.is = is;
})(InlineValueContext || (InlineValueContext = {}));
var InlayHintKind;
(function(InlayHintKind2) {
  InlayHintKind2.Type = 1;
  InlayHintKind2.Parameter = 2;
  function is(value) {
    return value === 1 || value === 2;
  }
  InlayHintKind2.is = is;
})(InlayHintKind || (InlayHintKind = {}));
var InlayHintLabelPart;
(function(InlayHintLabelPart2) {
  function create(value) {
    return { value };
  }
  InlayHintLabelPart2.create = create;
  function is(value) {
    const candidate = value;
    return Is.objectLiteral(candidate) && (candidate.tooltip === void 0 || Is.string(candidate.tooltip) || MarkupContent.is(candidate.tooltip)) && (candidate.location === void 0 || Location.is(candidate.location)) && (candidate.command === void 0 || Command.is(candidate.command));
  }
  InlayHintLabelPart2.is = is;
})(InlayHintLabelPart || (InlayHintLabelPart = {}));
var InlayHint;
(function(InlayHint2) {
  function create(position, label, kind) {
    const result = { position, label };
    if (kind !== void 0) {
      result.kind = kind;
    }
    return result;
  }
  InlayHint2.create = create;
  function is(value) {
    const candidate = value;
    return Is.objectLiteral(candidate) && Position.is(candidate.position) && (Is.string(candidate.label) || Is.typedArray(candidate.label, InlayHintLabelPart.is)) && (candidate.kind === void 0 || InlayHintKind.is(candidate.kind)) && candidate.textEdits === void 0 || Is.typedArray(candidate.textEdits, TextEdit.is) && (candidate.tooltip === void 0 || Is.string(candidate.tooltip) || MarkupContent.is(candidate.tooltip)) && (candidate.paddingLeft === void 0 || Is.boolean(candidate.paddingLeft)) && (candidate.paddingRight === void 0 || Is.boolean(candidate.paddingRight));
  }
  InlayHint2.is = is;
})(InlayHint || (InlayHint = {}));
var StringValue;
(function(StringValue2) {
  function createSnippet(value) {
    return { kind: "snippet", value };
  }
  StringValue2.createSnippet = createSnippet;
})(StringValue || (StringValue = {}));
var InlineCompletionItem;
(function(InlineCompletionItem2) {
  function create(insertText, filterText, range, command) {
    return { insertText, filterText, range, command };
  }
  InlineCompletionItem2.create = create;
})(InlineCompletionItem || (InlineCompletionItem = {}));
var InlineCompletionList;
(function(InlineCompletionList2) {
  function create(items) {
    return { items };
  }
  InlineCompletionList2.create = create;
})(InlineCompletionList || (InlineCompletionList = {}));
var InlineCompletionTriggerKind;
(function(InlineCompletionTriggerKind2) {
  InlineCompletionTriggerKind2.Invoked = 0;
  InlineCompletionTriggerKind2.Automatic = 1;
})(InlineCompletionTriggerKind || (InlineCompletionTriggerKind = {}));
var SelectedCompletionInfo;
(function(SelectedCompletionInfo2) {
  function create(range, text) {
    return { range, text };
  }
  SelectedCompletionInfo2.create = create;
})(SelectedCompletionInfo || (SelectedCompletionInfo = {}));
var InlineCompletionContext;
(function(InlineCompletionContext2) {
  function create(triggerKind, selectedCompletionInfo) {
    return { triggerKind, selectedCompletionInfo };
  }
  InlineCompletionContext2.create = create;
})(InlineCompletionContext || (InlineCompletionContext = {}));
var WorkspaceFolder;
(function(WorkspaceFolder2) {
  function is(value) {
    const candidate = value;
    return Is.objectLiteral(candidate) && URI.is(candidate.uri) && Is.string(candidate.name);
  }
  WorkspaceFolder2.is = is;
})(WorkspaceFolder || (WorkspaceFolder = {}));
var TextDocument;
(function(TextDocument3) {
  function create(uri, languageId, version, content) {
    return new FullTextDocument(uri, languageId, version, content);
  }
  TextDocument3.create = create;
  function is(value) {
    let candidate = value;
    return Is.defined(candidate) && Is.string(candidate.uri) && (Is.undefined(candidate.languageId) || Is.string(candidate.languageId)) && Is.uinteger(candidate.lineCount) && Is.func(candidate.getText) && Is.func(candidate.positionAt) && Is.func(candidate.offsetAt) ? true : false;
  }
  TextDocument3.is = is;
  function applyEdits(document, edits) {
    let text = document.getText();
    let sortedEdits = mergeSort2(edits, (a, b) => {
      let diff = a.range.start.line - b.range.start.line;
      if (diff === 0) {
        return a.range.start.character - b.range.start.character;
      }
      return diff;
    });
    let lastModifiedOffset = text.length;
    for (let i = sortedEdits.length - 1; i >= 0; i--) {
      let e = sortedEdits[i];
      let startOffset = document.offsetAt(e.range.start);
      let endOffset = document.offsetAt(e.range.end);
      if (endOffset <= lastModifiedOffset) {
        text = text.substring(0, startOffset) + e.newText + text.substring(endOffset, text.length);
      } else {
        throw new Error("Overlapping edit");
      }
      lastModifiedOffset = startOffset;
    }
    return text;
  }
  TextDocument3.applyEdits = applyEdits;
  function mergeSort2(data, compare) {
    if (data.length <= 1) {
      return data;
    }
    const p = data.length / 2 | 0;
    const left = data.slice(0, p);
    const right = data.slice(p);
    mergeSort2(left, compare);
    mergeSort2(right, compare);
    let leftIdx = 0;
    let rightIdx = 0;
    let i = 0;
    while (leftIdx < left.length && rightIdx < right.length) {
      let ret = compare(left[leftIdx], right[rightIdx]);
      if (ret <= 0) {
        data[i++] = left[leftIdx++];
      } else {
        data[i++] = right[rightIdx++];
      }
    }
    while (leftIdx < left.length) {
      data[i++] = left[leftIdx++];
    }
    while (rightIdx < right.length) {
      data[i++] = right[rightIdx++];
    }
    return data;
  }
})(TextDocument || (TextDocument = {}));
var FullTextDocument = class {
  constructor(uri, languageId, version, content) {
    this._uri = uri;
    this._languageId = languageId;
    this._version = version;
    this._content = content;
    this._lineOffsets = void 0;
  }
  get uri() {
    return this._uri;
  }
  get languageId() {
    return this._languageId;
  }
  get version() {
    return this._version;
  }
  getText(range) {
    if (range) {
      let start = this.offsetAt(range.start);
      let end = this.offsetAt(range.end);
      return this._content.substring(start, end);
    }
    return this._content;
  }
  update(event, version) {
    this._content = event.text;
    this._version = version;
    this._lineOffsets = void 0;
  }
  getLineOffsets() {
    if (this._lineOffsets === void 0) {
      let lineOffsets = [];
      let text = this._content;
      let isLineStart = true;
      for (let i = 0; i < text.length; i++) {
        if (isLineStart) {
          lineOffsets.push(i);
          isLineStart = false;
        }
        let ch = text.charAt(i);
        isLineStart = ch === "\r" || ch === "\n";
        if (ch === "\r" && i + 1 < text.length && text.charAt(i + 1) === "\n") {
          i++;
        }
      }
      if (isLineStart && text.length > 0) {
        lineOffsets.push(text.length);
      }
      this._lineOffsets = lineOffsets;
    }
    return this._lineOffsets;
  }
  positionAt(offset) {
    offset = Math.max(Math.min(offset, this._content.length), 0);
    let lineOffsets = this.getLineOffsets();
    let low = 0, high = lineOffsets.length;
    if (high === 0) {
      return Position.create(0, offset);
    }
    while (low < high) {
      let mid = Math.floor((low + high) / 2);
      if (lineOffsets[mid] > offset) {
        high = mid;
      } else {
        low = mid + 1;
      }
    }
    let line = low - 1;
    return Position.create(line, offset - lineOffsets[line]);
  }
  offsetAt(position) {
    let lineOffsets = this.getLineOffsets();
    if (position.line >= lineOffsets.length) {
      return this._content.length;
    } else if (position.line < 0) {
      return 0;
    }
    let lineOffset = lineOffsets[position.line];
    let nextLineOffset = position.line + 1 < lineOffsets.length ? lineOffsets[position.line + 1] : this._content.length;
    return Math.max(Math.min(lineOffset + position.character, nextLineOffset), lineOffset);
  }
  get lineCount() {
    return this.getLineOffsets().length;
  }
};
var Is;
(function(Is2) {
  const toString = Object.prototype.toString;
  function defined(value) {
    return typeof value !== "undefined";
  }
  Is2.defined = defined;
  function undefined2(value) {
    return typeof value === "undefined";
  }
  Is2.undefined = undefined2;
  function boolean(value) {
    return value === true || value === false;
  }
  Is2.boolean = boolean;
  function string(value) {
    return toString.call(value) === "[object String]";
  }
  Is2.string = string;
  function number(value) {
    return toString.call(value) === "[object Number]";
  }
  Is2.number = number;
  function numberRange(value, min, max) {
    return toString.call(value) === "[object Number]" && min <= value && value <= max;
  }
  Is2.numberRange = numberRange;
  function integer2(value) {
    return toString.call(value) === "[object Number]" && -2147483648 <= value && value <= 2147483647;
  }
  Is2.integer = integer2;
  function uinteger2(value) {
    return toString.call(value) === "[object Number]" && 0 <= value && value <= 2147483647;
  }
  Is2.uinteger = uinteger2;
  function func(value) {
    return toString.call(value) === "[object Function]";
  }
  Is2.func = func;
  function objectLiteral(value) {
    return value !== null && typeof value === "object";
  }
  Is2.objectLiteral = objectLiteral;
  function typedArray(value, check) {
    return Array.isArray(value) && value.every(check);
  }
  Is2.typedArray = typedArray;
})(Is || (Is = {}));

// node_modules/vscode-languageserver-textdocument/lib/esm/main.js
var FullTextDocument2 = class _FullTextDocument {
  constructor(uri, languageId, version, content) {
    this._uri = uri;
    this._languageId = languageId;
    this._version = version;
    this._content = content;
    this._lineOffsets = void 0;
  }
  get uri() {
    return this._uri;
  }
  get languageId() {
    return this._languageId;
  }
  get version() {
    return this._version;
  }
  getText(range) {
    if (range) {
      const start = this.offsetAt(range.start);
      const end = this.offsetAt(range.end);
      return this._content.substring(start, end);
    }
    return this._content;
  }
  update(changes, version) {
    for (const change of changes) {
      if (_FullTextDocument.isIncremental(change)) {
        const range = getWellformedRange(change.range);
        const startOffset = this.offsetAt(range.start);
        const endOffset = this.offsetAt(range.end);
        this._content = this._content.substring(0, startOffset) + change.text + this._content.substring(endOffset, this._content.length);
        const startLine = Math.max(range.start.line, 0);
        const endLine = Math.max(range.end.line, 0);
        let lineOffsets = this._lineOffsets;
        const addedLineOffsets = computeLineOffsets(change.text, false, startOffset);
        if (endLine - startLine === addedLineOffsets.length) {
          for (let i = 0, len = addedLineOffsets.length; i < len; i++) {
            lineOffsets[i + startLine + 1] = addedLineOffsets[i];
          }
        } else {
          if (addedLineOffsets.length < 1e4) {
            lineOffsets.splice(startLine + 1, endLine - startLine, ...addedLineOffsets);
          } else {
            this._lineOffsets = lineOffsets = lineOffsets.slice(0, startLine + 1).concat(addedLineOffsets, lineOffsets.slice(endLine + 1));
          }
        }
        const diff = change.text.length - (endOffset - startOffset);
        if (diff !== 0) {
          for (let i = startLine + 1 + addedLineOffsets.length, len = lineOffsets.length; i < len; i++) {
            lineOffsets[i] = lineOffsets[i] + diff;
          }
        }
      } else if (_FullTextDocument.isFull(change)) {
        this._content = change.text;
        this._lineOffsets = void 0;
      } else {
        throw new Error("Unknown change event received");
      }
    }
    this._version = version;
  }
  getLineOffsets() {
    if (this._lineOffsets === void 0) {
      this._lineOffsets = computeLineOffsets(this._content, true);
    }
    return this._lineOffsets;
  }
  positionAt(offset) {
    offset = Math.max(Math.min(offset, this._content.length), 0);
    const lineOffsets = this.getLineOffsets();
    let low = 0, high = lineOffsets.length;
    if (high === 0) {
      return { line: 0, character: offset };
    }
    while (low < high) {
      const mid = Math.floor((low + high) / 2);
      if (lineOffsets[mid] > offset) {
        high = mid;
      } else {
        low = mid + 1;
      }
    }
    const line = low - 1;
    offset = this.ensureBeforeEOL(offset, lineOffsets[line]);
    return { line, character: offset - lineOffsets[line] };
  }
  offsetAt(position) {
    const lineOffsets = this.getLineOffsets();
    if (position.line >= lineOffsets.length) {
      return this._content.length;
    } else if (position.line < 0) {
      return 0;
    }
    const lineOffset = lineOffsets[position.line];
    if (position.character <= 0) {
      return lineOffset;
    }
    const nextLineOffset = position.line + 1 < lineOffsets.length ? lineOffsets[position.line + 1] : this._content.length;
    const offset = Math.min(lineOffset + position.character, nextLineOffset);
    return this.ensureBeforeEOL(offset, lineOffset);
  }
  ensureBeforeEOL(offset, lineOffset) {
    while (offset > lineOffset && isEOL(this._content.charCodeAt(offset - 1))) {
      offset--;
    }
    return offset;
  }
  get lineCount() {
    return this.getLineOffsets().length;
  }
  static isIncremental(event) {
    const candidate = event;
    return candidate !== void 0 && candidate !== null && typeof candidate.text === "string" && candidate.range !== void 0 && (candidate.rangeLength === void 0 || typeof candidate.rangeLength === "number");
  }
  static isFull(event) {
    const candidate = event;
    return candidate !== void 0 && candidate !== null && typeof candidate.text === "string" && candidate.range === void 0 && candidate.rangeLength === void 0;
  }
};
var TextDocument2;
(function(TextDocument3) {
  function create(uri, languageId, version, content) {
    return new FullTextDocument2(uri, languageId, version, content);
  }
  TextDocument3.create = create;
  function update(document, changes, version) {
    if (document instanceof FullTextDocument2) {
      document.update(changes, version);
      return document;
    } else {
      throw new Error("TextDocument.update: document must be created by TextDocument.create");
    }
  }
  TextDocument3.update = update;
  function applyEdits(document, edits) {
    const text = document.getText();
    const sortedEdits = mergeSort(edits.map(getWellformedEdit), (a, b) => {
      const diff = a.range.start.line - b.range.start.line;
      if (diff === 0) {
        return a.range.start.character - b.range.start.character;
      }
      return diff;
    });
    let lastModifiedOffset = 0;
    const spans = [];
    for (const e of sortedEdits) {
      const startOffset = document.offsetAt(e.range.start);
      if (startOffset < lastModifiedOffset) {
        throw new Error("Overlapping edit");
      } else if (startOffset > lastModifiedOffset) {
        spans.push(text.substring(lastModifiedOffset, startOffset));
      }
      if (e.newText.length) {
        spans.push(e.newText);
      }
      lastModifiedOffset = document.offsetAt(e.range.end);
    }
    spans.push(text.substr(lastModifiedOffset));
    return spans.join("");
  }
  TextDocument3.applyEdits = applyEdits;
})(TextDocument2 || (TextDocument2 = {}));
function mergeSort(data, compare) {
  if (data.length <= 1) {
    return data;
  }
  const p = data.length / 2 | 0;
  const left = data.slice(0, p);
  const right = data.slice(p);
  mergeSort(left, compare);
  mergeSort(right, compare);
  let leftIdx = 0;
  let rightIdx = 0;
  let i = 0;
  while (leftIdx < left.length && rightIdx < right.length) {
    const ret = compare(left[leftIdx], right[rightIdx]);
    if (ret <= 0) {
      data[i++] = left[leftIdx++];
    } else {
      data[i++] = right[rightIdx++];
    }
  }
  while (leftIdx < left.length) {
    data[i++] = left[leftIdx++];
  }
  while (rightIdx < right.length) {
    data[i++] = right[rightIdx++];
  }
  return data;
}
function computeLineOffsets(text, isAtLineStart, textOffset = 0) {
  const result = isAtLineStart ? [textOffset] : [];
  for (let i = 0; i < text.length; i++) {
    const ch = text.charCodeAt(i);
    if (isEOL(ch)) {
      if (ch === 13 && i + 1 < text.length && text.charCodeAt(i + 1) === 10) {
        i++;
      }
      result.push(textOffset + i + 1);
    }
  }
  return result;
}
function isEOL(char) {
  return char === 13 || char === 10;
}
function getWellformedRange(range) {
  const start = range.start;
  const end = range.end;
  if (start.line > end.line || start.line === end.line && start.character > end.character) {
    return { start: end, end: start };
  }
  return range;
}
function getWellformedEdit(textEdit) {
  const range = getWellformedRange(textEdit.range);
  if (range !== textEdit.range) {
    return { newText: textEdit.newText, range };
  }
  return textEdit;
}

// node_modules/vscode-html-languageservice/lib/esm/htmlLanguageTypes.js
var TokenType;
(function(TokenType2) {
  TokenType2[TokenType2["StartCommentTag"] = 0] = "StartCommentTag";
  TokenType2[TokenType2["Comment"] = 1] = "Comment";
  TokenType2[TokenType2["EndCommentTag"] = 2] = "EndCommentTag";
  TokenType2[TokenType2["StartTagOpen"] = 3] = "StartTagOpen";
  TokenType2[TokenType2["StartTagClose"] = 4] = "StartTagClose";
  TokenType2[TokenType2["StartTagSelfClose"] = 5] = "StartTagSelfClose";
  TokenType2[TokenType2["StartTag"] = 6] = "StartTag";
  TokenType2[TokenType2["EndTagOpen"] = 7] = "EndTagOpen";
  TokenType2[TokenType2["EndTagClose"] = 8] = "EndTagClose";
  TokenType2[TokenType2["EndTag"] = 9] = "EndTag";
  TokenType2[TokenType2["DelimiterAssign"] = 10] = "DelimiterAssign";
  TokenType2[TokenType2["AttributeName"] = 11] = "AttributeName";
  TokenType2[TokenType2["AttributeValue"] = 12] = "AttributeValue";
  TokenType2[TokenType2["StartDoctypeTag"] = 13] = "StartDoctypeTag";
  TokenType2[TokenType2["Doctype"] = 14] = "Doctype";
  TokenType2[TokenType2["EndDoctypeTag"] = 15] = "EndDoctypeTag";
  TokenType2[TokenType2["Content"] = 16] = "Content";
  TokenType2[TokenType2["Whitespace"] = 17] = "Whitespace";
  TokenType2[TokenType2["Unknown"] = 18] = "Unknown";
  TokenType2[TokenType2["Script"] = 19] = "Script";
  TokenType2[TokenType2["Styles"] = 20] = "Styles";
  TokenType2[TokenType2["EOS"] = 21] = "EOS";
})(TokenType || (TokenType = {}));
var ScannerState;
(function(ScannerState2) {
  ScannerState2[ScannerState2["WithinContent"] = 0] = "WithinContent";
  ScannerState2[ScannerState2["AfterOpeningStartTag"] = 1] = "AfterOpeningStartTag";
  ScannerState2[ScannerState2["AfterOpeningEndTag"] = 2] = "AfterOpeningEndTag";
  ScannerState2[ScannerState2["WithinDoctype"] = 3] = "WithinDoctype";
  ScannerState2[ScannerState2["WithinTag"] = 4] = "WithinTag";
  ScannerState2[ScannerState2["WithinEndTag"] = 5] = "WithinEndTag";
  ScannerState2[ScannerState2["WithinComment"] = 6] = "WithinComment";
  ScannerState2[ScannerState2["WithinScriptContent"] = 7] = "WithinScriptContent";
  ScannerState2[ScannerState2["WithinStyleContent"] = 8] = "WithinStyleContent";
  ScannerState2[ScannerState2["AfterAttributeName"] = 9] = "AfterAttributeName";
  ScannerState2[ScannerState2["BeforeAttributeValue"] = 10] = "BeforeAttributeValue";
})(ScannerState || (ScannerState = {}));
var ClientCapabilities;
(function(ClientCapabilities2) {
  ClientCapabilities2.LATEST = {
    textDocument: {
      completion: {
        completionItem: {
          documentationFormat: [MarkupKind.Markdown, MarkupKind.PlainText]
        }
      },
      hover: {
        contentFormat: [MarkupKind.Markdown, MarkupKind.PlainText]
      }
    }
  };
})(ClientCapabilities || (ClientCapabilities = {}));
var FileType;
(function(FileType3) {
  FileType3[FileType3["Unknown"] = 0] = "Unknown";
  FileType3[FileType3["File"] = 1] = "File";
  FileType3[FileType3["Directory"] = 2] = "Directory";
  FileType3[FileType3["SymbolicLink"] = 64] = "SymbolicLink";
})(FileType || (FileType = {}));

// node_modules/vscode-html-languageservice/lib/esm/parser/htmlScanner.js
var MultiLineStream = class {
  constructor(source, position) {
    this.source = source;
    this.len = source.length;
    this.position = position;
  }
  eos() {
    return this.len <= this.position;
  }
  getSource() {
    return this.source;
  }
  pos() {
    return this.position;
  }
  goBackTo(pos) {
    this.position = pos;
  }
  goBack(n) {
    this.position -= n;
  }
  advance(n) {
    this.position += n;
  }
  goToEnd() {
    this.position = this.source.length;
  }
  nextChar() {
    return this.source.charCodeAt(this.position++) || 0;
  }
  peekChar(n = 0) {
    return this.source.charCodeAt(this.position + n) || 0;
  }
  advanceIfChar(ch) {
    if (ch === this.source.charCodeAt(this.position)) {
      this.position++;
      return true;
    }
    return false;
  }
  advanceIfChars(ch) {
    let i;
    if (this.position + ch.length > this.source.length) {
      return false;
    }
    for (i = 0; i < ch.length; i++) {
      if (this.source.charCodeAt(this.position + i) !== ch[i]) {
        return false;
      }
    }
    this.advance(i);
    return true;
  }
  advanceIfRegExp(regex) {
    const str = this.source.substr(this.position);
    const match = str.match(regex);
    if (match) {
      this.position = this.position + match.index + match[0].length;
      return match[0];
    }
    return "";
  }
  advanceUntilRegExp(regex) {
    const str = this.source.substr(this.position);
    const match = str.match(regex);
    if (match) {
      this.position = this.position + match.index;
      return match[0];
    } else {
      this.goToEnd();
    }
    return "";
  }
  advanceUntilChar(ch) {
    while (this.position < this.source.length) {
      if (this.source.charCodeAt(this.position) === ch) {
        return true;
      }
      this.advance(1);
    }
    return false;
  }
  advanceUntilChars(ch) {
    while (this.position + ch.length <= this.source.length) {
      let i = 0;
      for (; i < ch.length && this.source.charCodeAt(this.position + i) === ch[i]; i++) {
      }
      if (i === ch.length) {
        return true;
      }
      this.advance(1);
    }
    this.goToEnd();
    return false;
  }
  skipWhitespace() {
    const n = this.advanceWhileChar((ch) => {
      return ch === _WSP || ch === _TAB || ch === _NWL || ch === _LFD || ch === _CAR;
    });
    return n > 0;
  }
  advanceWhileChar(condition) {
    const posNow = this.position;
    while (this.position < this.len && condition(this.source.charCodeAt(this.position))) {
      this.position++;
    }
    return this.position - posNow;
  }
};
var _BNG = "!".charCodeAt(0);
var _MIN = "-".charCodeAt(0);
var _LAN = "<".charCodeAt(0);
var _RAN = ">".charCodeAt(0);
var _FSL = "/".charCodeAt(0);
var _EQS = "=".charCodeAt(0);
var _DQO = '"'.charCodeAt(0);
var _SQO = "'".charCodeAt(0);
var _NWL = "\n".charCodeAt(0);
var _CAR = "\r".charCodeAt(0);
var _LFD = "\f".charCodeAt(0);
var _WSP = " ".charCodeAt(0);
var _TAB = "	".charCodeAt(0);
var htmlScriptContents = {
  "text/x-handlebars-template": true,
  // Fix for https://github.com/microsoft/vscode/issues/77977
  "text/html": true
};
function createScanner(input, initialOffset = 0, initialState = ScannerState.WithinContent, emitPseudoCloseTags = false) {
  const stream = new MultiLineStream(input, initialOffset);
  let state = initialState;
  let tokenOffset = 0;
  let tokenType = TokenType.Unknown;
  let tokenError;
  let hasSpaceAfterTag;
  let lastTag;
  let lastAttributeName;
  let lastTypeValue;
  function nextElementName() {
    return stream.advanceIfRegExp(/^[_:\w][_:\w-.\d]*/).toLowerCase();
  }
  function nextAttributeName() {
    return stream.advanceIfRegExp(/^[^\s"'></=\x00-\x0F\x7F\x80-\x9F]*/).toLowerCase();
  }
  function finishToken(offset, type, errorMessage) {
    tokenType = type;
    tokenOffset = offset;
    tokenError = errorMessage;
    return type;
  }
  function scan() {
    const offset = stream.pos();
    const oldState = state;
    const token = internalScan();
    if (token !== TokenType.EOS && offset === stream.pos() && !(emitPseudoCloseTags && (token === TokenType.StartTagClose || token === TokenType.EndTagClose))) {
      console.warn("Scanner.scan has not advanced at offset " + offset + ", state before: " + oldState + " after: " + state);
      stream.advance(1);
      return finishToken(offset, TokenType.Unknown);
    }
    return token;
  }
  function internalScan() {
    const offset = stream.pos();
    if (stream.eos()) {
      return finishToken(offset, TokenType.EOS);
    }
    let errorMessage;
    switch (state) {
      case ScannerState.WithinComment:
        if (stream.advanceIfChars([_MIN, _MIN, _RAN])) {
          state = ScannerState.WithinContent;
          return finishToken(offset, TokenType.EndCommentTag);
        }
        stream.advanceUntilChars([_MIN, _MIN, _RAN]);
        return finishToken(offset, TokenType.Comment);
      case ScannerState.WithinDoctype:
        if (stream.advanceIfChar(_RAN)) {
          state = ScannerState.WithinContent;
          return finishToken(offset, TokenType.EndDoctypeTag);
        }
        stream.advanceUntilChar(_RAN);
        return finishToken(offset, TokenType.Doctype);
      case ScannerState.WithinContent:
        if (stream.advanceIfChar(_LAN)) {
          if (!stream.eos() && stream.peekChar() === _BNG) {
            if (stream.advanceIfChars([_BNG, _MIN, _MIN])) {
              state = ScannerState.WithinComment;
              return finishToken(offset, TokenType.StartCommentTag);
            }
            if (stream.advanceIfRegExp(/^!doctype/i)) {
              state = ScannerState.WithinDoctype;
              return finishToken(offset, TokenType.StartDoctypeTag);
            }
          }
          if (stream.advanceIfChar(_FSL)) {
            state = ScannerState.AfterOpeningEndTag;
            return finishToken(offset, TokenType.EndTagOpen);
          }
          state = ScannerState.AfterOpeningStartTag;
          return finishToken(offset, TokenType.StartTagOpen);
        }
        stream.advanceUntilChar(_LAN);
        return finishToken(offset, TokenType.Content);
      case ScannerState.AfterOpeningEndTag:
        const tagName = nextElementName();
        if (tagName.length > 0) {
          state = ScannerState.WithinEndTag;
          return finishToken(offset, TokenType.EndTag);
        }
        if (stream.skipWhitespace()) {
          return finishToken(offset, TokenType.Whitespace, l10n.t("Tag name must directly follow the open bracket."));
        }
        state = ScannerState.WithinEndTag;
        stream.advanceUntilChar(_RAN);
        if (offset < stream.pos()) {
          return finishToken(offset, TokenType.Unknown, l10n.t("End tag name expected."));
        }
        return internalScan();
      case ScannerState.WithinEndTag:
        if (stream.skipWhitespace()) {
          return finishToken(offset, TokenType.Whitespace);
        }
        if (stream.advanceIfChar(_RAN)) {
          state = ScannerState.WithinContent;
          return finishToken(offset, TokenType.EndTagClose);
        }
        if (emitPseudoCloseTags && stream.peekChar() === _LAN) {
          state = ScannerState.WithinContent;
          return finishToken(offset, TokenType.EndTagClose, l10n.t("Closing bracket missing."));
        }
        errorMessage = l10n.t("Closing bracket expected.");
        break;
      case ScannerState.AfterOpeningStartTag:
        lastTag = nextElementName();
        lastTypeValue = void 0;
        lastAttributeName = void 0;
        if (lastTag.length > 0) {
          hasSpaceAfterTag = false;
          state = ScannerState.WithinTag;
          return finishToken(offset, TokenType.StartTag);
        }
        if (stream.skipWhitespace()) {
          return finishToken(offset, TokenType.Whitespace, l10n.t("Tag name must directly follow the open bracket."));
        }
        state = ScannerState.WithinTag;
        stream.advanceUntilChar(_RAN);
        if (offset < stream.pos()) {
          return finishToken(offset, TokenType.Unknown, l10n.t("Start tag name expected."));
        }
        return internalScan();
      case ScannerState.WithinTag:
        if (stream.skipWhitespace()) {
          hasSpaceAfterTag = true;
          return finishToken(offset, TokenType.Whitespace);
        }
        if (hasSpaceAfterTag) {
          lastAttributeName = nextAttributeName();
          if (lastAttributeName.length > 0) {
            state = ScannerState.AfterAttributeName;
            hasSpaceAfterTag = false;
            return finishToken(offset, TokenType.AttributeName);
          }
        }
        if (stream.advanceIfChars([_FSL, _RAN])) {
          state = ScannerState.WithinContent;
          return finishToken(offset, TokenType.StartTagSelfClose);
        }
        if (stream.advanceIfChar(_RAN)) {
          if (lastTag === "script") {
            if (lastTypeValue && htmlScriptContents[lastTypeValue]) {
              state = ScannerState.WithinContent;
            } else {
              state = ScannerState.WithinScriptContent;
            }
          } else if (lastTag === "style") {
            state = ScannerState.WithinStyleContent;
          } else {
            state = ScannerState.WithinContent;
          }
          return finishToken(offset, TokenType.StartTagClose);
        }
        if (emitPseudoCloseTags && stream.peekChar() === _LAN) {
          state = ScannerState.WithinContent;
          return finishToken(offset, TokenType.StartTagClose, l10n.t("Closing bracket missing."));
        }
        stream.advance(1);
        return finishToken(offset, TokenType.Unknown, l10n.t("Unexpected character in tag."));
      case ScannerState.AfterAttributeName:
        if (stream.skipWhitespace()) {
          hasSpaceAfterTag = true;
          return finishToken(offset, TokenType.Whitespace);
        }
        if (stream.advanceIfChar(_EQS)) {
          state = ScannerState.BeforeAttributeValue;
          return finishToken(offset, TokenType.DelimiterAssign);
        }
        state = ScannerState.WithinTag;
        return internalScan();
      // no advance yet - jump to WithinTag
      case ScannerState.BeforeAttributeValue:
        if (stream.skipWhitespace()) {
          return finishToken(offset, TokenType.Whitespace);
        }
        let attributeValue = stream.advanceIfRegExp(/^[^\s"'`=<>]+/);
        if (attributeValue.length > 0) {
          if (stream.peekChar() === _RAN && stream.peekChar(-1) === _FSL) {
            stream.goBack(1);
            attributeValue = attributeValue.substring(0, attributeValue.length - 1);
          }
          if (lastAttributeName === "type") {
            lastTypeValue = attributeValue;
          }
          if (attributeValue.length > 0) {
            state = ScannerState.WithinTag;
            hasSpaceAfterTag = false;
            return finishToken(offset, TokenType.AttributeValue);
          }
        }
        const ch = stream.peekChar();
        if (ch === _SQO || ch === _DQO) {
          stream.advance(1);
          if (stream.advanceUntilChar(ch)) {
            stream.advance(1);
          }
          if (lastAttributeName === "type") {
            lastTypeValue = stream.getSource().substring(offset + 1, stream.pos() - 1);
          }
          state = ScannerState.WithinTag;
          hasSpaceAfterTag = false;
          return finishToken(offset, TokenType.AttributeValue);
        }
        state = ScannerState.WithinTag;
        hasSpaceAfterTag = false;
        return internalScan();
      // no advance yet - jump to WithinTag
      case ScannerState.WithinScriptContent:
        let sciptState = 1;
        while (!stream.eos()) {
          const match = stream.advanceIfRegExp(/<!--|-->|<\/?script\s*\/?>?/i);
          if (match.length === 0) {
            stream.goToEnd();
            return finishToken(offset, TokenType.Script);
          } else if (match === "<!--") {
            if (sciptState === 1) {
              sciptState = 2;
            }
          } else if (match === "-->") {
            sciptState = 1;
          } else if (match[1] !== "/") {
            if (sciptState === 2) {
              sciptState = 3;
            }
          } else {
            if (sciptState === 3) {
              sciptState = 2;
            } else {
              stream.goBack(match.length);
              break;
            }
          }
        }
        state = ScannerState.WithinContent;
        if (offset < stream.pos()) {
          return finishToken(offset, TokenType.Script);
        }
        return internalScan();
      // no advance yet - jump to content
      case ScannerState.WithinStyleContent:
        stream.advanceUntilRegExp(/<\/style/i);
        state = ScannerState.WithinContent;
        if (offset < stream.pos()) {
          return finishToken(offset, TokenType.Styles);
        }
        return internalScan();
    }
    stream.advance(1);
    state = ScannerState.WithinContent;
    return finishToken(offset, TokenType.Unknown, errorMessage);
  }
  return {
    scan,
    getTokenType: () => tokenType,
    getTokenOffset: () => tokenOffset,
    getTokenLength: () => stream.pos() - tokenOffset,
    getTokenEnd: () => stream.pos(),
    getTokenText: () => stream.getSource().substring(tokenOffset, stream.pos()),
    getScannerState: () => state,
    getTokenError: () => tokenError
  };
}

// src/htmlClassifier.ts
var TN_STRING = "string";
var TN_COMMENT = "comment";
var TN_HTML_TAG = "htmlTagName";
var TN_HTML_ATTR = "htmlAttributeName";
function nonEjsParts(rangeStart, rangeEnd, blocks) {
  const overlapping = blocks.filter(
    (b) => b.start < rangeEnd && b.end > rangeStart
  );
  if (overlapping.length === 0) {
    return [{ start: rangeStart, end: rangeEnd }];
  }
  const parts = [];
  let pos = rangeStart;
  for (const block of overlapping) {
    const blockStart = Math.max(block.start, rangeStart);
    const blockEnd = Math.min(block.end, rangeEnd);
    if (blockStart > pos) {
      parts.push({ start: pos, end: blockStart });
    }
    pos = blockEnd;
  }
  if (pos < rangeEnd) {
    parts.push({ start: pos, end: rangeEnd });
  }
  return parts;
}
function classifyHtml(placeholderText, blocks, tokens) {
  const scanner = createScanner(placeholderText, 0);
  let tokenType = scanner.scan();
  while (tokenType !== 21 /* EOS */) {
    const offset = scanner.getTokenOffset();
    const length = scanner.getTokenLength();
    const tokenEnd = offset + length;
    switch (tokenType) {
      // ── Tag names ──────────────────────────────────────────────────────────
      case 6 /* StartTag */:
      case 9 /* EndTag */: {
        emitSplit(offset, tokenEnd, TN_HTML_TAG, blocks, placeholderText, tokens);
        break;
      }
      // ── Attribute names ────────────────────────────────────────────────────
      case 11 /* AttributeName */: {
        emitSplit(offset, tokenEnd, TN_HTML_ATTR, blocks, placeholderText, tokens);
        break;
      }
      // ── Attribute values (includes surrounding quotes) ─────────────────────
      case 12 /* AttributeValue */: {
        emitSplit(offset, tokenEnd, TN_STRING, blocks, placeholderText, tokens);
        break;
      }
      // ── HTML comments: emit entire <!--...comment...-->'s inner text ────────
      case 0 /* StartCommentTag */:
      // <!--
      case 1 /* Comment */:
      // comment text
      case 2 /* EndCommentTag */: {
        emitSplit(offset, tokenEnd, TN_COMMENT, blocks, placeholderText, tokens);
        break;
      }
      // ── DOCTYPE ────────────────────────────────────────────────────────────
      case 13 /* StartDoctypeTag */:
      // <!DOCTYPE
      case 14 /* Doctype */:
      // doctype value
      case 15 /* EndDoctypeTag */: {
        emitSplit(offset, tokenEnd, TN_HTML_TAG, blocks, placeholderText, tokens);
        break;
      }
      // Content, whitespace, delimiters, script/style content — not emitted
      // (left to TextMate grammar fallback or default theme color)
      default:
        break;
    }
    tokenType = scanner.scan();
  }
}
function emitSplit(start, end, typeName, blocks, placeholderText, tokens) {
  const parts = nonEjsParts(start, end, blocks);
  for (const part of parts) {
    const partLen = part.end - part.start;
    if (partLen <= 0) {
      continue;
    }
    if (placeholderText.slice(part.start, part.end).includes("\n")) {
      continue;
    }
    tokens.push({ offset: part.start, length: partLen, typeName });
  }
}

// src/jsClassifier.ts
var KEYWORDS = /* @__PURE__ */ new Set([
  "break",
  "case",
  "catch",
  "class",
  "const",
  "continue",
  "debugger",
  "default",
  "delete",
  "do",
  "else",
  "export",
  "extends",
  "false",
  "finally",
  "for",
  "function",
  "if",
  "import",
  "in",
  "instanceof",
  "let",
  "new",
  "null",
  "of",
  "return",
  "static",
  "super",
  "switch",
  "this",
  "throw",
  "true",
  "try",
  "typeof",
  "undefined",
  "var",
  "void",
  "while",
  "with",
  "yield",
  "async",
  "await",
  "from",
  "as",
  "get",
  "set"
]);
var OPS3 = /* @__PURE__ */ new Set(["===", "!==", ">>>", "**=", ">>=", "<<=", "||=", "&&=", "??="]);
var OPS2 = /* @__PURE__ */ new Set([
  "==",
  "!=",
  "<=",
  ">=",
  "=>",
  "**",
  "++",
  "--",
  "+=",
  "-=",
  "*=",
  "/=",
  "%=",
  "&=",
  "|=",
  "^=",
  "&&",
  "||",
  "??",
  "?.",
  "::",
  "<<",
  ">>",
  "->",
  "**"
]);
function isIdentStart(ch) {
  return ch >= "a" && ch <= "z" || ch >= "A" && ch <= "Z" || ch === "_" || ch === "$";
}
function isIdentPart(ch) {
  return isIdentStart(ch) || ch >= "0" && ch <= "9";
}
function isDigit(ch) {
  return ch >= "0" && ch <= "9";
}
function tokenizeJs(code) {
  const tokens = [];
  let i = 0;
  const len = code.length;
  while (i < len) {
    const ch = code[i];
    if (ch === " " || ch === "	" || ch === "\r" || ch === "\n") {
      i++;
      continue;
    }
    if (ch === "/" && code[i + 1] === "/") {
      const start = i;
      i += 2;
      while (i < len && code[i] !== "\n") {
        i++;
      }
      tokens.push({ type: "comment", start, length: i - start });
      continue;
    }
    if (ch === "/" && code[i + 1] === "*") {
      const start = i;
      i += 2;
      while (i < len - 1 && !(code[i] === "*" && code[i + 1] === "/")) {
        i++;
      }
      if (i < len - 1) {
        i += 2;
      } else {
        i = len;
      }
      tokens.push({ type: "comment", start, length: i - start });
      continue;
    }
    if (ch === "`") {
      const start = i;
      i++;
      let depth = 0;
      while (i < len) {
        const c = code[i];
        if (c === "\\") {
          i += 2;
          continue;
        }
        if (c === "$" && code[i + 1] === "{") {
          depth++;
          i += 2;
          continue;
        }
        if (c === "}" && depth > 0) {
          depth--;
          i++;
          continue;
        }
        if (c === "`" && depth === 0) {
          i++;
          break;
        }
        i++;
      }
      tokens.push({ type: "string", start, length: i - start });
      continue;
    }
    if (ch === "'") {
      const start = i;
      i++;
      while (i < len) {
        const c = code[i];
        if (c === "\\") {
          i += 2;
          continue;
        }
        if (c === "'" || c === "\n") {
          if (c === "'") {
            i++;
          }
          break;
        }
        i++;
      }
      tokens.push({ type: "string", start, length: i - start });
      continue;
    }
    if (ch === '"') {
      const start = i;
      i++;
      while (i < len) {
        const c = code[i];
        if (c === "\\") {
          i += 2;
          continue;
        }
        if (c === '"' || c === "\n") {
          if (c === '"') {
            i++;
          }
          break;
        }
        i++;
      }
      tokens.push({ type: "string", start, length: i - start });
      continue;
    }
    const nextCh = i + 1 < len ? code[i + 1] : "";
    if (isDigit(ch) || ch === "." && isDigit(nextCh)) {
      const start = i;
      if (ch === "0" && (nextCh === "x" || nextCh === "X")) {
        i += 2;
        while (i < len && /[0-9a-fA-F_]/.test(code[i])) {
          i++;
        }
      } else if (ch === "0" && (nextCh === "b" || nextCh === "B")) {
        i += 2;
        while (i < len && (code[i] === "0" || code[i] === "1" || code[i] === "_")) {
          i++;
        }
      } else if (ch === "0" && (nextCh === "o" || nextCh === "O")) {
        i += 2;
        while (i < len && /[0-7_]/.test(code[i])) {
          i++;
        }
      } else {
        while (i < len && (isDigit(code[i]) || code[i] === "_")) {
          i++;
        }
        if (i < len && code[i] === ".") {
          i++;
          while (i < len && (isDigit(code[i]) || code[i] === "_")) {
            i++;
          }
        }
        if (i < len && (code[i] === "e" || code[i] === "E")) {
          i++;
          if (i < len && (code[i] === "+" || code[i] === "-")) {
            i++;
          }
          while (i < len && isDigit(code[i])) {
            i++;
          }
        }
        if (i < len && code[i] === "n") {
          i++;
        }
      }
      tokens.push({ type: "number", start, length: i - start });
      continue;
    }
    if (isIdentStart(ch)) {
      const start = i;
      while (i < len && isIdentPart(code[i])) {
        i++;
      }
      const word = code.slice(start, i);
      tokens.push({
        type: KEYWORDS.has(word) ? "keyword" : "variable",
        start,
        length: i - start
      });
      continue;
    }
    const s3 = code.slice(i, i + 3);
    if (OPS3.has(s3)) {
      tokens.push({ type: "operator", start: i, length: 3 });
      i += 3;
      continue;
    }
    const s2 = code.slice(i, i + 2);
    if (OPS2.has(s2)) {
      tokens.push({ type: "operator", start: i, length: 2 });
      i += 2;
      continue;
    }
    if ("+-*/<>=!&|^~%?:.;,()[]{}@#".includes(ch)) {
      tokens.push({ type: "operator", start: i, length: 1 });
      i++;
      continue;
    }
    i++;
  }
  return tokens;
}

// src/semanticTokenProvider.ts
var TOKEN_TYPES = [
  "keyword",
  // 0
  "variable",
  // 1
  "string",
  // 2
  "number",
  // 3
  "regexp",
  // 4
  "comment",
  // 5
  "operator",
  // 6
  "ejsDelimiter",
  // 7
  "htmlTagName",
  // 8
  "htmlAttributeName"
  // 9
];
var TOKEN_MODIFIERS = [];
var LEGEND = new vscode.SemanticTokensLegend(TOKEN_TYPES, TOKEN_MODIFIERS);
var cache = /* @__PURE__ */ new Map();
var ejsSemanticTokensProvider = {
  provideDocumentSemanticTokens(document, _token) {
    const key = document.uri.toString();
    const cached = cache.get(key);
    if (cached && cached.version === document.version) {
      return cached.tokens;
    }
    const text = document.getText();
    const tokens = buildTokens(text, document);
    cache.set(key, { version: document.version, tokens });
    if (cache.size > 50) {
      const firstKey = cache.keys().next().value;
      if (firstKey !== void 0) {
        cache.delete(firstKey);
      }
    }
    return tokens;
  }
};
var ejsRangeSemanticTokensProvider = {
  provideDocumentRangeSemanticTokens(document, _range, _token) {
    const key = document.uri.toString();
    const cached = cache.get(key);
    if (cached && cached.version === document.version) {
      return cached.tokens;
    }
    const text = document.getText();
    const tokens = buildTokens(text, document);
    cache.set(key, { version: document.version, tokens });
    if (cache.size > 50) {
      const firstKey = cache.keys().next().value;
      if (firstKey !== void 0) {
        cache.delete(firstKey);
      }
    }
    return tokens;
  }
};
function buildTokens(text, document) {
  const builder = new vscode.SemanticTokensBuilder(LEGEND);
  const blocks = scanEjsBlocks(text);
  const placeholderText = buildPlaceholderDoc(text, blocks);
  const pending = [];
  classifyHtml(placeholderText, blocks, pending);
  for (const block of blocks) {
    collectEjsBlock(block, text, pending);
  }
  pending.sort((a, b) => a.offset - b.offset);
  for (const tok of pending) {
    pushToken(tok.offset, tok.length, tok.typeName, document, builder);
  }
  return builder.build();
}
function collectEjsBlock(block, text, pending) {
  pending.push({ offset: block.start, length: block.openLen, typeName: "ejsDelimiter" });
  const contentStart = block.start + block.openLen;
  const contentEnd = block.end - block.closeLen;
  const jsCode = text.slice(contentStart, contentEnd);
  if (block.type === "comment") {
    if (contentEnd > contentStart) {
      pending.push({ offset: contentStart, length: contentEnd - contentStart, typeName: "comment" });
    }
  } else {
    const jsTokens = tokenizeJs(jsCode);
    for (const jsTok of jsTokens) {
      pending.push({ offset: contentStart + jsTok.start, length: jsTok.length, typeName: jsTok.type });
    }
  }
  pending.push({ offset: block.end - block.closeLen, length: block.closeLen, typeName: "ejsDelimiter" });
}
function pushToken(offset, length, typeName, document, builder) {
  if (length <= 0) {
    return;
  }
  const startPos = document.positionAt(offset);
  const endPos = document.positionAt(offset + length);
  if (startPos.line !== endPos.line) {
    for (let line = startPos.line; line <= endPos.line; line++) {
      const lineStart = line === startPos.line ? offset : document.offsetAt(new vscode.Position(line, 0));
      const lineEnd = line === endPos.line ? offset + length : document.offsetAt(new vscode.Position(line + 1, 0)) - 1;
      const lineLen = lineEnd - lineStart;
      if (lineLen > 0) {
        builder.push(
          new vscode.Range(
            document.positionAt(lineStart),
            document.positionAt(lineEnd)
          ),
          typeName,
          []
        );
      }
    }
    return;
  }
  builder.push(new vscode.Range(startPos, endPos), typeName, []);
}

// src/foldingProvider.ts
var vscode2 = __toESM(require("vscode"));
function endsWithOpenBrace(jsContent) {
  const stripped = jsContent.replace(/\/\/[^\n]*/g, "").replace(/\/\*[\s\S]*?\*\//g, "").trim();
  return stripped.endsWith("{");
}
function endsWithCloseBrace(jsContent) {
  const stripped = jsContent.replace(/\/\/[^\n]*/g, "").replace(/\/\*[\s\S]*?\*\//g, "").trim();
  return stripped === "}" || stripped === "};" || stripped === "} else {" || /^\}\s*else\s*(if\s*\(.*\)\s*)?\{$/.test(stripped);
}
function provideFoldingRanges(document, _context, _token) {
  const text = document.getText();
  const blocks = scanEjsBlocks(text);
  const ranges = [];
  const openStack = [];
  for (const block of blocks) {
    const blockStart = document.positionAt(block.start);
    const blockEnd = document.positionAt(block.end - 1);
    if (blockEnd.line > blockStart.line) {
      ranges.push(new vscode2.FoldingRange(blockStart.line, blockEnd.line));
      continue;
    }
    if (block.type !== "scriptlet" && block.type !== "output-escaped" && block.type !== "output-unescaped" && block.type !== "whitespace-slurp") {
      continue;
    }
    const contentStart = block.start + block.openLen;
    const contentEnd = block.end - block.closeLen;
    const jsContent = text.slice(contentStart, contentEnd);
    const line = blockStart.line;
    if (endsWithOpenBrace(jsContent)) {
      openStack.push(line);
    } else if (endsWithCloseBrace(jsContent) && openStack.length > 0) {
      const openLine = openStack.pop();
      if (line > openLine) {
        ranges.push(new vscode2.FoldingRange(openLine, line));
      }
    }
  }
  return ranges;
}

// src/completionProvider.ts
var vscode3 = __toESM(require("vscode"));
var EJS_SNIPPETS = [
  {
    label: "<%= ... %>",
    insertText: "<%= ${1:expression} %>",
    detail: "EJS output (HTML-escaped)",
    documentation: "Outputs the value of the expression, HTML-escaped. Use for user-generated content.",
    sortText: "0a"
  },
  {
    label: "<%- ... %>",
    insertText: "<%- ${1:expression} %>",
    detail: "EJS output (unescaped)",
    documentation: "Outputs the raw value of the expression without HTML escaping. Use only with trusted content.",
    sortText: "0b"
  },
  {
    label: "<% ... %>",
    insertText: "<% ${1:code} %>",
    detail: "EJS scriptlet",
    documentation: "Executes JavaScript code. No output is generated.",
    sortText: "0c"
  },
  {
    label: "<%# ... %>",
    insertText: "<%# ${1:comment} %>",
    detail: "EJS comment",
    documentation: "A comment that is not included in the rendered output.",
    sortText: "0d"
  },
  {
    label: "<%_ ... %>",
    insertText: "<%_ ${1:code} %>",
    detail: "EJS whitespace-slurp scriptlet",
    documentation: "Like <% %> but strips all preceding whitespace on the line.",
    sortText: "0e"
  },
  {
    label: "<% if %>",
    insertText: "<% if (${1:condition}) { %>\n	${2}\n<% } %>",
    detail: "EJS if block",
    documentation: "Conditional rendering block.",
    sortText: "1a"
  },
  {
    label: "<% if / else %>",
    insertText: "<% if (${1:condition}) { %>\n	${2}\n<% } else { %>\n	${3}\n<% } %>",
    detail: "EJS if/else block",
    documentation: "Conditional rendering block with else branch.",
    sortText: "1b"
  },
  {
    label: "<% for %>",
    insertText: "<% for (let ${1:i} = 0; ${1:i} < ${2:items}.length; ${1:i}++) { %>\n	${3}\n<% } %>",
    detail: "EJS for loop",
    documentation: "Iterate with a classic for loop.",
    sortText: "1c"
  },
  {
    label: "<% forEach %>",
    insertText: "<% ${1:items}.forEach(function(${2:item}) { %>\n	${3}\n<% }); %>",
    detail: "EJS forEach loop",
    documentation: "Iterate over an array with forEach.",
    sortText: "1d"
  },
  {
    label: "<% include %>",
    insertText: "<%- include('${1:path/to/partial}', { ${2} }) %>",
    detail: "EJS include partial",
    documentation: "Include another EJS file. The included file has access to the same local variables plus any extras passed in the second argument.",
    sortText: "2a"
  }
];
var ejsCompletionProvider = {
  provideCompletionItems(document, position) {
    const lineText = document.lineAt(position).text;
    const textBefore = lineText.slice(0, position.character);
    const blocks = scanEjsBlocks(document.getText());
    const offset = document.offsetAt(position);
    const insideEjs = blocks.some(
      (b) => offset > b.start + b.openLen && offset < b.end - b.closeLen
    );
    if (insideEjs) {
      return [];
    }
    if (!textBefore.endsWith("<") && !textBefore.endsWith("<%")) {
      return [];
    }
    return EJS_SNIPPETS.map((snippet) => {
      const item = new vscode3.CompletionItem(snippet.label, vscode3.CompletionItemKind.Snippet);
      item.insertText = new vscode3.SnippetString(
        // If user typed `<`, include the full tag; if they typed `<%`, skip the `<`
        textBefore.endsWith("<%") ? snippet.insertText.slice(1) : snippet.insertText
      );
      item.detail = snippet.detail;
      item.documentation = new vscode3.MarkdownString(snippet.documentation);
      item.sortText = snippet.sortText;
      item.filterText = snippet.label;
      return item;
    });
  }
};

// src/includePathCompletionProvider.ts
var vscode5 = __toESM(require("vscode"));

// src/includeResolver.ts
var vscode4 = __toESM(require("vscode"));
var path = __toESM(require("path"));
var INCLUDE_RE = /include\s*\(\s*(['"])(.*?)\1/g;
function resolveIncludePath(rawPath, documentUri) {
  const documentDir = vscode4.Uri.joinPath(documentUri, "..");
  const withExt = path.extname(rawPath) === "" ? rawPath + ".ejs" : rawPath;
  return vscode4.Uri.joinPath(documentDir, withExt);
}
function findIncludes(text, documentUri) {
  const includes = [];
  INCLUDE_RE.lastIndex = 0;
  let match;
  while ((match = INCLUDE_RE.exec(text)) !== null) {
    const quote = match[1];
    const rawPath = match[2];
    const quoteStart = match.index + match[0].indexOf(quote);
    const quoteEnd = quoteStart + rawPath.length + 2;
    includes.push({
      rawPath,
      quoteStart,
      quoteEnd,
      resolvedUri: resolveIncludePath(rawPath, documentUri)
    });
  }
  return includes;
}
function includeAtPosition(text, documentUri, document, position) {
  const offset = document.offsetAt(position);
  const includes = findIncludes(text, documentUri);
  return includes.find((inc) => offset >= inc.quoteStart && offset <= inc.quoteEnd);
}

// src/includePathCompletionProvider.ts
var INCLUDE_PREFIX_RE = /include\s*\(\s*(['"])((?:[^'"]*\/)?)([^'"]*)?$/;
var ejsIncludePathCompletionProvider = {
  async provideCompletionItems(document, position) {
    const lineText = document.lineAt(position).text;
    const textBeforeCursor = lineText.slice(0, position.character);
    const match = INCLUDE_PREFIX_RE.exec(textBeforeCursor);
    if (!match) {
      return void 0;
    }
    const dirPart = match[2];
    const filePart = match[3] ?? "";
    const documentDir = vscode5.Uri.joinPath(document.uri, "..");
    const targetDir = dirPart ? vscode5.Uri.joinPath(documentDir, dirPart) : documentDir;
    let entries;
    try {
      entries = await vscode5.workspace.fs.readDirectory(targetDir);
    } catch {
      return void 0;
    }
    const items = [];
    for (const [name, fileType] of entries) {
      if (name.startsWith(".")) {
        continue;
      }
      if (fileType === vscode5.FileType.Directory) {
        const item = new vscode5.CompletionItem(name + "/", vscode5.CompletionItemKind.Folder);
        item.insertText = name + "/";
        item.command = {
          command: "editor.action.triggerSuggest",
          title: "Re-trigger completions"
        };
        items.push(item);
      } else if (fileType === vscode5.FileType.File && (name.endsWith(".ejs") || name.endsWith(".html"))) {
        const label = name.endsWith(".ejs") ? name.slice(0, -4) : name;
        const item = new vscode5.CompletionItem(label, vscode5.CompletionItemKind.File);
        item.insertText = label;
        item.detail = name;
        const resolved = resolveIncludePath(dirPart + label, document.uri);
        item.documentation = new vscode5.MarkdownString(
          `\`${vscode5.workspace.asRelativePath(resolved)}\``
        );
        items.push(item);
      }
    }
    if (filePart) {
      const replaceStart = position.translate(0, -filePart.length);
      const replaceRange = new vscode5.Range(replaceStart, position);
      for (const item of items) {
        item.range = replaceRange;
      }
    }
    return items;
  }
};

// src/documentLinkProvider.ts
var vscode6 = __toESM(require("vscode"));
var ejsDocumentLinkProvider = {
  provideDocumentLinks(document) {
    const text = document.getText();
    const includes = findIncludes(text, document.uri);
    return includes.map((inc) => {
      const pathStart = document.positionAt(inc.quoteStart + 1);
      const pathEnd = document.positionAt(inc.quoteEnd - 1);
      const range = new vscode6.Range(pathStart, pathEnd);
      const link = new vscode6.DocumentLink(range, inc.resolvedUri);
      link.tooltip = `Open ${inc.rawPath}`;
      return link;
    });
  },
  resolveDocumentLink(link) {
    return link;
  }
};

// src/definitionProvider.ts
var vscode7 = __toESM(require("vscode"));
var ejsDefinitionProvider = {
  async provideDefinition(document, position) {
    const text = document.getText();
    const inc = includeAtPosition(text, document.uri, document, position);
    if (!inc) {
      return void 0;
    }
    try {
      await vscode7.workspace.fs.stat(inc.resolvedUri);
    } catch {
      return void 0;
    }
    return new vscode7.Location(inc.resolvedUri, new vscode7.Position(0, 0));
  }
};

// src/hoverProvider.ts
var vscode8 = __toESM(require("vscode"));
var TAG_DOCS = [
  {
    pattern: /^<%= ?/,
    title: "`<%= %>` \u2014 Escaped Output",
    body: "Evaluates the expression and inserts the result into the HTML output, **HTML-escaped** (e.g. `<` becomes `&lt;`). Use this for any user-supplied data to prevent XSS."
  },
  {
    pattern: /^<%- ?/,
    title: "`<%- %>` \u2014 Unescaped Output",
    body: "Evaluates the expression and inserts the result **without** HTML escaping. Only use with trusted content (e.g. pre-rendered HTML from your own code)."
  },
  {
    pattern: /^<%# ?/,
    title: "`<%# %>` \u2014 EJS Comment",
    body: "A server-side comment. The content is **not** included in the rendered HTML output \u2014 unlike `<!-- -->` HTML comments which are sent to the browser."
  },
  {
    pattern: /^<%_ ?/,
    title: "`<%_ %>` \u2014 Whitespace-Slurp Scriptlet",
    body: "Like `<% %>` but strips all whitespace (spaces, tabs) that precede the tag on the same line. Useful for keeping templates readable without extra blank lines in output."
  },
  {
    pattern: /^<% ?/,
    title: "`<% %>` \u2014 Scriptlet",
    body: "Executes the JavaScript code but produces **no output**. Use for control flow (`if`, `for`, `while`) and variable assignments."
  },
  {
    pattern: /^-%>/,
    title: "`-%>` \u2014 Newline-Slurp Close",
    body: "Closes the EJS tag and removes the **newline** immediately after it. Keeps the rendered HTML compact."
  },
  {
    pattern: /^_%>/,
    title: "`_%>` \u2014 Whitespace-Slurp Close",
    body: "Closes the EJS tag and removes all **trailing whitespace** (including newline) after it."
  },
  {
    pattern: /^%>/,
    title: "`%>` \u2014 Close Tag",
    body: "Closes an EJS scriptlet or output tag."
  }
];
var ejsHoverProvider = {
  provideHover(document, position) {
    const text = document.getText();
    const offset = document.offsetAt(position);
    const blocks = scanEjsBlocks(text);
    for (const block of blocks) {
      const openEnd = block.start + block.openLen;
      if (offset >= block.start && offset < openEnd) {
        const tag = text.slice(block.start, openEnd);
        const doc = TAG_DOCS.find((d) => d.pattern.test(tag));
        if (doc) {
          return new vscode8.Hover(
            new vscode8.MarkdownString(`**${doc.title}**

${doc.body}`),
            new vscode8.Range(
              document.positionAt(block.start),
              document.positionAt(openEnd)
            )
          );
        }
      }
      const closeStart = block.end - block.closeLen;
      if (offset >= closeStart && offset < block.end) {
        const tag = text.slice(closeStart, block.end);
        const doc = TAG_DOCS.find((d) => d.pattern.test(tag));
        if (doc) {
          return new vscode8.Hover(
            new vscode8.MarkdownString(`**${doc.title}**

${doc.body}`),
            new vscode8.Range(
              document.positionAt(closeStart),
              document.positionAt(block.end)
            )
          );
        }
      }
    }
    return void 0;
  }
};

// src/diagnosticProvider.ts
var vscode9 = __toESM(require("vscode"));
var DEBOUNCE_MS = 600;
var timers = /* @__PURE__ */ new Map();
function createDiagnosticProvider(context) {
  const collection = vscode9.languages.createDiagnosticCollection("ejs-colorizer");
  context.subscriptions.push(collection);
  const schedule = (doc) => {
    if (doc.languageId !== "ejs") {
      return;
    }
    const key = doc.uri.toString();
    const existing = timers.get(key);
    if (existing !== void 0) {
      clearTimeout(existing);
    }
    timers.set(key, setTimeout(() => {
      timers.delete(key);
      updateDiagnostics(doc, collection);
    }, DEBOUNCE_MS));
  };
  for (const doc of vscode9.workspace.textDocuments) {
    if (doc.languageId === "ejs") {
      schedule(doc);
    }
  }
  context.subscriptions.push(vscode9.workspace.onDidOpenTextDocument(schedule));
  context.subscriptions.push(vscode9.workspace.onDidChangeTextDocument(({ document }) => schedule(document)));
  context.subscriptions.push(vscode9.workspace.onDidCloseTextDocument((doc) => {
    collection.delete(doc.uri);
    const key = doc.uri.toString();
    const t2 = timers.get(key);
    if (t2 !== void 0) {
      clearTimeout(t2);
      timers.delete(key);
    }
  }));
  return collection;
}
async function updateDiagnostics(document, collection) {
  const text = document.getText();
  const diagnostics = [];
  checkJsSyntax(text, document, diagnostics);
  await checkIncludes(text, document, diagnostics);
  checkBrokenEjsComments(text, document, diagnostics);
  collection.set(document.uri, diagnostics);
}
function checkJsSyntax(text, document, diagnostics) {
  const blocks = scanEjsBlocks(text);
  const fragments = [];
  for (const block of blocks) {
    if (block.type === "comment") {
      continue;
    }
    const contentStart = block.start + block.openLen;
    const contentEnd = block.end - block.closeLen;
    const code = text.slice(contentStart, contentEnd);
    if (code.trim().length === 0) {
      continue;
    }
    fragments.push({ code, docOffset: contentStart });
  }
  if (fragments.length === 0) {
    return;
  }
  const syntheticLines = [];
  syntheticLines.push({ docOffset: 0 });
  const parts = ["(function(){\n"];
  for (const frag of fragments) {
    const fragLines = frag.code.split("\n");
    let lineOffset = 0;
    for (let li = 0; li < fragLines.length; li++) {
      syntheticLines.push({ docOffset: frag.docOffset + lineOffset });
      lineOffset += fragLines[li].length + 1;
    }
    parts.push(frag.code);
    parts.push("\n;\n");
    syntheticLines.push({ docOffset: frag.docOffset + frag.code.length });
  }
  parts.push("})");
  const joined = parts.join("");
  const error = trySyntaxCheck(joined);
  if (!error) {
    return;
  }
  let errorDocOffset = 0;
  if (error.lineNumber !== void 0) {
    const synLine = error.lineNumber - 1;
    const entry = syntheticLines[Math.min(synLine, syntheticLines.length - 1)];
    errorDocOffset = entry?.docOffset ?? 0;
  } else {
    const firstMeaningful = fragments.find(
      (f) => f.code.trim().length > 1
    );
    errorDocOffset = firstMeaningful?.docOffset ?? fragments[0]?.docOffset ?? 0;
  }
  const errorPos = document.positionAt(errorDocOffset);
  const errorLine = document.lineAt(errorPos.line);
  const range = new vscode9.Range(
    new vscode9.Position(errorPos.line, errorLine.firstNonWhitespaceCharacterIndex),
    errorLine.range.end
  );
  const diag = new vscode9.Diagnostic(
    range,
    `EJS JS syntax error: ${error.message}`,
    vscode9.DiagnosticSeverity.Error
  );
  diag.source = "ejs-colorizer";
  diagnostics.push(diag);
}
function trySyntaxCheck(code) {
  try {
    new Function(code);
    return null;
  } catch (e) {
    if (e instanceof SyntaxError) {
      return {
        message: e.message,
        lineNumber: e.lineNumber
      };
    }
    return null;
  }
}
async function checkIncludes(text, document, diagnostics) {
  const includes = findIncludes(text, document.uri);
  await Promise.all(includes.map(async (inc) => {
    let exists = false;
    try {
      await vscode9.workspace.fs.stat(inc.resolvedUri);
      exists = true;
    } catch {
      exists = false;
    }
    if (!exists) {
      const pathStart = document.positionAt(inc.quoteStart + 1);
      const pathEnd = document.positionAt(inc.quoteEnd - 1);
      const diag = new vscode9.Diagnostic(
        new vscode9.Range(pathStart, pathEnd),
        `Cannot find EJS partial: '${inc.rawPath}'`,
        vscode9.DiagnosticSeverity.Warning
      );
      diag.source = "ejs-colorizer";
      diagnostics.push(diag);
    }
  }));
}
function checkBrokenEjsComments(text, document, diagnostics) {
  const blocks = scanEjsBlocks(text);
  for (const block of blocks) {
    if (block.type !== "comment") {
      continue;
    }
    const endPos = document.positionAt(block.end);
    const lineEnd = document.lineAt(endPos.line).range.end;
    const lineEndOffset = document.offsetAt(lineEnd);
    if (block.end >= lineEndOffset) {
      continue;
    }
    const afterText = text.slice(block.end, lineEndOffset);
    const closerIdx = afterText.indexOf("%>");
    const openerIdx = afterText.indexOf("<%");
    if (closerIdx < 0 || openerIdx >= 0 && openerIdx < closerIdx) {
      continue;
    }
    const orphanEnd = document.positionAt(block.end + closerIdx + 2);
    const range = new vscode9.Range(document.positionAt(block.start), orphanEnd);
    const diag = new vscode9.Diagnostic(
      range,
      "EJS comment terminates early: the `%>` inside closes the comment before the intended end. Lines containing EJS tags cannot be fully commented with `<%# %>`. Use `<% if (false) { %>` \u2026 `<% } %>` instead.",
      vscode9.DiagnosticSeverity.Warning
    );
    diag.source = "ejs-colorizer";
    diagnostics.push(diag);
  }
}

// src/documentSymbolProvider.ts
var vscode10 = __toESM(require("vscode"));
var CONTROL_FLOW_RE = /^\s*(if|else\s*if|else|for|forEach|while|switch|try|catch|finally)\b/;
var VAR_DECL_RE = /^\s*(const|let|var)\s+(\w+)/;
var INCLUDE_RE2 = /include\s*\(\s*['"]([^'"]+)['"]/;
function classifyBlock(block, jsContent) {
  const trimmed = jsContent.trim();
  if (!trimmed) {
    return null;
  }
  const includeMatch = INCLUDE_RE2.exec(trimmed);
  if (includeMatch) {
    return {
      name: `include('${includeMatch[1]}')`,
      detail: "",
      kind: vscode10.SymbolKind.File
    };
  }
  if (block.type === "output-escaped" || block.type === "output-unescaped") {
    const preview = trimmed.length > 40 ? trimmed.slice(0, 40) + "\u2026" : trimmed;
    const sigil = block.type === "output-escaped" ? "=" : "-";
    return {
      name: `<%${sigil} ${preview} %>`,
      detail: block.type === "output-escaped" ? "escaped output" : "unescaped output",
      kind: vscode10.SymbolKind.Variable
    };
  }
  const cfMatch = CONTROL_FLOW_RE.exec(trimmed);
  if (cfMatch) {
    const firstLine = trimmed.split("\n")[0].trim();
    const preview = firstLine.length > 60 ? firstLine.slice(0, 60) + "\u2026" : firstLine;
    return {
      name: preview,
      detail: cfMatch[1],
      kind: vscode10.SymbolKind.Event
    };
  }
  const varMatch = VAR_DECL_RE.exec(trimmed);
  if (varMatch) {
    return {
      name: varMatch[2],
      detail: varMatch[1],
      kind: vscode10.SymbolKind.Variable
    };
  }
  if (trimmed.length >= 3 && trimmed !== "};" && !/^\}/.test(trimmed)) {
    const preview = trimmed.split("\n")[0].trim();
    const short = preview.length > 50 ? preview.slice(0, 50) + "\u2026" : preview;
    return {
      name: short,
      detail: "scriptlet",
      kind: vscode10.SymbolKind.Module
    };
  }
  return null;
}
var ejsDocumentSymbolProvider = {
  provideDocumentSymbols(document) {
    const text = document.getText();
    const blocks = scanEjsBlocks(text);
    const symbols = [];
    for (const block of blocks) {
      if (block.type === "comment") {
        continue;
      }
      const contentStart = block.start + block.openLen;
      const contentEnd = block.end - block.closeLen;
      const jsContent = text.slice(contentStart, contentEnd);
      const spec = classifyBlock(block, jsContent);
      if (!spec) {
        continue;
      }
      const startPos = document.positionAt(block.start);
      const endPos = document.positionAt(block.end);
      const fullRange = new vscode10.Range(startPos, endPos);
      const selectionRange = new vscode10.Range(
        startPos,
        document.positionAt(block.start + block.openLen)
      );
      symbols.push(new vscode10.DocumentSymbol(
        spec.name,
        spec.detail,
        spec.kind,
        fullRange,
        selectionRange
      ));
    }
    return symbols;
  }
};

// src/formattingProvider.ts
var vscode11 = __toESM(require("vscode"));
var cp = __toESM(require("child_process"));
var fs = __toESM(require("fs"));
var path2 = __toESM(require("path"));
function workspaceRoot() {
  return vscode11.workspace.workspaceFolders?.[0]?.uri.fsPath;
}
function findPrettierBin() {
  const root = workspaceRoot();
  if (root) {
    const local = path2.join(root, "node_modules", ".bin", "prettier");
    if (fs.existsSync(local)) {
      return local;
    }
  }
  try {
    const result = cp.execSync("command -v prettier", { encoding: "utf8" }).trim();
    if (result) {
      return result;
    }
  } catch {
  }
  return void 0;
}
function hasEjsPlugin(root) {
  if (!root) {
    return false;
  }
  const pluginDir = path2.join(root, "node_modules", "@prettier", "plugin-ejs");
  return fs.existsSync(pluginDir);
}
function runPrettier(prettierBin, args, input, cwd) {
  return new Promise((resolve, reject) => {
    const child = cp.spawn(prettierBin, args, {
      cwd,
      stdio: ["pipe", "pipe", "pipe"]
    });
    const stdoutChunks = [];
    const stderrChunks = [];
    child.stdout.on("data", (chunk) => stdoutChunks.push(chunk));
    child.stderr.on("data", (chunk) => stderrChunks.push(chunk));
    child.on("close", (code) => {
      if (code === 0) {
        resolve(Buffer.concat(stdoutChunks).toString("utf8"));
      } else {
        reject(new Error(Buffer.concat(stderrChunks).toString("utf8") || `prettier exited with code ${code}`));
      }
    });
    child.on("error", reject);
    child.stdin.write(input, "utf8");
    child.stdin.end();
  });
}
var ejsFormattingProvider = {
  async provideDocumentFormattingEdits(document, options) {
    const prettierBin = findPrettierBin();
    if (!prettierBin) {
      void vscode11.window.showInformationMessage(
        "EJS Colorizer: Prettier not found. Install it in your project: `npm install --save-dev prettier @prettier/plugin-ejs`"
      );
      return [];
    }
    const root = workspaceRoot();
    const filePath = document.uri.fsPath;
    const text = document.getText();
    const tabWidth = String(options.tabSize);
    const useTabs = !options.insertSpaces ? "true" : "false";
    const args = [
      "--stdin-filepath",
      filePath,
      "--tab-width",
      tabWidth,
      "--use-tabs",
      useTabs
    ];
    if (hasEjsPlugin(root)) {
      args.push("--plugin", "@prettier/plugin-ejs");
    }
    try {
      const formatted = await runPrettier(prettierBin, args, text, root);
      if (formatted === text) {
        return [];
      }
      const fullRange = document.validateRange(
        new vscode11.Range(
          new vscode11.Position(0, 0),
          new vscode11.Position(document.lineCount, 0)
        )
      );
      return [vscode11.TextEdit.replace(fullRange, formatted)];
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      if (message.includes("No parser") || message.includes("plugin")) {
        void vscode11.window.showWarningMessage(
          "EJS Colorizer: Prettier could not format the file. Install `@prettier/plugin-ejs` for full EJS formatting support."
        );
      } else {
        void vscode11.window.showErrorMessage(
          `EJS Colorizer: Prettier error \u2014 ${message.split("\n")[0]}`
        );
      }
      return [];
    }
  }
};

// src/extension.ts
var EJS_SELECTOR = { language: "ejs" };
function activate(context) {
  context.subscriptions.push(
    vscode12.languages.registerDocumentSemanticTokensProvider(
      EJS_SELECTOR,
      ejsSemanticTokensProvider,
      LEGEND
    )
  );
  context.subscriptions.push(
    vscode12.languages.registerDocumentRangeSemanticTokensProvider(
      EJS_SELECTOR,
      ejsRangeSemanticTokensProvider,
      LEGEND
    )
  );
  context.subscriptions.push(
    vscode12.languages.registerFoldingRangeProvider(EJS_SELECTOR, {
      provideFoldingRanges
    })
  );
  context.subscriptions.push(
    vscode12.languages.registerCompletionItemProvider(
      EJS_SELECTOR,
      ejsCompletionProvider,
      "<",
      "%"
    )
  );
  context.subscriptions.push(
    vscode12.languages.registerCompletionItemProvider(
      EJS_SELECTOR,
      ejsIncludePathCompletionProvider,
      "'",
      '"',
      "/"
    )
  );
  context.subscriptions.push(
    vscode12.languages.registerDocumentLinkProvider(EJS_SELECTOR, ejsDocumentLinkProvider)
  );
  context.subscriptions.push(
    vscode12.languages.registerDefinitionProvider(EJS_SELECTOR, ejsDefinitionProvider)
  );
  context.subscriptions.push(
    vscode12.languages.registerHoverProvider(EJS_SELECTOR, ejsHoverProvider)
  );
  createDiagnosticProvider(context);
  context.subscriptions.push(
    vscode12.languages.registerDocumentSymbolProvider(
      EJS_SELECTOR,
      ejsDocumentSymbolProvider
    )
  );
  context.subscriptions.push(
    vscode12.languages.registerDocumentFormattingEditProvider(
      EJS_SELECTOR,
      ejsFormattingProvider
    )
  );
  context.subscriptions.push(
    vscode12.commands.registerTextEditorCommand(
      "ejsColorizer.toggleLineComment",
      (editor, edit) => {
        const doc = editor.document;
        const sel = editor.selection;
        const startLine = sel.start.line;
        const endLine = !sel.isEmpty && sel.end.character === 0 ? sel.end.line - 1 : sel.end.line;
        const lastLine = Math.max(startLine, endLine);
        const lineTexts = [];
        for (let i = startLine; i <= lastLine; i++) {
          lineTexts.push(doc.lineAt(i).text);
        }
        const allCommented = lineTexts.filter((t2) => t2.trim().length > 0).every((t2) => t2.trim().startsWith("<%#") && t2.trim().endsWith("%>"));
        for (let i = startLine; i <= lastLine; i++) {
          const line = doc.lineAt(i);
          const trimmed = line.text.trim();
          if (!trimmed) {
            continue;
          }
          const indent = line.text.substring(
            0,
            line.text.length - line.text.trimStart().length
          );
          if (allCommented) {
            const inner = trimmed.slice(3, -2).trim();
            edit.replace(line.range, `${indent}${inner}`);
          } else {
            edit.replace(line.range, `${indent}<%# ${trimmed} %>`);
          }
        }
      }
    )
  );
}
function deactivate() {
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  activate,
  deactivate
});
//# sourceMappingURL=extension.js.map
