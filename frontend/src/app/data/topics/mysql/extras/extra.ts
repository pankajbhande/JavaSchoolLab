// Level-wise extras for MySQL topics: fresher / mid / senior notes, graded interview Q&A,
// practice exercises and extra worked examples. Layered on top of the deep dive (see
// mysqlSyllabus.ts), keyed by the exact topic name.
//
// Basic tab : Fresher Notes, Worked Examples, Practice Exercises
// Expert tab: Mid-Level Notes, Senior Notes. The graded Q&A data (`qa`) is kept but no longer
// rendered in the lesson body: interview questions live in the right sidebar tab.

import type { ContentBlock, Topic } from '../../../types';

export { r } from '../../python/deepdive/deepDive';

export type Level = 'F' | 'M' | 'S';

/** [level, question, answer]; answers may contain inline <code>/<b>. */
export type QA = [level: Level, question: string, answer: string];
/** [text, code]; the code ends with a `-- OUTPUT:` block. */
export type Pair = [text: string, code: string];

export interface Extra {
    fresher: string[];
    mid: string[];
    senior: string[];
    qa: QA[];
    exercises: Pair[];
    examples: Pair[];
}

/** Positional constructor to keep the data files compact. */
export const x = (
    fresher: string[], mid: string[], senior: string[], qa: QA[], exercises: Pair[], examples: Pair[]
): Extra => ({ fresher, mid, senior, qa, exercises, examples });

const list = (items: string[]) => `<ul>\n${items.map(i => `<li>${i}</li>`).join('\n')}\n</ul>`;

const LEVEL_LABEL: Record<Level, string> = { F: 'Fresher level', M: 'Mid-level', S: 'Senior level' };

const qaHtml = (qa: QA[]) =>
    (['F', 'M', 'S'] as Level[])
        .map(l => {
            const rows = qa.filter(q => q[0] === l);
            if (!rows.length) return '';
            return `<h4>${LEVEL_LABEL[l]}</h4>\n` +
                rows.map(([, q, a]) => `<p><b>Q. ${q}</b><br/>${a}</p>`).join('\n');
        })
        .filter(Boolean)
        .join('\n');

export function extraBeginner(e: Extra): ContentBlock[] {
    const out: ContentBlock[] = [{ content: `<h4>Fresher Notes</h4>\n${list(e.fresher)}` }];
    e.examples.forEach(([text, code], i) =>
        out.push({ content: `<h4>Worked Example ${i + 1}</h4>\n${text}`, codeExamples: [code] }));
    e.exercises.forEach(([task, code], i) =>
        out.push({ content: `<h4>Practice Exercise ${i + 1}</h4>\n${task}`, codeExamples: [code] }));
    return out;
}

export function extraExpert(e: Extra): ContentBlock[] {
    return [
        { content: `<h3>Mid-Level Notes</h3>\n${list(e.mid)}` },
        { content: `<h3>Senior Notes</h3>\n${list(e.senior)}` }
    ];
}

/** Returns a copy of `topic` with the extras appended after its existing content. */
export function withExtras(topic: Topic, e: Extra | undefined): Topic {
    if (!e) return topic;
    return {
        ...topic,
        beginner: [...(topic.beginner ?? []), ...extraBeginner(e)],
        expert: [...(topic.expert ?? []), ...extraExpert(e)]
    };
}
