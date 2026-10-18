// Topic-scoped keypoints for the right sidebar.
//
// History, because each rule below exists for a reason found in review:
//
//  1. Keypoints were taken from course.cheatNotes and, when the keyword match failed,
//     the ENTIRE course list was returned. "Features of Java" showed sealed class,
//     permits, record and HttpClient. There is now no whole-course fallback at all.
//  2. Matching was unanchored substring: "text" matched inside "context", "cycle" inside
//     "lifecycle", "data" inside "database", so ServletContext landed on the text/html
//     topic and every servlet lifecycle topic received the same 13 notes. Matching is now
//     word-boundary and stem-aware.
//  3. A course-wide word ("pattern" in Design Patterns) matched nearly every note, so the
//     same generic notes appeared on all 23 topics. See genericTokens().
//  4. A note whose leading term is ANOTHER topic's title belongs to that topic.
//  5. Bolded prose is not automatically a concept: "globally", "every", "once", "new",
//     "What is a Database?" and whole sentences were all appearing as keypoint titles.

import type { Topic } from '../data/types';

export interface Keypoint {
  /** Bolded term, rendered as the card title. */
  term: string;
  /** Short explanation, rendered under it. May be empty. */
  detail: string;
}

const STOPWORDS = new Set([
  'in', 'of', 'and', 'the', 'a', 'an', 'to', 'is', 'for', 'with', 'between', 'difference',
  'java', 'what', 'how', 'why', 'interface', 'framework', 'using', 'introduction', 'basics',
  'vs', 'or', 'on', 'at', 'by', 'from', 'into', 'about', 'its', 'it',
]);

/** Crude singular/plural + gerund folding so "keys" matches "KEY" and "querying" matches "query". */
export function stem(word: string): string {
  const w = word.toLowerCase();
  if (w.length > 4 && w.endsWith('ies')) return w.slice(0, -3) + 'y';
  if (w.length > 4 && w.endsWith('es')) return w.slice(0, -2);
  if (w.length > 3 && w.endsWith('s') && !w.endsWith('ss')) return w.slice(0, -1);
  if (w.length > 5 && w.endsWith('ing')) return w.slice(0, -3);
  return w;
}

