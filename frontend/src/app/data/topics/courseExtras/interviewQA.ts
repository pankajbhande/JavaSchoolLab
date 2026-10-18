// Pulls interview questions and answers out of a notes block so they can be shown in the right pane
// instead of the notes area. Handles the two shapes the topic data uses:
//   - a two-column table (Question | Answer)
//   - "<p><b>Q. question</b><br/>answer</p>" paragraphs
//   - numbered "<h4>1. question</h4>" headings followed by "Ans: ..." paragraphs or lists
//   - a plain <ol> of questions under an interview heading (no answers; stored with an empty answer)
// Whatever is not a question (summary tables, other headings) is returned as `rest` and stays in the notes.

export type QA = [question: string, answer: string];

const ENTITIES: Record<string, string> = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'", '&nbsp;': ' ' };

/** HTML to plain text for the sidebar, which renders strings as text. */
export function plain(html: string): string {
  return html
    .replace(/<br\s*\/?>|<\/?(?:p|li|ul|ol|div|h[1-6]|tr|td|th)\b[^>]*>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/&(?:amp|lt|gt|quot|#39|nbsp);/g, e => ENTITIES[e])
    .replace(/\s+/g, ' ')
    .trim();
}

const INTERVIEW_HEADING = /<h[1-6][^>]*>(?:(?!<\/h[1-6]>)[\s\S])*interview[\s\S]*?<\/h[1-6]>/gi;

export function splitInterview(html: string): { qa: QA[]; rest: string } {
  const qa: QA[] = [];
  let rest = html;

  // Question | Answer tables
  rest = rest.replace(/<table\b[\s\S]*?<\/table>/gi, table => {
    const rows = [...table.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)].map(m => m[1]);
    const head = rows[0]?.match(/<th\b[\s\S]*?<\/th>/gi) ?? [];
    if (head.length !== 2 || !/question|scenario|\bq\b/i.test(plain(head[0]))) return table;
    for (const row of rows.slice(1)) {
      const cells = [...row.matchAll(/<td\b[^>]*>([\s\S]*?)<\/td>/gi)].map(m => plain(m[1]));
      if (cells.length >= 2 && cells[0] && cells[1]) qa.push([cells[0], cells[1]]);
    }
    return '';
  });

  // <p><b>Q. question</b><br/>answer</p>
  rest = rest.replace(/<p><b>Q\.\s*([\s\S]*?)<\/b>\s*<br\s*\/?>([\s\S]*?)<\/p>/gi, (_m, q, a) => {
    const question = plain(q), answer = plain(a);
    if (question && answer) qa.push([question, answer]);
    return '';
  });

  // <li><strong>Q: question</strong> - answer</li>, then any list left empty
  rest = rest.replace(/<li>\s*<(?:strong|b)>\s*Q[:.]\s*([\s\S]*?)<\/(?:strong|b)>\s*(?:[—–-]|&mdash;|&ndash;)?\s*([\s\S]*?)<\/li>/gi, (_m, q, a) => {
    const question = plain(q), answer = plain(a);
    if (question && answer) qa.push([question, answer]);
    return '';
  }).replace(/<ul>\s*<\/ul>/gi, '');

  // <h4>1. question</h4> followed by its answer up to the next <h4> or the closing </div>
  rest = rest.replace(/<h4[^>]*>\s*\d+[.)]\s*([\s\S]*?)<\/h4>((?:(?!<h4|<\/div>)[\s\S])*)/gi, (_m, q, a) => {
    const question = plain(q);
    if (question) qa.push([question, plain(a).replace(/^Ans(?:wer)?\s*[:.-]\s*/i, '')]);
    return '';
  });

  // <h4>Important Interview Questions</h4><ol><li>question</li>...</ol>
  rest = rest.replace(/<h4[^>]*>[^<]*interview[^<]*<\/h4>\s*<ol>([\s\S]*?)<\/ol>/gi, (_m, items) => {
    for (const li of items.matchAll(/<li>([\s\S]*?)<\/li>/gi)) { const q = plain(li[1]); if (q) qa.push([q, '']); }
    return '';
  });

  // an interview heading with nothing left under it is dropped; text that remains is kept
  if (qa.length) rest = rest.replace(INTERVIEW_HEADING, '');
  const empty = plain(rest) === '';
  return { qa, rest: empty ? '' : rest.trim() };
}
