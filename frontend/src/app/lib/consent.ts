import { useSyncExternalStore } from 'react';

/**
 * The visitor's answer to "may we show ads (which use cookies from Google and its partners)?".
 * Kept in this browser only. Until the visitor chooses, nothing third-party is loaded for advertising.
 */
export type Consent = 'granted' | 'denied' | null;

const KEY = 'jsl_ad_consent';
const EVENT = 'jsl:consent';

export function getConsent(): Consent {
  try {
    const v = localStorage.getItem(KEY);
    return v === 'granted' || v === 'denied' ? v : null;
  } catch {
    return null; // storage blocked: behave as "not chosen yet", so no ads are loaded
  }
}

export function setConsent(value: Exclude<Consent, null> | 'reset'): void {
  try {
    if (value === 'reset') localStorage.removeItem(KEY);
    else localStorage.setItem(KEY, value);
  } catch {
    /* private mode: the choice just lasts until the page is closed */
  }
  window.dispatchEvent(new Event(EVENT));
}

function subscribe(onChange: () => void): () => void {
  window.addEventListener(EVENT, onChange);
  window.addEventListener('storage', onChange);
  return () => {
    window.removeEventListener(EVENT, onChange);
    window.removeEventListener('storage', onChange);
  };
}

/** The current choice; components re-render when it changes (also across tabs). */
export function useConsent(): Consent {
  return useSyncExternalStore(subscribe, getConsent, () => null);
}
