/**
 * Environment variable helpers
 * Expo uses EXPO_PUBLIC_ prefix for client-side env vars
 */
import Constants from 'expo-constants';

export const ENV = {
  SUPABASE_URL: Constants.expoConfig?.extra?.supabaseUrl ?? process.env.EXPO_PUBLIC_SUPABASE_URL ?? '',
  SUPABASE_ANON_KEY: Constants.expoConfig?.extra?.supabaseAnonKey ?? process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '',
} as const;
