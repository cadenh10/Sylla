/**
 * Supabase client singleton
 * Uses env vars: SUPABASE_URL, SUPABASE_ANON_KEY
 */
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { ENV } from '../utils/env';

// Custom storage adapter for persistence using SecureStore
const ExpoSecureStoreAdapter = {
  getItem: async (key: string) => {
    const value = await SecureStore.getItemAsync(key);
    return value;
  },
  setItem: async (key: string, value: string) => {
    await SecureStore.setItemAsync(key, value);
  },
  removeItem: async (key: string) => {
    await SecureStore.deleteItemAsync(key);
  },
};

export const supabase = createClient(ENV.SUPABASE_URL, ENV.SUPABASE_ANON_KEY, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
