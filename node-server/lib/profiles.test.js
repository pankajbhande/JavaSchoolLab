import { describe, it, expect } from 'vitest';
import {
  normalizeHandle, handleError, cleanBio, bioError, computeBadges, buildPublicProfile, settingsFromRow, RESERVED_HANDLES, BIO_MAX,
} from './profiles.js';
import * as client from '../../frontend/src/app/lib/profileHandle';

describe('handle validation', () => {
  it('accepts good handles', () => {
    for (const h of ['abc', 'asha_k', 'dev-ops', 'a1b2', 'x'.repeat(30), '123']) expect(handleError(h)).toBeNull();
  });
  it('rejects bad handles', () => {
    for (const h of ['', 'ab', 'x'.repeat(31), 'Has Space', 'UPPER', 'a.b', 'a@b', '-abc', 'abc-', '_abc', 'abc_', 'ünï', 'a/b', '<script>']) {
      expect(handleError(h), h).not.toBeNull();
    }
  });
  it('blocks reserved words', () => {
    for (const h of ['admin', 'api', 'login', 'verify', 'dashboard', 'users', 'javaschoollab']) expect(handleError(h), h).toMatch(/reserved/);
  });
  it('normalises case and whitespace, and non-strings', () => {
    expect(normalizeHandle('  Asha_K ')).toBe('asha_k');
    expect(normalizeHandle(null)).toBe('');
    expect(normalizeHandle(42)).toBe('');
  });
  it('agrees with the client copy', () => {
    expect([...client.RESERVED_HANDLES].sort()).toEqual([...RESERVED_HANDLES].sort());
    const samples = ['', 'ab', 'abc', 'Abc', 'a_b-c', '-ab', 'ab-', 'x'.repeat(30), 'x'.repeat(31), 'admin', 'me', 'a b', 'é1é', '123', '__x__', 'ok_name-1', 'u', 'uu', 'uuu', 'test'];
    for (const s of samples) {
      expect(client.handleError(s), s).toBe(handleError(s));
      expect(client.normalizeHandle(s)).toBe(normalizeHandle(s));
    }
    expect(client.BIO_MAX).toBe(BIO_MAX);
    expect(client.bioError('x'.repeat(161))).toBe(bioError('x'.repeat(161)));
  });
});

describe('bio', () => {
  it('strips control characters and enforces the cap', () => {
    expect(cleanBio('hi\u0000 there\u0007')).toBe('hi there');
    expect(cleanBio(5)).toBe('');
    expect(bioError('x'.repeat(160))).toBeNull();
    expect(bioError('x'.repeat(161))).not.toBeNull();
  });
  it('leaves markup alone (React renders it escaped)', () => {
    expect(cleanBio('<b>hi</b>')).toBe('<b>hi</b>');
  });
});

describe('badges', () => {
  it('returns only earned badges', () => {
    expect(computeBadges({ topicsSeen: 0, longestStreak: 0, modulesPassed: 0, studySecondsTotal: 0, certificates: 0 })).toEqual([]);
    const ids = computeBadges({ topicsSeen: 30, longestStreak: 7, modulesPassed: 1, studySecondsTotal: 4000, certificates: 1 }).map(b => b.id);
    expect(ids).toEqual(['first', 'explorer', 'streak3', 'streak7', 'quiz1', 'cert', 'focus']);
  });
});

describe('buildPublicProfile (privacy)', () => {
  const row = {
    handle: 'asha', display_name: null, full_name: 'Asha K', bio: 'hello', created_at: new Date('2026-03-04T00:00:00Z'),
    show_certificates: 0, show_stats: 0, show_badges: 0, show_progress: 0,
    // must never be copied even if a caller passes the whole row
    email: 'secret@example.com', mobile: '9999999999', dob: '2000-01-01', organization: 'Acme', user_id: 7, id: 7,
  };
  const data = {
    certificates: [{ certificate_uid: 'JSL-AAAA-BBBB-CCCC', course_name: 'Java', topic_name: 'Loops', score: 9, total_questions: 10, issued_at: new Date('2026-04-01T00:00:00Z'), user_id: 7, id: 3 }],
    stats: { xp: 100, currentStreak: 2, longestStreak: 3, topicsSeen: 5, modulesPassed: 1, studyDays: 4, studySecondsTotal: 99 },
    badgeInput: { topicsSeen: 5, longestStreak: 3, modulesPassed: 1, studySecondsTotal: 99, certificates: 1 },
    byCourse: { java: 5 },
  };

  it('shares nothing optional by default', () => {
    const out = buildPublicProfile(row, data);
    expect(Object.keys(out).sort()).toEqual(['bio', 'displayName', 'handle', 'memberSince', 'show']);
    expect(out.displayName).toBe('Asha K');
  });
  it('adds only the opted-in sections', () => {
    const out = buildPublicProfile({ ...row, show_stats: 1, show_progress: 1 }, data);
    expect(out.stats).toBeDefined();
    expect(out.courses).toEqual([{ courseId: 'java', topicsSeen: 5 }]);
    expect(out.certificates).toBeUndefined();
    expect(out.badges).toBeUndefined();
  });
  it('never leaks identity fields or ids', () => {
    const out = buildPublicProfile({ ...row, show_certificates: 1, show_stats: 1, show_badges: 1, show_progress: 1 }, data);
    const text = JSON.stringify(out);
    for (const secret of ['secret@example.com', '9999999999', '2000-01-01', 'Acme', 'user_id', 'email', 'mobile']) {
      expect(text).not.toContain(secret);
    }
    expect(out.certificates[0]).toEqual({
      certificateUid: 'JSL-AAAA-BBBB-CCCC', courseName: 'Java', topicName: 'Loops', score: 9, totalQuestions: 10, percentage: 90,
      issuedAt: '2026-04-01T00:00:00.000Z',
    });
  });
});

describe('settingsFromRow', () => {
  it('defaults everything to off with no row', () => {
    expect(settingsFromRow(null)).toEqual({
      isPublic: false, handle: '', displayName: '', bio: '', showCertificates: false, showStats: false, showBadges: false, showProgress: false,
    });
  });
});
