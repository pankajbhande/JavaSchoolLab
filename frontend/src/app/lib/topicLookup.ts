// Looks up the readable name of a topic or course from its id, using the course index (names only, no content). Ids are not for people to
// read: "introhtmlandcss" is the topic "Introduction to HTML and CSS".

import { courseIndex, type IndexCourse } from '../data/courseIndex';

interface Names { topics: Map<string, string>; courses: Map<string, string> }

// One lookup table per index, built the first time it is used and then kept.
const cache = new WeakMap<IndexCourse[], Names>();

function namesFor(index: IndexCourse[]): Names {
  let n = cache.get(index);
  if (!n) {
    n = { topics: new Map(), courses: new Map() };
    for (const c of index) {
      n.courses.set(c.id, c.name);
      for (const m of c.subTopics) for (const t of m.topics) n.topics.set(`${c.id}|${t.id}`, t.name);
    }
    cache.set(index, n);
  }
  return n;
}

function tidy(id: string): string {
  const words = id.replace(/[-_]+/g, ' ').trim();
  return words ? words.charAt(0).toUpperCase() + words.slice(1) : id;
}

/** "introhtmlandcss" -> "Introduction to HTML and CSS". An id the index does not know is shown tidied up rather than raw. */
export function topicTitle(courseId: string, topicId: string, index: IndexCourse[] = courseIndex): string {
  return namesFor(index).topics.get(`${courseId}|${topicId}`) ?? tidy(topicId);
}

export function courseTitle(courseId: string, index: IndexCourse[] = courseIndex): string | undefined {
  return namesFor(index).courses.get(courseId);
}
