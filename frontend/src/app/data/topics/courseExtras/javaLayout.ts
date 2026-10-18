// Re-arranges every Core Java topic into one fixed learning flow:
//   1 Introduction  2 Need of This Topic  3 Advantages  4 Disadvantages  5 Why We Learn This Topic
//   6 Basic Concepts  7 Intermediate Concepts  8 Advanced Concepts  9 Code for Each Concept
//   10 Examples  11 Quick Revision (interview questions are shown in the right pane, not in the notes)
// Existing blocks (original content, extras and deep dives) are classified by tab and heading and
// moved into the matching section; nothing is dropped. Sections 1-6 go to the Basic tab and
// sections 7-12 to the Expert tab, so reading order across the two tabs is 1 to 12.

import type { ContentBlock, Topic } from '../../types';
import { splitInterview, type QA } from './interviewQA';
import { highlight, MARK } from '../../../lib/highlight';

/** Short authored overview for one topic (sections 1-5 and 12). */
export interface Overview {
    intro: string;
    need: string;
    adv: string[];
    dis: string[];
    why: string[];
    revision: string[];
}

/** Positional constructor to keep the data files compact. */
export const o = (intro: string, need: string, adv: string[], dis: string[], why: string[], revision: string[]): Overview =>
    ({ intro, need, adv, dis, why, revision });

/** Bolds a short lead label ("Secure: ...") so each point can be scanned by its label. */
const boldLabel = (i: string) => i.replace(/^([^:<.,]{2,50}?):(?=\s)/, '<strong>$1:</strong>');

const list = (items: string[]) => `<ul>\n${items.map(i => `<li>${boldLabel(i)}</li>`).join('\n')}\n</ul>`;

const SECTION_TITLES: Record<number, string> = {
    1: 'Introduction',
    2: 'Need of This Topic',
    3: 'Advantages',
    4: 'Disadvantages',
    5: 'Why We Learn This Topic',
    6: 'Basic Concepts',
    7: 'Intermediate Concepts',
    8: 'Advanced Concepts',
    9: 'Code for Each Concept',
    10: 'Examples',
    11: 'Interview Questions',
    12: 'Quick Revision'
};

const INTERVIEW_HEADING = /<h[2-6][^>]*>[^<]*interview[^<]*<\/h[2-6]>/i;

/** Section 11. Its questions are shown in the right pane, so the notes skip it and Quick Revision becomes 11. */
const INTERVIEW_SECTION = 11;

const firstHeading = (html: string): string => {
    const m = html.match(/<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>/);
    return (m ? m[1] : '').replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').trim();
};

const retitle = (b: ContentBlock, title: string): ContentBlock => ({
    ...b,
    content: b.content.replace(/<h[1-6][^>]*>[\s\S]*?<\/h[1-6]>/, `<h3>${title}</h3>`)
});

interface Placed { section: number; order: number; block: ContentBlock; }

function classify(tab: 'beginner' | 'intermediate' | 'expert', block: ContentBlock): Placed {
    const h = firstHeading(block.content);
    const tabSection = tab === 'beginner' ? 6 : tab === 'intermediate' ? 7 : 8;
    let section = tabSection, order = 5, b = block;

    if (/^Introduction$/i.test(h) || /^\d+\.\s*Definition/i.test(h)) { section = 1; order = 5; }
    else if (/^\d+\.\s*(Purpose|Need)/i.test(h)) { section = 2; order = 5; }
    else if (/^\d+\.\s*Advantages/i.test(h)) { section = 3; order = 5; }
    else if (/^\d+\.\s*Disadvantages/i.test(h)) { section = 4; order = 5; }
    else if (/^\d+\.\s*Real Time Examples/i.test(h)) { section = 10; order = 1; }
    else if (/^Fresher Notes$/i.test(h)) { section = 6; order = 9; }
    else if (/^Mid-Level Notes$/i.test(h)) { section = 7; order = 9; }
    else if (/^Senior Notes$/i.test(h)) { section = 8; order = 9; }
    else if (/^Worked Example/i.test(h)) { section = 10; order = 2; }
    else if (/^Practice Exercise/i.test(h)) { section = 10; order = 3; }
    else if (/^Deep Dive: Syntax/i.test(h)) { section = 9; order = 1; b = retitle(block, 'Basic Code: Syntax Options &amp; Variants'); }
    else if (/^Deep Dive: Internals/i.test(h)) { section = 9; order = 2; b = retitle(block, 'Intermediate Code: How It Works Internally'); }
    else if (/^Deep Dive: Common Mistakes/i.test(h)) { section = 9; order = 3; b = retitle(block, 'Advanced Code: Common Mistakes &amp; Fixes'); }
    else if (/^Deep Dive: Performance/i.test(h)) { section = 9; order = 4; b = retitle(block, 'Advanced Code: Performance &amp; Tuning'); }
    else if (/^Deep Dive: Real-World/i.test(h)) { section = 9; order = 5; b = retitle(block, 'Advanced Code: Real-World Scenario'); }
    else if (/interview/i.test(h)) { section = INTERVIEW_SECTION; order = 1; }
    // original template blocks carry their own "1. Definition" style numbers; drop them so they do not clash with section numbers
    if (section <= 5 || (section === 10 && /^\d+\./.test(h))) b = retitle(b, h.replace(/^\d+\.\s*/, ''));
    return { section, order, block: b };
}

