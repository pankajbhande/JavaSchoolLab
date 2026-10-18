import { spawn } from 'node:child_process';
import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs';

// Generates PWA icons (192, 512, maskable 512) and the 1200x630 social share image from
// src/assets/logo1.jpg and the brand colours. No dependencies: it drives a local Chrome over the
// DevTools Protocol (Node's global WebSocket) to render and re-encode PNGs.
// Run: node scripts/gen-pwa-assets.mjs   (only when branding changes; set CHROME=path to override)
const root = process.env.PROJ || process.cwd();
const CHROME = [process.env.CHROME, 'C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe']
  .filter(Boolean).find((p) => fs.existsSync(p));
if (!CHROME) throw new Error('No Chrome found; set CHROME=path');
const port = 9661;
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'jsl-pwa-'));
const proc = spawn(CHROME, ['--headless=new', '--disable-gpu', '--no-sandbox', '--remote-debugging-port=' + port, '--user-data-dir=' + dir, 'about:blank'], { stdio: 'ignore' });
let target;
for (let i = 0; i < 50 && !target; i++) {
  try { target = (await (await fetch('http://127.0.0.1:' + port + '/json')).json()).find((t) => t.type === 'page'); } catch {}
  if (!target) await new Promise((r) => setTimeout(r, 200));
}
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
let nextId = 0; const pending = new Map();
ws.onmessage = (ev) => { const m = JSON.parse(ev.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } };
const send = (method, params = {}) => new Promise((res) => { const id = ++nextId; pending.set(id, res); ws.send(JSON.stringify({ id, method, params })); });

const b64 = fs.readFileSync(path.join(root, 'src/assets/logo1.jpg')).toString('base64');
const fn = async (b64) => {
  const img = new Image();
  img.src = 'data:image/jpeg;base64,' + b64;
  await img.decode();
  const side = Math.min(img.naturalWidth, img.naturalHeight);
  const sx = (img.naturalWidth - side) / 2, sy = (img.naturalHeight - side) / 2;
  const png = (c) => c.toDataURL('image/png').split(',')[1];
  const canvas = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d'); x.imageSmoothingQuality = 'high'; return [c, x]; };

  const icon = (size) => { const [c, x] = canvas(size, size); x.drawImage(img, sx, sy, side, side, 0, 0, size, size); return png(c); };
  // Maskable: keep the logo inside the central 80% safe zone on a solid brand background.
  const maskable = (size) => {
    const [c, x] = canvas(size, size);
    x.fillStyle = '#EA580C'; x.fillRect(0, 0, size, size);
    const inner = size * 0.7, off = (size - inner) / 2;
    x.drawImage(img, sx, sy, side, side, off, off, inner, inner);
    return png(c);
  };
  // 1200x630 share card.
  const share = () => {
    const [c, x] = canvas(1200, 630);
    const g = x.createLinearGradient(0, 0, 1200, 630);
    g.addColorStop(0, '#EA580C'); g.addColorStop(1, '#7C2D12');
    x.fillStyle = g; x.fillRect(0, 0, 1200, 630);
    x.save(); x.beginPath(); x.roundRect(80, 165, 300, 300, 40); x.clip();
    x.drawImage(img, sx, sy, side, side, 80, 165, 300, 300); x.restore();
    x.fillStyle = '#fff'; x.textBaseline = 'alphabetic';
    x.font = '700 84px system-ui, Segoe UI, Arial, sans-serif'; x.fillText('JavaSchoolLab', 430, 280);
    x.font = '400 40px system-ui, Segoe UI, Arial, sans-serif';
    x.fillText('Learn Java, Spring Boot, React and more', 430, 350);
    x.fillStyle = '#FED7AA';
    x.font = '400 32px system-ui, Segoe UI, Arial, sans-serif';
    x.fillText('28 courses  -  474 topics  -  interview questions', 430, 410);
    x.fillText('javaschoollab.com', 430, 520);
    return png(c);
  };
  return { i192: icon(192), i512: icon(512), m512: maskable(512), share: share() };
};
const r = await send('Runtime.evaluate', { expression: '(' + fn.toString() + ')(' + JSON.stringify(b64) + ')', awaitPromise: true, returnByValue: true });
try { await send('Browser.close'); } catch {} proc.kill();
if (r.result.exceptionDetails) throw new Error(JSON.stringify(r.result.exceptionDetails));
const out = r.result.result.value;

for (const [name, data] of [['icon-192.png', out.i192], ['icon-512.png', out.i512], ['icon-maskable-512.png', out.m512], ['og-image.png', out.share]]) {
  const buf = Buffer.from(data, 'base64');
  fs.writeFileSync(path.join(root, 'public', name), buf);
  console.log('public/' + name, buf.length + 'B', buf.slice(1, 4).toString() === 'PNG' ? 'valid PNG' : 'BAD');
}
