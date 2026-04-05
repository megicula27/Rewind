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
import { Colors } from '../theme/colors';
import { Radius, Spacing } from '../theme/spacing';

interface ProgressBarProps {
  /** Value between 0 and 1 */
  progress: number;
  /** Height of the bar in pixels */
  height?: number;
}

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

export default function ProgressBar({ progress, height = 12 }: ProgressBarProps) {
  const animatedWidth = useSharedValue(0);

  useEffect(() => {
    // Animate to new progress with a gentle ease-in-out (300–500ms per spec)
    animatedWidth.value = withTiming(Math.min(Math.max(progress, 0), 1), {
      duration: 500,
      easing: Easing.bezier(0.4, 0, 0.2, 1),
    });
  }, [progress]);

  const fillStyle = useAnimatedStyle(() => {
    return {
      width: `${animatedWidth.value * 100}%` as any,
    };
  });

  return (
    <View style={[styles.track, { height }]}>
      <Animated.View style={[styles.fillContainer, { height }, fillStyle]}>
        <LinearGradient
          colors={[Colors.primary, Colors.primary_fixed_variant]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.fill, { height }]}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: '100%',
    backgroundColor: Colors.surface_container_high,
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
