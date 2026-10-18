// Exports every course, exactly as the app shows it, from the TypeScript data files to plain JSON that the
// Spring Boot server serves. Nothing is rewritten by hand: this evaluates the same code the app runs
// (coursesData = base courses + extras + deep dives, already merged) and writes the result out.
//
//   npm run export:content            (writes into ../src/main/resources)
//   node scripts/export-content.mjs --out some/dir
//
// "Without loss" is checked, not assumed:
//   1. The data must be pure JSON (no functions, NaN, Dates, Maps, undefined inside arrays...). Anything else fails the export.
//      An object key whose value is undefined is simply "not set": JSON leaves the key out, which reads exactly the same.
//   2. The names-only index must equal the generated src/app/data/courseIndex.ts.
//   3. manifest.json records, per course, the counts of modules, topics, blocks, code examples and explanations,
//      interview Q&A, cheat notes and questions, plus a SHA-256 of the file. The Spring tests recount from the
//      files they load and compare, and `--verify` here re-reads the written files and compares with the source.
//   4. Images imported by the data files (48 of them) are copied to static/content-assets and the HTML points at them.
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const root = process.cwd();
const arg = (name) => { const i = process.argv.indexOf(name); return i >= 0 ? process.argv[i + 1] : undefined; };
const resources = path.resolve(arg('--out') ?? path.join(root, '..', 'src', 'main', 'resources'));
const contentDir = path.join(resources, 'content');
const assetsDir = path.join(resources, 'static', 'content-assets');
const verifyOnly = process.argv.includes('--verify');

const esbuild = await import(pathToFileURL(path.resolve(root, 'node_modules/esbuild/lib/main.js')).href);
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'jsl-export-'));
const bundle = path.join(tmp, 'bundle.mjs');

// Bundle the data layer. Images become real files (hashed names) so the exported HTML keeps working.
await esbuild.build({
  stdin: {
    contents: `export { coursesData } from './coursesData';`,
    resolveDir: path.join(root, 'src/app/data'), loader: 'ts', sourcefile: 'export-entry.ts',
  },
  bundle: true, format: 'esm', outfile: bundle, logLevel: 'error',
  loader: Object.fromEntries(['.png', '.jpg', '.jpeg', '.svg', '.gif', '.webp', '.mp3'].map(e => [e, 'file'])),
  assetNames: 'content-assets/[name]-[hash]', publicPath: '/',
  external: ['react', 'react-dom', 'motion', 'motion/react', 'lucide-react', 'react/jsx-runtime'],
});
const { coursesData } = await import(pathToFileURL(bundle).href);

// ---- 1. pure JSON only -------------------------------------------------------------------------------------------
const problems = [];
let droppedUndefined = 0;   // { codeExplanations: undefined } means "not set": JSON simply leaves the key out, which reads the same
(function walk(v, where) {
  if (v === null || typeof v === 'string' || typeof v === 'boolean') return;
  if (typeof v === 'number') { if (!Number.isFinite(v)) problems.push(`${where}: non-finite number`); return; }
  if (Array.isArray(v)) { v.forEach((x, i) => walk(x, `${where}[${i}]`)); return; }
  if (typeof v === 'object' && Object.getPrototypeOf(v) === Object.prototype) {
    for (const [k, x] of Object.entries(v)) { if (x === undefined) droppedUndefined++; else walk(x, `${where}.${k}`); }
    return;
  }
  problems.push(`${where}: ${v === undefined ? 'undefined' : typeof v === 'object' ? 'non-plain object' : typeof v}`);
})(coursesData, 'coursesData');
if (problems.length) {
  console.error(`Export refused: the data is not pure JSON (${problems.length} problems), so converting it would lose something.\n  ` + problems.slice(0, 20).join('\n  '));
  process.exit(1);
}

// ---- helpers -----------------------------------------------------------------------------------------------------
const slug = (id) => id.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const sha = (buf) => crypto.createHash('sha256').update(buf).digest('hex');
function counts(course) {
  const c = { modules: course.subTopics.length, topics: 0, blocks: 0, codeExamples: 0, codeExplanations: 0, interviewQA: 0,
    cheatNotes: course.cheatNotes.length, interviewQuestions: course.interviewQuestions.reduce((a, q) => a + q.questions.length, 0), characters: 0 };
  for (const m of course.subTopics) for (const t of m.topics) {
    c.topics++;
    c.interviewQA += (t.interviewQA ?? []).length;
    for (const level of [t.beginner, t.intermediate, t.expert]) for (const b of level ?? []) {
      c.blocks++;
      c.codeExamples += (b.codeExamples ?? []).length;
      c.codeExplanations += (b.codeExplanations ?? []).length;
      c.characters += b.content.length + (b.codeExamples ?? []).reduce((a, x) => a + x.length, 0);
    }
  }
  return c;
}
const toIndex = (c) => ({ id: c.id, name: c.name, icon: c.icon,
  subTopics: c.subTopics.map(m => ({ id: m.id, name: m.name, topics: m.topics.map(t => ({ id: t.id, name: t.name })) })) });

