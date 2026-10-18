// Freshness guard: while the TypeScript course sources still exist, the JSON copy under
// server-spring/src/main/resources/content/ must match them.
//
//   npm run check:content
//
// Runs the same comparison as `npm run verify:content` (export-content.mjs --verify) and relays its
// exit code. When the TypeScript sources are gone there is nothing to compare against, so it skips.
import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = process.cwd();

if (!fs.existsSync(path.join(root, 'src/app/data/coursesData.ts'))) {
  console.log('TypeScript sources not present, skipping');
  process.exit(0);
}
const r = spawnSync(process.execPath, [path.join(here, 'export-content.mjs'), '--verify'], { stdio: 'inherit', cwd: root });
process.exit(r.status ?? 1);
