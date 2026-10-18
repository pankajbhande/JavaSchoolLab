import { describe, it, expect } from 'vitest';
import { linkedInAddUrl, linkedInCertName } from './linkedin';

describe('LinkedIn add-certification link', () => {
  const cert = {
    moduleName: 'Java Basics',
    courseName: 'Java',
    issuedAt: new Date(2026, 9, 17),
    certificateUid: 'JSL-ABCD-EFGH-JKMN',
    verifyUrl: 'https://javaschoollab.com/verify/JSL-ABCD-EFGH-JKMN',
  };

  it('fills every field LinkedIn asks for', () => {
    const url = new URL(linkedInAddUrl(cert));
    expect(url.origin + url.pathname).toBe('https://www.linkedin.com/profile/add');
    expect(url.searchParams.get('startTask')).toBe('CERTIFICATION_NAME');
    expect(url.searchParams.get('name')).toBe('Java Basics (Java)');
    expect(url.searchParams.get('organizationName')).toBe('JavaSchoolLab');
    expect(url.searchParams.get('issueYear')).toBe('2026');
    expect(url.searchParams.get('issueMonth')).toBe('10');
    expect(url.searchParams.get('certUrl')).toBe(cert.verifyUrl);
    expect(url.searchParams.get('certId')).toBe(cert.certificateUid);
  });

  it('encodes awkward characters safely', () => {
    const url = new URL(linkedInAddUrl({ ...cert, moduleName: 'Spring & "Boot" <3', courseName: 'Java' }));
    expect(url.searchParams.get('name')).toBe('Spring & "Boot" <3 (Java)');
  });

  it('keeps names within LinkedIn\'s 100-character limit', () => {
    const name = linkedInCertName('M'.repeat(90), 'Course name here');
    expect(name.length).toBeLessThanOrEqual(100);
    expect(name.endsWith('...')).toBe(true);
  });

  it('does not repeat the name when module and course are the same', () => {
    expect(linkedInCertName('Java', 'Java')).toBe('Java');
  });
});
