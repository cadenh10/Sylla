/**
 * Auth state management with Zustand
 * Handles session, loading, and auth actions
 */
import { create } from 'zustand';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../services/supabase';
import type { User } from '../types/database';

interface AuthState {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  isInitialized: boolean;
  setSession: (session: Session | null) => void;
  setUser: (user: User | null) => void;
  fetchUserProfile: (userId: string) => Promise<User | null>;
  initialize: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, username: string, school?: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  user: null,
  isLoading: false,
  isInitialized: false,

  setSession: (session) => set({ session }),
  setUser: (user) => set({ user }),

  fetchUserProfile: async (userId: string) => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    if (error || !data) return null;
    const user = data as User;
    set({ user });
    return user;
  },

  initialize: async () => {
    set({ isLoading: true });
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        set({ session });
        await get().fetchUserProfile(session.user.id);
      } else {
        set({ session: null, user: null });
      }
    } catch {
      set({ session: null, user: null });
    } finally {
      set({ isLoading: false, isInitialized: true });
    }
  },

  signIn: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { error: error as Error };
      if (data.session?.user) {
        set({ session: data.session });
        await get().fetchUserProfile(data.session.user.id);
      }
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    } finally {
      set({ isLoading: false });
    }
  },

  signUp: async (email: string, password: string, username: string, school?: string) => {
    set({ isLoading: true });
    try {
      // Pass username/school in metadata - the DB trigger creates public.users row
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { username, school: school ?? null } },
      });
      if (error) return { error: error as Error };
      if (data.user) {
        // Profile is created by DB trigger; fetch or use metadata
        if (data.session) {
          const profile = await get().fetchUserProfile(data.user.id);
          if (profile) {
            set({ session: data.session, user: profile });
          } else {
            // Trigger may not have run yet; use metadata
            const newUser: User = {
              id: data.user.id,
              username,
              school: school ?? null,
              created_at: new Date().toISOString(),
            };
            set({ session: data.session, user: newUser });
          }
        }
      }
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    } finally {
      set({ isLoading: false });
    }
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ session: null, user: null });
  },
}));
