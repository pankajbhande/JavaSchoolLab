import { useEffect, useMemo, useState } from 'react';
import { loadCourse } from '../data/courseLoader';
import { courseIndex } from '../data/courseIndex';
import { courseCards, mergeCards, packCards, type QCard } from '../lib/questionBank';
import { allStudyPacks, type StudyPack } from '../data/studyPacks';
import { useDataset } from './useDataset';

const loaded = new Map<string, QCard[]>();
const packCache = new WeakMap<object, QCard[]>();
const getPacks = (packs: Record<string, StudyPack>) => {
  let c = packCache.get(packs);
  if (!c) packCache.set(packs, (c = packCards(packs)));
  return c;
};

/**
 * All questions (study packs + topic interviewQA) for a course, or for every course.
 * Study-pack cards are available immediately; courses are then fetched one at a time and the
 * list grows as each arrives. `progress` is loaded/total courses being fetched.
 */
export function useQuestionBank(courseId: string | null) {
  const wanted = useMemo(
    () => (courseId ? [courseId] : courseIndex.map(c => c.id)),
    [courseId],
  );
  const { data: packs, status: packsStatus } = useDataset<Record<string, StudyPack>>('study-packs', allStudyPacks);
  const [tick, setTick] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setError(null);
    (async () => {
      for (const id of wanted) {
        if (cancelled) return;
        if (loaded.has(id)) continue;
        try {
          const course = await loadCourse(id);
          loaded.set(id, courseCards(course));
        } catch (e) {
          loaded.set(id, []);
          if (!cancelled && courseId) setError(e instanceof Error ? e.message : 'Could not load this course');
        }
        if (!cancelled) setTick(t => t + 1);
      }
    })();
    return () => { cancelled = true; };
  }, [wanted, courseId]);

  const done = wanted.filter(id => loaded.has(id)).length;

  const cards = useMemo(() => {
    const ids = new Set(wanted);
    const own = wanted.flatMap(id => loaded.get(id) ?? []);
    return mergeCards((packs ? getPacks(packs) : []).filter(c => ids.has(c.courseId)), own);
    // tick re-runs this whenever another course finishes loading
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wanted, tick, packs]);

  return { cards, done, total: wanted.length, loading: done < wanted.length || packsStatus === 'loading', error };
}