// highlight() lives in lib/highlight.ts (it is not course data); re-exported so existing importers keep working.
export { highlight };

/** Key terms highlighted in the overview points. */
const KEY_TERMS = new RegExp('\\b(?:' + [
    'threads?', 'locks?', 'monitor', 'race conditions?', 'deadlock', 'volatile', 'synchroni[sz]\\w*', 'atomic\\w*', 'visibility', 'heap', 'stack', 'metaspace',
    'bytecode', 'JVM', 'JIT', 'JDK', 'JRE', 'garbage collect\\w*', 'immutable', 'thread-safe', 'references?', 'objects?', 'class(?:es)?', 'interfaces?', 'abstract',
    'exceptions?', 'null', 'compile[- ]time', 'run[- ]time', 'hash ?codes?', 'buckets?', 'override\\w*', 'overload\\w*', 'inherit\\w*', 'polymorphi\\w*', 'encapsulat\\w*',
    'memory', 'cache[sd]?', 'pools?', 'streams?', 'lambdas?', 'generics?', 'erasure', 'constructors?', 'static', 'final', 'private', 'public', 'protected', 'collections?',
    'serializ\\w*', 'reflection', 'annotations?', 'enums?', 'records?', 'sealed', 'virtual threads?', 'pattern matching', 'switch', 'optional', 'checked', 'unchecked'
].join('|') + ')\\b', 'gi');

/** Splits prose into one point per sentence and highlights the key terms in each. */
function bulletize(text: string): string {
    const points = text
        .split(/(?<=[.;])\s+(?=[A-Za-z<(])/)
        .map(p => p.trim().replace(/[;]$/, ''))
        .filter(p => p.length > 2)
        .map(p => p.charAt(0).toUpperCase() + p.slice(1));
    const mark = (s: string) => highlight(s).split(/(<[^>]+>)/).map((p, i, arr) => {
        if (p.startsWith('<')) return p;
        const before = arr.slice(0, i).join('');
        if ((before.match(/<mark/g) ?? []).length > (before.match(/<\/mark>/g) ?? []).length) return p;
        return p.replace(KEY_TERMS, t => `${MARK}${t}</mark>`);
    }).join('');
    return list(points.map(mark));
}

// a line that opens a block element, or is a closing block tag, is kept as is (never wrapped in <p>)
const BLOCK_START = /^(<(p|h[1-6]|div|img|ul|ol|table|pre|li|section|blockquote)\b|<\/(div|p|ul|ol|li|table|pre|section|blockquote|h[1-6])>)/i;
const BULLET = /^(?:•|â€¢|&bull;|-)\s+([\s\S]*)$/;
const NUMBERED = /^(\d+)[.)]\s+([\s\S]*)$/;

/**
 * Converts "• text <br>" and "1) text <br>" runs into real <ul>/<ol> lists and loose text into paragraphs,
 * so every point is on its own aligned line (the theme styles lists with a hanging indent).
 * Existing lists, tables and <pre> diagrams are left untouched.
 */
