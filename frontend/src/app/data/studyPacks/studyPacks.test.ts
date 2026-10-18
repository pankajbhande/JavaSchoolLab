import { describe, it, expect } from 'vitest';
import { allStudyPacks } from './index';
import { coursesData } from '../coursesData';

describe('study packs', () => {
  const topicKeys = new Set(
    coursesData.flatMap(c => c.subTopics.flatMap(st => st.topics.map(t => `${c.id}/${t.id}`))),
  );

  it('every pack points at a real topic', () => {
    const missing = Object.keys(allStudyPacks).filter(k => !topicKeys.has(k));
    expect(missing).toEqual([]);
  });

  it('every pack has keypoints, interview questions and MCQs', () => {
    for (const [key, p] of Object.entries(allStudyPacks)) {
      expect(p.keypoints.length, `${key} keypoints`).toBeGreaterThanOrEqual(6);
      expect(p.interview.length, `${key} interview`).toBeGreaterThanOrEqual(5);
      expect(p.mcq.length, `${key} mcq`).toBeGreaterThanOrEqual(5);
    }
  });

  it('MCQs have 4 distinct options and a reason', () => {
    for (const [key, p] of Object.entries(allStudyPacks)) {
      for (const [q, options, reason] of p.mcq) {
        expect(options.length, `${key}: ${q}`).toBe(4);
        expect(new Set(options).size, `${key}: ${q} duplicate options`).toBe(4);
        expect(reason.length, `${key}: ${q} reason`).toBeGreaterThan(10);
      }
    }
  });

  it('has no duplicate questions or terms inside a topic', () => {
    for (const [key, p] of Object.entries(allStudyPacks)) {
      const qs = p.interview.map(i => i[0].toLowerCase());
      expect(new Set(qs).size, `${key} interview dupes`).toBe(qs.length);
      const ts = p.keypoints.map(k => k[0].toLowerCase());
      expect(new Set(ts).size, `${key} keypoint dupes`).toBe(ts.length);
      const ms = p.mcq.map(m => m[0].toLowerCase());
      expect(new Set(ms).size, `${key} mcq dupes`).toBe(ms.length);
    }
  });
});
