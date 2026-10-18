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
import { API_BASE } from '../services/api';

// Content source: VITE_CONTENT_SOURCE=api reads each course from the server
// (GET {API_BASE}/content/courses/{id}); anything else uses the bundled TypeScript data.
// Read per call so tests can switch it. The bundled modules are only ever dynamically imported,
// so an api-only build never loads them at runtime.
function useApi(): boolean {
  return import.meta.env.VITE_CONTENT_SOURCE === 'api';
}

const cache = new Map<string, Promise<Course>>();

export function loadCourse(id: string): Promise<Course> {
  let p = cache.get(id);
  if (!p) {
    p = useApi() ? fetchCourseFromApi(id) : fetchCourse(id);
    cache.set(id, p);
    // a failed download must be retryable, not cached forever
    p.catch(() => cache.delete(id));
  }
  return p;
}

async function fetchCourseFromApi(id: string): Promise<Course> {
  const res = await fetch(`${API_BASE}/content/courses/${encodeURIComponent(id)}`);
  if (!res.ok) throw new Error(`Could not load course "${id}" (HTTP ${res.status})`);
  let body: unknown;
  try {
    body = await res.json();
  } catch {
    throw new Error(`Course "${id}" response was not valid JSON`);
  }
  const c = body as Partial<Course> | null;
  if (!c || typeof c !== 'object' || c.id !== id || !Array.isArray(c.subTopics)) {
    throw new Error(`Course "${id}" response has an unexpected shape`);
  }
  return c as Course;
}

async function fetchCourse(id: string): Promise<Course> {
  const [{ courseLoadMap }, { courseModules }, { extrasModules }, { applyExtrasWith }] = await Promise.all([
    import('./courseLoadMap'),
    import('./courseModules'),
    import('./topics/courseExtras/extrasModules'),
    import('./topics/courseExtras/applyExtras'),
  ]);
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
