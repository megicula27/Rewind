import React from 'react';
import {
  Alert,
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
import { Colors, type ThemeName } from '@/src/theme/colors';
import { Elevation } from '@/src/theme/elevation';
import { Radius, Spacing } from '@/src/theme/spacing';
import { useTheme } from '@/src/theme/ThemeContext';
import { FontFamily } from '@/src/theme/typography';
import { getThemeVisuals } from '@/src/theme/visuals';

interface RewardItem {
  id: string;
  themeId: ThemeName;
  title: string;
  cost: number;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  accent: string;
  accentSoft: string;
}

const REWARDS: RewardItem[] = [
  {
    id: 'aquatic-serenity',
    themeId: 'aquatic_serenity',
    title: 'Aquatic Serenity',
    cost: 1500,
    icon: 'waves',
    accent: '#475D82',
    accentSoft: '#DCEAF9',
  },
  {
    id: 'jungle-deep',
    themeId: 'jungle_deep',
    title: 'Jungle Deep',
    cost: 2000,
    icon: 'pine-tree',
    accent: '#556B2F',
    accentSoft: '#E7EED0',
  },
  {
    id: 'golden-sun',
    themeId: 'golden_sun',
    title: 'Golden Sunburst',
    cost: 2500,
    icon: 'white-balance-sunny',
    accent: '#904800',
    accentSoft: '#FFE3A5',
  },
];

function formatPoints(value: number) {
  return value.toLocaleString();
}

export default function PointsScreen() {
  const insets = useSafeAreaInsets();
  const { colors, themeName, userName, ownsTheme, unlockTheme } = useTheme();
  const { points, weekSummary, spendPoints } = usePoints();
  const headerQuote = useMotivationQuote('points-tab-header', 3);
  const styles = createStyles(colors);
  const visuals = getThemeVisuals(themeName);
  const isGoldenTheme = themeName === 'golden_sun';

  const maxJarPoints = 2000;
  const jarFillRatio = Math.max(0.08, Math.min(points.total_points / maxJarPoints, 1));
  const lockedRewards = REWARDS.filter((reward) => !ownsTheme(reward.themeId));
  const nextUnlock =
    lockedRewards.find((reward) => reward.cost > points.total_points) ?? lockedRewards[0] ?? null;
  const pointsToNextUnlock = nextUnlock ? Math.max(nextUnlock.cost - points.total_points, 0) : 0;
  const completedDays = weekSummary.filter((day) => day.completed).length;

  const headerPaddingTop = insets.top + Spacing.compact;

  const handleRewardPress = (reward: RewardItem) => {
    if (ownsTheme(reward.themeId)) {
      Alert.alert('Already owned', `${reward.title} is already in your theme collection.`);
      return;
    }

    if (points.total_points < reward.cost) {
      const shortfall = reward.cost - points.total_points;
      Alert.alert(
        'More points needed',
        `You need ${formatPoints(shortfall)} more points to unlock ${reward.title}.`
      );
      return;
    }

    Alert.alert(
      'Unlock theme?',
      `Spend ${formatPoints(reward.cost)} points to unlock ${reward.title}?`,
      [
        { text: 'Not yet', style: 'cancel' },
        {
          text: 'Unlock',
          onPress: async () => {
            await spendPoints(reward.cost);
            unlockTheme(reward.themeId);
            Alert.alert('Theme unlocked', `${reward.title} has been added to your collection.`);
          },
        },
      ]
    );
  };

  return (
    <View style={styles.screen}>
      <LinearGradient
        colors={
          isGoldenTheme
            ? [colors.surface, '#FFF3C8', colors.surface_container_low]
            : [colors.surface, colors.tertiary, colors.surface_container_low]
        }
        locations={[0, 0.72, 1]}
        style={StyleSheet.absoluteFill}
      />
      <MaterialCommunityIcons
        name={visuals.points.backgroundTop}
        size={112}
        color={`${colors.primary}16`}
        style={styles.backgroundIconTop}
      />
      <MaterialCommunityIcons
        name={visuals.points.backgroundBottom}
        size={118}
        color={`${colors.secondary}14`}
        style={styles.backgroundIconBottom}
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
            <Text style={styles.headerQuote}>{'"'}{headerQuote.text}{'"'}</Text>
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
          {isGoldenTheme ? (
            <View style={styles.collectionBadge}>
              <MaterialCommunityIcons name="star-four-points" size={14} color={colors.secondary} />
              <Text style={styles.collectionBadgeText}>Nearly full!</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.jarWrap}>
          <View style={styles.jar}>
            <View style={styles.jarLid} />
            <View style={styles.jarHighlight} />
            <View style={[styles.jarFill, { height: `${jarFillRatio * 100}%` }]}>
              <LinearGradient
                colors={
                  isGoldenTheme
                    ? ['#FFEFC7', '#FFE082']
                    : [colors.primary_container, colors.primary_fixed]
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
            </View>
            <View style={styles.jarBaseGlow} />

            <MaterialCommunityIcons
              name={visuals.points.jarTopIcon}
              size={22}
              color={colors.primary_fixed_variant}
              style={styles.jarIconTop}
            />
            <MaterialCommunityIcons
              name={visuals.points.jarBottomIcon}
              size={20}
              color={colors.primary_fixed_variant}
              style={styles.jarIconBottom}
            />
            <MaterialCommunityIcons
              name={visuals.points.jarMiddleIcon}
              size={18}
              color={colors.primary_fixed_variant}
              style={styles.jarIconLeaf}
            />
          </View>
          <Text style={styles.jarHint}>
            {!nextUnlock
              ? 'You have unlocked every reward theme here. More horizons can bloom in the next phase.'
              : pointsToNextUnlock > 0
              ? `Almost there! Just ${formatPoints(pointsToNextUnlock)} more points until your next ${visuals.points.unlockNoun} unlocks.`
              : 'Your next reward is ready. More themes can open in the next phase.'}
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
              const iconName = visuals.points.streakIcons[index % visuals.points.streakIcons.length];

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
              ? `${completedDays} day${completedDays === 1 ? '' : 's'} completed this week.`
              : 'Your first completed day this week will appear here.'}
          </Text>
        </View>

        <View style={styles.rewardsSection}>
          <View style={styles.sectionRow}>
            <View>
              <Text style={styles.sectionHeading}>Reward Shop</Text>
              <Text style={styles.sectionSubheading}>Trade your points for new horizons.</Text>
            </View>
          </View>

          <View style={styles.rewardGrid}>
            {REWARDS.map((reward) => {
              const affordable = points.total_points >= reward.cost;
              const owned = ownsTheme(reward.themeId);

              return (
                <TouchableOpacity
                  key={reward.id}
                  accessibilityRole="button"
                  activeOpacity={0.92}
                  onPress={() => handleRewardPress(reward)}
                  style={[
                    styles.rewardCard,
                    {
                      backgroundColor: owned ? colors.surface_container_highest : colors.surface_container_low,
                    },
                  ]}
                >
                  <LinearGradient
                    colors={[`${reward.accentSoft}F5`, `${reward.accent}30`]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={StyleSheet.absoluteFill}
                  />
                  <MaterialCommunityIcons
                    name={reward.icon}
                    size={108}
                    color={`${reward.accent}26`}
                    style={styles.rewardArtBackground}
                  />

                  {!owned ? (
                    <View style={styles.lockBadge}>
                      <MaterialCommunityIcons name="lock" size={14} color={colors.surface} />
                    </View>
                  ) : null}

                  <Text style={styles.rewardTitle}>{reward.title}</Text>
                  <Text style={styles.rewardCost}>{formatPoints(reward.cost)} Points</Text>

                  <TouchableOpacity
                    accessibilityRole="button"
                    activeOpacity={0.9}
                    onPress={() => handleRewardPress(reward)}
                    style={[
                      styles.rewardButton,
                      owned
                        ? styles.rewardButtonOwned
                        : affordable
                          ? styles.rewardButtonActive
                          : styles.rewardButtonDisabled,
                    ]}
                  >
                    <Text
                      style={[
                        styles.rewardButtonText,
                        (owned || !affordable) && styles.rewardButtonTextDisabled,
                      ]}
                    >
                      {owned ? 'Owned' : affordable ? 'Unlock Theme' : 'Need More Points'}
                    </Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {isGoldenTheme ? (
          <LinearGradient
            colors={['#FFD67A', '#FFC933']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.sunburstCard}
          >
            <MaterialCommunityIcons
              name="ticket-percent-outline"
              size={54}
              color={`${colors.primary}20`}
              style={styles.sunburstCardArt}
            />
            <Text style={styles.sunburstCardTitle}>Keep it up, {userName ?? 'Rose'}!</Text>
            <Text style={styles.sunburstCardText}>
              Complete a few more reminders today to grow your next golden petal.
            </Text>
          </LinearGradient>
        ) : null}

        {!isGoldenTheme ? <QuoteFooter scope="points-tab-footer" shift={4} /> : null}
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
    backgroundIconTop: {
      position: 'absolute',
      top: 96,
      right: -18,
      opacity: 0.82,
    },
    backgroundIconBottom: {
      position: 'absolute',
      bottom: 132,
      left: -22,
      opacity: 0.72,
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
    collectionBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.hair,
      paddingHorizontal: Spacing.item,
      paddingVertical: Spacing.compact,
      borderRadius: Radius.full,
      backgroundColor: '#FFE89A',
    },
    collectionBadgeText: {
      fontFamily: FontFamily.bold,
      fontSize: 14,
      color: colors.secondary,
    },
    jarWrap: {
      alignItems: 'center',
      gap: Spacing.generous,
    },
    jar: {
      width: 212,
      height: 272,
      borderRadius: 42,
      backgroundColor: `${colors.surface_container_lowest}C4`,
      borderWidth: 2,
      borderColor: `${colors.outline_variant}66`,
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
    jarHighlight: {
      position: 'absolute',
      top: 26,
      left: 26,
      width: 52,
      height: 132,
      borderRadius: 26,
      backgroundColor: 'rgba(255,255,255,0.22)',
      zIndex: 1,
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
    jarBaseGlow: {
      position: 'absolute',
      left: 14,
      right: 14,
      bottom: 10,
      height: 36,
      borderRadius: 18,
      backgroundColor: `${colors.primary}12`,
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
    sunburstCard: {
      position: 'relative',
      overflow: 'hidden',
      borderRadius: Radius.xl,
      paddingHorizontal: Spacing.breathe,
      paddingVertical: Spacing.breathe,
      ...Elevation.low,
    },
    sunburstCardArt: {
      position: 'absolute',
      right: -10,
      bottom: 2,
    },
    sunburstCardTitle: {
      fontFamily: FontFamily.extraBold,
      fontSize: 24,
      lineHeight: 30,
      color: colors.on_surface,
      marginBottom: Spacing.compact,
    },
    sunburstCardText: {
      maxWidth: '78%',
      fontFamily: FontFamily.regular,
      fontSize: 16,
      lineHeight: 28,
      color: colors.on_surface,
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
    rewardArtBackground: {
      position: 'absolute',
      top: 8,
      right: -10,
    },
    lockBadge: {
      position: 'absolute',
      top: Spacing.generous,
      right: Spacing.generous,
      width: 26,
      height: 26,
      borderRadius: 13,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primary_fixed_variant,
    },
    rewardTitle: {
      maxWidth: '82%',
      fontFamily: FontFamily.bold,
      fontSize: 20,
      lineHeight: 24,
      color: colors.on_surface,
      marginBottom: Spacing.hair,
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
    rewardButtonOwned: {
      backgroundColor: colors.surface_container_lowest,
      borderWidth: 1,
      borderColor: `${colors.primary}2A`,
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
