// Regenerates src/app/data/courseStats.ts from the real course tree.
//
// The dashboard needs per-course topic totals to draw completion, but it deliberately does
// NOT import coursesData: that would pull every topic back into the entry chunk and undo
// the code split. This emits a few hundred bytes of counts instead.
//
//   npm run gen:course-stats
//
// CourseWorkspace asserts these counts against the live data in dev builds, so drift shows
// up in the console rather than silently skewing every progress ring.
import path from 'path';
import fs from 'fs';
import { pathToFileURL } from 'url';
import os from 'os';

const root = process.cwd();
const esbuild = await import(pathToFileURL(path.resolve(root, 'node_modules/esbuild/lib/main.js')).href);
const out = path.join(os.tmpdir(), 'jsl-course-stats-' + process.pid + '.mjs');

await esbuild.build({
  entryPoints: [path.join(root, 'src/app/data/coursesData.ts')],
  bundle: true, format: 'esm', outfile: out, logLevel: 'error',
  loader: { '.png': 'empty', '.jpg': 'empty', '.jpeg': 'empty', '.svg': 'empty', '.mp3': 'empty', '.gif': 'empty' },
  external: ['react', 'react-dom', 'motion', 'motion/react', 'lucide-react', 'react/jsx-runtime'],
});

const { coursesData } = await import(pathToFileURL(out).href);
fs.rmSync(out, { force: true });

const rows = coursesData
  .map(c => ({
    id: c.id,
    topics: c.subTopics.reduce((a, s) => a + s.topics.length, 0),
    modules: c.subTopics.length,
  }))
  .sort((a, b) => a.id.localeCompare(b.id));

const body = rows.map(r => `  ${JSON.stringify(r.id)}: { topics: ${r.topics}, modules: ${r.modules} },`).join('\n');
const total = rows.reduce((a, r) => a + r.topics, 0);

const file = `// GENERATED FILE - do not edit by hand. Run: npm run gen:course-stats
//
// Per-course totals for the dashboard's completion rings. Kept separate from coursesData
// so the landing page can show progress without downloading every topic.
// ${rows.length} courses, ${total} topics.

export interface CourseStat {
  topics: number;
  modules: number;
}

export const courseStats: Record<string, CourseStat> = {
${body}
};

/** Total topics across every course. */
export const TOTAL_TOPICS = ${total};
`;

fs.writeFileSync(path.join(root, 'src/app/data/courseStats.ts'), file);
console.log(`courseStats.ts: ${rows.length} courses, ${total} topics`);
