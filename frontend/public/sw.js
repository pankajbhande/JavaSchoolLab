/* JavaSchoolLab service worker (hand-written, no dependencies).
 *
 * Strategies
 *  - navigations:      network-first, falls back to the cached app shell, then /offline.html
 *  - /assets/* (hashed): stale-while-revalidate (this also covers lazy course chunks, so a
 *                      course opened once keeps working offline)
 *  - images / fonts:   cache-first (Google Fonts are the only cross-origin hosts allowed)
 *  - /api/content/* (GET): stale-while-revalidate in its own cache, so courses already opened
 *                      stay readable offline (the server sends ETags; the refresh keeps it current)
 *  - /content-assets/*: cache-first (file names are content-hashed)
 *  - every other /api path and everything else cross-origin: never touched, never cached
 *
 * Bump VERSION to drop every old cache on the next activation.
 */
const VERSION = 'v5';
const SHELL_CACHE = `jsl-shell-${VERSION}`;
const ASSET_CACHE = `jsl-assets-${VERSION}`;
const STATIC_CACHE = `jsl-static-${VERSION}`;
const CONTENT_CACHE = `jsl-content-${VERSION}`;
const CURRENT = [SHELL_CACHE, ASSET_CACHE, STATIC_CACHE, CONTENT_CACHE];
const SHELL_KEY = '/index.html';
const FONT_HOSTS = ['fonts.googleapis.com', 'fonts.gstatic.com'];

self.addEventListener('install', (event) => {
  // No skipWaiting here: the page asks for it (SKIP_WAITING message) when the user accepts.
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) =>
      cache.addAll(['/offline.html', '/manifest.webmanifest', '/icon-192.png', '/favicon-32.png']),
    ),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.filter((k) => k.startsWith('jsl-') && !CURRENT.includes(k)).map((k) => caches.delete(k)),
      );
      await self.clients.claim();
    })(),
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  if (url.origin !== self.location.origin) {
    if (FONT_HOSTS.includes(url.hostname)) event.respondWith(cacheFirst(req, STATIC_CACHE));
    return; // all other cross-origin: browser default, uncached
  }
  if (url.pathname.startsWith('/api/content/')) {
    event.respondWith(staleWhileRevalidate(req, CONTENT_CACHE));
    return;
  }
  if (url.pathname.startsWith('/api/') || url.pathname === '/api') return; // never cache the rest of the API
  if (url.pathname.startsWith('/content-assets/')) {
    event.respondWith(cacheFirst(req, STATIC_CACHE));
    return;
  }
  if (req.headers.has('range')) return;
  // Standalone pages (java-compiler.html, html-viewer.html, python-compiler.html...) are real files, not routes of the app:
  // the browser must load them itself. Answering them with the cached app shell showed "Something went wrong".
  if (req.mode === 'navigate' && /\.html$/.test(url.pathname) && url.pathname !== '/index.html') return;

  if (req.mode === 'navigate') {
    event.respondWith(navigate(req));
  } else if (url.pathname.startsWith('/assets/')) {
    event.respondWith(staleWhileRevalidate(req, ASSET_CACHE));
  } else if (req.destination === 'image' || req.destination === 'font') {
    event.respondWith(cacheFirst(req, STATIC_CACHE));
  }
});

async function navigate(req) {
  const cache = await caches.open(SHELL_CACHE);
  try {
    const res = await fetch(req);
    if (res.ok && (res.headers.get('content-type') || '').includes('text/html')) {
      // Single-page app: every route serves the same shell, so keep one copy.
      cache.put(SHELL_KEY, res.clone());
    }
    return res;
  } catch {
    return (await cache.match(SHELL_KEY)) || (await cache.match('/offline.html')) || Response.error();
  }
}

async function staleWhileRevalidate(req, name) {
  const cache = await caches.open(name);
  const cached = await cache.match(req);
  const network = fetch(req)
    .then((res) => {
      if (res.ok && res.type === 'basic') cache.put(req, res.clone());
      return res;
    })
    .catch(() => undefined);
  if (cached) return cached;
  return (await network) || Response.error();
}

async function cacheFirst(req, name) {
  const cache = await caches.open(name);
  // An image or font request must never be answered with an HTML page (the single-page-app fallback for a missing
  // file): such a copy is ignored and never stored, so one bad response cannot stick for a year.
  const isHtml = (r) => (r.headers.get('content-type') || '').includes('text/html');
  const cached = await cache.match(req);
  if (cached && !isHtml(cached)) return cached;
  try {
    const res = await fetch(req);
    if ((res.ok && !isHtml(res)) || res.type === 'opaque') cache.put(req, res.clone());
    return res;
  } catch {
    return Response.error();
  }
}
