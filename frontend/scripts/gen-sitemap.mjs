// Generates public/sitemap.xml and public/robots.txt from the real course tree.
//
//   npm run gen:sitemap
//
// Set SITE_URL to your production origin (defaults to https://javaschoollab.dhipansoft.in).
// Vite copies public/ into dist/ verbatim, so both files ship at the site root.
//
// Why this matters: the app is a single index.html, so without a sitemap a crawler has
// no way to discover the 474 topic URLs - there is no server-rendered link graph to
// follow. This is the cheapest way to make the catalogue discoverable; a prerender step
// is what would make each page independently indexable.
import path from 'path';
import fs from 'fs';

const SITE = (process.env.SITE_URL || 'https://javaschoollab.dhipansoft.in').replace(/\/+$/, '');
const root = process.cwd();

// The course list comes from the JSON copy of the content (written by `npm run export:content`),
// so this script no longer needs the TypeScript course data or esbuild.
const indexFile = path.join(root, '../src/main/resources/content/index.json');
if (!fs.existsSync(indexFile)) {
  console.error(`Missing ${indexFile}
Run \`npm run export:content\` first to generate the course content JSON.`);
  process.exit(1);
}
const coursesData = JSON.parse(fs.readFileSync(indexFile, 'utf8'));

// Must match src/app/lib/slug.ts exactly, or the sitemap will advertise 404s.
const slugify = (id) => id.trim().replace(/\s+/g, '_');
const enc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');

const urls = [{ loc: SITE + '/dashboard', priority: '1.0', freq: 'weekly' }];
for (const course of coursesData) {
  urls.push({ loc: `${SITE}/course/${slugify(course.id)}`, priority: '0.8', freq: 'weekly' });
  for (const module of course.subTopics) {
    for (const topic of module.topics) {
      urls.push({
        loc: `${SITE}/course/${slugify(course.id)}/${slugify(module.id)}/${slugify(topic.id)}`,
        priority: '0.6',
        freq: 'monthly',
      });
    }
  }
}

const body = urls.map(u =>
  `  <url>\n    <loc>${enc(u.loc)}</loc>\n    <changefreq>${u.freq}</changefreq>\n    <priority>${u.priority}</priority>\n  </url>`
).join('\n');

const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;

const robots = [
  'User-agent: *',
  'Allow: /',
  '',
  '# The app is a client-rendered SPA; the sitemap is how the topic URLs are discovered.',
  `Sitemap: ${SITE}/sitemap.xml`,
  '',
].join('\n');

fs.mkdirSync(path.join(root, 'public'), { recursive: true });
fs.writeFileSync(path.join(root, 'public/sitemap.xml'), xml);
fs.writeFileSync(path.join(root, 'public/robots.txt'), robots);
console.log(`sitemap.xml: ${urls.length} URLs (1 dashboard + ${coursesData.length} courses + ${urls.length - 1 - coursesData.length} topics)`);
console.log(`robots.txt:  points at ${SITE}/sitemap.xml`);
