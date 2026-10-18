// Exports the other TypeScript data sets (quiz banks, predict-the-output challenges, study packs, learning paths)
// to plain JSON that the Spring Boot server serves. Like export-content.mjs, nothing is rewritten by hand: this
// evaluates the same code the app runs and writes the result out.
//
//   npm run export:datasets            (writes into ../src/main/resources/datasets)
//   node scripts/export-datasets.mjs --out some/dir
//   npm run verify:datasets            (re-evaluates the source and compares with the written files)
//
// "Without loss" is checked, not assumed:
//   1. The data must be pure JSON (no functions, NaN, Dates, Maps, undefined inside arrays...). Anything else fails the export.
//      An object key whose value is undefined is simply "not set": JSON leaves the key out, which reads exactly the same.
//   2. Images or other asset imports are not expected here; the bundle is built with no asset loaders, so one would fail the build.
//   3. manifest.json records, per data set, the file, bytes, SHA-256 and the counts below. The Spring tests recount from the
//      files they load and compare, and `--verify` here re-reads the written files and compares with the source.
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const root = process.cwd();
const arg = (name) => { const i = process.argv.indexOf(name); return i >= 0 ? process.argv[i + 1] : undefined; };
const outDir = path.resolve(arg('--out') ?? path.join(root, '..', 'src', 'main', 'resources', 'datasets'));
const verifyOnly = process.argv.includes('--verify');

const esbuild = await import(pathToFileURL(path.resolve(root, 'node_modules/esbuild/lib/main.js')).href);
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'jsl-datasets-'));
const bundle = path.join(tmp, 'bundle.mjs');

// Bundle the data layer. No asset loaders on purpose: an image import in these files must fail loudly.
await esbuild.build({
  stdin: {
    contents: `export { allBanks } from './quiz';\nexport { predictChallenges } from './predictOutput';\n` +
      `export { allStudyPacks } from './studyPacks';\nexport { learningPaths } from './learningPaths';`,
    resolveDir: path.join(root, 'src/app/data'), loader: 'ts', sourcefile: 'export-datasets-entry.ts',
  },
  bundle: true, format: 'esm', outfile: bundle, logLevel: 'error',
});
const src = await import(pathToFileURL(bundle).href);
const data = {
  'quiz-banks': src.allBanks,
  'predict-output': src.predictChallenges,
  'study-packs': src.allStudyPacks,
  'learning-paths': src.learningPaths,
};

// ---- 1. pure JSON only -------------------------------------------------------------------------------------------
const problems = [];
let droppedUndefined = 0;   // { x: undefined } means "not set": JSON simply leaves the key out, which reads the same
function walk(v, where) {
  if (v === null || typeof v === 'string' || typeof v === 'boolean') return;
  if (typeof v === 'number') { if (!Number.isFinite(v)) problems.push(`${where}: non-finite number`); return; }
  if (Array.isArray(v)) { v.forEach((x, i) => walk(x, `${where}[${i}]`)); return; }
  if (typeof v === 'object' && Object.getPrototypeOf(v) === Object.prototype) {
    for (const [k, x] of Object.entries(v)) { if (x === undefined) droppedUndefined++; else walk(x, `${where}.${k}`); }
    return;
  }
  problems.push(`${where}: ${v === undefined ? 'undefined' : typeof v === 'object' ? 'non-plain object' : typeof v}`);
}
for (const [name, v] of Object.entries(data)) walk(v, name);
if (problems.length) {
  console.error(`Export refused: the data is not pure JSON (${problems.length} problems), so converting it would lose something.\n  ` + problems.slice(0, 20).join('\n  '));
  process.exit(1);
}

// ---- helpers -----------------------------------------------------------------------------------------------------
const sha = (buf) => crypto.createHash('sha256').update(buf).digest('hex');
const sum = (arr, f) => arr.reduce((a, x) => a + f(x), 0);
const packs = Object.values(data['study-packs']);
const countOf = {
  'quiz-banks': (d) => ({ banks: d.length, questions: sum(d, b => b.questions.length) }),
  'predict-output': (d) => ({ challenges: d.length }),
  'study-packs': () => ({ packs: packs.length, keypoints: sum(packs, p => p.keypoints.length),
    interviewQA: sum(packs, p => p.interview.length), mcq: sum(packs, p => p.mcq.length) }),
  'learning-paths': (d) => ({ paths: d.length, steps: sum(d, p => p.steps.length) }),
};

// ---- build what we would write -------------------------------------------------------------------------------------
const files = new Map(); const items = [];
for (const [name, value] of Object.entries(data)) {
  const file = `${name}.json`;
  const bytes = Buffer.from(JSON.stringify(value), 'utf8');
  files.set(file, bytes);
  items.push({ name, file, bytes: bytes.length, sha256: sha(bytes), counts: countOf[name](value) });
}
const totals = items.reduce((a, m) => { for (const [k, v] of Object.entries(m.counts)) a[k] = (a[k] ?? 0) + v; return a; }, {});
const manifestDoc = { generatedBy: 'scripts/export-datasets.mjs', datasets: items.length, totals, items };
files.set('manifest.json', Buffer.from(JSON.stringify(manifestDoc, null, 1), 'utf8'));

// ---- write, or verify ---------------------------------------------------------------------------------------------
if (verifyOnly) {
  let bad = 0;
  for (const [rel, bytes] of files) {
    const p = path.join(outDir, rel);
    if (!fs.existsSync(p) || sha(fs.readFileSync(p)) !== sha(bytes)) { bad++; console.error('DIFFERS: ' + rel); }
  }
  console.log(bad ? `Verify FAILED: ${bad} file(s) differ from the TypeScript source.` : `Verify OK: ${files.size} dataset files match the TypeScript source exactly.`);
  fs.rmSync(tmp, { recursive: true, force: true });
  process.exit(bad ? 1 : 0);
}
fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });
for (const [rel, bytes] of files) fs.writeFileSync(path.join(outDir, rel), bytes);
fs.rmSync(tmp, { recursive: true, force: true });

const kb = (n) => (n / 1024).toFixed(0) + ' KB';
if (droppedUndefined) console.log(`  note: ${droppedUndefined} keys set to undefined were left out (same as not set)`);
console.log(`Exported ${items.length} data sets to ${path.relative(root, outDir)}`);
console.log(`  banks ${totals.banks}, questions ${totals.questions}, challenges ${totals.challenges}, packs ${totals.packs}, keypoints ${totals.keypoints}, ` +
  `interview Q&A ${totals.interviewQA}, mcq ${totals.mcq}, paths ${totals.paths}, steps ${totals.steps}`);
console.log(`  ${kb(items.reduce((a, m) => a + m.bytes, 0))} of JSON`);
