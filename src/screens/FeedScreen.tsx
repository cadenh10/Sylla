/**
 * Feed screen - displays study sessions from all users
 */
import React from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { FeedCard } from '../components/FeedCard';
import { useFeed } from '../hooks/useFeed';
import type { StudySessionWithUser } from '../types/database';

export function FeedScreen() {
  const { sessions, loading, error, refresh } = useFeed();

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error.message}</Text>
        <Text style={styles.hint}>Check your Supabase connection and env vars.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={sessions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <FeedCard session={item} />}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No study sessions yet</Text>
            <Text style={styles.emptySubtext}>Start a study session to see it here!</Text>
          </View>
        }
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refresh} colors={['#6366f1']} />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  list: {
    padding: 16,
    paddingBottom: 24,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 16,
    color: '#dc2626',
    textAlign: 'center',
  },
  hint: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 8,
  },
  empty: {
    paddingVertical: 48,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#334155',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
});
