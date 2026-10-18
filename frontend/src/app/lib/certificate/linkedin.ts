// "Add to LinkedIn profile": LinkedIn's documented add-certification link. It opens the form on
// LinkedIn with the fields below filled in; the student only confirms. The certificate URL is the
// public verification page, so anyone viewing the profile can check it is genuine.

export interface LinkedInCertification {
  moduleName: string;
  courseName: string;
  issuedAt: Date;
  certificateUid: string;
  /** Public verification page for this certificate. */
  verifyUrl: string;
}

const ORGANISATION = 'JavaSchoolLab';

/** LinkedIn limits certification names to 100 characters. */
export function linkedInCertName(moduleName: string, courseName: string): string {
  const name = moduleName.trim() === courseName.trim() ? moduleName.trim() : `${moduleName.trim()} (${courseName.trim()})`;
  return name.length <= 100 ? name : name.slice(0, 97).trimEnd() + '...';
}

export function linkedInAddUrl(c: LinkedInCertification): string {
  const params = new URLSearchParams({
    startTask: 'CERTIFICATION_NAME',
    name: linkedInCertName(c.moduleName, c.courseName),
    organizationName: ORGANISATION,
    issueYear: String(c.issuedAt.getFullYear()),
    issueMonth: String(c.issuedAt.getMonth() + 1),
    certUrl: c.verifyUrl,
    certId: c.certificateUid,
  });
  return `https://www.linkedin.com/profile/add?${params.toString()}`;
}
