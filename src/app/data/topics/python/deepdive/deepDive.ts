// Uniform "deep dive" layer for every Python topic.
//
// Every topic in the Python course gets the same nine-part treatment, so a beginner and an
// architect can read the same page at different depths:
//   Introduction, Need, Real-time Use, Advantages, Disadvantages, Limitations, Diagram,
//   plus commented code with its OUTPUT under every point.
//
// Entries are keyed by the exact topic name used in pythonModules.ts. Beginner tab gets the
// "what / why / where" half and the diagram; Expert tab gets the trade-off half and the
// architect notes. Prose is HTML (inline <code>/<b> allowed); code is plain Python written
// with String.raw so backslashes survive.

import type { ContentBlock, Topic } from '../../../types';

/** A point = short prose + a commented code sample that ends with a `# OUTPUT:` block. */
export type Point = [text: string, code: string];

export interface DeepDive {
    intro: Point;
    need: Point;
    realTime: Point;
    pros: Point;
    cons: Point;
    limits: Point;
    /** ASCII diagram; rendered in a <pre> block. */
    diagram: string;
    /** Architect-level guidance (design decisions, trade-offs, when NOT to use). */
    arch: string;
}

/** Tag for Python source: keeps `\n`, `\d` etc. literal. */
export const r = String.raw;

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const block = (title: string, level: 'h4' | 'h3', p: Point): ContentBlock => ({
    content: `<${level}>${title}</${level}>\n${p[0]}`,
    codeExamples: [p[1]]
});

const diagramBlock = (d: string): ContentBlock => ({
    content: `<h4>Diagram</h4>\n<pre style="background:#12121c;color:#cdd6f4;padding:14px;border-radius:8px;overflow-x:auto;line-height:1.35;font-size:12.5px;border:1px solid #374151">${esc(d)}</pre>`
});

export function deepBeginner(d: DeepDive): ContentBlock[] {
    return [
        block('Introduction', 'h4', d.intro),
        block('Why Do We Need This?', 'h4', d.need),
        block('Real-Time Use', 'h4', d.realTime),
        diagramBlock(d.diagram)
    ];
}

export function deepExpert(d: DeepDive): ContentBlock[] {
    return [
        block('Advantages', 'h3', d.pros),
        block('Disadvantages', 'h3', d.cons),
        block('Limitations', 'h3', d.limits),
        { content: `<h3>Architect's Notes</h3>\n${d.arch}` }
    ];
}

/** Marks a placeholder topic so deep content can replace its "coming soon" body. */
const isPlaceholder = (t: Topic) =>
    (t.beginner?.length ?? 0) === 1 && (t.beginner![0].content ?? '').includes('coming soon');

/**
 * Returns a copy of `topic` with the deep dive attached. Placeholder topics lose their
 * "coming soon" block; topics with hand-written content keep it and gain the deep dive after it.
 */
export function withDeepDive(topic: Topic, d: DeepDive | undefined): Topic {
    if (!d) return topic;
    const drop = isPlaceholder(topic);
    return {
        ...topic,
        beginner: [...(drop ? [] : topic.beginner ?? []), ...deepBeginner(d)],
        expert: [...(topic.expert ?? []), ...deepExpert(d)]
    };
}

/** Positional constructor to keep module data files compact. */
export const dd = (
    intro: Point, need: Point, realTime: Point, pros: Point, cons: Point, limits: Point, diagram: string, arch: string
): DeepDive => ({ intro, need, realTime, pros, cons, limits, diagram, arch });
