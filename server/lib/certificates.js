// Helpers for certificate IDs and the public verification lookup.

import crypto from 'node:crypto';

// Crockford base32: no I, L, O or U, so an ID read aloud or typed from paper cannot be misread.
const ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';

/**
 * A new certificate ID such as JSL-7K3M-Q9XD-4HTB: 12 characters from a CSPRNG (60 bits), so IDs
 * cannot be guessed or counted. The old format was a millisecond timestamp plus six characters,
 * which a stranger could enumerate once verification became public.
 */
export function generateCertificateUid() {
  const bytes = crypto.randomBytes(12);
  let chars = '';
  for (let i = 0; i < 12; i++) chars += ALPHABET[bytes[i] % 32];
  return `JSL-${chars.slice(0, 4)}-${chars.slice(4, 8)}-${chars.slice(8, 12)}`;
}

/** IDs we have ever issued: JSL-<letters, digits, dashes>. Anything else is rejected before touching the database. */
export function isCertificateUid(value) {
  return typeof value === 'string' && /^JSL-[A-Za-z0-9-]{4,60}$/.test(value);
}

/**
 * A small fixed-window limiter per client address. Verification is public, so without a limit
 * anyone could hammer it; this keeps casual abuse out without adding a dependency.
 */
export function createRateLimiter({ windowMs = 60_000, max = 60 } = {}) {
  const hits = new Map();
  return function rateLimit(req, res, next) {
    const now = Date.now();
    const key = req.ip || req.socket?.remoteAddress || 'unknown';
    const entry = hits.get(key);
    if (!entry || now - entry.start >= windowMs) {
      hits.set(key, { start: now, count: 1 });
    } else if (++entry.count > max) {
      res.set('Retry-After', String(Math.ceil((entry.start + windowMs - now) / 1000)));
      return res.status(429).json({ error: 'Too many requests. Please wait a minute and try again.' });
    }
    if (hits.size > 5000) for (const [k, v] of hits) if (now - v.start >= windowMs) hits.delete(k);
    next();
  };
}
