import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { fetchProStatus } from '../services/payments';

interface ProContextType {
  isPro: boolean;
  /** ISO date Pro runs until, or null. */
  expiresAt: string | null;
  refresh: () => Promise<void>;
}

const ProContext = createContext<ProContextType>({ isPro: false, expiresAt: null, refresh: async () => {} });

/** Whether the signed-in learner has Pro. A guest, a failed request or a lapsed plan all mean "not Pro", so ads and limits stay as they are. */
export function ProProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const [isPro, setIsPro] = useState(false);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (userId === null) {
      setIsPro(false);
      setExpiresAt(null);
      return;
    }
    try {
      const s = await fetchProStatus();
      setIsPro(s.pro);
      setExpiresAt(s.expiresAt);
    } catch {
      /* keep what we had: a network blip must not flip someone to free or to Pro */
    }
  }, [userId]);

  useEffect(() => {
    if (userId === null) {
      setIsPro(false);
      setExpiresAt(null);
      return;
    }
    void refresh();
  }, [userId, refresh]);

  const value = useMemo(() => ({ isPro, expiresAt, refresh }), [isPro, expiresAt, refresh]);
  return <ProContext.Provider value={value}>{children}</ProContext.Provider>;
}

export function usePro(): ProContextType {
  return useContext(ProContext);
}