export function pointwise(html: string): string {
    const keep: string[] = [];
    const guarded = html.replace(/<(pre|table|ul|ol)\b[\s\S]*?<\/\1>/gi, m => { keep.push(m); return `\n@@KEEP${keep.length - 1}@@\n`; });
    const lines = guarded.split(/<br\s*\/?>|\n/i).map(l => l.trim()).filter(Boolean);
    const out: string[] = [];
    let mode: 'ul' | 'ol' | null = null;
    const close = () => { if (mode) { out.push(`</${mode}>`); mode = null; } };
    for (const line of lines) {
        const b = line.match(BULLET), n = line.match(NUMBERED);
        if (b && !BLOCK_START.test(line)) { if (mode !== 'ul') { close(); out.push('<ul>'); mode = 'ul'; } out.push(`<li>${b[1].trim()}</li>`); }
        else if (n && !BLOCK_START.test(line)) { if (mode !== 'ol') { close(); out.push('<ol>'); mode = 'ol'; } out.push(`<li>${n[2].trim()}</li>`); }
        else { close(); out.push(BLOCK_START.test(line) || /^@@KEEP\d+@@$/.test(line) ? line : `<p>${line}</p>`); }
    }
    close();
    return out.join('\n').replace(/@@KEEP(\d+)@@/g, (_m, i) => keep[Number(i)]);
}

/** Builds the 12-section layout for one topic. */
export function layoutTopic(topic: Topic, ov: Overview | undefined): Topic {
    const placed: Placed[] = [];
    const interview: QA[] = [];
    (['beginner', 'intermediate', 'expert'] as const).forEach(tab =>
        (topic[tab] ?? []).forEach((original, i) => {
            // an interview heading in the middle of a block: its questions go to the right pane, the text above stays put
            let block = original;
            const at = original.content.search(INTERVIEW_HEADING);
            if (at > 0) {
                const { qa, rest } = splitInterview(original.content.slice(at));
                interview.push(...qa);
                block = { ...original, content: original.content.slice(0, at) + rest };
            }
            const p = classify(tab, block);
            if (p.section <= 5) {
                // The text of the original Definition/Purpose/Need/Advantages/Disadvantages blocks is merged into the
                // authored overview (javaOverview); only their code samples are kept, under section 9.
                if (p.block.codeExamples?.length) {
                    const title = firstHeading(p.block.content);
                    placed.push({
                        section: 9, order: 500 + i + (tab === 'beginner' ? 0 : 300),
                        block: { content: `<h3>Code: ${title}</h3>`, codeExamples: p.block.codeExamples, codeExplanations: p.block.codeExplanations }
                    });
                }
                return;
            }
            if (p.section === INTERVIEW_SECTION) {
                // questions go to the right pane; anything else in the block (e.g. a summary table) stays in the notes, under Examples
                const { qa, rest } = splitInterview(p.block.content);
                interview.push(...qa);
                if (rest || p.block.codeExamples?.length) placed.push({ section: 10, order: 4000 + i, block: { ...p.block, content: rest } });
                return;
            }
            // keep original relative order inside a section: tab first, then position
            placed.push({ ...p, order: p.order * 1000 + (tab === 'beginner' ? 0 : tab === 'intermediate' ? 300 : 600) + i });
        }));

    const bySection = (n: number) => placed.filter(p => p.section === n).sort((a, b) => a.order - b.order).map(p => p.block);

    const fixed: Record<number, ContentBlock[]> = {};
    if (ov) {
        fixed[1] = [{ content: bulletize(ov.intro) }];
        fixed[2] = [{ content: bulletize(ov.need) }];
        fixed[3] = [{ content: list(ov.adv) }];
        fixed[4] = [{ content: list(ov.dis) }];
        fixed[5] = [{ content: list(ov.why) }];
        fixed[12] = [{ content: list(ov.revision) }];
    }

    const sections = (from: number, to: number): ContentBlock[] => {
        const out: ContentBlock[] = [];
        for (let n = from; n <= to; n++) {
            if (n === INTERVIEW_SECTION) continue; // interview questions live in the right pane, not in the notes
            const blocks = [...(fixed[n] ?? []), ...bySection(n)].map(b => ({ ...b, content: pointwise(b.content) }));
            if (!blocks.length) continue;
            // the section heading lives inside its first block so it shares one card (no orphaned heading)
            const head = `<h2>${n > INTERVIEW_SECTION ? n - 1 : n}. ${SECTION_TITLES[n]}</h2>`;
            out.push({ ...blocks[0], content: head + '\n' + blocks[0].content }, ...blocks.slice(1));
        }
        return out;
    };

    return { ...topic, beginner: sections(1, 6), intermediate: [], expert: sections(7, 12), ...(interview.length ? { interviewQA: interview } : {}) };
}
