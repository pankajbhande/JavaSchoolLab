// "Land on the point": after someone picks a lesson-text search result, the topic opens scrolled to the passage that matched, with the
// matching words highlighted.
//
// The highlight uses the browser's CSS Custom Highlight API, so the lesson's own HTML is never touched (wrapping words in new elements
// inside React-rendered content would fight React). Where that API does not exist, the page still scrolls to the passage.

export interface Match { start: number; end: number }

/** The words worth finding: two letters or more, lowercase, no repeats. */
export function searchTerms(query: string): string[] {
  return Array.from(new Set(query.toLowerCase().split(/\s+/).filter(t => t.length >= 2)));
}

/**
 * Every place in `text` where a search word occurs (at most `cap`), in reading order. If the whole phrase occurs, only its occurrences are
 * returned: "hashmap collision" should land on the sentence that has both words, not on the first stray "collision".
 */
export function findMatches(text: string, query: string, cap = 80): Match[] {
  const hay = text.toLowerCase();
  const phrase = query.trim().toLowerCase().replace(/\s+/g, ' ');
  const spots = (needle: string): Match[] => {
    const out: Match[] = [];
    if (!needle) return out;
    let at = hay.indexOf(needle);
    while (at >= 0 && out.length < cap) { out.push({ start: at, end: at + needle.length }); at = hay.indexOf(needle, at + needle.length); }
    return out;
  };
  const whole = phrase.includes(' ') ? spots(phrase) : [];
  if (whole.length) return whole;
  return searchTerms(query).flatMap(t => spots(t)).sort((a, b) => a.start - b.start).slice(0, cap);
}

const NAME = 'jsl-find';

export function clearFindHighlight(): void {
  try { (CSS as unknown as { highlights?: Map<string, unknown> }).highlights?.delete(NAME); } catch { /* not supported */ }
}

/** Highlights the matches inside `root` and returns the element holding the first one, or null when nothing matched. */
export function highlightInPage(root: HTMLElement, query: string): HTMLElement | null {
  clearFindHighlight();
  const nodes: { node: Text; offset: number }[] = [];
  let text = '';
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode: n => (n.parentElement && /^(SCRIPT|STYLE|NOSCRIPT)$/.test(n.parentElement.tagName)) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT,
  });
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    nodes.push({ node: n as Text, offset: text.length });
    text += (n as Text).data;
  }
  const matches = findMatches(text, query);
  if (!matches.length) return null;

  const locate = (pos: number) => {
    for (let i = nodes.length - 1; i >= 0; i--) if (nodes[i].offset <= pos) return { node: nodes[i].node, at: pos - nodes[i].offset };
    return null;
  };
  const ranges: Range[] = [];
  for (const m of matches) {
    const a = locate(m.start); const b = locate(m.end - 1);
    if (!a || !b) continue;
    const r = document.createRange();
    r.setStart(a.node, Math.min(a.at, a.node.length));
    r.setEnd(b.node, Math.min(b.at + 1, b.node.length));
    ranges.push(r);
  }
  const H = (window as unknown as { Highlight?: new (...r: Range[]) => unknown }).Highlight;
  const registry = (CSS as unknown as { highlights?: Map<string, unknown> }).highlights;
  if (H && registry && ranges.length) registry.set(NAME, new H(...ranges));
  return ranges[0]?.startContainer.parentElement ?? null;
}