export function topicTokens(topicName: string): string[] {
  return topicName
    .toLowerCase()
    .split(/[^a-z0-9+#.]+/)
    .filter(w => w.length > 1 && !STOPWORDS.has(w))
    .map(stem);
}

/** Words of a cheat-note term, stemmed, for whole-word comparison. */
function termWords(term: string): Set<string> {
  return new Set(
    term.toLowerCase().split(/[^a-z0-9+#.]+/).filter(Boolean).map(stem),
  );
}

const dedupeKey = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, '');

const stripTags = (html: string) =>
  html.replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();

/** Trim list glyphs and trailing punctuation that make a term read as prose. */
export function normalizeTerm(text: string): string {
  return text
    .replace(/^[\u2022\u25cf\u25aa*\-\u2013\u2014\s]+/, '')
    .replace(/^\d+[.)]\s+/, '')
    .replace(/[\s:.;,\-\u2013\u2014]+$/, '')
    .trim();
}

/**
 * Tokens too common within a course to identify a topic.
 *
 * Two scales matter. In a small themed course every topic ends in "Pattern" (23/23), so a
 * proportional threshold catches it. In a 90-topic course a word like "class" appears in
 * only ~9% of titles yet still matches a dozen unrelated notes, so an absolute floor is
 * needed too.
 */
export function genericTokens(siblingTopicNames: string[]): Set<string> {
  const generic = new Set<string>();
  if (siblingTopicNames.length < 4) return generic;
  const freq = new Map<string, number>();
  for (const name of siblingTopicNames) {
    for (const tok of new Set(topicTokens(name))) freq.set(tok, (freq.get(tok) || 0) + 1);
  }
  const n = siblingTopicNames.length;
  for (const [tok, count] of freq) {
    if (count / n > 0.4 || (n >= 20 && count >= 4)) generic.add(tok);
  }
  return generic;
}

/**
 * Cheat notes that are really about this topic.
 *
 * A note qualifies only when the topic's tokens COVER most of the note's own term. That
 * coverage rule is what separates "Wrapper classes" (both words matched, belongs here)
 * from "abstract class" and "sealed class" (only the shared word "class" matched, belong
 * elsewhere) on the Wrapper Class topic.
 */
export function matchCheatNotes(
  cheatNotes: string[],
  topicName: string,
  generic: Set<string> = new Set(),
  siblingTopicNames: string[] = [],
): Keypoint[] {
  const all = topicTokens(topicName);
  const tokens = all.filter(t => !generic.has(t));
  // If the discount removed everything (e.g. "Introduction to Hibernate"), fall back to
  // the undiscounted tokens rather than showing the student nothing.
  const usable = tokens.length > 0 ? tokens : all;
  if (usable.length === 0) return [];

  const self = dedupeKey(topicName);
  const bare = (nm: string) => dedupeKey(nm.replace(/\s+pattern$/i, ''));
  const otherTopics = new Set(
    siblingTopicNames.map(bare).filter(k => k && k !== self && k !== bare(topicName)),
  );

  const seen = new Set<string>();
  const out: Keypoint[] = [];
  for (const note of cheatNotes) {
    const head = normalizeTerm(note.split(' - ')[0]);
    if (!head || head.length > 90) continue;
    // A note whose term is another topic's title belongs on that topic.
    if (otherTopics.has(dedupeKey(head))) continue;

    const words = [...termWords(head)].filter(w => !STOPWORDS.has(w));
    if (words.length === 0) continue;
    const hits = words.filter(w => usable.includes(w)).length;
    if (hits === 0 || hits / words.length < 0.6) continue;

    const key = dedupeKey(head);
    if (seen.has(key)) continue;   // the course lists some terms twice
    seen.add(key);
    out.push(toKeypoint(note));
  }
  return out;
}

function toKeypoint(note: string): Keypoint {
  const at = note.indexOf(' - ');
  return at < 0
    ? { term: normalizeTerm(note), detail: '' }
    : { term: normalizeTerm(note.slice(0, at)), detail: note.slice(at + 3).trim() };
}

/** Function words and bare literals authors bold for emphasis. Never a keypoint. */
const NON_CONCEPTS = new Set([
  'and', 'or', 'not', 'but', 'both', 'all', 'any', 'only', 'every', 'each', 'once', 'never',
  'always', 'same', 'other', 'more', 'less', 'most', 'least', 'new', 'old', 'true', 'false',
  'null', 'undefined', 'yes', 'no', 'up', 'down', 'in', 'out', 'into', 'onto', 'before',
  'after', 'first', 'last', 'next', 'one', 'two', 'three', 'multiple', 'single', 'optional',
  'required', 'default', 'result', 'type', 'value', 'state', 'shape', 'context', 'event',
  'must', 'can', 'will', 'should', 'this', 'that', 'these', 'those', 'it', 'its', 'user',
  'blocks', 'chained', 'combined', 'entire', 'together', 'fair', 'empty', 'equals',
  'implements', 'introduced', 'doubles', 'relational', 'primary', 'maximum', 'initial',
  'symptom', 'comparison', 'behavior', 'intent', 'operations', 'independent', 'transient',
  'today', 'now', 'later', 'earlier', 'currently', 'recently', 'previously', 'finally',
  'what', 'when', 'why', 'how', 'where', 'which', 'who', 'whose', 'step', 'note',
]);

/**
 * Section headings every topic repeats. Harvesting these put "Interview Questions" on all
 * 25 Programming Fundamentals topics and "Real-Life Example" on 21 of 23 Design Patterns
 * topics - boilerplate structure, not content.
 */
const SECTION_HEADINGS = new Set([
  'interview questions', 'interview question', 'real-life example', 'real life example',
  'real-world example', 'real world example', 'example', 'examples', 'key points',
  'keypoints', 'summary', 'conclusion', 'overview', 'introduction', 'definition',
  'advantages', 'disadvantages', 'pros and cons', 'benefits', 'drawbacks', 'limitations',
  'best practices', 'common mistakes', 'common pitfalls', 'pitfalls', 'anti-patterns',
  'when to use', 'how it works', 'why it matters', 'use cases', 'syntax', 'output',
  'code example', 'sample code', 'explanation', 'notes', 'note', 'points to remember',
  'one-line summary', 'one line summary', 'in short', 'quick recap', 'recap',
]);

/** Words that start a clause rather than a term. */
const CLAUSE_STARTERS = /^(without|within|when|while|because|since|during|through|across|unless|although|if|so|then|after|before|until|whether|which|where|how|why|what|does|is|are|was|were|has|have|the|a|an)\b/i;

/**
 * Is this bolded fragment a concept worth showing as a keypoint title?
 *
 * Authors bold for emphasis as often as for definition, so without this filter the panel
 * fills with "globally", "every", "What is a Database?", "// => Works Fine" and whole
 * sentences lifted mid-paragraph.
 */
export function isConceptTerm(raw: string): boolean {
  const text = raw.trim();
  if (!text) return false;
  if (text.endsWith('?')) return false;                 // FAQ / quiz headings
  if (/^\/\/|^\/\*|^#/.test(text)) return false;         // code comments
  if (/^\d/.test(text)) return false;                    // "1991 - The Green Project"
  if (!/[a-z]/i.test(text)) return false;

  const term = normalizeTerm(text);
  if (term.length < 2 || term.length > 48) return false;

  const words = term.split(/\s+/);
  if (words.length > 6) return false;                    // a sentence, not a term
  if (words.length > 1 && CLAUSE_STARTERS.test(term)) return false;

  const lower = term.toLowerCase();
  if (SECTION_HEADINGS.has(lower)) return false;
  if (/^(tip|warning|steps?|why|how)$/i.test(lower)) return false;
  if (words.length === 1) {
    if (NON_CONCEPTS.has(lower)) return false;
    if (/^[a-z]+ly$/.test(lower)) return false;          // globally, independently
    // Bare example identifiers (rs, stmt, s1), tested against the ORIGINAL casing:
    // a capitalised short word like "Oak" is a name, not a variable. A vowel-less short
    // lowercase word is an abbreviation, so "var" and "int" survive but "rs"/"stmt" do not.
    if (/^[a-z]{1,4}[0-9]*$/.test(term) && !/[aeiou]/.test(term)) return false;
    if (/^[a-z]{1,2}[0-9]+$/.test(term)) return false;
  }
  if (words.every(w => NON_CONCEPTS.has(w.toLowerCase()))) return false;
  return true;
}

/**
 * Key for collapsing near-identical terms.
 *
 * "SequencedCollection<E>" and "SequencedCollection", "PC (Program Counter) Register" and
 * "PC Register", "Configuration Server (Spring Cloud Config)" and "Configuration Server"
 * were each occupying two cards in a 24-slot panel.
 */
export function conceptKey(term: string): string {
  return term
    .replace(/<[^>]*>/g, '')
    .replace(/\([^)]*\)/g, '')
    .replace(/\s*\/.*$/, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '');
}

/**
 * True when the mark at `i` ends a sentence. A period between two digits is a decimal -
 * "Java 1.0 with the slogan" must not split into a detail that opens "0 with the slogan".
 */
const LEAD = /^[-:\s\u2013\u2014)\],;.]+/;
/** The dash or colon that separates a label from its explanation. */
const SEP = /^\s*[-:\u2013\u2014]+\s*/;

