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

// courseStats.ts and courseIndex.ts come from the JSON copy of the content (`npm run export:content`).
const indexFile = path.join(root, '../src/main/resources/content/index.json');
if (!fs.existsSync(indexFile)) {
  console.error(`Missing ${indexFile}
Run \`npm run export:content\` first to generate the course content JSON.`);
  process.exit(1);
}
const coursesData = JSON.parse(fs.readFileSync(indexFile, 'utf8'));

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

// ---------------------------------------------------------------------------------------------
// Course index and load map. The workspace opens with only names (the index); a course's content
// and extras are fetched when it is opened (courseLoader.ts), using the map written here.
// ---------------------------------------------------------------------------------------------
const index = coursesData.map(c => ({
  id: c.id, name: c.name, icon: c.icon,
  subTopics: c.subTopics.map(m => ({ id: m.id, name: m.name, topics: m.topics.map(t => ({ id: t.id, name: t.name })) })),
}));

fs.writeFileSync(path.join(root, 'src/app/data/courseIndex.ts'), `// GENERATED FILE - do not edit by hand. Run: npm run gen:course-stats
//
// Names only: every course, module and topic id/name, with no content. The workspace shows this
// straight away (sidebars, tabs, routing, progress) and fetches a course's content on demand.
// ${index.length} courses, ${total} topics.

export interface IndexTopic { id: string; name: string; }
export interface IndexModule { id: string; name: string; topics: IndexTopic[]; }
export interface IndexCourse { id: string; name: string; icon: string; subTopics: IndexModule[]; }

export const courseIndex: IndexCourse[] = ${JSON.stringify(index)};
`);
console.log(`courseIndex.ts: ${index.length} courses`);

// ---------------------------------------------------------------------------------------------
// courseLoadMap.ts needs the TypeScript module map, so it is only regenerated while the TypeScript
// course data is still in the tree; otherwise the existing file is left untouched.
// ---------------------------------------------------------------------------------------------
if (!fs.existsSync(path.join(root, 'src/app/data/coursesData.ts'))) {
  console.log('courseLoadMap.ts: skipped (src/app/data/coursesData.ts not present), existing file left untouched');
} else {
  const esbuild = await import(pathToFileURL(path.resolve(root, 'node_modules/esbuild/lib/main.js')).href);
  const out = path.join(os.tmpdir(), 'jsl-course-stats-' + process.pid + '.mjs');

  await esbuild.build({
    stdin: {
      contents: `export { coursesData, baseCourses } from './coursesData';
export { courseModules } from './courseModules';
export { extrasModules } from './topics/courseExtras/extrasModules';`,
      resolveDir: path.join(root, 'src/app/data'), loader: 'ts', sourcefile: 'gen-entry.ts',
    },
    bundle: true, format: 'esm', outfile: out, logLevel: 'error',
    loader: { '.png': 'empty', '.jpg': 'empty', '.jpeg': 'empty', '.svg': 'empty', '.mp3': 'empty', '.gif': 'empty' },
    external: ['react', 'react-dom', 'motion', 'motion/react', 'lucide-react', 'react/jsx-runtime'],
  });

  const { coursesData: tsCourses, baseCourses, courseModules, extrasModules } = await import(pathToFileURL(out).href);
  fs.rmSync(out, { force: true });
  const byId = [...tsCourses].sort((a, b) => a.id.localeCompare(b.id));

  // course id -> the course module that defines it
  const moduleOf = {};
  for (const key of Object.keys(courseModules).sort()) {
    for (const c of await courseModules[key]()) moduleOf[c.id] = key;
  }
  for (const c of tsCourses) if (!moduleOf[c.id]) throw new Error('no course module defines ' + c.id);

  // course id -> the extras files that hold any of its topics
  const topicCourses = new Map();
  for (const c of baseCourses) for (const m of c.subTopics) for (const t of m.topics) {
    if (!topicCourses.has(t.id)) topicCourses.set(t.id, new Set());
    topicCourses.get(t.id).add(c.id);
  }
  const extrasOf = {};
  for (const file of Object.keys(extrasModules).sort()) {
    const { extras, deep } = await extrasModules[file]();
    for (const id of new Set([...Object.keys(extras), ...Object.keys(deep)])) {
      for (const courseId of topicCourses.get(id) ?? []) (extrasOf[courseId] ??= new Set()).add(file);
    }
  }

  const q = JSON.stringify;
  fs.writeFileSync(path.join(root, 'src/app/data/courseLoadMap.ts'), `// GENERATED FILE - do not edit by hand. Run: npm run gen:course-stats
//
// Which course module defines each course, and which extras files hold its topics' extra content.

export const courseLoadMap: Record<string, { module: string; extras: string[] }> = {
${byId.map(c => `  ${q(c.id)}: { module: ${q(moduleOf[c.id])}, extras: ${q([...(extrasOf[c.id] ?? [])].sort())} },`).join('\n')}
};
`);
  console.log(`courseLoadMap.ts: ${byId.length} courses`);
}
