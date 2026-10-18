// Two kinds of table read badly in the content column, and both are really lists.
//
// 314 topics end with a Question/Answer table, and another ~120 carry a "label -> what it
// means" summary (Feature | Meaning, Command | Purpose, Step | What happens). In a column
// that also holds code blocks and diagrams, each cell wraps to three or four lines and the
// pairing gets hard to follow, so both are re-laid out line by line.
//
// Genuine side-by-side comparisons - HTTP vs HTTPS, catch vs finally, Servlet vs JSP - do
// need their columns and are left alone. The second header is what separates the two: a
// descriptive heading ("Meaning", "What It Does", "Allowed?") describes the first column,
// whereas a peer heading ("HTTPS") is a thing in its own right.
//
// This is a presentation transform over the topic's HTML; the source data is untouched.

const TABLE = /<table\b[^>]*>([\s\S]*?)<\/table>/gi;
const ROW = /<tr\b[^>]*>([\s\S]*?)<\/tr>/gi;
const TH = /<th\b[^>]*>([\s\S]*?)<\/th>/gi;
const CELL = /<td\b[^>]*>([\s\S]*?)<\/td>/gi;

const ANSWER = /^(short |brief |one-line )?answers?$/;

/** Second-column headings that describe the first column rather than stand beside it. */
const DESCRIBES = new Set([
  // interrogatives: "What It Does", "When it happens", "Why It's a Problem"
  'what', 'when', 'why', 'how', 'where', 'which', 'who',
  'description', 'purpose', 'meaning', 'impact', 'method', 'methods', 'example',
  'examples', 'explanation', 'responsibility', 'note', 'notes', 'effect', 'use',
  'used', 'uses', 'reads', 'reality', 'definition', 'focus', 'guidance', 'idea',
  'relationship', 'behavior', 'behaviour', 'detail', 'details', 'result', 'output',
  'returns', 'risk', 'complexity', 'modifiers', 'additions', 'delegates', 'brings',
  'thrown', 'leans', 'typical', 'possible', 'core', 'conceptual', 'implicit', 'key',
  'time', 'space', 'benefit', 'benefits', 'problem', 'solution', 'rule', 'value',
]);

function headerText(inner: string): string[] {
  return [...inner.matchAll(TH)]
    .map(m => m[1].replace(/<[^>]+>/g, '').replace(/&[a-z]+;/gi, ' ').trim().toLowerCase());
}

function describes(head: string): boolean {
  if (!head) return false;
  if (head.endsWith('?')) return true;            // "Allowed?", "Shared or Per-Thread?"
  return DESCRIBES.has(head.split(/[^a-z]+/)[0]);
}

/**
 * Locate the question and answer columns, or null if this is not a Q/A table.
 *
 * Most of these tables are two columns, but several Design Patterns topics carry a leading
 * "#" index column and title the third "Short Answer", so the columns are found by header
 * rather than assumed by position. A few title the first column "Trap" or "Question /
 * Scenario"; the answer column is the reliable half.
 */
function qaColumns(inner: string): { q: number; a: number } | null {
  const heads = headerText(inner);
  if (heads.length < 2 || heads.length > 3) return null;
  const a = heads.findIndex(h => ANSWER.test(h));
  if (a < 0) return null;
  let q = heads.findIndex(h => /^questions?\b/.test(h));
  if (q < 0 && heads.length === 2) q = 1 - a;     // "Trap | Answer"
  if (q < 0 || q === a) return null;
  return { q, a };
}

/** True when a two-column table is a "label -> what it means" summary. */
function isSummary(inner: string): boolean {
  const heads = headerText(inner);
  return heads.length === 2 && !!heads[0] && describes(heads[1]);
}

/** Body rows as cell arrays, header row dropped. */
function bodyRows(inner: string): string[][] {
  const rows: string[][] = [];
  for (const rowMatch of inner.matchAll(ROW)) {
    const row = rowMatch[1];
    if (/<th\b/i.test(row)) continue;
    rows.push([...row.matchAll(CELL)].map(c => c[1].trim()));
  }
  return rows;
}

/**
 * Rewrites Question/Answer tables and label/meaning summaries as stacked lists. Any other
 * table - the comparison grids that genuinely need their columns - is returned untouched.
 */
export function transformContentTables(html: string): string {
  if (!html || html.indexOf('<table') === -1) return html;

  return html.replace(TABLE, (whole, inner: string) => {
    const cols = qaColumns(inner);
    if (cols) {
      const items: string[] = [];
      for (const cells of bodyRows(inner)) {
        if (cells.length <= Math.max(cols.q, cols.a)) continue;
        const question = cells[cols.q];
        const answer = cells[cols.a];
        if (!question && !answer) continue;
        items.push(
          '<div class="jsl-qa-item">'
          + '<p class="jsl-qa-q">' + question + '</p>'
          + '<p class="jsl-qa-a">' + answer + '</p>'
          + '</div>',
        );
      }
      // A table we could not read is better left as a table than dropped.
      if (items.length) return '<div class="jsl-qa">' + items.join('') + '</div>';
      return whole;
    }

    if (isSummary(inner)) {
      const items: string[] = [];
      for (const cells of bodyRows(inner)) {
        if (cells.length < 2) continue;
        const term = cells[0];
        const detail = cells[1];
        if (!term || !detail) continue;
        items.push(
          '<div class="jsl-def-item">'
          + '<div class="jsl-def-t">' + term + '</div>'
          + '<div class="jsl-def-d">' + detail + '</div>'
          + '</div>',
        );
      }
      if (items.length) return '<div class="jsl-def">' + items.join('') + '</div>';
    }

    return whole;
  });
}