function isSentenceBreak(plain: string, i: number): boolean {
  const ch = plain[i];
  if (ch !== '.' && ch !== '?' && ch !== '!') return false;
  if (ch !== '.') return true;
  return !(/[0-9]/.test(plain[i - 1] || '') && /[0-9]/.test(plain[i + 1] || ''));
}

/** Index just past the last sentence break at or before `at`. */
function sentenceStart(plain: string, at: number): number {
  for (let i = Math.min(at, plain.length - 1); i > 0; i--) {
    if (isSentenceBreak(plain, i)) return i + 1;
  }
  return 0;
}

function sentenceEnd(plain: string, from: number): number {
  for (let i = from; i < plain.length; i++) {
    if (isSentenceBreak(plain, i)) return i;
  }
  return -1;
}

/** Details that are really code or config read as noise on a revision card. */
function looksLikeCode(s: string): boolean {
  if (/[{}]/.test(s)) return true;
  if (/[-*_=]{4,}/.test(s)) return true;                          // rules and box art
  const cells = s.replace(/\|\|/g, '').match(/[|]/g);              // not the OR operator
  if (cells && cells.length >= 3) return true;                    // a flattened table row
  const digits = (s.match(/[0-9]/g) || []).length;
  if (digits > (s.match(/[a-z]/gi) || []).length) return true;    // a row of figures
  return (s.match(/[A-Za-z_]+:\s/g) || []).length >= 3;             // YAML in prose
}

/** The first sentence mentioning `term` that reads as prose rather than as markup. */
function sentenceAround(plain: string, term: string): string {
  const hay = plain.toLowerCase();
  const needle = term.toLowerCase();
  for (let at = hay.indexOf(needle); at >= 0; at = hay.indexOf(needle, at + needle.length)) {
    const found = detailAt(plain, term, at);
    if (found) return found;
  }
  return '';
}

