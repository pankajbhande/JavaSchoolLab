// Calls the same endpoints on the Node server and on the Spring server (same MySQL database, same JWT secret),
// using a token issued by NODE, and reports any difference in status or JSON body.
const NODE = 'http://localhost:3012/api', SPRING = 'http://localhost:3013/api';
async function call(base, method, path, { token, body } = {}) {
  const res = await fetch(base + path, { method, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}) }, body: body === undefined ? undefined : JSON.stringify(body) });
  let json = null; try { json = await res.json(); } catch { /* none */ }
  return { status: res.status, json };
}
// Normalise what is allowed to differ: key order, and timestamps shown with or without milliseconds.
const norm = v => Array.isArray(v) ? v.map(norm)
  : v && typeof v === 'object' ? Object.fromEntries(Object.keys(v).sort().map(k => [k, norm(v[k])]))
  : typeof v === 'string' ? v.replace(/^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})(\.\d+)?Z$/, '$1Z') : v;

const login = await call(NODE, 'POST', '/auth/login', { body: { email: 'baji.node@example.com', password: 'nodepass1', loginType: 'email' } });
const token = login.json.token;
const certs = await call(NODE, 'GET', '/certificates', { token });
const uid = certs.json[0].certificateUid;
// Make the profile public through NODE so both servers can be compared on it.
await call(NODE, 'PUT', '/profile/settings', { token, body: { isPublic: true, handle: 'baji-node', bio: 'from node', showStats: true, showBadges: true, showCertificates: true, showProgress: true } });

const checks = [
  ['GET', '/auth/me'], ['GET', '/progress/summary'], ['GET', '/progress/topics'], ['GET', '/progress/review'],
  ['GET', '/quiz/attempts'], ['GET', '/certificates'], ['GET', '/notes'], ['GET', '/bookmarks'], ['GET', '/leaderboard'],
  ['GET', '/profile/settings'], ['GET', '/profiles/baji-node', false], ['GET', `/certificates/verify/${uid}`, false],
  ['GET', '/profile/handle-available?handle=baji-node'], ['GET', '/profile/handle-available?handle=ab'],
  ['GET', '/profiles/does-not-exist', false], ['GET', '/certificates/verify/not-an-id', false],
  ['GET', '/auth/me', 'noauth'], ['GET', '/auth/me', 'badtoken'],
];
let diffs = 0, same = 0;
for (const [method, path, mode] of checks) {
  const t = mode === false || mode === 'noauth' ? undefined : mode === 'badtoken' ? 'junk' : token;
  const [a, b] = [await call(NODE, method, path, { token: t }), await call(SPRING, method, path, { token: t })];
  const na = JSON.stringify(norm(a.json)), nb = JSON.stringify(norm(b.json));
  if (a.status === b.status && na === nb) { same++; console.log('same     ', method, path, mode === 'noauth' ? '(no token)' : mode === 'badtoken' ? '(bad token)' : '', a.status); }
  else { diffs++; console.log('DIFFERENT', method, path, `node ${a.status} / spring ${b.status}\n   node:   ${na.slice(0, 500)}\n   spring: ${nb.slice(0, 500)}`); }
}

// Password login on Spring with the bcrypt hash Node wrote, and Node-issued token accepted by Spring writes.
const sl = await call(SPRING, 'POST', '/auth/login', { body: { email: 'baji.node@example.com', password: 'nodepass1', loginType: 'email' } });
console.log(sl.status === 200 && sl.json.token ? 'same      Spring logs in with the password hash Node stored' : 'DIFFERENT login on spring ' + sl.status);
if (!(sl.status === 200)) diffs++;
const w = await call(SPRING, 'POST', '/progress/topic', { token, body: { courseId: 'java', moduleId: 'm', topicId: 'z' } });
const back = await call(NODE, 'GET', '/progress/topics', { token });
const seen = back.json.some(t => t.topicId === 'z');
console.log(w.status === 201 && seen ? 'same      A write through Spring is visible to Node (shared database)' : 'DIFFERENT write via spring ' + w.status);
if (!(w.status === 201 && seen)) diffs++;
console.log(JSON.stringify({ same, diffs }));
process.exit(diffs ? 1 : 0);
