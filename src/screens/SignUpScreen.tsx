/**
 * Sign up screen - email/password registration and verification.
 * Includes email verification messaging, resend cooldown, and university autocomplete.
 */
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { UniversitySearchInput } from '../components/UniversitySearchInput';
import { useAuthStore } from '../store/authStore';
import type { AuthStackParamList } from '../navigation/types';
import { supabase } from '../services/supabase';

// Map Supabase auth error messages to friendlier variants
const mapAuthErrorMessage = (message: string): string => {
  const lower = message.toLowerCase();
  if (lower.includes('user already registered')) {
    return 'An account with this email already exists.';
  }
  if (lower.includes('email not confirmed')) {
    return 'Please verify your email before logging in.';
  }
  if (lower.includes('rate limit') || lower.includes('too many requests')) {
    return 'Too many attempts. Please wait a minute before trying again.';
  }
  return message;
};

type Props = NativeStackScreenProps<AuthStackParamList, 'SignUp'>;

export function SignUpScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [university, setUniversity] = useState('');

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  const [resendSecondsLeft, setResendSecondsLeft] = useState(0);
  const resendIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const { signUp, isLoading } = useAuthStore();

  // Start a resend verification email cooldown
  const startResendCooldown = () => {
    if (resendIntervalRef.current) {
      clearInterval(resendIntervalRef.current);
    }
    setResendSecondsLeft(60);
    resendIntervalRef.current = setInterval(() => {
      setResendSecondsLeft((prev) => {
        if (prev <= 1) {
          if (resendIntervalRef.current) {
            clearInterval(resendIntervalRef.current);
            resendIntervalRef.current = null;
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Clean up resend cooldown timer on unmount
  useEffect(() => {
    return () => {
      if (resendIntervalRef.current) {
        clearInterval(resendIntervalRef.current);
      }
    };
  }, []);

  const handleSignUp = async () => {
    setErrorMessage(null);
    setInfoMessage(null);

    if (!email.trim() || !password || !username.trim()) {
      setErrorMessage('Please enter email, password, and username.');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    const schoolValue = university.trim() || undefined;
    const { error } = await signUp(email.trim(), password, username.trim(), schoolValue);
    if (error) {
      setErrorMessage(mapAuthErrorMessage(error.message));
      return;
    }

    // Show verification message without navigating away and start cooldown
    setInfoMessage(`Verification email sent to ${email.trim()}. Please check your inbox.`);
    startResendCooldown();
  };

  // Trigger a resend of the verification email, respecting cooldown and rate limits
  const handleResendEmail = async () => {
    setErrorMessage(null);

    if (!email.trim()) {
      setErrorMessage('Enter your email above before resending the verification email.');
      return;
    }
    if (resendSecondsLeft > 0) {
      return;
    }

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email.trim(),
      });
      if (error) {
        setErrorMessage(mapAuthErrorMessage(error.message));
        return;
      }
      setInfoMessage(`Verification email re-sent to ${email.trim()}.`);
      startResendCooldown();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong while resending email.';
      setErrorMessage(mapAuthErrorMessage(message));
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Create account</Text>
        <Text style={styles.subtitle}>Join Sylla and track your study sessions</Text>

        {errorMessage && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        )}

        {infoMessage && (
          <View style={styles.infoBanner}>
            <Text style={styles.infoText}>{infoMessage}</Text>
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
          placeholder="At least 6 characters"
          secureTextEntry
        />
        <Input
          label="Username"
          value={username}
          onChangeText={setUsername}
          placeholder="studybuddy"
          autoCapitalize="none"
        />
        <UniversitySearchInput value={university} onSelect={setUniversity} error={undefined} />

        <View style={styles.resendRow}>
          <Button title="Sign Up" onPress={handleSignUp} loading={isLoading} />
        </View>

        <View style={styles.resendRow}>
          <Button
            title={resendSecondsLeft > 0 ? `Resend email (${resendSecondsLeft}s)` : 'Resend Email'}
            onPress={handleResendEmail}
            disabled={resendSecondsLeft > 0 || isLoading}
            variant="outline"
          />
        </View>
        <Button
          title="Already have an account? Sign in"
          onPress={() => navigation.navigate('Login')}
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
  infoBanner: {
    backgroundColor: '#e0f2fe',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#bae6fd',
  },
  infoText: {
    color: '#0369a1',
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
  resendRow: {
    marginBottom: 12,
  },
});
