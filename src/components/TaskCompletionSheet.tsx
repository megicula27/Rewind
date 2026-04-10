import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  AccessibilityActionEvent,
  ActivityIndicator,
  Animated,
  Easing,
  Modal,
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
import type { ThemeColors } from '../theme/colors';
import { Elevation } from '../theme/elevation';
import { Radius, Spacing, TapTargets } from '../theme/spacing';
import { useTheme } from '../theme/ThemeContext';
import { FontFamily } from '../theme/typography';
import { getThemeVisuals } from '../theme/visuals';

const RING_SIZE = 172;
const RADIUS = 66;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const SLIDER_SIDE_INSET = 14;
const SLIDER_THUMB_SIZE = 28;
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface TaskCompletionSheetProps {
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
      title: 'Wonderfully done!',
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

export default function TaskCompletionSheet({
  visible,
  reminderName,
  totalPoints,
  dialValue,
  saving = false,
  onChangeDial,
  onClose,
  onPrimaryAction,
  onSecondaryAction,
}: TaskCompletionSheetProps) {
  const { colors, themeName } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = createStyles(colors, insets.top);
  const visuals = getThemeVisuals(themeName);
  const isGoldenTheme = themeName === 'golden_sun';
  const pointsEarned = calculatePoints(dialValue);
  const completionCopy = getCompletionCopy(dialValue);
  const progressRatio = dialValue / 10;
  const [sliderMeasureWidth, setSliderMeasureWidth] = useState(0);

  const ringProgress = useRef(new Animated.Value(progressRatio)).current;
  const fillProgress = useRef(new Animated.Value(progressRatio)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(ringProgress, {
        toValue: progressRatio,
        duration: 280,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
      Animated.timing(fillProgress, {
        toValue: progressRatio,
        duration: 240,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
    ]).start();
  }, [fillProgress, progressRatio, ringProgress]);

  const strokeOffset = ringProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [CIRCUMFERENCE, 0],
  });
  const sliderTrackWidth = Math.max(0, sliderMeasureWidth - SLIDER_SIDE_INSET * 2);
  const sliderFillWidth = fillProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, sliderTrackWidth],
  });
  const sliderThumbTranslate = fillProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, sliderTrackWidth],
  });

  const updateDialFromPosition = useCallback((locationX: number) => {
    if (sliderTrackWidth <= 0) {
      return;
    }

    const relativeX = Math.min(Math.max(locationX - SLIDER_SIDE_INSET, 0), sliderTrackWidth);
    const nextValue = Math.round((relativeX / sliderTrackWidth) * 10);
    if (nextValue !== dialValue) {
      onChangeDial(nextValue);
    }
  }, [dialValue, onChangeDial, sliderTrackWidth]);

  const handleSliderAccessibilityAction = (event: AccessibilityActionEvent) => {
    if (event.nativeEvent.actionName === 'increment') {
      onChangeDial(Math.min(10, dialValue + 1));
      return;
    }

    if (event.nativeEvent.actionName === 'decrement') {
      onChangeDial(Math.max(0, dialValue - 1));
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <LinearGradient
          colors={
            isGoldenTheme
              ? [colors.surface, '#FFF5D4', colors.surface_container_low]
              : [colors.surface, colors.surface_container_low, colors.tertiary]
          }
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
            <Text style={styles.headerTitle}>
              {isGoldenTheme ? 'Wonderfully Done!' : `Remind Me${'\n'}Gently`}
            </Text>
          </View>

          <View style={styles.pointsBadge}>
            <MaterialCommunityIcons name="star-four-points" size={16} color={colors.primary_fixed_variant} />
            <Text style={styles.pointsBadgeText}>{totalPoints}</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {!isGoldenTheme ? (
            <View style={styles.growthChip}>
              <MaterialCommunityIcons
                name={visuals.completion.chipIcon}
                size={18}
                color={colors.primary_fixed_variant}
              />
              <Text style={styles.growthChipText}>{visuals.completion.chipLabel}</Text>
            </View>
          ) : null}

          <View style={styles.heroCard}>
            <View style={styles.heroDecorationLeft} />
            <View style={styles.heroDecorationRight} />
            <MaterialCommunityIcons
              name={visuals.completion.sparkleTop}
              size={18}
              color={colors.primary}
              style={styles.sparkleTop}
            />
            <MaterialCommunityIcons
              name={visuals.completion.sparkleBottom}
              size={14}
              color={colors.primary}
              style={styles.sparkleBottom}
            />

            <View style={styles.heroIconWrap}>
              {isGoldenTheme ? <View style={styles.heroIconHalo} /> : null}
              <View style={[styles.heroMoodIconWrap, isGoldenTheme && styles.heroMoodIconWrapGolden]}>
                <MaterialCommunityIcons
                  name={completionCopy.moodIcon as any}
                  size={52}
                  color={isGoldenTheme ? colors.on_primary : colors.primary_fixed_variant}
                />
              </View>
            </View>
            <Text style={styles.heroTitle}>{completionCopy.title}</Text>
            <Text style={styles.heroSubtitle}>{completionCopy.subtitle}</Text>
            <Text style={styles.reminderLabel}>{reminderName}</Text>

            <View style={styles.pointsPill}>
              {isGoldenTheme ? (
                <LinearGradient
                  colors={['#FFD033', '#FDCB2D']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={StyleSheet.absoluteFill}
                />
              ) : null}
              <MaterialCommunityIcons
                name={isGoldenTheme ? 'star-circle' : 'plus-circle'}
                size={20}
                color={isGoldenTheme ? colors.secondary : colors.on_primary}
              />
              <Text style={[styles.pointsPillText, isGoldenTheme && styles.pointsPillTextGolden]}>
                {formatDelta(pointsEarned)} Points
              </Text>
            </View>
            {isGoldenTheme ? <Text style={styles.goldenCaption}>Every petal counts.</Text> : null}
          </View>

          <View style={styles.dialCard}>
            <Text style={styles.sectionTitle}>
              {isGoldenTheme ? 'How much did you bloom today?' : 'How much did you do?'}
            </Text>

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
                <AnimatedCircle
                  cx={RING_SIZE / 2}
                  cy={RING_SIZE / 2}
                  r={RADIUS}
                  stroke={isGoldenTheme ? colors.secondary_container : colors.primary}
                  strokeWidth={12}
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={`${CIRCUMFERENCE} ${CIRCUMFERENCE}`}
                  strokeDashoffset={strokeOffset as any}
                  rotation={-90}
                  origin={`${RING_SIZE / 2}, ${RING_SIZE / 2}`}
                />
              </Svg>

              <View style={styles.dialCenter}>
                <View style={styles.dialMoodIconWrap}>
                  <MaterialCommunityIcons
                    name={completionCopy.moodIcon as any}
                    size={36}
                    color={colors.primary}
                  />
                </View>
                <Text style={styles.dialValue}>
                  {dialValue}
                  <Text style={styles.dialValueMax}>/10</Text>
                </Text>
              </View>
            </View>
            <Text style={styles.moodLabel}>{completionCopy.moodLabel}</Text>

            <View style={styles.sliderWrap}>
              <View
                accessible
                accessibilityRole="adjustable"
                accessibilityLabel={`Completion score ${dialValue} out of 10`}
                accessibilityActions={[
                  { name: 'increment', label: 'Increase completion score' },
                  { name: 'decrement', label: 'Decrease completion score' },
                ]}
                onAccessibilityAction={handleSliderAccessibilityAction}
                onLayout={(event) => setSliderMeasureWidth(event.nativeEvent.layout.width)}
                onStartShouldSetResponder={() => true}
                onMoveShouldSetResponder={() => true}
                onResponderGrant={(event) => updateDialFromPosition(event.nativeEvent.locationX)}
                onResponderMove={(event) => updateDialFromPosition(event.nativeEvent.locationX)}
                  style={styles.sliderTouchArea}
              >
                <View style={styles.sliderTrack} />
                <Animated.View style={[styles.sliderFill, { width: sliderFillWidth }]}>
                  <LinearGradient
                    colors={
                      isGoldenTheme
                        ? [colors.secondary, '#E0BB00', colors.secondary_container]
                        : [colors.primary, colors.primary_fixed_variant]
                    }
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={StyleSheet.absoluteFill}
                  />
                </Animated.View>
                <Animated.View
                  style={[
                    styles.sliderThumb,
                    { transform: [{ translateX: sliderThumbTranslate }] },
                  ]}
                />
              </View>
              <Text style={styles.sliderCaption}>Slide gently to match what you got done.</Text>
              {isGoldenTheme ? (
                <View style={styles.sliderLegend}>
                  <Text style={styles.sliderLegendText}>Resting</Text>
                  <Text style={styles.sliderLegendText}>Full Bloom</Text>
                </View>
              ) : null}
            </View>

            <Text style={styles.dialQuote}>{'"'}{getReflectionLine(dialValue)}{'"'}</Text>
          </View>

          <View style={styles.reflectionCard}>
            <Text style={styles.reflectionLabel}>Today&apos;s Reflection</Text>
            <Text style={styles.reflectionTitle}>Small steps are still steps forward.</Text>
            <LinearGradient
              colors={
                isGoldenTheme
                  ? ['#FFF3CC', '#FFDFA7']
                  : [colors.primary_container, colors.secondary_container]
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.reflectionArt}
            >
              <MaterialCommunityIcons
                name={visuals.completion.reflectionPrimary}
                size={42}
                color={colors.primary_fixed_variant}
              />
              <MaterialCommunityIcons
                name={visuals.completion.reflectionSecondary}
                size={20}
                color={colors.primary_fixed_variant}
                style={styles.artHeart}
              />
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
            ) : isGoldenTheme ? (
              <LinearGradient
                colors={[colors.primary, '#E3D7B6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.primaryButtonGradient}
              >
                <Text style={styles.primaryButtonText}>Tend more tasks</Text>
              </LinearGradient>
            ) : (
              <Text style={styles.primaryButtonText}>Save progress</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            accessibilityRole="button"
            activeOpacity={0.88}
            disabled={saving}
            onPress={onSecondaryAction}
            style={styles.secondaryButton}
          >
            <Text style={styles.secondaryButtonText}>{isGoldenTheme ? 'Rest for now' : 'Back for now'}</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );
}

const createStyles = (colors: ThemeColors, topInset: number) =>
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
    heroIconHalo: {
      position: 'absolute',
      width: 116,
      height: 116,
      borderRadius: 58,
      borderWidth: 4,
      borderColor: 'rgba(144, 72, 0, 0.15)',
    },
    heroMoodIconWrap: {
      width: 56,
      height: 56,
      alignItems: 'center',
      justifyContent: 'center',
    },
    heroMoodIconWrapGolden: {
      width: 82,
      height: 82,
      borderRadius: 41,
      backgroundColor: colors.primary,
    },
    heroTitle: {
      minHeight: 68,
      fontFamily: FontFamily.bold,
      fontSize: 28,
      lineHeight: 34,
      color: colors.on_surface,
      textAlign: 'center',
      marginBottom: Spacing.compact,
    },
    heroSubtitle: {
      minHeight: 78,
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
      overflow: 'hidden',
      ...Elevation.medium,
    },
    pointsPillText: {
      fontFamily: FontFamily.bold,
      fontSize: 24,
      color: colors.on_primary,
    },
    pointsPillTextGolden: {
      color: colors.secondary,
    },
    goldenCaption: {
      marginTop: Spacing.cozy,
      fontFamily: FontFamily.bold,
      fontSize: 16,
      color: colors.primary,
      textAlign: 'center',
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
      marginBottom: Spacing.compact,
    },
    dialCenter: {
      position: 'absolute',
      alignItems: 'center',
      justifyContent: 'center',
      transform: [{ translateY: -4 }],
    },
    dialMoodIconWrap: {
      width: 42,
      height: 42,
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
      minHeight: 20,
      fontFamily: FontFamily.medium,
      fontSize: 14,
      color: colors.on_surface_variant,
      marginBottom: Spacing.generous,
      textAlign: 'center',
    },
    sliderWrap: {
      marginBottom: Spacing.cozy,
      position: 'relative',
      justifyContent: 'center',
    },
    sliderTouchArea: {
      height: 38,
      justifyContent: 'center',
      marginBottom: Spacing.compact,
    },
    sliderTrack: {
      position: 'absolute',
      left: SLIDER_SIDE_INSET,
      right: SLIDER_SIDE_INSET,
      height: 6,
      borderRadius: Radius.full,
      backgroundColor: colors.surface_container_highest,
    },
    sliderFill: {
      position: 'absolute',
      left: SLIDER_SIDE_INSET,
      height: 6,
      borderRadius: Radius.full,
      overflow: 'hidden',
    },
    sliderThumb: {
      position: 'absolute',
      left: SLIDER_SIDE_INSET - SLIDER_THUMB_SIZE / 2,
      width: SLIDER_THUMB_SIZE,
      height: SLIDER_THUMB_SIZE,
      borderRadius: SLIDER_THUMB_SIZE / 2,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.surface_container_lowest,
      borderColor: colors.primary,
      borderWidth: 3,
      ...Elevation.low,
    },
    sliderCaption: {
      fontFamily: FontFamily.medium,
      fontSize: 13,
      lineHeight: 18,
      color: colors.on_surface_variant,
      textAlign: 'center',
      opacity: 0.82,
    },
    sliderLegend: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: Spacing.compact,
      paddingHorizontal: SLIDER_SIDE_INSET,
    },
    sliderLegendText: {
      fontFamily: FontFamily.medium,
      fontSize: 15,
      color: colors.on_surface_variant,
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
      overflow: 'hidden',
      ...Elevation.medium,
    },
    primaryButtonGradient: {
      width: '100%',
      minHeight: TapTargets.primaryButton,
      alignItems: 'center',
      justifyContent: 'center',
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

