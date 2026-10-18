// Handle and bio rules for public profiles. The server (server/lib/profiles.js) is the authority;
// this copy gives instant feedback while typing. server/lib/profiles.test.js asserts they agree.

export const HANDLE_MIN = 3;
export const HANDLE_MAX = 30;
export const BIO_MAX = 160;
export const DISPLAY_NAME_MAX = 60;

export const RESERVED_HANDLES: ReadonlySet<string> = new Set([
  'admin', 'administrator', 'api', 'app', 'account', 'accounts', 'dashboard', 'login', 'logout', 'signin', 'signup',
  'register', 'verify', 'certificate', 'certificates', 'course', 'courses', 'flashcards', 'interview', 'interview-practice',
  'leaderboard', 'me', 'u', 'user', 'users', 'profile', 'profiles', 'settings', 'support', 'help', 'about', 'contact',
  'root', 'system', 'sysadmin', 'moderator', 'mod', 'staff', 'team', 'official', 'javaschoollab', 'jsl', 'dhipan',
  'null', 'undefined', 'true', 'false', 'www', 'mail', 'email', 'static', 'assets', 'public', 'terms', 'privacy',
  'security', 'billing', 'blog', 'docs', 'status', 'search', 'home', 'index', 'new', 'edit', 'delete', 'anonymous',
  'guest', 'test', 'demo', 'webmaster', 'postmaster', 'abuse', 'noreply', 'no-reply',
]);

export function normalizeHandle(value: unknown): string {
  return typeof value === 'string' ? value.trim().toLowerCase() : '';
}

/** An error message, or null when the (normalised) handle is acceptable. */
export function handleError(handle: string): string | null {
  if (typeof handle !== 'string' || !handle) return 'Choose a handle';
  if (handle.length < HANDLE_MIN) return `Use at least ${HANDLE_MIN} characters`;
  if (handle.length > HANDLE_MAX) return `Use at most ${HANDLE_MAX} characters`;
  if (!/^[a-z0-9_-]+$/.test(handle)) return 'Use only lowercase letters, digits, hyphen (-) and underscore (_)';
  if (!/^[a-z0-9]/.test(handle) || !/[a-z0-9]$/.test(handle)) return 'Start and end with a letter or digit';
  if (RESERVED_HANDLES.has(handle)) return 'That handle is reserved. Please pick another';
  return null;
}

export function bioError(bio: string): string | null {
  return bio.length > BIO_MAX ? `Keep your bio to ${BIO_MAX} characters or fewer` : null;
}

export function profileUrl(origin: string, handle: string): string {
  return `${origin.replace(/\/+$/, '')}/u/${encodeURIComponent(handle)}`;
}
