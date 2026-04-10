/**
 * Rewind — ProgressBar
 * 
 * Warm gradient progress bar showing daily completion.
 * Uses primary → primary_fixed_variant gradient per the "Glass & Gradient" rule.
 */

import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import type { ThemeColors } from '../theme/colors';
import { Radius } from '../theme/spacing';
import { useTheme } from '../theme/ThemeContext';

interface ProgressBarProps {
  /** Value between 0 and 1 */
  progress: number;
  /** Height of the bar in pixels */
  height?: number;
}

export default function ProgressBar({ progress, height = 12 }: ProgressBarProps) {
  const { colors, themeName } = useTheme();
  const animatedWidth = useSharedValue(0);
  const styles = createStyles(colors);
  const gradientColors =
    themeName === 'golden_sun'
      ? ([colors.primary, '#F68A2F', colors.secondary_container] as const)
      : ([colors.primary, colors.primary_fixed_variant] as const);

  useEffect(() => {
    // Animate to new progress with a gentle ease-in-out (300–500ms per spec)
    animatedWidth.value = withTiming(Math.min(Math.max(progress, 0), 1), {
      duration: 500,
      easing: Easing.bezier(0.4, 0, 0.2, 1),
    });
  }, [animatedWidth, progress]);

  const fillStyle = useAnimatedStyle(() => {
    return {
      width: `${animatedWidth.value * 100}%` as any,
    };
  });

  return (
    <View style={[styles.track, { height }]}>
      <Animated.View style={[styles.fillContainer, { height }, fillStyle]}>
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.fill, { height }]}
        />
      </Animated.View>
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    track: {
      width: '100%',
      backgroundColor: colors.surface_container_high,
      borderRadius: Radius.full,
      overflow: 'hidden',
    },
    fillContainer: {
      borderRadius: Radius.full,
      overflow: 'hidden',
    },
    fill: {
      width: '100%',
      borderRadius: Radius.full,
    },
  });

