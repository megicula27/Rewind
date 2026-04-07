import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, {
  FadeInDown,
  FadeOutUp,
  LinearTransition,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import type { ThemeColors } from '../theme/colors';
import { FontFamily } from '../theme/typography';
import { Spacing, Radius } from '../theme/spacing';
import { Elevation } from '../theme/elevation';
import { useTheme } from '../theme/ThemeContext';

export interface HomeReminderCardProps {
  id: number;
  name: string;
  type: 'medicine' | 'food' | 'water' | 'custom';
  icon: string;
  description?: string | null;
  timeLabel: string;
  isCompleted: boolean;
  dialValue?: number;
  onPress?: () => void;
  onToggleComplete?: () => void;
  onLongPress?: () => void;
  index?: number;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

function getTypeVisuals(colors: ThemeColors) {
  return {
    medicine: {
      badge: colors.primary_fixed,
      icon: colors.primary_fixed_variant,
      iconName: 'medical-bag',
    },
    food: {
      badge: colors.secondary_container,
      icon: colors.secondary,
      iconName: 'silverware-fork-knife',
    },
    water: {
      badge: colors.primary_container,
      icon: colors.primary,
      iconName: 'dumbbell',
    },
    custom: {
      badge: colors.surface_container_high,
      icon: colors.primary_fixed_variant,
      iconName: 'sparkles',
    },
  } as const;
}

export default function HomeReminderCard({
  name,
  type,
  description,
  timeLabel,
  isCompleted,
  onPress,
  onToggleComplete,
  onLongPress,
  index = 0,
}: HomeReminderCardProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const pressed = useSharedValue(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const trimmedDescription = description?.trim() ?? '';
  const hasDescription = trimmedDescription.length > 0;
  const typeVisuals = getTypeVisuals(colors);
  const typeConfig = typeVisuals[type] ?? typeVisuals.custom;
  const bgColor =
    index % 2 === 0 ? colors.surface_container_lowest : colors.surface_container_low;

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: withSpring(pressed.value ? 0.98 : 1, { damping: 15, stiffness: 200 }) },
    ],
  }));

  const handleCardPress = () => {
    if (hasDescription) {
      setIsExpanded((previous) => !previous);
    }

    onPress?.();
  };

  return (
    <AnimatedTouchable
      activeOpacity={0.92}
      onPressIn={() => {
        pressed.value = true;
      }}
      onPressOut={() => {
        pressed.value = false;
      }}
      onPress={handleCardPress}
      onLongPress={onLongPress}
      delayLongPress={320}
      style={[styles.card, cardAnimatedStyle, { backgroundColor: bgColor }]}
      layout={LinearTransition.springify().damping(18).stiffness(180)}
      accessibilityRole="button"
      accessibilityLabel={`${name}, ${timeLabel}${hasDescription ? isExpanded ? ', expanded' : ', collapsed' : ''}${isCompleted ? ', completed' : ''}`}
    >
      <View style={styles.topRow}>
        <View style={styles.leadingRow}>
          <View style={[styles.iconBadge, { backgroundColor: typeConfig.badge }]}>
            <MaterialCommunityIcons
              name={typeConfig.iconName as any}
              size={22}
              color={typeConfig.icon}
            />
          </View>

          <View style={styles.textContent}>
            <View style={styles.titleRow}>
              <Text
                style={[
                  styles.reminderName,
                  isCompleted && styles.reminderNameCompleted,
                ]}
                numberOfLines={1}
              >
                {name}
              </Text>
            </View>

            <Text style={styles.timeLabel}>{timeLabel}</Text>
          </View>
        </View>

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
          {isCompleted ? <Text style={styles.checkmark}>✓</Text> : null}
        </TouchableOpacity>
      </View>

      {hasDescription && isExpanded ? (
        <Animated.View
          entering={FadeInDown.duration(180)}
          exiting={FadeOutUp.duration(140)}
          style={styles.descriptionWrap}
        >
          <Text style={styles.descriptionText}>{trimmedDescription}</Text>
        </Animated.View>
      ) : null}
    </AnimatedTouchable>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    card: {
      padding: Spacing.generous,
      borderRadius: Radius.lg,
      minHeight: 94,
      ...Elevation.low,
    },
    topRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: Spacing.item,
    },
    leadingRow: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: Spacing.cozy,
      paddingRight: Spacing.compact,
    },
    iconBadge: {
      width: 42,
      height: 42,
      borderRadius: Radius.md,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 1,
      flexShrink: 0,
    },
    textContent: {
      flex: 1,
      minHeight: 42,
      justifyContent: 'center',
    },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: 4,
    },
    reminderName: {
      flex: 1,
      fontFamily: FontFamily.semiBold,
      fontSize: 18,
      lineHeight: 24,
      color: colors.on_surface,
    },
    reminderNameCompleted: {
      color: colors.on_surface_variant,
    },
    timeLabel: {
      fontFamily: FontFamily.regular,
      fontSize: 14,
      lineHeight: 20,
      color: colors.on_surface_variant,
    },
    descriptionWrap: {
      marginTop: Spacing.cozy,
      marginLeft: 0,
      paddingTop: Spacing.cozy,
      paddingRight: Spacing.cozy,
      paddingBottom: Spacing.cozy,
      paddingLeft: 58,
      borderRadius: Radius.md,
      backgroundColor: colors.tertiary,
    },
    descriptionText: {
      fontFamily: FontFamily.medium,
      fontSize: 14,
      lineHeight: 21,
      color: colors.primary,
    },
    checkCircle: {
      width: 32,
      height: 32,
      borderRadius: Radius.full,
      borderWidth: 2,
      borderColor: colors.outline_variant,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 4,
      flexShrink: 0,
    },
    checkCircleCompleted: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    checkmark: {
      color: colors.on_primary,
      fontSize: 16,
      fontFamily: FontFamily.bold,
    },
  });
