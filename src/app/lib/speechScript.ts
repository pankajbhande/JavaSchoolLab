// Turns a topic's HTML content into a script for Robo Guru: many short pieces, each with the
// pause that should follow it, instead of one giant utterance read in a single breath.
//
//   heading   spoken a little slower and higher, with a longer pause after it
//   sentence  one sentence per piece, short pause
//   item      list items, numbered aloud ("First, ... Second, ...") when the list is short
//
// Code blocks are never read (braces and semicolons sound robotic).

export type SegmentKind = 'intro' | 'heading' | 'sentence' | 'item' | 'outro';

export interface SpeechSegment {
  text: string;
  /** Milliseconds of silence after this piece. */
  pause: number;
  kind: SegmentKind;
}

const ORDINALS = ['First', 'Second', 'Third', 'Fourth', 'Fifth', 'Sixth'];
const ABBREVIATIONS = /\b(e\.g|i\.e|vs|etc|approx|Mr|Mrs|Dr|No|Fig)\.$/i;
const MAX_PIECE = 200;

const PAUSE = { sentence: 320, paragraph: 700, heading: 650, item: 520, block: 950, intro: 800 };

function decode(text: string): string {
  return text
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, ' less than ')
    .replace(/&gt;/g, ' greater than ')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'");
}

/** Makes symbols that sound odd read aloud into plain words. */
function speakable(text: string): string {
  return text
    .replace(/&&/g, ' and ')
    .replace(/&/g, ' and ')
    .replace(/\|\|/g, ' or ')
    .replace(/\+\+/g, ' plus plus ')
    .replace(/--/g, ' minus minus ')
    .replace(/=>/g, ' arrow ')
    .replace(/[{}\[\]<>_*#`~^|\\]/g, ' ')
    .replace(/\(\)/g, '')
    .replace(/•/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function splitSentences(paragraph: string): string[] {
  const raw = paragraph.split(/(?<=[.!?])\s+(?=[A-Z0-9"'(])/);
  const merged: string[] = [];
  for (const part of raw) {
    const prev = merged[merged.length - 1];
    if (prev && (ABBREVIATIONS.test(prev) || prev.length < 18)) merged[merged.length - 1] = prev + ' ' + part;
    else merged.push(part);
  }
  // Very long sentences are broken at commas/semicolons so the voice can breathe.
  const out: string[] = [];
  for (const s of merged) {
    if (s.length <= MAX_PIECE) { out.push(s); continue; }
    let rest = s;
    while (rest.length > MAX_PIECE) {
      const cut = Math.max(rest.lastIndexOf(', ', MAX_PIECE), rest.lastIndexOf('; ', MAX_PIECE), rest.lastIndexOf(' - ', MAX_PIECE));
      const at = cut > 60 ? cut + 1 : rest.lastIndexOf(' ', MAX_PIECE);
      out.push(rest.slice(0, at).trim());
      rest = rest.slice(at).trim();
    }
    if (rest) out.push(rest);
  }
  return out.filter(Boolean);
}

type Line = { kind: 'H' | 'L' | 'P'; text: string };

function htmlToLines(html: string): Line[] {
  const marked = html
    .replace(/<pre[\s\S]*?<\/pre>/gi, '\n')
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<h[1-6][^>]*>/gi, '\n@@H@@')
    .replace(/<\/h[1-6]>/gi, '\n')
    .replace(/<li[^>]*>/gi, '\n@@L@@')
    .replace(/<\/li>/gi, '\n')
    .replace(/<\/(p|div|tr|ul|ol|table|blockquote)>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(td|th)>/gi, ', ')
    .replace(/<[^>]+>/g, ' ');

  const lines: Line[] = [];
  for (const rawLine of marked.split('\n')) {
    let kind: Line['kind'] = 'P';
    let body = rawLine;
    if (body.includes('@@H@@')) { kind = 'H'; body = body.replace(/@@H@@/g, ''); }
    else if (body.includes('@@L@@')) { kind = 'L'; body = body.replace(/@@L@@/g, ''); }
    const text = speakable(decode(body));
    if (text.length > 1 && /[A-Za-z0-9]/.test(text)) lines.push({ kind, text });
  }
  return lines;
}

/** Builds the script for one topic. `blocks` are the topic's HTML content strings, in order. */
export function buildSpeechScript(topicName: string, blocks: string[]): SpeechSegment[] {
  const script: SpeechSegment[] = [
    { text: `Hello! Let's learn about ${speakable(topicName)}.`, pause: PAUSE.intro, kind: 'intro' },
  ];

  blocks.forEach((html, blockIndex) => {
    const lines = htmlToLines(html || '');
    if (!lines.length) return;

    // A closing pause between blocks is added to the last piece of the previous block.
    if (blockIndex > 0 && script.length) script[script.length - 1].pause = Math.max(script[script.length - 1].pause, PAUSE.block);

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (line.kind === 'H') {
        const heading = line.text.replace(/^\d+[.)]\s*/, '').replace(/[.:]+$/, '');
        script.push({ text: heading + '.', pause: PAUSE.heading, kind: 'heading' });
        continue;
      }

      if (line.kind === 'L') {
        // Gather the whole list so it can be numbered.
        const items: string[] = [];
        while (i < lines.length && lines[i].kind === 'L') items.push(lines[i++].text);
        i--;
        const numbered = items.length >= 2 && items.length <= ORDINALS.length;
        items.forEach((item, n) => {
          const lead = numbered ? `${ORDINALS[n]}, ` : n === 0 ? '' : 'Next, ';
          const pieces = splitSentences(item);
          pieces.forEach((piece, p) => {
            script.push({
              text: (p === 0 ? lead : '') + piece,
              pause: p === pieces.length - 1 ? PAUSE.item : PAUSE.sentence,
              kind: 'item',
            });
          });
        });
        script[script.length - 1].pause = PAUSE.paragraph;
        continue;
      }

      const sentences = splitSentences(line.text);
      sentences.forEach((s, n) => {
        script.push({
          text: s,
          pause: n === sentences.length - 1 ? PAUSE.paragraph : PAUSE.sentence,
          kind: 'sentence',
        });
      });
    }
  });

  script.push({ text: `That's all for ${speakable(topicName)}. Happy learning!`, pause: 0, kind: 'outro' });
  return script;
}

/** Slight, repeatable variation so consecutive sentences do not sound identical. */
export function prosody(seg: SpeechSegment, index: number): { rate: number; pitch: number } {
  const wobble = ((index * 37) % 7) / 100; // 0.00 .. 0.06, deterministic
  switch (seg.kind) {
    case 'heading': return { rate: 0.86, pitch: 1.12 };
    case 'intro':
    case 'outro': return { rate: 0.9, pitch: 1.1 };
    case 'item': return { rate: 0.92, pitch: 1.0 + wobble / 2 };
    default: {
      const question = seg.text.trim().endsWith('?');
      return { rate: 0.92 - wobble / 3, pitch: (question ? 1.12 : 1.03) + wobble / 2 };
    }
  }
}
