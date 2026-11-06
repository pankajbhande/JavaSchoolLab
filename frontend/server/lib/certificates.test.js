import { describe, it, expect } from 'vitest';
import { generateCertificateUid, isCertificateUid, createRateLimiter } from './certificates.js';

describe('certificate ids', () => {
  it('look like JSL-XXXX-XXXX-XXXX from an unambiguous alphabet', () => {
    for (let i = 0; i < 200; i++) {
      const uid = generateCertificateUid();
      expect(uid).toMatch(/^JSL-[0-9A-HJKMNP-TV-Z]{4}-[0-9A-HJKMNP-TV-Z]{4}-[0-9A-HJKMNP-TV-Z]{4}$/);
      expect(isCertificateUid(uid)).toBe(true);
    }
  });

  it('do not repeat', () => {
    const seen = new Set(Array.from({ length: 5000 }, generateCertificateUid));
    expect(seen.size).toBe(5000);
  });

  it('accepts old-format ids and rejects junk', () => {
    expect(isCertificateUid('JSL-1760000000000-AB12CD')).toBe(true);
    expect(isCertificateUid('JSL-MGK4F2XQ')).toBe(true);
    for (const bad of ['', 'abc', 'JSL-', "JSL-1' OR '1'='1", 'jsl-ABCD', 'JSL-' + 'A'.repeat(80), null, undefined, 42]) {
      expect(isCertificateUid(bad)).toBe(false);
    }
  });
});

describe('rate limiter', () => {
  const run = (limiter, ip) => {
    const res = { code: 200, headers: {}, set(k, v) { this.headers[k] = v; }, status(c) { this.code = c; return this; }, json() { return this; } };
    let passed = false;
    limiter({ ip }, res, () => { passed = true; });
    return { passed, res };
  };

  it('lets requests through up to the limit, then answers 429 with Retry-After', () => {
    const limiter = createRateLimiter({ windowMs: 60_000, max: 3 });
    for (let i = 0; i < 3; i++) expect(run(limiter, '1.1.1.1').passed).toBe(true);
    const blocked = run(limiter, '1.1.1.1');
    expect(blocked.passed).toBe(false);
    expect(blocked.res.code).toBe(429);
    expect(Number(blocked.res.headers['Retry-After'])).toBeGreaterThan(0);
  });

  it('counts each client separately', () => {
    const limiter = createRateLimiter({ max: 1 });
    expect(run(limiter, 'a').passed).toBe(true);
    expect(run(limiter, 'b').passed).toBe(true);
    expect(run(limiter, 'a').passed).toBe(false);
  });
});
