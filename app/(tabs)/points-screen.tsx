import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import HydrationTimerButton from '@/src/components/HydrationTimerButton';
import QuoteFooter from '@/src/components/QuoteFooter';
import { usePoints } from '@/src/hooks/usePoints';
import { useMotivationQuote } from '@/src/hooks/useMotivationQuote';
import { Colors } from '@/src/theme/colors';
import { Elevation } from '@/src/theme/elevation';
import { Radius, Spacing } from '@/src/theme/spacing';
import { useTheme } from '@/src/theme/ThemeContext';
import { FontFamily } from '@/src/theme/typography';

interface RewardItem {
  id: string;
  title: string;
  cost: number;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  accent: string;
  accentSoft: string;
  large?: boolean;
}

const REWARDS: RewardItem[] = [
  {
    id: 'sky-ocean',
    title: 'Sky & Ocean',
    cost: 1500,
    icon: 'weather-partly-cloudy',
    accent: '#6C9FCF',
    accentSoft: '#DDECF8',
    large: true,
  },
  {
    id: 'jungle-deep',
    title: 'Jungle Deep',
    cost: 2000,
    icon: 'pine-tree',
    accent: '#7C9070',
    accentSoft: '#E3ECD8',
  },
  {
    id: 'golden-sun',
    title: 'Golden Sun',
    cost: 2500,
    icon: 'white-balance-sunny',
    accent: '#D7A347',
    accentSoft: '#FBE8BC',
  },
];

function formatPoints(value: number) {
  return value.toLocaleString();
}

