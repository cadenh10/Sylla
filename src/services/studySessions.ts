/**
 * Study session service - CRUD operations
 */
import { supabase } from './supabase';
import type { StudySessionWithUser, StudySessionInput } from '../types/database';

/** Fetch feed of study sessions (all users, with user profile) */
export async function fetchFeedSessions(limit = 50): Promise<StudySessionWithUser[]> {
  const { data, error } = await supabase
    .from('study_sessions')
    .select(`
      *,
      users (username)
    `)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as StudySessionWithUser[];
}

/** Fetch sessions for the current user */
export async function fetchUserSessions(userId: string, limit = 100) {
  const { data, error } = await supabase
    .from('study_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

/** Create a new study session */
export async function createStudySession(userId: string, input: StudySessionInput) {
  const { data, error } = await supabase
    .from('study_sessions')
    .insert({
      user_id: userId,
      subject: input.subject,
      duration_minutes: input.duration_minutes,
      location: input.location,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}
