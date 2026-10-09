// Shortening topic names for list display.
//
// Inside the Java course a sidebar reading "Introduction to Java / Features of Java /
// Operators in Java / Control Statements in Java" repeats the course name on nearly every
// row, which wastes the narrow column and makes the list harder to scan.
//
// This is a DISPLAY concern only. The full name stays on the topic page, the document
// title, the certificate and search results, where the course context is not implied.

/** Course-name variants a topic might trail with (e.g. ReactJS -> React). */
function courseAliases(courseName: string): string[] {
  const base = courseName.trim();
  const out = new Set<string>([base]);
  const firstWord = base.split(/[\s&]+/)[0];
  if (firstWord) out.add(firstWord);
  // ReactJS -> React, Node.js -> Node
  const stripped = base.replace(/\.?js$/i, '').trim();
  if (stripped) out.add(stripped);
  return [...out].filter(a => a.length >= 2);
}

const CONNECTORS = ['in', 'of', 'to', 'for', 'with', 'using'];

/**
 * Drops a trailing "<connector> <course>" when the course is already implied by context.
 *
 * Only strips a TRAILING occurrence, so "Java Buzzwords" and "Java 8 Features" are left
 * alone, and never returns something too short to be a heading.
 */
export function displayTopicName(topicName: string, courseName?: string | null): string {
  const name = (topicName || '').trim();
  if (!courseName) return name;

  for (const alias of courseAliases(courseName)) {
    for (const connector of CONNECTORS) {
      const suffix = ` ${connector} ${alias}`;
      if (name.toLowerCase().endsWith(suffix.toLowerCase())) {
        const shortened = name.slice(0, name.length - suffix.length).trim();
        // "Introduction to Java" -> "Introduction" is fine; anything shorter is not.
        if (shortened.length >= 3) return shortened;
      }
    }
  }
  return name;
}
