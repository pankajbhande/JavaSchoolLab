import { useEffect, useSyncExternalStore } from 'react';
import { useAuth } from '../context/AuthContext';
import { Achievements, getLatestAchievements, refreshAchievements, subscribeAchievements } from '../services/achievements';

/** My level and badges, or null until they have loaded (and always null when signed out). */
export function useAchievements(): Achievements | null {
  const { isLoggedIn } = useAuth();
  const latest = useSyncExternalStore(subscribeAchievements, getLatestAchievements);
  useEffect(() => {
    if (isLoggedIn && !getLatestAchievements()) refreshAchievements().catch(() => {});
  }, [isLoggedIn]);
  return isLoggedIn ? latest : null;
}
