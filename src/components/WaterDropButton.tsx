/**
 * Rewind — WaterDropButton
 * 
 * Persistent hydration button at the top of every screen.
 * Tapping shows an overlay with a timer dial for hydration reminders.
 * The timer runs throughout the day until tapped again to stop.
 */

import React, { useEffect, useRef, useState } from 'react';
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
import { Spacing, Radius, TapTargets } from '../theme/spacing';
import { useTheme } from '../theme/ThemeContext';
import { FontFamily } from '../theme/typography';

const TIMER_OPTIONS = [
  { label: '15 min', minutes: 15 },
  { label: '30 min', minutes: 30 },
  { label: '45 min', minutes: 45 },
  { label: '1 hour', minutes: 60 },
  { label: '1.5 hr', minutes: 90 },
  { label: '2 hours', minutes: 120 },
];

interface WaterDropButtonProps {
  /** Reserved for future counter logic */
}

export default function WaterDropButton(_props: WaterDropButtonProps) {
  const { colors } = useTheme();
  const [showOverlay, setShowOverlay] = useState(false);
  const [selectedTimer, setSelectedTimer] = useState<number | null>(null);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const styles = createStyles(colors);

  // Pulse animation for the water drop when timer is active
  const pulseScale = useSharedValue(1);
  const dropBounce = useSharedValue(1);

  useEffect(() => {
    if (isTimerRunning) {
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
  }, [isTimerRunning, pulseScale]);

  useEffect(() => {
    if (isTimerRunning && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            // Timer finished — notify user
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            return selectedTimer ? selectedTimer * 60 : 0; // restart timer
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerRunning, selectedTimer]);

  const handleDropPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    dropBounce.value = withSequence(
      withSpring(0.85, { damping: 4, stiffness: 300 }),
      withSpring(1, { damping: 8, stiffness: 200 })
    );
    
    if (isTimerRunning) {
      // Stop timer
      setIsTimerRunning(false);
      setTimeRemaining(0);
      if (timerRef.current) clearInterval(timerRef.current);
    } else {
      setShowOverlay(true);
    }
  };

  const handleSelectTimer = (minutes: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedTimer(minutes);
    setTimeRemaining(minutes * 60);
    setIsTimerRunning(true);
    setShowOverlay(false);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const dropAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: pulseScale.value * dropBounce.value },
    ],
  }));

  return (
    <>
      <TouchableOpacity
        onPress={handleDropPress}
        activeOpacity={0.7}
        style={styles.dropContainer}
        accessibilityRole="button"
        accessibilityLabel={
          isTimerRunning
            ? `Water timer running, ${formatTime(timeRemaining)} remaining. Tap to stop.`
            : `Hydration timer. Tap to set timer.`
        }
      >
        <Animated.View
          style={[
            styles.dropCircle,
            isTimerRunning && styles.dropCircleActive,
            dropAnimatedStyle,
          ]}
        >
          <Text style={styles.dropEmoji}>💧</Text>
        </Animated.View>
        <View pointerEvents="none" style={styles.dropIconOverlay}>
          <MaterialCommunityIcons
            name={isTimerRunning ? 'water' : 'water-outline'}
            size={22}
            color={isTimerRunning ? colors.primary : colors.primary_fixed_variant}
          />
        </View>
        {isTimerRunning && (
          <View style={styles.timerBadge}>
            <Text style={styles.timerBadgeText}>{formatTime(timeRemaining)}</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Timer Selection Overlay */}
      <Modal
        visible={showOverlay}
        transparent
        animationType="fade"
        onRequestClose={() => setShowOverlay(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setShowOverlay(false)}>
          <View style={styles.overlayContent} onStartShouldSetResponder={() => true}>
            <Text style={styles.overlayTitle}>Hydration Timer 💧</Text>
            <Text style={styles.overlaySubtitle}>
              Set a gentle reminder to drink water
            </Text>

            <View style={styles.timerGrid}>
              {TIMER_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.minutes}
                  style={[
                    styles.timerOption,
                    selectedTimer === option.minutes && styles.timerOptionActive,
                  ]}
                  onPress={() => handleSelectTimer(option.minutes)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.timerOptionText,
                      selectedTimer === option.minutes && styles.timerOptionTextActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.overlayHint}>
              Stay hydrated throughout the day 🌊
            </Text>
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

  // Overlay
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
