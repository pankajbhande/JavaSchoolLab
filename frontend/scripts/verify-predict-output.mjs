// Verifies every "Predict the output" challenge by really compiling and running it with the
// installed JDK (javac / java on PATH). Snippets are written to a temp dir OUTSIDE the project.
//
//   node scripts/verify-predict-output.mjs [challenge-id ...]
//
// `answer` must equal the program's stdout (trimmed, \r\n normalised), or be "Compile error"
// when javac must reject the snippet. Exit code 1 if any challenge differs.
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const dataFile = path.join(here, '..', 'src', 'app', 'data', 'predictOutput.ts');

// Load the TS data file without a build step: strip the types and evaluate it as a module.
async function loadChallenges() {
  let src = fs.readFileSync(dataFile, 'utf8');
  src = src
    .replace(/export interface PredictChallenge \{[\s\S]*?\n\}\n/, '')
    .replace(/export const predictChallenges: PredictChallenge\[\]/, 'export const predictChallenges')
    .replace(/export function challengesForTopic[\s\S]*$/, '');
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'jsl-predict-data-'));
  const file = path.join(tmp, 'data.mjs');
  fs.writeFileSync(file, src);
  const mod = await import(new URL('file:///' + file.replace(/\\/g, '/')).href);
  return mod.predictChallenges;
}

function run(cmd, args, cwd, timeout = 60000) {
  return new Promise((resolve) => {
    const p = spawn(cmd, args, { cwd, shell: false });
    let out = '';
    let err = '';
    const t = setTimeout(() => p.kill(), timeout);
    p.stdout.on('data', (d) => (out += d));
    p.stderr.on('data', (d) => (err += d));
    p.on('close', (code) => {
      clearTimeout(t);
      resolve({ code, out, err });
    });
    p.on('error', (e) => {
      clearTimeout(t);
      resolve({ code: -1, out, err: String(e) });
    });
  });
}

const norm = (s) => s.replace(/\r\n/g, '\n').replace(/\s+$/, '');

async function verifyOne(c, root) {
  const dir = path.join(root, c.id);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'Main.java'), c.code);
  const comp = await run('javac', ['-encoding', 'UTF-8', 'Main.java'], dir);
  if (comp.code !== 0) {
    const ok = c.answer === 'Compile error';
    return { id: c.id, ok, actual: 'Compile error', detail: ok ? '' : comp.err.slice(0, 400) };
  }
  if (c.answer === 'Compile error') return { id: c.id, ok: false, actual: '(compiled fine)', detail: '' };
  const r = await run('java', ['-Xshare:auto', 'Main'], dir);
  const actual = norm(r.out);
  return { id: c.id, ok: actual === c.answer, actual, detail: r.code !== 0 ? 'exit ' + r.code + ' ' + r.err.slice(0, 200) : '' };
}

const only = new Set(process.argv.slice(2));
const all = await loadChallenges();
const list = only.size ? all.filter((c) => only.has(c.id)) : all;
const root = fs.mkdtempSync(path.join(os.tmpdir(), 'jsl-predict-java-'));
const results = [];
const queue = list.slice();
const workers = Array.from({ length: 4 }, async () => {
  while (queue.length) {
    const c = queue.shift();
    const r = await verifyOne(c, root);
    results.push(r);
    process.stdout.write(r.ok ? '.' : 'F');
  }
});
await Promise.all(workers);
console.log();
const bad = results.filter((r) => !r.ok);
for (const r of bad) {
  const c = list.find((x) => x.id === r.id);
  console.log(`\nMISMATCH ${r.id}\n  recorded: ${JSON.stringify(c.answer)}\n  actual:   ${JSON.stringify(r.actual)}${r.detail ? '\n  ' + r.detail : ''}`);
}
console.log(`\n${results.length - bad.length}/${results.length} challenges verified by running Java (${process.env.JAVA_HOME ?? 'java on PATH'}).`);
try { fs.rmSync(root, { recursive: true, force: true }); } catch {}
process.exit(bad.length ? 1 : 0);
