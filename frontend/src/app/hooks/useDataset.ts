import { useEffect, useState } from 'react';
import { datasetsFromApi, getLoadedDataset, loadDataset, type DatasetName } from '../data/datasetLoader';

export type DatasetStatus = 'loading' | 'ready' | 'error';

/**
 * A data set for a component.
 *
 * Bundle mode: pass the value the component already imports statically as `bundled`; it is returned
 * immediately with status 'ready', exactly as before (no extra render, no flicker).
 * Api mode: `bundled` is ignored; the data set is fetched once (shared cache) and status goes
 * 'loading' -> 'ready' | 'error'. `data` is undefined until ready.
 */
export function useDataset<T>(name: DatasetName, bundled?: T): { data: T | undefined; status: DatasetStatus } {
  const direct = !datasetsFromApi() && bundled !== undefined;
  const [state, setState] = useState<{ data: T | undefined; status: DatasetStatus }>(() => {
    const cached = getLoadedDataset<T>(name);
    return cached !== undefined ? { data: cached, status: 'ready' } : { data: undefined, status: 'loading' };
  });

  useEffect(() => {
    if (direct) return;
    let cancelled = false;
    loadDataset<T>(name)
      .then(data => { if (!cancelled) setState({ data, status: 'ready' }); })
      .catch(() => { if (!cancelled) setState({ data: undefined, status: 'error' }); });
    return () => { cancelled = true; };
  }, [name, direct]);

  return direct ? { data: bundled, status: 'ready' } : state;
}
