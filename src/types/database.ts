/**
 * Database types for Supabase
 * Matches the schema: users, study_sessions
 */

export interface User {
  id: string;
  username: string;
  school: string | null;
  created_at: string;
}

export interface StudySession {
  id: string;
  user_id: string;
  subject: string;
  duration_minutes: number;
  location: string | null;
  created_at: string;
}

/** Study session with user profile joined (for feed) */
export interface StudySessionWithUser extends StudySession {
  users: Pick<User, 'username'> | null;
}

/** Form data when creating a study session */
export interface StudySessionInput {
  subject: string;
  duration_minutes: number;
  location: string | null;
}
