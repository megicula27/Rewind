import React, { useEffect, useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { Colors } from '../theme/colors';
import { Elevation } from '../theme/elevation';
import { Radius, Spacing, TapTargets } from '../theme/spacing';
import { useTheme } from '../theme/ThemeContext';
import { FontFamily } from '../theme/typography';

const TIMER_OPTIONS = [
  { label: '10 sec', seconds: 10 },
  { label: '15 min', seconds: 15 * 60 },
  { label: '30 min', seconds: 30 * 60 },
  { label: '45 min', seconds: 45 * 60 },
  { label: '1 hour', seconds: 60 * 60 },
  { label: '2 hours', seconds: 120 * 60 },
];

export default function HydrationTimerButton() {
  const {
    colors,
    hydrationTimerSeconds,
    hydrationTimeRemaining,
    isHydrationTimerRunning,
    startHydrationTimer,
    stopHydrationTimer,
  } = useTheme();
  const [showOverlay, setShowOverlay] = useState(false);
  const styles = createStyles(colors);

  const pulseScale = useSharedValue(1);
  const dropBounce = useSharedValue(1);

  useEffect(() => {
    if (isHydrationTimerRunning) {
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.15, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
    } else {
      pulseScale.value = withTiming(1, { duration: 300 });
    }
  }, [isHydrationTimerRunning, pulseScale]);

  useEffect(() => {
    if (isHydrationTimerRunning && hydrationTimeRemaining === 1) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }, [hydrationTimeRemaining, isHydrationTimerRunning]);

  const handleDropPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    dropBounce.value = withSequence(
      withSpring(0.85, { damping: 4, stiffness: 300 }),
      withSpring(1, { damping: 8, stiffness: 200 })
    );

    if (isHydrationTimerRunning) {
      stopHydrationTimer();
      return;
    }

    setShowOverlay(true);
  };

  const handleSelectTimer = (seconds: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    startHydrationTimer(seconds);
    setShowOverlay(false);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainder = seconds % 60;
    return `${minutes}:${remainder.toString().padStart(2, '0')}`;
  };

  const dropAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value * dropBounce.value }],
  }));

  return (
    <>
      <TouchableOpacity
        onPress={handleDropPress}
        activeOpacity={0.7}
        style={styles.dropContainer}
        accessibilityRole="button"
        accessibilityLabel={
          isHydrationTimerRunning
            ? `Water timer running, ${formatTime(hydrationTimeRemaining)} remaining. Tap to stop.`
            : 'Hydration timer. Tap to set timer.'
        }
      >
        <Animated.View
          style={[
            styles.dropCircle,
            isHydrationTimerRunning && styles.dropCircleActive,
            dropAnimatedStyle,
          ]}
        >
          <Text style={styles.dropEmoji}>.</Text>
        </Animated.View>

        <View pointerEvents="none" style={styles.dropIconOverlay}>
          <MaterialCommunityIcons
            name={isHydrationTimerRunning ? 'water' : 'water-outline'}
            size={22}
            color={isHydrationTimerRunning ? colors.primary : colors.primary_fixed_variant}
          />
        </View>

        {isHydrationTimerRunning && (
          <View style={styles.timerBadge}>
            <Text style={styles.timerBadgeText}>{formatTime(hydrationTimeRemaining)}</Text>
          </View>
        )}
      </TouchableOpacity>

      <Modal
        visible={showOverlay}
        transparent
        animationType="fade"
        onRequestClose={() => setShowOverlay(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setShowOverlay(false)}>
          <View style={styles.overlayContent} onStartShouldSetResponder={() => true}>
            <Text style={styles.overlayTitle}>Hydration Timer</Text>
            <Text style={styles.overlaySubtitle}>Set a gentle reminder to drink water</Text>

            <View style={styles.timerGrid}>
              {TIMER_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.seconds}
                  style={[
                    styles.timerOption,
                    hydrationTimerSeconds === option.seconds && styles.timerOptionActive,
                  ]}
                  onPress={() => handleSelectTimer(option.seconds)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.timerOptionText,
                      hydrationTimerSeconds === option.seconds && styles.timerOptionTextActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.overlayHint}>Stay hydrated throughout the day</Text>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const createStyles = (colors: typeof Colors) =>
  StyleSheet.create({
    dropContainer: {
      position: 'relative',
      alignItems: 'center',
      justifyContent: 'center',
      width: 56,
      height: 56,
      zIndex: 1,
    },
    dropCircle: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: colors.primary_container,
      alignItems: 'center',
      justifyContent: 'center',
      ...Elevation.low,
    },
    dropCircleActive: {
      backgroundColor: colors.primary_fixed,
    },
    dropIconOverlay: {
      position: 'absolute',
      alignItems: 'center',
      justifyContent: 'center',
    },
    dropEmoji: {
      fontSize: 1,
      opacity: 0,
    },
    timerBadge: {
      position: 'absolute',
      top: -3,
      right: -12,
      backgroundColor: colors.primary,
      borderRadius: Radius.full,
      paddingHorizontal: 5,
      paddingVertical: 2,
      minWidth: 34,
      alignItems: 'center',
    },
    timerBadgeText: {
      color: colors.on_primary,
      fontSize: 9,
      fontFamily: FontFamily.bold,
    },
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(31, 27, 27, 0.4)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: Spacing.breathe,
    },
    overlayContent: {
      backgroundColor: colors.surface,
      borderRadius: Radius.xl,
      padding: Spacing.breathe,
      width: '100%',
      maxWidth: 340,
      ...Elevation.high,
    },
    overlayTitle: {
      fontFamily: FontFamily.bold,
      fontSize: 24,
      color: colors.on_surface,
      textAlign: 'center',
      marginBottom: Spacing.compact,
    },
    overlaySubtitle: {
      fontFamily: FontFamily.regular,
      fontSize: 16,
      color: colors.on_surface_variant,
      textAlign: 'center',
      marginBottom: Spacing.generous,
    },
    timerGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: Spacing.item,
      justifyContent: 'center',
      marginBottom: Spacing.generous,
    },
    timerOption: {
      backgroundColor: colors.surface_container_low,
      borderRadius: Radius.lg,
      paddingVertical: Spacing.cozy,
      paddingHorizontal: Spacing.generous,
      minWidth: 90,
      alignItems: 'center',
      minHeight: TapTargets.minHeight,
      justifyContent: 'center',
    },
    timerOptionActive: {
      backgroundColor: colors.primary_container,
    },
    timerOptionText: {
      fontFamily: FontFamily.semiBold,
      fontSize: 16,
      color: colors.on_surface,
    },
    timerOptionTextActive: {
      color: colors.on_primary_container,
    },
    overlayHint: {
      fontFamily: FontFamily.medium,
      fontSize: 14,
      color: colors.on_surface_variant,
      textAlign: 'center',
    },
  });
