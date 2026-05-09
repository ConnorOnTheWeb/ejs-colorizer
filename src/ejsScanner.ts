/**
 * ejsScanner.ts
 *
 * Scans a raw EJS document and returns the locations of all EJS blocks
 * (<%...%>, <%=...%>, <%-...%>, <%#...%>, <%_...%>).
 *
 * Also provides a helper to build a "placeholder document" where every EJS
 * block is replaced with the same number of space characters. This lets a
 * standard HTML parser operate on the file without being confused by EJS
 * syntax, while keeping all character offsets identical.
 */

export type EjsTagType =
  | 'comment'          // <%# ... %>
  | 'output-escaped'   // <%= ... %>
  | 'output-unescaped' // <%- ... %>
  | 'whitespace-slurp' // <%_ ... %>
  | 'scriptlet';       // <% ... %>

export interface EjsBlock {
  /** Tag type */
  type: EjsTagType;
  /** Start offset of `<` in document (inclusive) */
  start: number;
  /** End offset after `>` in document (exclusive) */
  end: number;
  /** Length of the opening delimiter: 2 for `<%`, 3 for `<%=` etc. */
  openLen: number;
  /** Length of the closing delimiter: 2 for `%>`, 3 for `-%>` or `_%>` */
  closeLen: number;
}

/**
 * Matches any EJS tag.
 * Group 1: opening marker (#, =, -, _, or empty)
 * Group 2: inner content (non-greedy)
 * Group 3: closing marker (- or _, or empty)
 */
const EJS_BLOCK_RE = /<%([#=\-_]?)([\s\S]*?)([-_])?%>/g;

export function scanEjsBlocks(text: string): EjsBlock[] {
  const blocks: EjsBlock[] = [];
  EJS_BLOCK_RE.lastIndex = 0;

  let match: RegExpExecArray | null;
  while ((match = EJS_BLOCK_RE.exec(text)) !== null) {
    const openMarker = match[1];   // '#' | '=' | '-' | '_' | ''
    const closeMarker = match[3];  // '-' | '_' | undefined

    const type: EjsTagType =
      openMarker === '#' ? 'comment' :
      openMarker === '=' ? 'output-escaped' :
      openMarker === '-' ? 'output-unescaped' :
      openMarker === '_' ? 'whitespace-slurp' :
      'scriptlet';

    const openLen = openMarker ? 3 : 2;       // <%x vs <%
    const closeLen = closeMarker ? 3 : 2;     // x%> vs %>

    blocks.push({
      type,
      start: match.index,
      end: match.index + match[0].length,
      openLen,
      closeLen,
    });
  }

  return blocks;
}

/**
 * Returns a copy of `text` where every EJS block is replaced by an equal
 * number of space characters. All character offsets are preserved.
 */
export function buildPlaceholderDoc(text: string, blocks: EjsBlock[]): string {
  if (blocks.length === 0) {
    return text;
  }

  const parts: string[] = [];
  let pos = 0;

  for (const block of blocks) {
    if (block.start > pos) {
      parts.push(text.slice(pos, block.start));
    }
    parts.push(' '.repeat(block.end - block.start));
    pos = block.end;
  }

  if (pos < text.length) {
    parts.push(text.slice(pos));
  }

  return parts.join('');
}
