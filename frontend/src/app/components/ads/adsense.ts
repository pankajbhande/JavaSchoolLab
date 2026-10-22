/**
 * AdSense configuration and lazy loader.
 *
 * The script is fetched on the first ad slot that mounts, not from index.html. The
 * initial load already pulls a 428 kB app chunk plus course data; putting a ~500 kB ad
 * script ahead of that would cost more in bounced students than the ads earn.
 *
 * With VITE_ADSENSE_CLIENT unset — local dev, and any build made before the AdSense
 * account is approved — every slot renders nothing: no placeholder, no reserved gap, no
 * console noise. So this is safe to merge before approval comes through.
 */

import { getConsent } from '../../lib/consent';

export const ADSENSE_CLIENT = import.meta.env.VITE_ADSENSE_CLIENT ?? '';

/** Guards against a half-filled .env: "ca-pub-" alone would load a script that 400s. */
export const adsEnabled = /^ca-pub-\d{10,}$/.test(ADSENSE_CLIENT);

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

let loader: Promise<void> | null = null;

/**
 * Resolves once the AdSense script is usable. Rejects when it is blocked, which for a
 * developer audience is the common case rather than the exception — every caller treats
 * rejection as "render nothing" instead of as an error worth reporting.
 */
export function loadAdSense(): Promise<void> {
  if (!adsEnabled) return Promise.reject(new Error('adsense-not-configured'));
  // No advertising script is ever fetched before the visitor says yes (lib/consent.ts, components/ConsentBanner.tsx).
  if (getConsent() !== 'granted') return Promise.reject(new Error('adsense-no-consent'));
  if (loader) return loader;

  loader = new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.dataset.jslAdsense = 'true';
    script.src =
      'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=' + ADSENSE_CLIENT;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('adsense-blocked'));
    document.head.appendChild(script);
  });

  return loader;
}

/**
 * Ad unit ids, in one place so the AdSense dashboard and the code cannot drift.
 * Create each unit in AdSense > Ads > By ad unit, then paste its numeric slot id here.
 */
export const AD_SLOTS = {
  /** Right rail, above the keypoints. Highest viewability on desktop. */
  railTop: import.meta.env.VITE_AD_SLOT_RAIL_TOP ?? '',
  /** Right rail, after the interview questions. Seen by students who read to the end. */
  railBottom: import.meta.env.VITE_AD_SLOT_RAIL_BOTTOM ?? '',
  /** Dismissible bottom-right corner unit. */
  corner: import.meta.env.VITE_AD_SLOT_CORNER ?? '',
} as const;
