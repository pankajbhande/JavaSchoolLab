import fs from 'fs';
import path from 'path';

const dirs = [
    'src/app/data/topics/dsa',
];
const extraFiles = [
    'src/app/data/topics/ComplexityAnalysis.tsx',
    'src/app/data/topics/SortingAlgorithms.tsx',
    'src/app/data/topics/SearchingAlgorithms.tsx',
    'src/app/data/topics/RecursionAndDp.tsx',
    'src/app/data/topics/GraphBfsdfs.tsx',
];

const root = process.cwd();

function stripTags(s) {
    return s.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&rarr;/g, '->').replace(/&#8319;/g, 'n').replace(/&#8317;/g, 'n').trim();
}

function extractFromFile(filePath) {
    const src = fs.readFileSync(filePath, 'utf8');
    const nameMatch = src.match(/name:\s*["']([^"']+)["']/);
    if (!nameMatch) return null;
    const name = nameMatch[1];

    const marker = src.lastIndexOf('Interview Questions');
    if (marker === -1) return null;
    const tail = src.slice(marker);

    const rows = [...tail.matchAll(/<tr class='text-center'><td>([\s\S]*?)<\/td><td>([\s\S]*?)<\/td><\/tr>/g)];
    if (rows.length === 0) return null;

    const questions = rows.map(r => stripTags(r[1]));
    return { name, questions };
}

const files = [];
for (const dir of dirs) {
    const full = path.join(root, dir);
    for (const f of fs.readdirSync(full)) {
        if (f.endsWith('.tsx')) files.push(path.join(full, f));
    }
}
for (const f of extraFiles) files.push(path.join(root, f));

const byName = new Map();
for (const f of files) {
    const r = extractFromFile(f);
    if (!r) continue;
    if (byName.has(r.name)) {
        const existing = byName.get(r.name);
        for (const q of r.questions) {
            if (!existing.questions.includes(q)) existing.questions.push(q);
        }
    } else {
        byName.set(r.name, r);
    }
}
const results = [...byName.values()];

console.error(`Extracted ${results.length} unique-named topics with Q&A`);

const entries = results.map(r => {
    const qs = r.questions.map(q => '                    ' + JSON.stringify(q)).join(',\n');
    return `            {\n                company: ${JSON.stringify(r.name)},\n                questions: [\n${qs}\n                ]\n            }`;
}).join(',\n');

fs.writeFileSync(path.join(root, 'scratch_dsa_interview_entries.ts.txt'), entries + '\n');
console.error('Wrote scratch_dsa_interview_entries.ts.txt');
