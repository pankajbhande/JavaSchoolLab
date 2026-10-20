// Merges extras and deep dives into a course. Kept free of the (large) extras data files so a
// lazily loaded course can pass in only the extras that belong to it; see courseLoader.ts.

import { commentJava } from './commentJava';
import type { Course } from '../../types';
import { withExtras, type Extra } from '../mysql/extras/extra';
import { withDeep, type Deep } from '../mysql/extras/deep';
import { layoutTopic, type Overview } from './javaLayout';

export interface ExtrasContext {
    extras: Record<string, Extra>;
    deep: Record<string, Deep>;
    /** Core Java overviews, keyed by topic id. Only used for the `java` course. */
    overviews: Record<string, Overview>;
}

/** Returns the course with extras and deep dives merged into every topic that has them. */
type Block = NonNullable<Course['subTopics'][number]['topics'][number]['beginner']>[number];
const commentBlocks = (blocks: Block[] | undefined): Block[] | undefined =>
    blocks?.map(b => (b.codeExamples?.length ? { ...b, codeExamples: b.codeExamples.map(commentJava) } : b));
const withCommentedCode = (t: Course['subTopics'][number]['topics'][number]) => ({
    ...t,
    beginner: commentBlocks(t.beginner),
    intermediate: commentBlocks(t.intermediate),
    expert: commentBlocks(t.expert),
});

export function applyExtrasWith<T extends Course>(course: T, ctx: ExtrasContext): T {
    type Tp = Course['subTopics'][number]['topics'][number];
    // Placeholder pages ("This topic is being written ...") are dropped once a topic has real extra content.
    const PLACEHOLDER = /This topic is being written/;
    const withoutPlaceholder = (t: Tp): Tp => ctx.extras[t.id]
        ? { ...t, beginner: t.beginner?.filter(b => !PLACEHOLDER.test(b.content)), intermediate: t.intermediate?.filter(b => !PLACEHOLDER.test(b.content)), expert: t.expert?.filter(b => !PLACEHOLDER.test(b.content)) }
        : t;
    // Topics that deliberately stop after the basics: no Mid/Senior notes, deep dives, code sections, examples or revision.
    const BASIC_ONLY = new Set(['feautures of java']);
    const merged = (t: Tp) => withDeep(withExtras(withoutPlaceholder(t), ctx.extras[t.id]), ctx.deep[t.id]);
    const merge = (t: Tp): Tp => BASIC_ONLY.has(t.id) ? { ...merged(t), intermediate: [], expert: [] } : merged(t);
    const basicOnly = (t: Tp): Tp => BASIC_ONLY.has(t.id) ? { ...t, intermediate: [], expert: [] } : t;
    // Core Java topics are re-arranged into the fixed 12-section learning flow (see javaLayout.ts).
    const build = course.id === 'java' ? (t: Tp) => basicOnly(layoutTopic(merge(t), ctx.overviews[t.id])) : merge;
    // Collection Framework: every Java sample is formatted and commented line by line (see commentJava.ts).
    const finish = course.id === 'collection' ? (t: Tp): Tp => withCommentedCode(build(t)) : build;
    return {
        ...course,
        subTopics: course.subTopics.map(m => ({
            ...m,
            topics: m.topics.map(finish)
        }))
    };
}
