/**
 * Rewind — Points Tab (Placeholder)
 * 
 * Phase 1 placeholder. Jar + streaks will be built in Phase 3.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/src/theme/colors';
import { FontFamily } from '@/src/theme/typography';
import { Spacing } from '@/src/theme/spacing';

export default function PointsScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient
        colors={[Colors.surface, Colors.tertiary]}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.content}>
        <Text style={styles.emoji}>🏆</Text>
        <Text style={styles.title}>Your Points</Text>
        <Text style={styles.subtitle}>
          Your blooming jar and weekly streaks{'\n'}will appear here soon
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.breathe,
    paddingBottom: 100,
  },
  emoji: {
    fontSize: 56,
    marginBottom: Spacing.generous,
  },
  title: {
    fontFamily: FontFamily.bold,
    fontSize: 28,
    color: Colors.on_surface,
    marginBottom: Spacing.compact,
  },
  subtitle: {
    fontFamily: FontFamily.regular,
    fontSize: 18,
    color: Colors.on_surface_variant,
    textAlign: 'center',
    lineHeight: 26,
  },
});
