/**
 * Rewind — Home Screen
 * 
 * The heart of the app. Now powered by SQLite (Phase 2).
 * Shows:
 * - Greeting header with user name + water drop button  
 * - Focus card with progress summary + gradient bar
 * - Today's reminder cards from the database
 * - Empty state when no reminders exist
 */

import React, { useCallback, useState } from 'react';
import {
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import TaskCompletionSheet from '@/src/components/TaskCompletionSheet';
import HydrationTimerButton from '@/src/components/HydrationTimerButton';
import HomeReminderCard from '@/src/components/HomeReminderCard';
import ProgressBar from '@/src/components/ProgressBar';
import QuoteFooter from '@/src/components/QuoteFooter';
import type { ReminderWithStatus } from '@/src/db/types';
import { buildTimeLabel } from '@/src/db/types';
import { usePoints } from '@/src/hooks/usePoints';
import { useReminders } from '@/src/hooks/useReminders';
import { Colors } from '@/src/theme/colors';
import { Elevation } from '@/src/theme/elevation';
import { Spacing, Radius } from '@/src/theme/spacing';
import { useTheme } from '@/src/theme/ThemeContext';
import { FontFamily } from '@/src/theme/typography';
import { getThemeVisuals } from '@/src/theme/visuals';
import { getGreeting, getProgressMessage } from '@/src/utils/greetings';

export default function HomeScreen() {
  const { userName, colors, themeName } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { reminders, loading, refresh, completeReminder, removeReminder } = useReminders();
  const { points, refresh: refreshPoints } = usePoints();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedReminder, setSelectedReminder] = useState<ReminderWithStatus | null>(null);
  const [dialValue, setDialValue] = useState(10);
  const [savingCompletion, setSavingCompletion] = useState(false);
  const styles = createStyles(colors);
  const visuals = getThemeVisuals(themeName);
  const isGoldenTheme = themeName === 'golden_sun';

  const completedCount = reminders.filter((r) => r.todayCompletion !== null).length;
  const totalCount = reminders.length;
  const progress = totalCount > 0 ? completedCount / totalCount : 0;

  const greeting = getGreeting(userName);
  const progressMessage = getProgressMessage(completedCount, totalCount);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }, [refresh]);

  const openCompletionSheet = (reminder: ReminderWithStatus) => {
    if (reminder.todayCompletion) {
      return;
    }

    setSelectedReminder(reminder);
    setDialValue(10);
  };

  const closeCompletionSheet = () => {
    if (savingCompletion) {
      return;
    }

    setSelectedReminder(null);
    setDialValue(10);
  };

  const saveCompletion = async () => {
    if (!selectedReminder) {
      return;
    }

    try {
      setSavingCompletion(true);
      await completeReminder(selectedReminder.id, dialValue);
      await Promise.all([refresh(), refreshPoints()]);
      setSelectedReminder(null);
      setDialValue(10);
    } catch (error) {
      console.error('Failed to save completion:', error);
    } finally {
      setSavingCompletion(false);
    }
  };

  const promptRemoveReminder = (reminder: ReminderWithStatus) => {
    Alert.alert(
      'Remove task?',
      `Remove "${reminder.name}" from your reminders?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeReminder(reminder.id);
              if (selectedReminder?.id === reminder.id) {
                setSelectedReminder(null);
                setDialValue(10);
              }
            } catch (error) {
              console.error('Failed to delete reminder:', error);
            }
          },
        },
      ]
    );
  };

  const handleToggleComplete = async (id: number, isCurrentlyCompleted: boolean) => {
    if (!isCurrentlyCompleted) {
      // Quick complete with full score (10)
      await completeReminder(id, 10);
    }
    // TODO: Phase 3 — show completion dial for partial completion
  };

  const headerPaddingTop = insets.top + Spacing.compact;

  return (
    <View style={styles.screen}>
      <LinearGradient
        colors={
          isGoldenTheme
            ? [colors.surface, '#FFF3C4', colors.surface_container_low]
            : [colors.surface, colors.tertiary, colors.surface_container_low]
        }
        locations={[0, 0.3, 1]}
        style={StyleSheet.absoluteFill}
      />
      <MaterialCommunityIcons
        name={visuals.home.backgroundTop}
        size={106}
        color={`${colors.primary}18`}
        style={styles.backgroundIconTop}
      />
      <MaterialCommunityIcons
        name={visuals.home.backgroundBottom}
        size={116}
        color={`${colors.secondary}16`}
        style={styles.backgroundIconBottom}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: 100 + insets.bottom },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {/* ── Header Bar ─────────────────────────────── */}
        <Animated.View 
          entering={FadeInDown.duration(500).delay(100)}
          style={[
            styles.headerBar,
            {
              paddingTop: headerPaddingTop,
              backgroundColor: isGoldenTheme ? colors.surface : colors.primary_fixed,
              borderBottomLeftRadius: isGoldenTheme ? 0 : Radius.xxl + 12,
              borderBottomRightRadius: isGoldenTheme ? 0 : Radius.xxl + 12,
              marginBottom: isGoldenTheme ? Spacing.item : Spacing.breathe + Spacing.compact,
              minHeight: isGoldenTheme ? 78 : 104,
            },
          ]}
        >
          {!isGoldenTheme ? <View style={styles.headerGlow} /> : null}

          <View style={styles.greetingWrap}>
            {isGoldenTheme ? (
              <View style={styles.greetingRow}>
                <Text style={styles.greetingText}>{greeting}</Text>
                <MaterialCommunityIcons
                  name="white-balance-sunny"
                  size={22}
                  color={colors.primary_container}
                  style={styles.greetingSun}
                />
              </View>
            ) : (
              <Text style={styles.greetingText}>{greeting}</Text>
            )}
          </View>

          <HydrationTimerButton />
        </Animated.View>

        {/* ── Focus Card ─────────────────────────────── */}
        <Animated.View 
          entering={FadeInDown.duration(500).delay(200)}
          style={styles.focusCard}
        >
          <View style={styles.decorCircle} />
          <View style={styles.focusIconBadge}>
            <MaterialCommunityIcons
              name={visuals.home.focusIcon}
              size={22}
              color={colors.primary_fixed_variant}
            />
          </View>
          <Text style={styles.focusLabel}>FOCUS FOR TODAY</Text>
          <Text style={styles.focusTitle}>{progressMessage}</Text>
          <View style={styles.progressBarContainer}>
            <ProgressBar progress={progress} height={10} />
          </View>
        </Animated.View>

        {/* ── Reminder Cards (from database) ──────────── */}
        {!loading && reminders.length === 0 ? (
          <Animated.View
            entering={FadeInDown.duration(500).delay(300)}
            style={styles.emptyState}
          >
            <Text style={styles.emptyEmoji}>🌱</Text>
            <View style={styles.emptyIconWrap}>
              <MaterialCommunityIcons
                name={visuals.home.emptyIcon}
                size={42}
                color={colors.primary_fixed_variant}
              />
            </View>
            <Text style={styles.emptyTitle}>No reminders yet</Text>
            <Text style={styles.emptySubtitle}>
              Tap the Add tab to plant your first gentle reminder
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => router.push('/(tabs)/add')}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[colors.primary, colors.primary_fixed_variant]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.emptyButtonGradient}
              >
                <MaterialCommunityIcons name="plus" size={20} color={colors.on_primary} />
                <Text style={styles.emptyButtonText}>Add Reminder</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        ) : (
          <View style={styles.remindersSection}>
            {reminders.map((reminder, index) => {
              const isCompleted = reminder.todayCompletion !== null;
              const timeLabel = buildTimeLabel(reminder, reminder.todayCompletion);
              
              return (
                <Animated.View
                  key={reminder.id}
                  entering={FadeInDown.duration(400).delay(300 + index * 80)}
                >
                  <HomeReminderCard
                    id={reminder.id}
                    name={reminder.name}
                    type={reminder.type}
                    icon={reminder.icon}
                    description={reminder.description}
                    timeLabel={timeLabel}
                    isCompleted={isCompleted}
                    dialValue={reminder.todayCompletion?.dial_value}
                    onToggleComplete={() => openCompletionSheet(reminder)}
                    onLongPress={() => promptRemoveReminder(reminder)}
                    index={index}
                  />
                </Animated.View>
              );
            })}
          </View>
        )}

        {/* ── Illustration footer ───────────────────── */}
        <Animated.View
          entering={FadeInDown.duration(500).delay(700)}
          style={styles.illustrationPlaceholder}
        >
          {isGoldenTheme ? (
            <LinearGradient
              colors={['#FFE9A8', '#FFE3A5', '#FFD76A']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.nudgeCard}
            >
              <MaterialCommunityIcons
                name="flower-pollen-outline"
                size={54}
                color={`${colors.primary}20`}
                style={styles.nudgeArtLeft}
              />
              <MaterialCommunityIcons
                name="flower-outline"
                size={72}
                color={`${colors.primary}28`}
                style={styles.nudgeArtRight}
              />
              <Text style={styles.nudgeTitle}>The Gentle Nudge</Text>
              <Text style={styles.nudgeText}>
                It&apos;s a beautiful sunny moment, {userName ?? 'friend'}. Remember to take a
                deep breath before your next reminder.
              </Text>
            </LinearGradient>
          ) : (
            <QuoteFooter scope="home-tab-footer" shift={1} />
          )}
        </Animated.View>
      </ScrollView>

      <TaskCompletionSheet
        visible={selectedReminder !== null}
        reminderName={selectedReminder?.name ?? "Today's reminder"}
        totalPoints={points.total_points}
        dialValue={dialValue}
        saving={savingCompletion}
        onChangeDial={setDialValue}
        onClose={closeCompletionSheet}
        onPrimaryAction={saveCompletion}
        onSecondaryAction={closeCompletionSheet}
      />
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
    },

    // Header bar
    headerBar: {
      position: 'relative',
      overflow: 'hidden',
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.primary_fixed,
      borderBottomLeftRadius: Radius.xxl + 12,
      borderBottomRightRadius: Radius.xxl + 12,
      paddingBottom: Spacing.compact,
      paddingHorizontal: Spacing.generous + 12,
      marginTop: 0,
      marginHorizontal: -Spacing.generous,
      marginBottom: Spacing.breathe + Spacing.compact,
      minHeight: 104,
    },
    headerGlow: {
      position: 'absolute',
      top: -22,
      right: -18,
      width: 150,
      height: 150,
      borderRadius: 75,
      backgroundColor: colors.primary_container,
      opacity: 0.2,
    },
    backgroundIconTop: {
      position: 'absolute',
      top: 78,
      right: -18,
      opacity: 0.85,
    },
    backgroundIconBottom: {
      position: 'absolute',
      bottom: 110,
      left: -24,
      opacity: 0.7,
    },
    greetingWrap: {
      flex: 1,
      justifyContent: 'center',
      paddingRight: Spacing.item,
      zIndex: 1,
    },
    greetingRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: Spacing.compact,
    },
    greetingText: {
      fontFamily: FontFamily.extraBold,
      fontSize: 24,
      lineHeight: 31,
      color: colors.primary_fixed_variant,
      letterSpacing: 0.2,
      textAlign: 'left',
    },
    greetingSun: {
      marginTop: 4,
    },

    // Focus Card
    focusCard: {
      backgroundColor: colors.surface_container_lowest,
      borderRadius: Radius.xl,
      paddingVertical: Spacing.generous,
      paddingHorizontal: Spacing.breathe,
      marginHorizontal: 8,
      marginBottom: Spacing.breathe,
      overflow: 'hidden',
      position: 'relative',
      ...Elevation.low,
    },
    decorCircle: {
      position: 'absolute',
      top: -20,
      right: -20,
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: colors.primary_container,
      opacity: 0.4,
    },
    focusIconBadge: {
      position: 'absolute',
      top: Spacing.generous,
      right: Spacing.generous,
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: `${colors.surface_container_lowest}D8`,
    },
    focusLabel: {
      fontFamily: FontFamily.semiBold,
      fontSize: 12,
      color: colors.on_surface_variant,
      letterSpacing: 1.5,
      textTransform: 'uppercase',
      marginBottom: Spacing.compact,
    },
    focusTitle: {
      fontFamily: FontFamily.bold,
      fontSize: 22,
      lineHeight: 30,
      color: colors.on_surface,
      marginBottom: Spacing.cozy,
    },
    progressBarContainer: {
      marginTop: Spacing.compact,
    },

    // Reminders
    remindersSection: {
      gap: Spacing.item,
    },

    // Empty state
    emptyState: {
      alignItems: 'center',
      paddingVertical: Spacing.solitude,
      paddingHorizontal: Spacing.breathe,
    },
    emptyEmoji: {
      fontSize: 1,
      lineHeight: 1,
      opacity: 0,
      height: 1,
      marginBottom: 0,
    },
    emptyIconWrap: {
      width: 92,
      height: 92,
      borderRadius: 46,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primary_fixed,
      marginBottom: Spacing.generous,
      ...Elevation.low,
    },
    emptyTitle: {
      fontFamily: FontFamily.bold,
      fontSize: 24,
      color: colors.on_surface,
      marginBottom: Spacing.compact,
    },
    emptySubtitle: {
      fontFamily: FontFamily.regular,
      fontSize: 18,
      color: colors.on_surface_variant,
      textAlign: 'center',
      lineHeight: 26,
      marginBottom: Spacing.breathe,
    },
    emptyButton: {
      borderRadius: Radius.full,
      overflow: 'hidden',
      ...Elevation.medium,
    },
    emptyButtonGradient: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: Spacing.compact,
      height: 56,
      paddingHorizontal: Spacing.breathe,
    },
    emptyButtonText: {
      fontFamily: FontFamily.bold,
      fontSize: 16,
      color: colors.on_primary,
    },

    // Illustration
    illustrationPlaceholder: {
      paddingVertical: Spacing.breathe,
      marginTop: Spacing.cozy,
    },
    nudgeCard: {
      borderRadius: Radius.xl,
      paddingHorizontal: Spacing.breathe,
      paddingVertical: Spacing.breathe,
      overflow: 'hidden',
      ...Elevation.low,
    },
    nudgeArtLeft: {
      position: 'absolute',
      left: -14,
      bottom: -8,
    },
    nudgeArtRight: {
      position: 'absolute',
      right: -12,
      bottom: 10,
    },
    nudgeTitle: {
      fontFamily: FontFamily.bold,
      fontSize: 24,
      lineHeight: 30,
      color: colors.on_surface,
      marginBottom: Spacing.compact,
    },
    nudgeText: {
      maxWidth: '82%',
      fontFamily: FontFamily.regular,
      fontSize: 16,
      lineHeight: 28,
      color: colors.on_surface,
    },
  });
