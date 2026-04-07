import React from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { calculatePoints } from '../db/completions';
import { Colors } from '../theme/colors';
import { Elevation } from '../theme/elevation';
import { Radius, Spacing, TapTargets } from '../theme/spacing';
import { useTheme } from '../theme/ThemeContext';
import { FontFamily } from '../theme/typography';

const DIAL_VALUES = Array.from({ length: 11 }, (_, index) => index);
const RING_SIZE = 172;
const RADIUS = 66;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

interface CompletionSheetProps {
  visible: boolean;
  reminderName: string;
  totalPoints: number;
  dialValue: number;
  saving?: boolean;
  onChangeDial: (value: number) => void;
  onClose: () => void;
  onPrimaryAction: () => void;
  onSecondaryAction: () => void;
}

function getCompletionCopy(dialValue: number) {
  if (dialValue === 10) {
    return {
      title: 'Wonderfully Done!',
      subtitle: "You've nurtured your garden today. The soul of your tasks is light.",
      moodIcon: 'check-circle',
      moodLabel: 'Fully done',
    };
  }

  if (dialValue >= 7) {
    return {
      title: 'Beautiful progress',
      subtitle: 'Most of it is done, and that absolutely counts.',
      moodIcon: 'emoticon-happy',
      moodLabel: 'Mostly done',
    };
  }

  if (dialValue >= 4) {
    return {
      title: 'A gentle step forward',
      subtitle: 'Every bit you finished matters, even if it was not all of it.',
      moodIcon: 'emoticon-outline',
      moodLabel: 'Partial progress',
    };
  }

  return {
    title: 'Thank you for checking in',
    subtitle: 'Even an honest check-in helps us care for the day a little more gently.',
    moodIcon: 'heart-outline',
    moodLabel: 'Checked in',
  };
}

function getReflectionLine(dialValue: number) {
  if (dialValue === 10) return 'The garden grew because you showed up with care.';
  if (dialValue >= 7) return 'That is okay, every bit counts.';
  if (dialValue >= 4) return 'Small steps are still steps forward.';
  return 'Tomorrow gets to begin softly too.';
}

function formatDelta(pointsEarned: number) {
  if (pointsEarned > 0) return `+${pointsEarned}`;
  return `${pointsEarned}`;
}

