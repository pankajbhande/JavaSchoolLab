// Guards the JSON exported by scripts/export-datasets.mjs: the committed manifest must match the live TypeScript data.
// If this fails, run "npm run export:datasets".
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { allBanks } from './quiz';
import { predictChallenges } from './predictOutput';
import { allStudyPacks } from './studyPacks';
import { learningPaths } from './learningPaths';

const dir = path.resolve(process.cwd(), 'server-spring/src/main/resources/datasets');
const read = (f: string) => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
const sum = <T,>(a: T[], f: (x: T) => number) => a.reduce((n, x) => n + f(x), 0);

describe('exported datasets', () => {
  const manifest = read('manifest.json');
  const t = manifest.totals;
  const packs = Object.values(allStudyPacks);

  it('manifest counts equal the live TypeScript data', () => {
    expect(t.banks).toBe(allBanks.length);
    expect(t.questions).toBe(sum(allBanks, b => b.questions.length));
    expect(t.challenges).toBe(predictChallenges.length);
    expect(t.packs).toBe(packs.length);
    expect(t.keypoints).toBe(sum(packs, p => p.keypoints.length));
    expect(t.interviewQA).toBe(sum(packs, p => p.interview.length));
    expect(t.mcq).toBe(sum(packs, p => p.mcq.length));
    expect(t.paths).toBe(learningPaths.length);
    expect(t.steps).toBe(sum(learningPaths, p => p.steps.length));
  });

  it('files hold exactly the TypeScript data', () => {
    const same = (a: unknown, b: unknown) => expect(JSON.parse(JSON.stringify(a))).toEqual(b);
    same(allBanks, read('quiz-banks.json'));
    same(predictChallenges, read('predict-output.json'));
    same(allStudyPacks, read('study-packs.json'));
    same(learningPaths, read('learning-paths.json'));
  });
});
