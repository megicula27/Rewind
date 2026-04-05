/**
 * Rewind — Profile Tab (Placeholder)
 * 
 * Phase 1 placeholder. Settings, themes, and accessibility toggles
 * will be built in Phase 6.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/src/theme/colors';
import { FontFamily } from '@/src/theme/typography';
import { Spacing } from '@/src/theme/spacing';
import { useTheme } from '@/src/theme/ThemeContext';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { userName } = useTheme();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient
        colors={[Colors.surface, Colors.tertiary]}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.content}>
        <Text style={styles.emoji}>🌸</Text>
        <Text style={styles.title}>{userName || 'Profile'}</Text>
        <Text style={styles.subtitle}>
          Theme selection, accessibility settings,{'\n'}
          and your weekly summary will live here
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