export default function PointsScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { points, weekSummary } = usePoints();
  const headerQuote = useMotivationQuote('points-tab-header', 3);
  const styles = createStyles(colors);

  const maxJarPoints = 2000;
  const jarFillRatio = Math.max(0.08, Math.min(points.total_points / maxJarPoints, 1));
  const nextUnlock =
    REWARDS.find((reward) => reward.cost > points.total_points) ?? REWARDS[REWARDS.length - 1];
  const pointsToNextUnlock = Math.max(nextUnlock.cost - points.total_points, 0);
  const completedDays = weekSummary.filter((day) => day.completed).length;

  const headerPaddingTop = insets.top + Spacing.compact;

  return (
    <View style={styles.screen}>
      <LinearGradient
        colors={[colors.surface, colors.tertiary, colors.surface_container_low]}
        locations={[0, 0.72, 1]}
        style={StyleSheet.absoluteFill}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 120 + insets.bottom }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.headerGlow} />
          <View style={[styles.headerContentWrap, { paddingTop: headerPaddingTop }]}>
          <View style={styles.headerContent}>
            <Text style={styles.headerLabel}>Today&apos;s Motivation</Text>
            <Text style={styles.headerQuote}>"{headerQuote.text}"</Text>
            <Text style={styles.headerAuthor}>- {headerQuote.author}</Text>
          </View>
          </View>

          <HydrationTimerButton />
        </View>

        <View style={styles.collectionSection}>
          <Text style={styles.collectionLabel}>Your Collection</Text>
          <Text style={styles.collectionValue}>
            {formatPoints(points.total_points)}
            <Text style={styles.collectionSuffix}> Points</Text>
          </Text>
        </View>

        <View style={styles.jarWrap}>
          <View style={styles.jar}>
            <View style={styles.jarLid} />
            <View style={[styles.jarFill, { height: `${jarFillRatio * 100}%` }]}>
              <LinearGradient
                colors={[colors.primary_container, colors.primary_fixed]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
            </View>

            <MaterialCommunityIcons
              name="flower-pollen"
              size={22}
              color={colors.primary_fixed_variant}
              style={styles.jarIconTop}
            />
            <MaterialCommunityIcons
              name="heart"
              size={20}
              color={colors.primary_fixed_variant}
              style={styles.jarIconBottom}
            />
            <MaterialCommunityIcons
              name="leaf"
              size={18}
              color={colors.primary_fixed_variant}
              style={styles.jarIconLeaf}
            />
          </View>
          <Text style={styles.jarHint}>
            {pointsToNextUnlock > 0
              ? `Almost there! Just ${formatPoints(pointsToNextUnlock)} more points until your next petal unlocks.`
              : 'Your newest bloom is ready. More rewards can open in the next phase.'}
          </Text>
        </View>

        <View style={styles.streakCard}>
          <View style={styles.sectionRow}>
            <Text style={styles.sectionHeading}>Weekly Streak</Text>
            <View style={styles.streakBadge}>
              <MaterialCommunityIcons name="fire" size={14} color={colors.primary_fixed_variant} />
              <Text style={styles.streakBadgeText}>
                {points.current_streak > 0 ? `${points.current_streak} Days` : 'Starting out'}
              </Text>
            </View>
          </View>

          <View style={styles.weekRow}>
            {weekSummary.map((day, index) => {
              const iconName = index % 2 === 0 ? 'flower-poppy' : 'leaf';

              return (
                <View key={day.key} style={styles.dayColumn}>
                  <Text style={styles.dayLabel}>{day.label}</Text>
                  <View
                    style={[
                      styles.dayCircle,
                      day.completed ? styles.dayCircleCompleted : styles.dayCircleEmpty,
                      day.isToday && styles.dayCircleToday,
                    ]}
                  >
                    {day.completed ? (
                      <MaterialCommunityIcons
                        name={iconName}
                        size={18}
                        color={colors.primary_fixed_variant}
                      />
                    ) : (
                      <View style={styles.dayDot} />
                    )}
                  </View>
                </View>
              );
            })}
          </View>

          <Text style={styles.streakNote}>
            {completedDays > 0
              ? `${completedDays} day${completedDays === 1 ? '' : 's'} bloomed this week.`
              : 'Your first bloom this week will appear here.'}
          </Text>
        </View>

        <View style={styles.rewardsSection}>
          <View style={styles.sectionRow}>
            <View>
              <Text style={styles.sectionHeading}>Reward Shop</Text>
              <Text style={styles.sectionSubheading}>Trade your blossoms for new horizons.</Text>
            </View>
          </View>

          <View style={styles.rewardGrid}>
            {REWARDS.map((reward) => {
              const affordable = points.total_points >= reward.cost;
              const largeCard = reward.large === true;

              return (
                <View
                  key={reward.id}
                  style={[
                    styles.rewardCard,
                    largeCard && styles.rewardCardLarge,
                    {
                      backgroundColor: largeCard
                        ? colors.surface_container_highest
                        : colors.surface_container_low,
                    },
                  ]}
                >
                  <LinearGradient
                    colors={[`${reward.accentSoft}F5`, `${reward.accent}30`]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={StyleSheet.absoluteFill}
                  />

                  <View style={styles.rewardArt}>
                    <MaterialCommunityIcons
                      name={reward.icon}
                      size={largeCard ? 38 : 34}
                      color={reward.accent}
                    />
                    {!affordable && (
                      <View style={styles.lockBadge}>
                        <MaterialCommunityIcons name="lock" size={14} color={colors.surface} />
                      </View>
                    )}
                  </View>

                  <Text style={[styles.rewardTitle, largeCard && styles.rewardTitleLarge]}>
                    {reward.title}
                  </Text>
                  <Text style={styles.rewardCost}>{formatPoints(reward.cost)} Points</Text>

                  <TouchableOpacity
                    accessibilityRole="button"
                    activeOpacity={0.9}
                    disabled={!affordable}
                    style={[
                      styles.rewardButton,
                      affordable ? styles.rewardButtonActive : styles.rewardButtonDisabled,
                    ]}
                  >
                    <Text
                      style={[
                        styles.rewardButtonText,
                        !affordable && styles.rewardButtonTextDisabled,
                      ]}
                    >
                      {affordable ? 'Ready Soon' : 'Keep Blooming'}
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        </View>

        <QuoteFooter scope="points-tab-footer" shift={4} />
      </ScrollView>
    </View>
  );
}

const createStyles = (colors: typeof Colors) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.surface,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: Spacing.generous,
      gap: Spacing.breathe,
    },
    header: {
      marginHorizontal: -Spacing.generous,
      marginBottom: Spacing.item,
      paddingHorizontal: Spacing.generous + 4,
      paddingBottom: Spacing.compact,
      minHeight: 108,
      overflow: 'hidden',
      position: 'relative',
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.primary_fixed,
      borderBottomLeftRadius: Radius.xxl + 12,
      borderBottomRightRadius: Radius.xxl + 12,
    },
    headerContentWrap: {
      flex: 1,
      justifyContent: 'center',
    },
    headerGlow: {
      position: 'absolute',
      top: -18,
      right: -10,
      width: 132,
      height: 132,
      borderRadius: 66,
      backgroundColor: colors.primary_container,
      opacity: 0.18,
    },
    headerContent: {
      paddingRight: Spacing.item,
      zIndex: 1,
    },
    headerLabel: {
      fontFamily: FontFamily.bold,
      fontSize: 11,
      lineHeight: 16,
      letterSpacing: 1.2,
      textTransform: 'uppercase',
      color: colors.primary_fixed_variant,
      opacity: 0.82,
      marginBottom: Spacing.hair,
    },
    headerQuote: {
      fontFamily: FontFamily.bold,
      fontSize: 18,
      lineHeight: 24,
      color: colors.primary_fixed_variant,
    },
    headerAuthor: {
      marginTop: Spacing.compact,
      fontFamily: FontFamily.medium,
      fontSize: 13,
      lineHeight: 18,
      color: colors.primary_fixed_variant,
      opacity: 0.82,
    },
    collectionSection: {
      alignItems: 'center',
      gap: Spacing.compact,
    },
    collectionLabel: {
      fontFamily: FontFamily.bold,
      fontSize: 12,
      letterSpacing: 1.4,
      textTransform: 'uppercase',
      color: colors.primary_fixed_variant,
    },
    collectionValue: {
      fontFamily: FontFamily.extraBold,
      fontSize: 46,
      color: colors.on_surface,
    },
    collectionSuffix: {
      fontFamily: FontFamily.bold,
      fontSize: 24,
      color: colors.primary,
    },
    jarWrap: {
      alignItems: 'center',
      gap: Spacing.generous,
    },
    jar: {
      width: 212,
      height: 272,
      borderRadius: 42,
      backgroundColor: 'rgba(255,255,255,0.45)',
      borderWidth: 4,
      borderColor: `${colors.primary}33`,
      overflow: 'hidden',
      position: 'relative',
      justifyContent: 'flex-end',
      ...Elevation.low,
    },
    jarLid: {
      position: 'absolute',
      top: 8,
      alignSelf: 'center',
      width: 88,
      height: 18,
      borderRadius: Radius.full,
      backgroundColor: colors.primary_container,
      zIndex: 2,
    },
    jarFill: {
      position: 'absolute',
      left: 18,
      right: 18,
      bottom: 18,
      borderBottomLeftRadius: 34,
      borderBottomRightRadius: 34,
      borderTopLeftRadius: 16,
      borderTopRightRadius: 16,
      overflow: 'hidden',
    },
    jarIconTop: {
      position: 'absolute',
      top: 116,
      left: 92,
      zIndex: 3,
    },
    jarIconBottom: {
      position: 'absolute',
      bottom: 56,
      left: 106,
      zIndex: 3,
    },
    jarIconLeaf: {
      position: 'absolute',
      top: 130,
      right: 50,
      zIndex: 3,
    },
    jarHint: {
      fontFamily: FontFamily.medium,
      fontSize: 17,
      lineHeight: 24,
      color: colors.on_surface_variant,
      textAlign: 'center',
      fontStyle: 'italic',
      paddingHorizontal: Spacing.item,
    },
    streakCard: {
      borderRadius: Radius.xl,
      backgroundColor: colors.surface_container_low,
      padding: Spacing.generous,
      gap: Spacing.cozy,
      ...Elevation.low,
    },
    sectionRow: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      gap: Spacing.item,
    },
    sectionHeading: {
      fontFamily: FontFamily.bold,
      fontSize: 28,
      lineHeight: 34,
      color: colors.on_surface,
    },
    sectionSubheading: {
      fontFamily: FontFamily.regular,
      fontSize: 16,
      lineHeight: 22,
      color: colors.on_surface_variant,
      marginTop: Spacing.hair,
    },
    streakBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.hair,
      paddingHorizontal: Spacing.item,
      paddingVertical: Spacing.compact,
      borderRadius: Radius.full,
      backgroundColor: colors.primary_container,
    },
    streakBadgeText: {
      fontFamily: FontFamily.bold,
      fontSize: 14,
      color: colors.primary_fixed_variant,
    },
    weekRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: Spacing.hair,
    },
    dayColumn: {
      alignItems: 'center',
      gap: Spacing.compact,
      flex: 1,
    },
    dayLabel: {
      fontFamily: FontFamily.bold,
      fontSize: 12,
      color: colors.on_surface_variant,
    },
    dayCircle: {
      width: 42,
      height: 42,
      borderRadius: 21,
      alignItems: 'center',
      justifyContent: 'center',
    },
    dayCircleCompleted: {
      backgroundColor: colors.primary_container,
    },
    dayCircleEmpty: {
      backgroundColor: colors.surface_container_highest,
      borderWidth: 1.5,
      borderColor: colors.outline_variant,
      borderStyle: 'dashed',
    },
    dayCircleToday: {
      transform: [{ scale: 1.06 }],
    },
    dayDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.outline_variant,
    },
    streakNote: {
      fontFamily: FontFamily.medium,
      fontSize: 16,
      lineHeight: 22,
      color: colors.on_surface_variant,
    },
    rewardsSection: {
      gap: Spacing.cozy,
    },
    viewAll: {
      fontFamily: FontFamily.bold,
      fontSize: 14,
      color: colors.primary_fixed_variant,
    },
    rewardGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: Spacing.item,
    },
    rewardCard: {
      width: '47%',
      minHeight: 212,
      borderRadius: Radius.lg,
      padding: Spacing.generous,
      overflow: 'hidden',
      justifyContent: 'flex-end',
      ...Elevation.low,
    },
    rewardCardLarge: {
      width: '100%',
      minHeight: 224,
    },
    rewardArt: {
      position: 'absolute',
      top: Spacing.generous,
      left: Spacing.generous,
      width: 68,
      height: 68,
      borderRadius: 24,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(255,255,255,0.55)',
    },
    lockBadge: {
      position: 'absolute',
      top: -6,
      right: -6,
      width: 26,
      height: 26,
      borderRadius: 13,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primary_fixed_variant,
    },
    rewardTitle: {
      fontFamily: FontFamily.bold,
      fontSize: 20,
      lineHeight: 24,
      color: colors.on_surface,
      marginBottom: Spacing.hair,
    },
    rewardTitleLarge: {
      fontSize: 28,
      lineHeight: 32,
    },
    rewardCost: {
      fontFamily: FontFamily.bold,
      fontSize: 13,
      color: colors.primary_fixed_variant,
      marginBottom: Spacing.cozy,
    },
    rewardButton: {
      minHeight: 48,
      borderRadius: Radius.full,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: Spacing.compact,
    },
    rewardButtonActive: {
      backgroundColor: colors.primary,
    },
    rewardButtonDisabled: {
      backgroundColor: colors.surface_container_lowest,
      borderWidth: 1,
      borderColor: colors.primary_container,
    },
    rewardButtonText: {
      fontFamily: FontFamily.bold,
      fontSize: 13,
      lineHeight: 16,
      color: colors.on_primary,
      textAlign: 'center',
    },
    rewardButtonTextDisabled: {
      color: colors.primary_fixed_variant,
    },
  });
