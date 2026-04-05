/**
 * Rewind — Tab Layout
 * 
 * 4-tab navigator with custom glassmorphic tab bar.
 * Tabs: Home, Add, Points, Profile
 * All tabs sit flush (no elevation on Add button per user's preference).
 */

import { Tabs } from 'expo-router';
import React from 'react';

import GlassTabBar from '@/src/components/GlassTabBar';
import { Colors } from '@/src/theme/colors';

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <GlassTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: 'none' }, // Hidden — we use custom GlassTabBar
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'Home' }}
      />
      <Tabs.Screen
        name="add"
        options={{ title: 'Add' }}
      />
      <Tabs.Screen
        name="points"
        options={{ title: 'Points' }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: 'Profile' }}
      />
    </Tabs>
  );
}
