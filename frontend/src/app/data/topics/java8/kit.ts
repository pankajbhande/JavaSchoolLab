// Small helpers for the "Java 8 Complete" topics: each subtopic is a heading, one line of explanation and its own short program.
import type { ContentBlock, Topic } from '../../types';

/** [heading, explanation (HTML allowed), code]. The code is a fragment: put it inside main() unless it declares a class. */
export type Sub = [heading: string, text: string, code: string];

export const block = ([heading, text, code]: Sub): ContentBlock => ({
    content: `<h3>${heading}</h3>\n${text}<br>`,
    codeExamples: [code],
});

/** A group heading that introduces the subtopics that follow it (no code). */
export const group = (heading: string, text: string): ContentBlock => ({ content: `<h2>${heading}</h2>\n${text}<br>` });

export const topic = (id: string, name: string, blocks: ContentBlock[], qa: [string, string][] = []): Topic => ({
    id,
    name,
    beginner: blocks,
    interviewQA: qa.length ? qa : undefined,
});
