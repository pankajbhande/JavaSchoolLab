// Prints the keypoints the right sidebar will show for each topic in a course, so their
// relevance can be reviewed without clicking through the UI.
//
//   node scripts/dump-keypoints.mjs <courseId> [--terms]
//   node scripts/dump-keypoints.mjs --list        (show course ids)
//
// --terms prints only the keypoint terms, which is easier to scan in bulk.
import path from 'path';
import os from 'os';
import fs from 'fs';
import { pathToFileURL } from 'url';

const root = process.cwd();
const esbuild = await import(pathToFileURL(path.resolve(root, 'node_modules/esbuild/lib/main.js')).href);
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'jsl-kp-'));
const common = {
  bundle: true, format: 'esm', logLevel: 'error',
  loader: { '.png': 'empty', '.jpg': 'empty', '.jpeg': 'empty', '.svg': 'empty', '.mp3': 'empty', '.gif': 'empty' },
  external: ['react', 'react-dom', 'motion', 'motion/react', 'lucide-react', 'react/jsx-runtime'],
  define: { 'import.meta.env': '{"DEV":false}' },
};
await esbuild.build({ ...common, entryPoints: ['src/app/services/keypoints.ts'], outfile: path.join(tmp, 'kp.mjs') });
await esbuild.build({ ...common, entryPoints: ['src/app/data/coursesData.ts'], outfile: path.join(tmp, 'cd.mjs') });
const { buildKeypoints } = await import(pathToFileURL(path.join(tmp, 'kp.mjs')).href);
const { coursesData } = await import(pathToFileURL(path.join(tmp, 'cd.mjs')).href);
fs.rmSync(tmp, { recursive: true, force: true });

const arg = process.argv[2];
const termsOnly = process.argv.includes('--terms');

if (!arg || arg === '--list') {
  for (const c of coursesData) {
    console.log(`${c.id.padEnd(30)} ${c.subTopics.reduce((a, s) => a + s.topics.length, 0)} topics  ${c.name}`);
  }
  process.exit(0);
}

const course = coursesData.find(c => c.id === arg);
if (!course) { console.error(`No course "${arg}". Run with --list.`); process.exit(1); }

const siblings = course.subTopics.flatMap(s => s.topics.map(t => t.name));
console.log(`COURSE: ${course.name} (${course.id})`);
console.log('');
for (const module of course.subTopics) {
  for (const topic of module.topics) {
    const kp = buildKeypoints(topic, course.cheatNotes, course.name, siblings);
    console.log(`### ${topic.name}   [${module.name}]  -> ${kp.length} keypoints`);
    if (kp.length === 0) { console.log('    (none)'); continue; }
    for (const k of kp) {
      console.log(termsOnly ? `    - ${k.term}` : `    - ${k.term}${k.detail ? ': ' + k.detail.slice(0, 110) : ''}`);
    }
    console.log('');
  }
}
