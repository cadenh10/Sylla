/**
 * Root navigator - switches between Auth and Main app
 */
import React, { useEffect } from 'react';
import { supabase } from '../services/supabase';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { AuthStack } from './AuthStack';
import { MainTabs } from './MainTabs';
import { useAuthStore } from '../store/authStore';

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const { session, isInitialized, initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  // Listen for auth changes (e.g. sign out, token refresh)
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      useAuthStore.getState().setSession(session);
      if (session?.user) {
        useAuthStore.getState().fetchUserProfile(session.user.id);
      } else {
        useAuthStore.getState().setUser(null);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  if (!isInitialized) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {session ? (
        <Stack.Screen name="Main" component={MainTabs} />
      ) : (
        <Stack.Screen name="Auth" component={AuthStack} />
      )}
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
});
