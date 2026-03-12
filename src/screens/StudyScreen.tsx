/**
 * Study screen - start/stop study session with timer
 */
import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, Alert } from 'react-native';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { useAuthStore } from '../store/authStore';
import { createStudySession } from '../services/studySessions';

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function StudyScreen() {
  const { session } = useAuthStore();
  const [isStudying, setIsStudying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [subject, setSubject] = useState('');
  const [location, setLocation] = useState('');
  const [saving, setSaving] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isStudying) {
      intervalRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isStudying]);

  const handleStart = () => {
    setElapsed(0);
    setIsStudying(true);
  };

  const handleStop = async () => {
    setIsStudying(false);
    const durationMinutes = Math.ceil(elapsed / 60);
    if (durationMinutes < 1) {
      Alert.alert('Too short', 'Study at least 1 minute to save.');
      return;
    }
    if (!subject.trim()) {
      Alert.alert('Missing subject', 'Please enter what you studied.');
      return;
    }
    if (!session?.user?.id) {
      Alert.alert('Error', 'You must be logged in to save sessions.');
      return;
    }
    setSaving(true);
    try {
      await createStudySession(session.user.id, {
        subject: subject.trim(),
        duration_minutes: durationMinutes,
        location: location.trim() || null,
      });
      setSubject('');
      setLocation('');
      setElapsed(0);
      Alert.alert('Saved!', `Studied ${formatTime(elapsed)} – ${subject}`);
    } catch (err) {
      Alert.alert('Error', (err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.timerSection}>
        <Text style={styles.timer}>{formatTime(elapsed)}</Text>
        <Text style={styles.timerLabel}>
          {isStudying ? 'Studying...' : 'Ready to study'}
        </Text>
      </View>

      {!isStudying ? (
        <>
          <Input
            label="Subject"
            value={subject}
            onChangeText={setSubject}
            placeholder="e.g. Calculus"
          />
          <Input
            label="Location (optional)"
            value={location}
            onChangeText={setLocation}
            placeholder="e.g. Main Library"
          />
          <Button title="Start Study Session" onPress={handleStart} />
        </>
      ) : (
        <>
          <Input
            label="Subject"
            value={subject}
            onChangeText={setSubject}
            placeholder="e.g. Calculus"
          />
          <Input
            label="Location (optional)"
            value={location}
            onChangeText={setLocation}
            placeholder="e.g. Main Library"
          />
          <Button
            title="Stop & Save"
            onPress={handleStop}
            loading={saving}
            variant="secondary"
          />
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    padding: 24,
    paddingBottom: 48,
  },
  timerSection: {
    alignItems: 'center',
    marginBottom: 32,
    paddingVertical: 24,
  },
  timer: {
    fontSize: 56,
    fontWeight: '800',
    color: '#6366f1',
    fontVariant: ['tabular-nums'],
  },
  timerLabel: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 8,
  },
});
