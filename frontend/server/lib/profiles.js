// Public learner profiles: handle/bio validation and the builder that decides what may leave the server.
//
// Privacy is enforced here, in one pure place: buildPublicProfile() starts from an empty object and
// adds a section ONLY when the owner switched it on. It never receives (and so can never leak) email,
// mobile, date of birth, organisation or internal ids.
//
// The handle rules are duplicated in src/app/lib/profileHandle.ts for instant client feedback;
// server/lib/profiles.test.js asserts the two agree.

export const HANDLE_MIN = 3;
export const HANDLE_MAX = 30;
export const BIO_MAX = 160;
export const DISPLAY_NAME_MAX = 60;

/** Words that would collide with routes or impersonate the site. */
export const RESERVED_HANDLES = new Set([
  'admin', 'administrator', 'api', 'app', 'account', 'accounts', 'dashboard', 'login', 'logout', 'signin', 'signup',
  'register', 'verify', 'certificate', 'certificates', 'course', 'courses', 'flashcards', 'interview', 'interview-practice',
  'leaderboard', 'me', 'u', 'user', 'users', 'profile', 'profiles', 'settings', 'support', 'help', 'about', 'contact',
  'root', 'system', 'sysadmin', 'moderator', 'mod', 'staff', 'team', 'official', 'javaschoollab', 'jsl', 'dhipan',
  'null', 'undefined', 'true', 'false', 'www', 'mail', 'email', 'static', 'assets', 'public', 'terms', 'privacy',
  'security', 'billing', 'blog', 'docs', 'status', 'search', 'home', 'index', 'new', 'edit', 'delete', 'anonymous',
  'guest', 'test', 'demo', 'webmaster', 'postmaster', 'abuse', 'noreply', 'no-reply',
]);

/** Trim and lowercase, so "  Asha_K " is treated as "asha_k". Non-strings become an empty string. */
export function normalizeHandle(value) {
  return typeof value === 'string' ? value.trim().toLowerCase() : '';
}

/** Returns an error message, or null when the (already normalised) handle is acceptable. */
export function handleError(handle) {
  if (typeof handle !== 'string' || !handle) return 'Choose a handle';
  if (handle.length < HANDLE_MIN) return `Use at least ${HANDLE_MIN} characters`;
  if (handle.length > HANDLE_MAX) return `Use at most ${HANDLE_MAX} characters`;
  if (!/^[a-z0-9_-]+$/.test(handle)) return 'Use only lowercase letters, digits, hyphen (-) and underscore (_)';
  if (!/^[a-z0-9]/.test(handle) || !/[a-z0-9]$/.test(handle)) return 'Start and end with a letter or digit';
  if (RESERVED_HANDLES.has(handle)) return 'That handle is reserved. Please pick another';
  return null;
}

/** Plain-text bio. Control characters are dropped and whitespace collapsed; the browser renders it escaped. */
export function cleanBio(value) {
  if (typeof value !== 'string') return '';
  // eslint-disable-next-line no-control-regex
  return value.replace(/[\u0000-\u0008\u000B-\u001F\u007F]/g, '').replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim();
}
export function bioError(bio) {
  return bio.length > BIO_MAX ? `Keep your bio to ${BIO_MAX} characters or fewer` : null;
}

export function cleanDisplayName(value) {
  // eslint-disable-next-line no-control-regex
  return typeof value === 'string' ? value.replace(/[\u0000-\u001F\u007F]/g, ' ').replace(/\s+/g, ' ').trim() : '';
}

/** Badge rules, mirroring the account page. Only EARNED badges are ever returned publicly. */
export function computeBadges({ topicsSeen, longestStreak, modulesPassed, studySecondsTotal, certificates }) {
  const defs = [
    ['first', 'First Steps', 'Opened a first topic', topicsSeen >= 1],
    ['explorer', 'Explorer', 'Opened 25 topics', topicsSeen >= 25],
    ['scholar', 'Scholar', 'Opened 100 topics', topicsSeen >= 100],
    ['streak3', 'On Fire', '3-day streak', longestStreak >= 3],
    ['streak7', 'Week Warrior', '7-day streak', longestStreak >= 7],
    ['streak30', 'Unstoppable', '30-day streak', longestStreak >= 30],
    ['quiz1', 'Quiz Passer', 'Passed a module test', modulesPassed >= 1],
    ['quiz5', 'Quiz Master', 'Passed 5 module tests', modulesPassed >= 5],
    ['cert', 'Certified', 'Earned a certificate', certificates >= 1],
    ['focus', 'Deep Focus', 'Studied for 1 hour in total', studySecondsTotal >= 3600],
  ];
  return defs.filter(d => d[3]).map(([id, name, hint]) => ({ id, name, hint }));
}

const iso = v => (v instanceof Date ? v.toISOString() : v ? new Date(v).toISOString() : null);

/**
 * `profile` is the user_profiles row plus users.full_name/created_at. `data` holds the learner's
 * activity (certificates, stats, byCourse); the sections are copied in only when their flag is set.
 * Safe to call with `data` omitted for sections that are off (the caller skips those queries).
 */
export function buildPublicProfile(profile, data = {}) {
  const out = {
    handle: profile.handle,
    displayName: profile.display_name || profile.full_name,
    bio: profile.bio || '',
    memberSince: iso(profile.created_at),
    show: {
      certificates: !!profile.show_certificates,
      stats: !!profile.show_stats,
      badges: !!profile.show_badges,
      progress: !!profile.show_progress,
    },
  };
  if (profile.avatar) out.avatar = profile.avatar;
  if (profile.show_certificates) {
    out.certificates = (data.certificates || []).map(c => ({
      certificateUid: c.certificate_uid,
      courseName: c.course_name,
      topicName: c.topic_name,
      score: c.score,
      totalQuestions: c.total_questions,
      percentage: c.total_questions > 0 ? Math.round((c.score / c.total_questions) * 100) : 0,
      issuedAt: iso(c.issued_at),
    }));
  }
  if (profile.show_stats && data.stats) {
    const s = data.stats;
    out.stats = {
      xp: s.xp, currentStreak: s.currentStreak, longestStreak: s.longestStreak, topicsSeen: s.topicsSeen,
      modulesPassed: s.modulesPassed, studyDays: s.studyDays, studySecondsTotal: s.studySecondsTotal,
    };
  }
  if (profile.show_badges && data.badgeInput) out.badges = computeBadges(data.badgeInput);
  if (profile.show_progress) {
    out.courses = Object.entries(data.byCourse || {}).map(([courseId, topicsSeen]) => ({ courseId, topicsSeen: Number(topicsSeen) }))
      .sort((a, b) => b.topicsSeen - a.topicsSeen);
  }
  return out;
}

/** The owner's own settings, in the shape the account page edits. */
export function settingsFromRow(row) {
  return {
    isPublic: !!row?.is_public,
    handle: row?.handle ?? '',
    displayName: row?.display_name ?? '',
    bio: row?.bio ?? '',
    showCertificates: !!row?.show_certificates,
    showStats: !!row?.show_stats,
    showBadges: !!row?.show_badges,
    showProgress: !!row?.show_progress,
  };
}
