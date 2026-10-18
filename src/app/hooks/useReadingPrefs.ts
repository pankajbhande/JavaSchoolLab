import { useCallback, useState } from 'react';
import { loadPrefs, savePrefs, type ReadingPrefs } from '../lib/readingPrefs';

export function useReadingPrefs() {
  const [prefs, setPrefs] = useState<ReadingPrefs>(loadPrefs);
  const update = useCallback((patch: Partial<ReadingPrefs>) => {
    setPrefs(p => { const n = { ...p, ...patch }; savePrefs(n); return n; });
  }, []);
  return [prefs, update] as const;
}
