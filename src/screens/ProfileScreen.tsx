/**
 * Profile screen - username, total hours, sessions this week
 */
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Button } from '../components/Button';
import { useAuthStore } from '../store/authStore';
import { useUserStats } from '../hooks/useUserStats';

function formatHours(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  return `${m}m`;
}

export function ProfileScreen() {
  const { user, signOut } = useAuthStore();
  const { stats, loading } = useUserStats(user?.id);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <Text style={styles.username}>{user?.username ?? 'User'}</Text>
        {user?.school ? (
          <Text style={styles.school}>{user.school}</Text>
        ) : null}
      </View>

      <View style={styles.stats}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>
            {loading ? '...' : formatHours(stats.totalMinutes)}
          </Text>
          <Text style={styles.statLabel}>Total study time</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>
            {loading ? '...' : stats.sessionsThisWeek}
          </Text>
          <Text style={styles.statLabel}>Sessions this week</Text>
        </View>
      </View>

      <Button title="Sign Out" onPress={signOut} variant="outline" />
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
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  username: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0f172a',
  },
  school: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  stats: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 32,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#6366f1',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
});