/** The sentence around one mention, or empty when that mention is not prose. */
function detailAt(plain: string, term: string, at: number): string {
  const stop = sentenceEnd(plain, at + term.length);
  const end = stop < 0 ? Math.min(plain.length, at + 160) : stop;
  let detail = plain.slice(sentenceStart(plain, at), end).trim();

  // Numbered list markers and the tail of an earlier parenthetical both survive the
  // strip to plain text: "1) break Statement...", "code) works) users) These...".
  detail = detail.replace(/^(?:[A-Za-z0-9-]{1,18}\)\s*)+/, '');

  // The sentence usually opens with the term itself, which the card already shows as
  // its title - leaving "Fan-out - - Fan-out - one message can be routed...". Drop the
  // echo, but not when a lowercase word is carrying the phrase on: the term "Divide"
  // against "Divide and Conquer is a strategy..." has to keep the words that follow.
  if (detail.toLowerCase().startsWith(term.toLowerCase())) {
    const after = detail.slice(term.length);
    const sep = SEP.exec(after);
    const rest = sep ? after.slice(sep[0].length) : after.replace(/^\s+/, '');
    // A separator proves the opening was a label. Without one, only drop the repeat
    // when no lowercase word is carrying the phrase on.
    if (sep || !/^[a-z]/.test(rest)) detail = rest;
  }
  detail = detail.replace(LEAD, '').trim();
  if (!detail) return '';        // the sentence was nothing but the title

  if (looksLikeCode(detail)) return '';
  return detail.length > 180 ? detail.slice(0, 177).trimEnd() + '…' : detail;
}

/** Terms the topic emphasises in its own body, paired with the sentence they sit in. */
export function extractKeyTerms(topic: Topic, courseName?: string | null): Keypoint[] {
  return harvest(topic, /<(?:strong|b)>([\s\S]*?)<\/(?:strong|b)>/gi, courseName);
}

/** Section headings, for topics that structure with <h3>/<h4> instead of bolding terms. */
export function extractHeadingTerms(topic: Topic, courseName?: string | null): Keypoint[] {
  return harvest(topic, /<h[34][^>]*>([\s\S]*?)<\/h[34]>/gi, courseName);
}

/** Inline identifiers, a last resort for syntax-led topics that emphasise nothing. */
export function extractCodeTerms(topic: Topic, courseName?: string | null): Keypoint[] {
  return harvest(topic, /<code>([\s\S]*?)<\/code>/gi, courseName);
}

function harvest(topic: Topic, pattern: RegExp, courseName?: string | null): Keypoint[] {
  const skip = new Set([conceptKey(topic.name), courseName ? conceptKey(courseName) : ''].filter(Boolean));
  const blocks = (['beginner', 'intermediate', 'expert'] as const)
    .flatMap(t => (topic[t] as { content?: string }[] | undefined) || []);
  const out: Keypoint[] = [];
  const seen = new Set<string>();

  for (const block of blocks) {
    const html = block.content || '';
    const plain = stripTags(html);
    for (const m of html.matchAll(pattern)) {
      const raw = stripTags(m[1]);
      if (!isConceptTerm(raw)) continue;
      const term = normalizeTerm(raw);
      const key = conceptKey(term);
      if (!key || seen.has(key) || skip.has(key)) continue;
      seen.add(key);
      out.push({ term, detail: sentenceAround(plain, term) });
    }
  }
  return out;
}

/**
 * Keypoints for the topic on screen, in descending order of authority: hand-written cheat
 * notes, then terms the topic emphasises, then its headings, then inline identifiers.
 * There is deliberately no whole-course fallback.
 */
export function buildKeypoints(
  topic: Topic | null,
  cheatNotes: string[],
  courseName?: string | null,
  siblingTopicNames: string[] = [],
  limit = 20,
): Keypoint[] {
  if (!topic) return [];

  const result: Keypoint[] = [];
  const seen = new Set<string>();
  const add = (items: Keypoint[]) => {
    for (const k of items) {
      const key = conceptKey(k.term);
      if (!key || seen.has(key)) continue;
      seen.add(key);
      result.push(k);
    }
  };

  add(matchCheatNotes(cheatNotes, topic.name, genericTokens(siblingTopicNames), siblingTopicNames));
  add(extractKeyTerms(topic, courseName));
  if (result.length < 10) add(extractHeadingTerms(topic, courseName));
  if (result.length < 10) add(extractCodeTerms(topic, courseName));
  return result.slice(0, limit);
}