export default function CompletionSheet({
  visible,
  reminderName,
  totalPoints,
  dialValue,
  saving = false,
  onChangeDial,
  onClose,
  onPrimaryAction,
  onSecondaryAction,
}: CompletionSheetProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = createStyles(colors, insets.top);
  const pointsEarned = calculatePoints(dialValue);
  const completionCopy = getCompletionCopy(dialValue);
  const progressRatio = dialValue / 10;
  const strokeOffset = CIRCUMFERENCE - CIRCUMFERENCE * progressRatio;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <LinearGradient
          colors={[colors.surface, colors.surface_container_low, colors.tertiary]}
          locations={[0, 0.78, 1]}
          style={StyleSheet.absoluteFill}
        />

        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Close completion sheet"
              activeOpacity={0.8}
              style={styles.closeButton}
              onPress={onClose}
            >
              <MaterialCommunityIcons name="close" size={22} color={colors.primary_fixed_variant} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Remind Me{"\n"}Gently</Text>
          </View>

          <View style={styles.pointsBadge}>
            <MaterialCommunityIcons name="star-four-points" size={16} color={colors.primary_fixed_variant} />
            <Text style={styles.pointsBadgeText}>{totalPoints}</Text>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.growthChip}>
            <MaterialCommunityIcons name="sprout" size={18} color={colors.primary_fixed_variant} />
            <Text style={styles.growthChipText}>Garden Grew!</Text>
          </View>

          <View style={styles.heroCard}>
            <View style={styles.heroDecorationLeft} />
            <View style={styles.heroDecorationRight} />
            <MaterialCommunityIcons
              name="star-four-points"
              size={18}
              color={colors.primary}
              style={styles.sparkleTop}
            />
            <MaterialCommunityIcons
              name="flower-poppy"
              size={14}
              color={colors.primary}
              style={styles.sparkleBottom}
            />

            <View style={styles.heroIconWrap}>
              <MaterialCommunityIcons
                name={completionCopy.moodIcon as any}
                size={52}
                color={colors.primary_fixed_variant}
              />
            </View>
            <Text style={styles.heroTitle}>{completionCopy.title}</Text>
            <Text style={styles.heroSubtitle}>
              {completionCopy.subtitle}
            </Text>
            <Text style={styles.reminderLabel}>{reminderName}</Text>

            <View style={styles.pointsPill}>
              <MaterialCommunityIcons name="plus-circle" size={20} color={colors.on_primary} />
              <Text style={styles.pointsPillText}>{formatDelta(pointsEarned)} Points</Text>
            </View>
          </View>

          <View style={styles.dialCard}>
            <Text style={styles.sectionTitle}>How much did you do?</Text>

            <View style={styles.dialArea}>
              <Svg width={RING_SIZE} height={RING_SIZE}>
                <Circle
                  cx={RING_SIZE / 2}
                  cy={RING_SIZE / 2}
                  r={RADIUS}
                  stroke={colors.surface_container_highest}
                  strokeWidth={12}
                  fill="none"
                />
                <Circle
                  cx={RING_SIZE / 2}
                  cy={RING_SIZE / 2}
                  r={RADIUS}
                  stroke={colors.primary}
                  strokeWidth={12}
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={`${CIRCUMFERENCE} ${CIRCUMFERENCE}`}
                  strokeDashoffset={strokeOffset}
                  rotation={-90}
                  origin={`${RING_SIZE / 2}, ${RING_SIZE / 2}`}
                />
              </Svg>

              <View style={styles.dialCenter}>
                <MaterialCommunityIcons
                  name={completionCopy.moodIcon as any}
                  size={36}
                  color={colors.primary}
                />
                <Text style={styles.dialValue}>
                  {dialValue}
                  <Text style={styles.dialValueMax}>/10</Text>
                </Text>
                <Text style={styles.moodLabel}>{completionCopy.moodLabel}</Text>
              </View>
            </View>

            <View style={styles.sliderWrap}>
              <View style={styles.sliderTrack} />
              <View style={[styles.sliderFill, { width: `${progressRatio * 100}%` }]} />
              <View style={styles.valueRow}>
                {DIAL_VALUES.map((value) => {
                  const active = value <= dialValue;
                  const selected = value === dialValue;

                  return (
                    <Pressable
                      key={value}
                      accessibilityRole="button"
                      accessibilityLabel={`Set completion score to ${value}`}
                      onPress={() => onChangeDial(value)}
                      style={[
                        styles.valueDot,
                        active && styles.valueDotActive,
                        selected && styles.valueDotSelected,
                      ]}
                    >
                      <Text
                        style={[
                          styles.valueDotText,
                          active && styles.valueDotTextActive,
                        ]}
                      >
                        {value}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <Text style={styles.dialQuote}>"{getReflectionLine(dialValue)}"</Text>
          </View>

          <View style={styles.reflectionCard}>
            <Text style={styles.reflectionLabel}>Today's Reflection</Text>
            <Text style={styles.reflectionTitle}>Small steps are still steps forward.</Text>
            <LinearGradient
              colors={[colors.primary_container, colors.secondary_container]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.reflectionArt}
            >
              <MaterialCommunityIcons name="leaf" size={42} color={colors.primary_fixed_variant} />
              <MaterialCommunityIcons name="heart" size={20} color={colors.primary_fixed_variant} style={styles.artHeart} />
            </LinearGradient>
          </View>

          <TouchableOpacity
            accessibilityRole="button"
            activeOpacity={0.88}
            disabled={saving}
            onPress={onPrimaryAction}
            style={styles.primaryButton}
          >
            {saving ? (
              <ActivityIndicator color={colors.on_primary} />
            ) : (
              <Text style={styles.primaryButtonText}>Rest and Refill</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            accessibilityRole="button"
            activeOpacity={0.88}
            disabled={saving}
            onPress={onSecondaryAction}
            style={styles.secondaryButton}
          >
            <Text style={styles.secondaryButtonText}>Log another task</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );
}

const createStyles = (colors: typeof Colors, topInset: number) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: colors.surface,
    },
    header: {
      paddingTop: topInset + Spacing.item,
      paddingHorizontal: Spacing.generous,
      paddingBottom: Spacing.cozy,
      backgroundColor: colors.primary_fixed,
      borderBottomLeftRadius: Radius.xxl,
      borderBottomRightRadius: Radius.xxl,
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
    },
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      flex: 1,
      paddingRight: Spacing.item,
    },
    closeButton: {
      width: TapTargets.minHeight,
      height: TapTargets.minHeight,
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: -Spacing.item,
      marginRight: Spacing.compact,
    },
    headerTitle: {
      fontFamily: FontFamily.bold,
      fontSize: 30,
      lineHeight: 32,
      color: colors.primary_fixed_variant,
    },
    pointsBadge: {
      marginTop: Spacing.compact,
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.hair,
      paddingHorizontal: Spacing.item,
      paddingVertical: Spacing.compact,
      borderRadius: Radius.full,
      backgroundColor: colors.primary_container,
    },
    pointsBadgeText: {
      fontFamily: FontFamily.bold,
      fontSize: 15,
      color: colors.primary_fixed_variant,
    },
    content: {
      paddingHorizontal: Spacing.generous,
      paddingTop: Spacing.cozy,
      paddingBottom: Spacing.large,
      gap: Spacing.breathe,
    },
    growthChip: {
      alignSelf: 'flex-end',
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.compact,
      paddingHorizontal: Spacing.generous,
      paddingVertical: Spacing.item,
      borderRadius: Radius.full,
      backgroundColor: colors.primary_container,
      ...Elevation.low,
    },
    growthChipText: {
      fontFamily: FontFamily.bold,
      fontSize: 16,
      color: colors.primary_fixed_variant,
    },
    heroCard: {
      overflow: 'hidden',
      position: 'relative',
      alignItems: 'center',
      paddingHorizontal: Spacing.breathe,
      paddingTop: Spacing.breathe,
      paddingBottom: Spacing.large,
      borderRadius: Radius.xl,
      backgroundColor: colors.surface_container_lowest,
      ...Elevation.low,
    },
    heroDecorationLeft: {
      position: 'absolute',
      left: -28,
      bottom: -22,
      width: 112,
      height: 112,
      borderRadius: 56,
      backgroundColor: colors.secondary_container,
      opacity: 0.22,
    },
    heroDecorationRight: {
      position: 'absolute',
      right: -32,
      top: -20,
      width: 128,
      height: 128,
      borderRadius: 64,
      backgroundColor: colors.primary_container,
      opacity: 0.3,
    },
    sparkleTop: {
      position: 'absolute',
      top: Spacing.cozy,
      left: 42,
    },
    sparkleBottom: {
      position: 'absolute',
      bottom: 42,
      right: 46,
    },
    heroIconWrap: {
      width: 116,
      height: 116,
      borderRadius: 58,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primary_container,
      marginBottom: Spacing.cozy,
    },
    heroTitle: {
      fontFamily: FontFamily.bold,
      fontSize: 28,
      lineHeight: 34,
      color: colors.on_surface,
      textAlign: 'center',
      marginBottom: Spacing.compact,
    },
    heroSubtitle: {
      fontFamily: FontFamily.regular,
      fontSize: 18,
      lineHeight: 26,
      color: colors.on_surface_variant,
      textAlign: 'center',
      marginBottom: Spacing.compact,
    },
    reminderLabel: {
      fontFamily: FontFamily.semiBold,
      fontSize: 15,
      color: colors.primary_fixed_variant,
      marginBottom: Spacing.generous,
      textAlign: 'center',
    },
    pointsPill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.compact,
      paddingHorizontal: Spacing.breathe,
      paddingVertical: Spacing.cozy,
      borderRadius: Radius.full,
      backgroundColor: colors.primary,
      ...Elevation.medium,
    },
    pointsPillText: {
      fontFamily: FontFamily.bold,
      fontSize: 24,
      color: colors.on_primary,
    },
    dialCard: {
      paddingHorizontal: Spacing.generous,
      paddingVertical: Spacing.breathe,
      borderRadius: Radius.xl,
      backgroundColor: colors.surface_container_low,
      ...Elevation.low,
    },
    sectionTitle: {
      fontFamily: FontFamily.bold,
      fontSize: 24,
      lineHeight: 30,
      color: colors.on_surface,
      textAlign: 'center',
      marginBottom: Spacing.generous,
    },
    dialArea: {
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: Spacing.generous,
    },
    dialCenter: {
      position: 'absolute',
      alignItems: 'center',
      justifyContent: 'center',
    },
    dialValue: {
      marginTop: Spacing.compact,
      fontFamily: FontFamily.extraBold,
      fontSize: 36,
      color: colors.on_surface,
    },
    dialValueMax: {
      fontFamily: FontFamily.medium,
      fontSize: 18,
      color: colors.on_surface_variant,
    },
    moodLabel: {
      fontFamily: FontFamily.medium,
      fontSize: 14,
      color: colors.on_surface_variant,
      marginTop: Spacing.hair,
    },
    sliderWrap: {
      marginBottom: Spacing.cozy,
      position: 'relative',
      justifyContent: 'center',
    },
    sliderTrack: {
      position: 'absolute',
      left: 14,
      right: 14,
      height: 6,
      borderRadius: Radius.full,
      backgroundColor: colors.surface_container_highest,
    },
    sliderFill: {
      position: 'absolute',
      left: 14,
      height: 6,
      borderRadius: Radius.full,
      backgroundColor: colors.primary,
    },
    valueRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    valueDot: {
      width: 28,
      height: 28,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.surface_container_highest,
      borderWidth: 2,
      borderColor: colors.surface_container_highest,
    },
    valueDotActive: {
      backgroundColor: colors.primary_container,
      borderColor: colors.primary_container,
    },
    valueDotSelected: {
      backgroundColor: colors.surface_container_lowest,
      borderColor: colors.primary,
      transform: [{ scale: 1.08 }],
    },
    valueDotText: {
      fontFamily: FontFamily.bold,
      fontSize: 11,
      color: colors.on_surface_variant,
    },
    valueDotTextActive: {
      color: colors.primary_fixed_variant,
    },
    dialQuote: {
      fontFamily: FontFamily.medium,
      fontSize: 17,
      lineHeight: 24,
      color: colors.on_surface_variant,
      textAlign: 'center',
      fontStyle: 'italic',
    },
    reflectionCard: {
      padding: Spacing.generous,
      borderRadius: Radius.xl,
      backgroundColor: colors.primary_fixed,
    },
    reflectionLabel: {
      fontFamily: FontFamily.bold,
      fontSize: 12,
      letterSpacing: 1.4,
      textTransform: 'uppercase',
      color: colors.on_surface_variant,
      marginBottom: Spacing.compact,
    },
    reflectionTitle: {
      fontFamily: FontFamily.bold,
      fontSize: 22,
      lineHeight: 28,
      color: colors.on_surface,
      marginBottom: Spacing.generous,
    },
    reflectionArt: {
      height: 124,
      borderRadius: Radius.lg,
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    },
    artHeart: {
      position: 'absolute',
      right: 36,
      bottom: 28,
    },
    primaryButton: {
      minHeight: TapTargets.primaryButton,
      borderRadius: Radius.full,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primary,
      ...Elevation.medium,
    },
    primaryButtonText: {
      fontFamily: FontFamily.bold,
      fontSize: 22,
      color: colors.on_primary,
    },
    secondaryButton: {
      minHeight: TapTargets.minHeight,
      borderRadius: Radius.full,
      borderWidth: 2,
      borderColor: colors.primary_container,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.surface_container_lowest,
    },
    secondaryButtonText: {
      fontFamily: FontFamily.bold,
      fontSize: 18,
      color: colors.primary_fixed_variant,
    },
  });
