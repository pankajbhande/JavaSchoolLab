// Reading preferences for the notes area, persisted in localStorage.

export type RdWidth = 'comfortable' | 'wide';
export type RdTheme = 'default' | 'sepia' | 'contrast';

export interface ReadingPrefs {
  /** 0..3 -> 90%, 100%, 115%, 130% */
  fontStep: number;
  width: RdWidth;
  theme: RdTheme;
}

export const DEFAULT_PREFS: ReadingPrefs = { fontStep: 1, width: 'wide', theme: 'default' };
export const FONT_SCALES = [0.9, 1, 1.15, 1.3];
export const READING_KEY = 'jsl_reading_prefs';

export function sanitizePrefs(raw: unknown): ReadingPrefs {
  const o = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const step = typeof o.fontStep === 'number' && Number.isInteger(o.fontStep) && o.fontStep >= 0 && o.fontStep < FONT_SCALES.length
    ? o.fontStep : DEFAULT_PREFS.fontStep;
  const width: RdWidth = o.width === 'comfortable' || o.width === 'wide' ? o.width : DEFAULT_PREFS.width;
  const theme: RdTheme = o.theme === 'sepia' || o.theme === 'contrast' || o.theme === 'default' ? o.theme : DEFAULT_PREFS.theme;
  return { fontStep: step, width, theme };
}

export function loadPrefs(): ReadingPrefs {
  try {
    const s = localStorage.getItem(READING_KEY);
    return s ? sanitizePrefs(JSON.parse(s)) : DEFAULT_PREFS;
  } catch { return DEFAULT_PREFS; }
}

export function savePrefs(p: ReadingPrefs) {
  try { localStorage.setItem(READING_KEY, JSON.stringify(p)); } catch { /* storage unavailable */ }
}
