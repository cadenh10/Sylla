/**
 * Main tab navigator - Feed, Study, Profile
 */
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View, StyleSheet } from 'react-native';
import { FeedScreen } from '../screens/FeedScreen';
import { StudyScreen } from '../screens/StudyScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import type { MainTabParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

function TabIcon({ label, focused }: { label: string; focused: boolean }) {
  const emoji = label === 'Feed' ? '📚' : label === 'Study' ? '⏱️' : '👤';
  return (
    <View style={[styles.tabIcon, focused && styles.tabIconFocused]}>
      <Text style={styles.emoji}>{emoji}</Text>
    </View>
  );
}

export function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: true,
        headerStyle: { backgroundColor: '#f8fafc' },
        headerTitleStyle: { fontWeight: '700', fontSize: 18 },
        tabBarStyle: { backgroundColor: '#fff', borderTopColor: '#e2e8f0' },
        tabBarActiveTintColor: '#6366f1',
        tabBarInactiveTintColor: '#94a3b8',
        tabBarLabelStyle: { fontWeight: '600', fontSize: 12 },
        tabBarIcon: ({ focused }) => <TabIcon label={route.name} focused={focused} />,
      })}
    >
      <Tab.Screen name="Feed" component={FeedScreen} options={{ title: 'Feed' }} />
      <Tab.Screen name="Study" component={StudyScreen} options={{ title: 'Study Session' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabIcon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIconFocused: {
    opacity: 1,
  },
  emoji: {
    fontSize: 20,
  },
});
