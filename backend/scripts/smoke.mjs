// End-to-end smoke test of the whole API over real HTTP against a running server.
// usage: node smoke.mjs http://localhost:3011
const base = process.argv[2] ?? 'http://localhost:3011';
let pass = 0, fail = 0; const failures = [];
const ok = (cond, label, extra = '') => { if (cond) pass++; else { fail++; failures.push(label + (extra ? '  -> ' + extra : '')); } };
async function call(method, path, { token, body } = {}) {
  const res = await fetch(base + path, {
    method, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}) },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  let json = null; try { json = await res.json(); } catch { /* no body */ }
  return { status: res.status, json, headers: res.headers };
}
const email = `smoke.${Date.now()}@example.com`;
const handle = 'smoke' + Date.now();

// --- sign-up by OTP ---
let r = await call('POST', '/api/otp/send', { body: { identifier: email, identifierType: 'email', purpose: 'register' } });
ok(r.status === 200 && r.json?._dev_otp, 'otp send', JSON.stringify(r));
const otp = r.json?._dev_otp;
r = await call('POST', '/api/otp/verify', { body: { identifier: email, identifierType: 'email', otp, purpose: 'register' } });
ok(r.status === 200 && r.json.verified === true, 'otp verify');
r = await call('POST', '/api/auth/register-otp', { body: { fullName: 'Tanaji Malusare', email, password: 'secret123', loginType: 'email', otp, gender: 'Male', dob: '1990-05-17', organization: 'Sinhagad' } });
ok(r.status === 201 && r.json.token, 'register-otp', JSON.stringify(r.json));
const token = r.json?.token;
r = await call('POST', '/api/auth/register-otp', { body: { fullName: 'Tanaji Malusare', email, password: 'secret123', loginType: 'email', otp } });
ok(r.status === 401, 'otp is single use', String(r.status));

r = await call('GET', '/api/auth/me', { token });
ok(r.status === 200 && r.json.fullName === 'Tanaji Malusare' && r.json.dob === '1990-05-17' && r.json.createdAt, 'me', JSON.stringify(r.json));
r = await call('POST', '/api/auth/login', { body: { email, password: 'secret123', loginType: 'email' } });
ok(r.status === 200 && r.json.token, 'password login');
r = await call('POST', '/api/auth/login', { body: { email, password: 'wrong', loginType: 'email' } });
ok(r.status === 401, 'wrong password rejected');
r = await call('GET', '/api/auth/me');
ok(r.status === 401, 'me without token -> 401');
r = await call('GET', '/api/auth/me', { token: 'junk' });
ok(r.status === 403, 'me with bad token -> 403');

// --- progress ---
for (const t of ['a', 'b', 'c']) {
  r = await call('POST', '/api/progress/topic', { token, body: { courseId: 'java', moduleId: 'basics', topicId: t } });
  ok(r.status === 201, 'topic ' + t);
}
await call('POST', '/api/progress/topic', { token, body: { courseId: 'java', moduleId: 'basics', topicId: 'a' } });   // repeat: still one row
r = await call('POST', '/api/progress/study', { token, body: { seconds: 700 } });
ok(r.status === 200 && r.json.added === 700, 'study');
r = await call('POST', '/api/progress/study', { token, body: { seconds: 100000 } });
ok(r.json.added === 900, 'study clamp');
r = await call('POST', '/api/progress/import', { token, body: { topics: [{ courseId: 'py', moduleId: 'm', topicId: 'x' }, { courseId: 'java', moduleId: 'basics', topicId: 'a' }] } });
ok(r.status === 200 && r.json.imported === 2, 'import');
r = await call('PUT', '/api/progress/goal', { token, body: { minutes: 120 } });
ok(r.status === 200 && r.json.weeklyGoalMinutes === 120, 'goal set');
r = await call('POST', '/api/quiz/attempts', { token, body: { courseId: 'java', moduleId: 'basics', moduleName: 'Java Basics', score: 9, totalQuestions: 10 } });
ok(r.status === 201 && r.json.percentage === 90 && r.json.passed === true, 'quiz attempt', JSON.stringify(r.json));
await call('POST', '/api/quiz/attempts', { token, body: { courseId: 'java', moduleId: 'oop', moduleName: 'OOP', score: 3, totalQuestions: 10 } });
r = await call('GET', '/api/progress/summary', { token });
const s = r.json;
ok(r.status === 200, 'summary status', String(r.status));
ok(s.topicsSeen === 4, 'summary topicsSeen', String(s?.topicsSeen));
ok(s.xp === 4 * 10 + 50 + 5, 'summary xp', String(s?.xp));
ok(s.studySecondsToday === 1600, 'summary studySecondsToday', String(s?.studySecondsToday));
ok(s.currentStreak === 1 && s.studiedToday === true, 'summary streak');
ok(s.weeklyGoalMinutes === 120, 'summary goal');
ok(s.byCourse?.java === 3 && s.byCourse?.py === 1, 'summary byCourse', JSON.stringify(s?.byCourse));
ok(s.modulesPassed === 1 && s.passedModules?.[0]?.best === 90, 'summary passed modules');
ok(Array.isArray(s.studyDays) && /^\d{4}-\d{2}-\d{2}$/.test(s.studyDays[0]?.date), 'summary study day date format', JSON.stringify(s?.studyDays?.[0]));
r = await call('GET', '/api/progress/topics', { token });
ok(r.status === 200 && r.json.length === 4, 'topics list');
r = await call('GET', '/api/progress/review', { token });
ok(r.status === 200 && r.json.length === 1 && r.json[0].moduleId === 'oop' && r.json[0].everPassed === false, 'review queue', JSON.stringify(r.json));
r = await call('GET', '/api/quiz/attempts', { token });
ok(r.status === 200 && r.json.length === 2 && typeof r.json[0].passed === 'boolean', 'attempt list');

