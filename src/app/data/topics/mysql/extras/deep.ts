// Deep-dive sections for MySQL topics. Every topic gets five sections, each an explanation
// plus its own runnable code with output:
//   1 Internals: How It Works      (Basic tab)
//   2 Syntax Options & Variants    (Basic tab)
//   3 Common Mistakes & Fixes      (Expert tab)
//   4 Performance & Tuning         (Expert tab)
//   5 Real-World Scenario          (Expert tab)
// Keyed by the exact topic name in mysqlSyllabus.ts.

import type { ContentBlock, Topic } from '../../../types';

/** [explanation, code]; explanation is HTML, code ends with a `-- OUTPUT:` block. */
export type Sec = [text: string, code: string];

export interface Deep {
    internals: Sec;
    syntax: Sec;
    mistakes: Sec;
    perf: Sec;
    scenario: Sec;
}

/** Positional constructor to keep the data files compact. */
export const dv = (internals: Sec, syntax: Sec, mistakes: Sec, perf: Sec, scenario: Sec): Deep =>
    ({ internals, syntax, mistakes, perf, scenario });

const block = (title: string, level: 'h3' | 'h4', s: Sec): ContentBlock => ({
    content: `<${level}>${title}</${level}>\n${s[0]}`,
    codeExamples: [s[1]]
});

export function deepBeginner(d: Deep): ContentBlock[] {
    return [block('Deep Dive: Internals - How It Works', 'h4', d.internals),
        block('Deep Dive: Syntax Options &amp; Variants', 'h4', d.syntax)];
}

export function deepExpert(d: Deep): ContentBlock[] {
    return [block('Deep Dive: Common Mistakes &amp; Fixes', 'h3', d.mistakes),
        block('Deep Dive: Performance &amp; Tuning', 'h3', d.perf),
        block('Deep Dive: Real-World Scenario', 'h3', d.scenario)];
}

/** Returns a copy of `topic` with the deep-dive sections appended after its existing content. */
export function withDeep(topic: Topic, d: Deep | undefined): Topic {
    if (!d) return topic;
    return {
        ...topic,
        beginner: [...(topic.beginner ?? []), ...deepBeginner(d)],
        expert: [...(topic.expert ?? []), ...deepExpert(d)]
    };
}
