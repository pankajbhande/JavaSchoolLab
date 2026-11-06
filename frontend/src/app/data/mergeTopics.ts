import type { ContentBlock, Topic } from './types';

/**
 * Combines several short topics into one chapter without rewriting any of their content.
 * Each source topic's blocks are kept in order, and the first block of every part gets a heading with
 * the original topic name so the reader can still find it. The merged chapter keeps the id of the first
 * topic, so progress already saved against that id carries over.
 */
export function mergeTopics(name: string, parts: Topic[]): Topic {
  const level = (pick: (t: Topic) => ContentBlock[] | undefined, suffix: string): ContentBlock[] | undefined => {
    const out: ContentBlock[] = [];
    for (const part of parts) {
      const blocks = pick(part);
      if (!blocks?.length) continue;
      const [first, ...rest] = blocks;
      out.push({ ...first, content: `<h2>${part.name}${suffix}</h2>\n${first.content}` }, ...rest);
    }
    return out.length ? out : undefined;
  };
  const qa = parts.flatMap((p) => p.interviewQA ?? []);
  return {
    id: parts[0].id,
    name,
    beginner: level((t) => t.beginner, ''),
    intermediate: level((t) => t.intermediate, ' (intermediate)'),
    expert: level((t) => t.expert, ' (advanced)'),
    interviewQA: qa.length ? qa : undefined,
  };
}
