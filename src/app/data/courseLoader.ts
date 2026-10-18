// Loads one course on demand: its content module plus only the extras files that hold its topics,
// then merges them exactly as the eager coursesData does. Results are cached, so each course is
// fetched at most once per visit.
//
// The map of which files a course needs is generated (courseLoadMap.ts); courseLoader.test.ts
// checks every course loads identically to the eager list.

import type { Course } from './types';
import type { Extra } from './topics/mysql/extras/extra';
import type { Deep } from './topics/mysql/extras/deep';
import { courseIndex } from './courseIndex';
import { courseLoadMap } from './courseLoadMap';
import { courseModules } from './courseModules';
import { extrasModules } from './topics/courseExtras/extrasModules';
import { applyExtrasWith } from './topics/courseExtras/applyExtras';

const cache = new Map<string, Promise<Course>>();

export function loadCourse(id: string): Promise<Course> {
  let p = cache.get(id);
  if (!p) {
    p = fetchCourse(id);
    cache.set(id, p);
    // a failed download must be retryable, not cached forever
    p.catch(() => cache.delete(id));
  }
  return p;
}

async function fetchCourse(id: string): Promise<Course> {
  const entry = courseLoadMap[id];
  if (!entry) throw new Error(`Unknown course: ${id}`);
  const [courses, files, overviews] = await Promise.all([
    courseModules[entry.module](),
    Promise.all(entry.extras.map(f => extrasModules[f]())),
    // Core Java topics are re-arranged using their authored overviews
    id === 'java' ? import('./topics/courseExtras/javaOverview').then(m => m.javaOverviewById) : Promise.resolve({}),
  ]);
  const base = courses.find(c => c.id === id);
  if (!base) throw new Error(`Course module ${entry.module} does not define ${id}`);
  const extras: Record<string, Extra> = Object.assign({}, ...files.map(f => f.extras));
  const deep: Record<string, Deep> = Object.assign({}, ...files.map(f => f.deep));
  return applyExtrasWith(base, { extras, deep, overviews });
}

/** Every course, for features that need all of the content at once (full-text search). */
export function loadAllCourses(): Promise<Course[]> {
  return Promise.all(courseIndex.map(c => loadCourse(c.id)));
}
