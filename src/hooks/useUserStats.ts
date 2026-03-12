/**
 * Hook to fetch user stats (total hours, sessions this week)
 */
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase';

interface UserStats {
  totalMinutes: number;
  sessionsThisWeek: number;
}

export function useUserStats(userId: string | undefined) {
  const [stats, setStats] = useState<UserStats>({ totalMinutes: 0, sessionsThisWeek: 0 });
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!userId) {
      setStats({ totalMinutes: 0, sessionsThisWeek: 0 });
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const startOfWeek = new Date();
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      const startIso = startOfWeek.toISOString();

      const { data, error } = await supabase
        .from('study_sessions')
        .select('duration_minutes, created_at')
        .eq('user_id', userId);

      if (error) throw error;

      let totalMinutes = 0;
      let sessionsThisWeek = 0;
      for (const s of data ?? []) {
        totalMinutes += s.duration_minutes;
        if (s.created_at >= startIso) sessionsThisWeek++;
      }
      setStats({ totalMinutes, sessionsThisWeek });
    } catch {
      setStats({ totalMinutes: 0, sessionsThisWeek: 0 });
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { stats, loading, refresh };
}
