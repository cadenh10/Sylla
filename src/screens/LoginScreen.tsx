/**
 * Login screen - email/password authentication with banner-based error handling.
 */
import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { useAuthStore } from '../store/authStore';
import type { AuthStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { signIn, isLoading } = useAuthStore();

  // Map Supabase auth error messages to friendlier variants
  const mapAuthErrorMessage = (message: string): string => {
    const lower = message.toLowerCase();
    if (lower.includes('invalid login credentials')) {
      return 'Incorrect email or password.';
    }
    if (lower.includes('user already registered')) {
      return 'An account with this email already exists.';
    }
    if (lower.includes('email not confirmed')) {
      return 'Please verify your email before logging in.';
    }
    return message;
  };

  const handleLogin = async () => {
    setErrorMessage(null);

    if (!email.trim() || !password) {
      setErrorMessage('Please enter email and password.');
      return;
    }
    const { error } = await signIn(email.trim(), password);
    if (error) {
      setErrorMessage(mapAuthErrorMessage(error.message));
    }
    // Success: auth listener or store will trigger redirect
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.subtitle}>Sign in to continue studying</Text>
        {errorMessage && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        )}
        <Input
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          keyboardType="email-address"
        />
        <Input
          label="Password"
          value={password}
          onChangeText={setPassword}
          placeholder="••••••••"
          secureTextEntry
        />
        <Button title="Sign In" onPress={handleLogin} loading={isLoading} />
        <Button
          title="Create account"
          onPress={() => navigation.navigate('SignUp')}
          variant="outline"
          disabled={isLoading}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scroll: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 60,
  },
  errorBanner: {
    backgroundColor: '#fee2e2',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  errorText: {
    color: '#b91c1c',
    fontSize: 14,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 32,
  },
});
