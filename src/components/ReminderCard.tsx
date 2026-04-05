/**
 * Rewind — ReminderCard
 * 
 * Organic, rounded card displaying a single reminder.
 * Follows the design system:
 *   - lg (24px) border radius for cards
 *   - No dividers or 1px borders
 *   - Generous 24px internal padding ("Forgiveness Rule")
 *   - Alternating surface container backgrounds
 *   - Soft press animation (scale 0.98)
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Colors } from '../theme/colors';
import { Typography, FontFamily } from '../theme/typography';
import { Spacing, Radius } from '../theme/spacing';
import { Elevation } from '../theme/elevation';

export interface ReminderCardProps {
  id: number;
  name: string;
  type: 'medicine' | 'food' | 'water' | 'custom';
  icon: string;
  timeLabel: string; // "Taken at 8:15 AM" or "Scheduled for 10:30 AM"
  isCompleted: boolean;
  dialValue?: number; // 0–10, shown if partially completed
  onPress?: () => void;
  onToggleComplete?: () => void;
  index?: number; // for alternating backgrounds
}

const TYPE_ICONS: Record<string, { bg: string; emoji: string }> = {
  medicine: { bg: '#FCE4EC', emoji: '💊' },
  food:     { bg: '#FFF3E0', emoji: '🍽️' },
  water:    { bg: '#E3F2FD', emoji: '💧' },
  custom:   { bg: '#F3E5F5', emoji: '📌' },
};

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export default function ReminderCard({
  id,
  name,
  type,
  icon,
  timeLabel,
  isCompleted,
  dialValue,
  onPress,
  onToggleComplete,
  index = 0,
}: ReminderCardProps) {
  const pressed = useSharedValue(false);

  const cardAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: withSpring(pressed.value ? 0.98 : 1, { damping: 15, stiffness: 200 }) },
      ],
    };
  });

  const typeConfig = TYPE_ICONS[type] || TYPE_ICONS.custom;
  const displayIcon = icon || typeConfig.emoji;

  // Alternate backgrounds to define boundaries without dividers
  const bgColor = index % 2 === 0 
    ? Colors.surface_container_lowest 
    : Colors.surface_container_low;

  return (
    <AnimatedTouchable
      activeOpacity={0.9}
      onPressIn={() => { pressed.value = true; }}
      onPressOut={() => { pressed.value = false; }}
      onPress={onPress}
      style={[styles.card, cardAnimatedStyle, { backgroundColor: bgColor }]}
      accessibilityRole="button"
      accessibilityLabel={`${name}, ${timeLabel}${isCompleted ? ', completed' : ''}`}
    >
      {/* Icon badge */}
      <View style={[styles.iconBadge, { backgroundColor: typeConfig.bg }]}>
        <Text style={styles.iconEmoji}>{displayIcon}</Text>
      </View>

      {/* Completion circle / checkmark */}
      <TouchableOpacity
        onPress={onToggleComplete}
        style={[
          styles.checkCircle,
          isCompleted && styles.checkCircleCompleted,
        ]}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: isCompleted }}
        accessibilityLabel={`Mark ${name} as ${isCompleted ? 'incomplete' : 'complete'}`}
      >
        {isCompleted && <Text style={styles.checkmark}>✓</Text>}
      </TouchableOpacity>

      {/* Text content */}
      <View style={styles.textContent}>
        <Text 
          style={[
            styles.reminderName, 
            isCompleted && styles.reminderNameCompleted
          ]}
          numberOfLines={1}
        >
          {name}
        </Text>
        <Text style={styles.timeLabel}>{timeLabel}</Text>
      </View>
    </AnimatedTouchable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'column',
    padding: Spacing.generous, // 24px — "Forgiveness Rule"
    borderRadius: Radius.lg,  // 24px
    minHeight: 120,
    position: 'relative',
    ...Elevation.low,
  },
  iconBadge: {
    width: 48,
    height: 48,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.cozy,
  },
  iconEmoji: {
    fontSize: 22,
  },
  checkCircle: {
    position: 'absolute',
    top: Spacing.generous,
    right: Spacing.generous,
    width: 32,
    height: 32,
    borderRadius: Radius.full,
    borderWidth: 2,
    borderColor: Colors.outline_variant,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkCircleCompleted: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  checkmark: {
    color: Colors.on_primary,
    fontSize: 16,
    fontFamily: FontFamily.bold,
  },
  textContent: {
    flex: 1,
  },
  reminderName: {
    fontFamily: FontFamily.semiBold,
    fontSize: 18,
    lineHeight: 24,
    color: Colors.on_surface,
    marginBottom: 4,
  },
  reminderNameCompleted: {
    color: Colors.on_surface_variant,
  },
  timeLabel: {
    fontFamily: FontFamily.regular,
    fontSize: 14,
    lineHeight: 20,
    color: Colors.on_surface_variant,
  },
});