// ---- build what we would write -------------------------------------------------------------------------------------
const files = new Map(); const used = new Set(); const manifest = [];
for (const course of coursesData) {
  let file = `courses/${slug(course.id)}.json`;
  for (let n = 2; used.has(file); n++) file = `courses/${slug(course.id)}-${n}.json`;
  used.add(file);
  const bytes = Buffer.from(JSON.stringify(course), 'utf8');
  files.set(file, bytes);
  manifest.push({ id: course.id, name: course.name, file, bytes: bytes.length, sha256: sha(bytes), counts: counts(course) });
}
const index = coursesData.map(toIndex);
files.set('index.json', Buffer.from(JSON.stringify(index), 'utf8'));
const totals = manifest.reduce((a, m) => { for (const [k, v] of Object.entries(m.counts)) a[k] = (a[k] ?? 0) + v; return a; }, {});
const manifestDoc = { generatedBy: 'scripts/export-content.mjs', courses: manifest.length, totals, items: manifest };
files.set('manifest.json', Buffer.from(JSON.stringify(manifestDoc, null, 1), 'utf8'));

// ---- 2. the names-only index must equal the app's generated courseIndex.ts ----------------------------------------
{
  const text = fs.readFileSync(path.join(root, 'src/app/data/courseIndex.ts'), 'utf8');
  const m = text.match(/export const courseIndex: IndexCourse\[\] = (\[.*\]);/s);
  const fromTs = m ? JSON.parse(m[1]) : null;
  if (!fromTs || JSON.stringify(fromTs) !== JSON.stringify(index)) {
    console.error('Export refused: the exported index differs from src/app/data/courseIndex.ts. Run "npm run gen:course-stats" first, then export again.');
    process.exit(1);
  }
}

// ---- write, or verify ---------------------------------------------------------------------------------------------
const emittedAssets = fs.existsSync(path.join(tmp, 'content-assets')) ? fs.readdirSync(path.join(tmp, 'content-assets')) : [];
if (verifyOnly) {
  let bad = 0;
  for (const [rel, bytes] of files) {
    const p = path.join(contentDir, rel);
    if (!fs.existsSync(p) || sha(fs.readFileSync(p)) !== sha(bytes)) { bad++; console.error('DIFFERS: ' + rel); }
  }
  for (const a of emittedAssets) if (!fs.existsSync(path.join(assetsDir, a))) { bad++; console.error('MISSING ASSET: ' + a); }
  console.log(bad ? `Verify FAILED: ${bad} file(s) differ from the TypeScript source.` : `Verify OK: ${files.size} content files and ${emittedAssets.length} images match the TypeScript source exactly.`);
  fs.rmSync(tmp, { recursive: true, force: true });
  process.exit(bad ? 1 : 0);
}
fs.rmSync(contentDir, { recursive: true, force: true });
for (const [rel, bytes] of files) { fs.mkdirSync(path.dirname(path.join(contentDir, rel)), { recursive: true }); fs.writeFileSync(path.join(contentDir, rel), bytes); }
fs.mkdirSync(assetsDir, { recursive: true });
for (const a of emittedAssets) fs.copyFileSync(path.join(tmp, 'content-assets', a), path.join(assetsDir, a));
fs.rmSync(tmp, { recursive: true, force: true });

const mb = (n) => (n / 1048576).toFixed(1) + ' MB';
if (droppedUndefined) console.log(`  note: ${droppedUndefined} keys set to undefined were left out (same as not set)`);
console.log(`Exported ${manifest.length} courses to ${path.relative(root, contentDir)}`);
console.log(`  modules ${totals.modules}, topics ${totals.topics}, blocks ${totals.blocks}, code examples ${totals.codeExamples}, ` +
  `explanations ${totals.codeExplanations}, interview Q&A ${totals.interviewQA}, cheat notes ${totals.cheatNotes}, company questions ${totals.interviewQuestions}`);
console.log(`  ${mb(manifest.reduce((a, m) => a + m.bytes, 0))} of JSON, ${emittedAssets.length} images copied to ${path.relative(root, assetsDir)}`);
