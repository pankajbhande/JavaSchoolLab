// The public address of the site, used for links that must work outside the browser tab, such as
// the QR code printed on a certificate.
//
// In production this is the page's own origin. Set VITE_SITE_URL at build time to pin it (for
// example when the app is also served from a preview or staging host but certificates must always
// point at the real site).

export function siteUrl(): string {
  const configured = (import.meta.env.VITE_SITE_URL as string | undefined)?.trim();
  const base = configured || (typeof window !== 'undefined' ? window.location.origin : 'https://javaschoollab.dhipansoft.in');
  return base.replace(/\/+$/, '');
}

/** Where the QR code on a certificate leads. */
export function certificateVerifyUrl(certificateUid: string): string {
  return `${siteUrl()}/verify/${encodeURIComponent(certificateUid)}`;
}
