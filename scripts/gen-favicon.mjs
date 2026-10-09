import { pathToFileURL } from 'url';
import path from 'path';
import fs from 'fs';
const puppeteer = (await import(pathToFileURL((process.env.PROJ || process.cwd()) + '/node_modules/puppeteer-core/lib/esm/puppeteer/puppeteer-core.js').href)).default;
const CHROME = path.join(process.env.USERPROFILE, '.cache/puppeteer/chrome/win64-131.0.6778.204/chrome-win64/chrome.exe');
const root = process.env.PROJ || process.cwd();

// Regenerates the favicons from the brand logo.  npm run gen:favicon
// Requires puppeteer-core and a local Chrome; run it only when the logo changes.
// The source is a JPEG named .png. Decode it in Chrome and re-encode as real PNGs at the
// sizes a favicon actually needs — no image-processing dependency required.
const jpegB64 = fs.readFileSync(path.join(root, 'src/assets/logo1.jpg')).toString('base64');
const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-sandbox'] });
const page = await browser.newPage();

const out = await page.evaluate(async (b64) => {
  const img = new Image();
  img.src = 'data:image/jpeg;base64,' + b64;
  await img.decode();
  const render = (size) => {
    const c = document.createElement('canvas');
    c.width = c.height = size;
    const ctx = c.getContext('2d');
    // Square-crop from the centre so a non-square source is not squashed.
    const side = Math.min(img.naturalWidth, img.naturalHeight);
    const sx = (img.naturalWidth - side) / 2;
    const sy = (img.naturalHeight - side) / 2;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, sx, sy, side, side, 0, 0, size, size);
    return c.toDataURL('image/png').split(',')[1];
  };
  return { w: img.naturalWidth, h: img.naturalHeight, p32: render(32), p180: render(180) };
}, jpegB64);

await browser.close();
console.log('source logo:', out.w + 'x' + out.h, '(JPEG)');

fs.mkdirSync(path.join(root, 'public'), { recursive: true });
const write = (name, b64) => {
  const buf = Buffer.from(b64, 'base64');
  fs.writeFileSync(path.join(root, 'public', name), buf);
  const ok = buf[0] === 0x89 && buf.slice(1, 4).toString() === 'PNG';
  console.log('  public/' + name.padEnd(20), buf.length + 'B', ok ? 'valid PNG' : 'BAD');
  return buf;
};
const p32 = write('favicon-32.png', out.p32);
write('apple-touch-icon.png', out.p180);

// A real .ico wrapping the 32x32 PNG, so browsers probing /favicon.ico get a file
// instead of a 404. ICO has allowed embedded PNG payloads since Vista.
const dir = Buffer.alloc(6);
dir.writeUInt16LE(0, 0); dir.writeUInt16LE(1, 2); dir.writeUInt16LE(1, 4);
const ent = Buffer.alloc(16);
ent[0] = 32; ent[1] = 32; ent[2] = 0; ent[3] = 0;
ent.writeUInt16LE(1, 4); ent.writeUInt16LE(32, 6);
ent.writeUInt32LE(p32.length, 8); ent.writeUInt32LE(22, 12);
const ico = Buffer.concat([dir, ent, p32]);
fs.writeFileSync(path.join(root, 'public/favicon.ico'), ico);
console.log('  public/favicon.ico'.padEnd(28), ico.length + 'B', ico[0] === 0 && ico[2] === 1 ? 'valid ICO' : 'BAD');
