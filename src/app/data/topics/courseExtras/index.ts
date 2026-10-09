// Extra learning content for every course other than the original MySQL syllabus, keyed by topic id:
//   - Extra  (level notes, interview Q&A, exercises, worked examples)  -> ../mysql/extras/extra.ts
//   - Deep   (five deep-dive sections with code)                         -> ../mysql/extras/deep.ts
// Content is merged into each topic after its existing blocks, so existing content is never replaced.
// Explicit imports (not import.meta.glob) so Node-based scripts can load this too.

import type { Course } from '../../types';
import { withExtras, type Extra } from '../mysql/extras/extra';
import { withDeep, type Deep } from '../mysql/extras/deep';
import { hibernateExtras, hibernateDeep } from './hibernate';
import { jdbcExtras, jdbcDeep } from './jdbc';
import { angularExtras, angularDeep } from './angular';
import { javafxExtras, javafxDeep } from './javafx';
import { springCoreExtras, springCoreDeep } from './springcore';
import { javascript1Extras, javascript1Deep } from './javascript1';
import { javascript2Extras, javascript2Deep } from './javascript2';
import { react1Extras, react1Deep } from './react1';
import { react2Extras, react2Deep } from './react2';
import { collection1Extras, collection1Deep } from './collection1';
import { collection2Extras, collection2Deep } from './collection2';
import { java01Extras, java01Deep } from './java01';
import { java02Extras, java02Deep } from './java02';
import { java03Extras, java03Deep } from './java03';
import { java04Extras, java04Deep } from './java04';
import { java05Extras, java05Deep } from './java05';
import { java06Extras, java06Deep } from './java06';
import { java07Extras, java07Deep } from './java07';
import { java08Extras, java08Deep } from './java08';
import { java09Extras, java09Deep } from './java09';
import { java10Extras, java10Deep } from './java10';
import { java11Extras, java11Deep } from './java11';
import { java12Extras, java12Deep } from './java12';
import { jvm1Extras, jvm1Deep } from './jvm1';
import { jvm2Extras, jvm2Deep } from './jvm2';
import { jvm3Extras, jvm3Deep } from './jvm3';
import { jvm4Extras, jvm4Deep } from './jvm4';
import { jvm5Extras, jvm5Deep } from './jvm5';
import { jvm6Extras, jvm6Deep } from './jvm6';
import { jsp1Extras, jsp1Deep } from './jsp1';
import { jsp2Extras, jsp2Deep } from './jsp2';
import { jsp3Extras, jsp3Deep } from './jsp3';
import { jsp4Extras, jsp4Deep } from './jsp4';
import { jsp5Extras, jsp5Deep } from './jsp5';
import { jsp6Extras, jsp6Deep } from './jsp6';
import { jsp7Extras, jsp7Deep } from './jsp7';
import { springExtras, springDeep } from './springAll';
import { layoutTopic } from './javaLayout';
import { javaOverviewById } from './javaOverview';

export const courseExtrasById: Record<string, Extra> = Object.assign(
    {},
    hibernateExtras,
    jdbcExtras,
    angularExtras,
    javafxExtras,
    springCoreExtras,
    javascript1Extras,
    javascript2Extras,
    react1Extras,
    react2Extras,
    collection1Extras,
    collection2Extras,
    java01Extras,
    java02Extras,
    java03Extras,
    java04Extras,
    java05Extras,
    java06Extras,
    java07Extras,
    java08Extras,
    java09Extras,
    java10Extras,
    java11Extras,
    java12Extras,
    jvm1Extras,
    jvm2Extras,
    jvm3Extras,
    jvm4Extras,
    jvm5Extras,
    jvm6Extras,
    jsp1Extras,
    jsp2Extras,
    jsp3Extras,
    jsp4Extras,
    jsp5Extras,
    jsp6Extras,
    jsp7Extras,
    springExtras
);

export const courseDeepById: Record<string, Deep> = Object.assign(
    {},
    hibernateDeep,
    jdbcDeep,
    angularDeep,
    javafxDeep,
    springCoreDeep,
    javascript1Deep,
    javascript2Deep,
    react1Deep,
    react2Deep,
    collection1Deep,
    collection2Deep,
    java01Deep,
    java02Deep,
    java03Deep,
    java04Deep,
    java05Deep,
    java06Deep,
    java07Deep,
    java08Deep,
    java09Deep,
    java10Deep,
    java11Deep,
    java12Deep,
    jvm1Deep,
    jvm2Deep,
    jvm3Deep,
    jvm4Deep,
    jvm5Deep,
    jvm6Deep,
    jsp1Deep,
    jsp2Deep,
    jsp3Deep,
    jsp4Deep,
    jsp5Deep,
    jsp6Deep,
    jsp7Deep,
    springDeep
);

/** Returns the course with extras and deep dives merged into every topic that has them. */
export function applyCourseExtras<T extends Course>(course: T): T {
    type Tp = Course['subTopics'][number]['topics'][number];
    // Placeholder pages ("This topic is being written ...") are dropped once a topic has real extra content.
    const PLACEHOLDER = /This topic is being written/;
    const withoutPlaceholder = (t: Tp): Tp => courseExtrasById[t.id]
        ? { ...t, beginner: t.beginner?.filter(b => !PLACEHOLDER.test(b.content)), intermediate: t.intermediate?.filter(b => !PLACEHOLDER.test(b.content)), expert: t.expert?.filter(b => !PLACEHOLDER.test(b.content)) }
        : t;
    const merge = (t: Tp) => withDeep(withExtras(withoutPlaceholder(t), courseExtrasById[t.id]), courseDeepById[t.id]);
    // Core Java topics are re-arranged into the fixed 12-section learning flow (see javaLayout.ts).
    const build = course.id === 'java' ? (t: Parameters<typeof merge>[0]) => layoutTopic(merge(t), javaOverviewById[t.id]) : merge;
    return {
        ...course,
        subTopics: course.subTopics.map(m => ({
            ...m,
            topics: m.topics.map(build)
        }))
    };
}
