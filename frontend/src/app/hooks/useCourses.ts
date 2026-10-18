// Course data for the workspace. The index (names only) is available immediately; a course's
// content is fetched when it is opened, and every course is fetched the first time full-text
// search is used. Courses that are not loaded yet appear as empty shells, so sidebars, tabs and
// routing work straight away.

import { useEffect, useMemo, useState } from 'react';
import type { Course } from '../data/types';
import { courseIndex } from '../data/courseIndex';
import { loadAllCourses, loadCourse } from '../data/courseLoader';

/** Every course with names only (no topic content, cheat notes or questions). */
export const skeletonCourses: Course[] = courseIndex.map(c => ({ ...c, cheatNotes: [], interviewQuestions: [] }));

export interface CourseCatalog {
  /** Index shells, replaced by the full course as each one loads. */
  courses: Course[];
  /** True once the course's content is in `courses`. */
  isLoaded: (courseId: string | null) => boolean;
  /** True once every course is loaded (needed before searching lesson text). */
  allLoaded: boolean;
  /** Set when a course could not be downloaded. */
  error: string | null;
  retry: () => void;
}

export function useCourses(wantedId: string | null, loadEverything: boolean): CourseCatalog {
  const [loaded, setLoaded] = useState<Record<string, Course>>({});
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!wantedId || loaded[wantedId]) return;
    let cancelled = false;
    setError(null);
    loadCourse(wantedId)
      .then(course => { if (!cancelled) setLoaded(prev => ({ ...prev, [wantedId]: course })); })
      .catch(() => { if (!cancelled) setError('This course could not be loaded. Check your connection and try again.'); });
    return () => { cancelled = true; };
  }, [wantedId, attempt]);

  useEffect(() => {
    if (!loadEverything) return;
    let cancelled = false;
    loadAllCourses()
      .then(all => { if (!cancelled) setLoaded(Object.fromEntries(all.map(c => [c.id, c]))); })
      .catch(() => { if (!cancelled) setError('Search could not load the course content. Check your connection and try again.'); });
    return () => { cancelled = true; };
  }, [loadEverything, attempt]);

  const courses = useMemo(() => skeletonCourses.map(c => loaded[c.id] ?? c), [loaded]);
  return {
    courses,
    isLoaded: id => !!id && !!loaded[id],
    allLoaded: skeletonCourses.every(c => loaded[c.id]),
    error,
    retry: () => setAttempt(a => a + 1),
  };
}