// --- certificates ---
r = await call('POST', '/api/certificates', { token, body: { courseName: 'Core Java', topicName: 'Java Basics' } });
ok(r.status === 201 && /^JSL-/.test(r.json?.certificateUid ?? ''), 'certificate issued', JSON.stringify(r.json));
const cert = r.json;
r = await call('POST', '/api/certificates', { token, body: { courseName: 'Core Java', topicName: 'Java Basics' } });
ok(r.status === 200 && r.json.certificateUid === cert.certificateUid, 'same pass -> same certificate');
r = await call('POST', '/api/certificates', { token, body: { courseName: 'Core Java', topicName: 'OOP' } });
ok(r.status === 403, 'failed module -> no certificate');
r = await call('GET', `/api/certificates/verify/${cert.certificateUid}`);
ok(r.status === 200 && r.json.valid === true && r.json.percentage === 90 && r.json.studentName === 'Tanaji Malusare' && !('email' in r.json), 'public verify', JSON.stringify(r.json));
r = await call('GET', '/api/certificates/verify/JSL-ZZZZ-ZZZZ-ZZZZ');
ok(r.status === 404 && r.json.valid === false, 'verify unknown');
r = await call('GET', '/api/certificates', { token });
ok(r.status === 200 && r.json.length === 1, 'my certificates');

// --- bookmarks & notes ---
r = await call('POST', '/api/bookmarks', { token, body: { courseId: 'java', moduleId: 'basics', topicId: 'a', topicName: 'Intro' } });
ok(r.status === 201, 'bookmark add');
r = await call('POST', '/api/bookmarks', { token, body: { courseId: 'java', moduleId: 'basics', topicId: 'a', topicName: 'Intro 2' } });
r = await call('GET', '/api/bookmarks', { token });
ok(r.json.length === 1 && r.json[0].topicName === 'Intro 2', 'bookmark upsert', JSON.stringify(r.json));
r = await call('DELETE', '/api/bookmarks', { token, body: { courseId: 'java', topicId: 'a' } });
ok(r.status === 200, 'bookmark delete');
r = await call('PUT', '/api/notes', { token, body: { courseId: 'java', moduleId: 'basics', topicId: 'a', topicName: 'Intro', body: 'remember this' } });
ok(r.status === 200, 'note save');
r = await call('GET', '/api/notes', { token });
ok(r.json.length === 1 && r.json[0].body === 'remember this', 'note list');
r = await call('PUT', '/api/notes', { token, body: { courseId: 'java', moduleId: 'basics', topicId: 'a', body: '  ' } });
ok(r.json?.deleted === true, 'note blank deletes');

// --- profile, avatar, public profile ---
r = await call('PATCH', '/api/auth/profile', { token, body: { fullName: 'Tanaji M Patil', gender: 'Male', dob: '1991-01-02', organization: 'Fort' } });
ok(r.status === 200, 'profile edit');
const png = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUg==';
r = await call('PUT', '/api/profile/avatar', { token, body: { image: png } });
ok(r.status === 200 && r.json.avatar === png, 'avatar set');
r = await call('PUT', '/api/profile/settings', { token, body: { isPublic: true, handle, bio: 'hi', showStats: true, showBadges: true, showCertificates: true, showProgress: true } });
ok(r.status === 200 && r.json.isPublic === true && r.json.handle === handle, 'profile settings', JSON.stringify(r.json));
r = await call('GET', `/api/profiles/${handle}`);
const p = r.json;
ok(r.status === 200 && p.stats?.xp === 95 && p.certificates?.length === 1 && p.avatar === png && p.badges?.length >= 3, 'public profile', JSON.stringify(p));
ok(!JSON.stringify(p).includes(email) && !JSON.stringify(p).includes('1991-01-02') && !JSON.stringify(p).includes('Fort'), 'public profile leaks nothing private');
r = await call('GET', `/api/profile/handle-available?handle=${handle}`, { token });
ok(r.json.available === true, 'own handle is available to me');
r = await call('DELETE', '/api/profile/avatar', { token });
ok(r.status === 200 && r.json.avatar === null, 'avatar removed');

// --- password change, leaderboard, visitors ---
r = await call('POST', '/api/auth/change-password', { token, body: { currentPassword: 'secret123', newPassword: 'newsecret1' } });
ok(r.status === 200, 'change password');
r = await call('POST', '/api/auth/login', { body: { email, password: 'newsecret1', loginType: 'email' } });
ok(r.status === 200, 'login with new password');
r = await call('GET', '/api/leaderboard', { token });
ok(r.status === 200 && r.json.me?.xp === 95 && r.json.top?.some(x => x.isMe && x.name === 'Tanaji P.'), 'leaderboard', JSON.stringify(r.json?.me));
const v1 = (await call('GET', '/api/visitors/count')).json.count;
const v2 = (await call('POST', '/api/visitors/increment')).json.count;
ok(Number(v2) === Number(v1) + 1, 'visitor counter', `${v1} -> ${v2}`);

// --- the built site ---
let page = await fetch(base + '/course/java/basics/Constructor_in_java');
const html = await page.text();
ok(page.status === 200 && html.includes('<div id="root"'), 'React route serves index.html', String(page.status));
page = await fetch(base + '/assets/definitely-missing-abc.js');
ok(page.status === 404, 'missing asset is a real 404', String(page.status));

console.log(JSON.stringify({ pass, fail }));
if (fail) { console.log('FAILED:\n - ' + failures.join('\n - ')); process.exit(1); }
