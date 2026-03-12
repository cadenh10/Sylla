/**
 * Card component for displaying a study session in the feed
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { StudySessionWithUser } from '../types/database';

interface FeedCardProps {
  session: StudySessionWithUser;
}

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  return `${m}m`;
}

function formatTimestamp(createdAt: string): string {
  const date = new Date(createdAt);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export function FeedCard({ session }: FeedCardProps) {
  const username = session.users?.username ?? 'Anonymous';
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.username}>{username}</Text>
        <Text style={styles.timestamp}>{formatTimestamp(session.created_at)}</Text>
      </View>
      <Text style={styles.duration}>Studied {formatDuration(session.duration_minutes)}</Text>
      <Text style={styles.subject}>{session.subject}</Text>
      {session.location ? (
        <Text style={styles.location}>📍 {session.location}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  username: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  timestamp: {
    fontSize: 12,
    color: '#64748b',
  },
  duration: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6366f1',
    marginBottom: 4,
  },
  subject: {
    fontSize: 15,
    color: '#334155',
    marginBottom: 4,
  },
  location: {
    fontSize: 13,
    color: '#64748b',
  },
});
