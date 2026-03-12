/**
 * Hook to fetch and refresh feed sessions
 */
import { useState, useEffect, useCallback } from 'react';
import { fetchFeedSessions } from '../services/studySessions';
import type { StudySessionWithUser } from '../types/database';

export function useFeed() {
  const [sessions, setSessions] = useState<StudySessionWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchFeedSessions();
      setSessions(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load feed'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { sessions, loading, error, refresh };
}
