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

import ReminderCard from '@/src/components/ReminderCard';
import ProgressBar from '@/src/components/ProgressBar';
import WaterDropButton from '@/src/components/WaterDropButton';
import { buildTimeLabel } from '@/src/db/types';
import { useReminders } from '@/src/hooks/useReminders';
import { Colors } from '@/src/theme/colors';
import { Elevation } from '@/src/theme/elevation';
import { Spacing, Radius } from '@/src/theme/spacing';
import { useTheme } from '@/src/theme/ThemeContext';
import { FontFamily } from '@/src/theme/typography';
import { getGreeting, getProgressMessage } from '@/src/utils/greetings';

export default function HomeScreen() {
  const { userName, colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { reminders, loading, refresh, completeReminder } = useReminders();
  const [refreshing, setRefreshing] = useState(false);
  const styles = createStyles(colors);

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

  const handleToggleComplete = async (id: number, isCurrentlyCompleted: boolean) => {
    if (!isCurrentlyCompleted) {
      // Quick complete with full score (10)
      await completeReminder(id, 10);
    }
    // TODO: Phase 3 — show completion dial for partial completion
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <LinearGradient
        colors={[colors.surface, colors.tertiary, colors.surface_container_low]}
        locations={[0, 0.3, 1]}
        style={StyleSheet.absoluteFill}
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
          style={styles.headerBar}
        >
          <View style={styles.headerGlow} />
          <TouchableOpacity
            style={styles.menuButton}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Menu"
          >
            <MaterialCommunityIcons
              name="menu"
              size={28}
              color={colors.primary_fixed_variant}
            />
          </TouchableOpacity>

          <View style={styles.greetingWrap}>
            <Text style={styles.greetingText}>{greeting}</Text>
          </View>

          <WaterDropButton />
        </Animated.View>

        {/* ── Focus Card ─────────────────────────────── */}
        <Animated.View 
          entering={FadeInDown.duration(500).delay(200)}
          style={styles.focusCard}
        >
          <View style={styles.decorCircle} />
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
                  <ReminderCard
                    id={reminder.id}
                    name={reminder.name}
                    type={reminder.type}
                    icon={reminder.icon}
                    timeLabel={timeLabel}
                    isCompleted={isCompleted}
                    dialValue={reminder.todayCompletion?.dial_value}
                    onToggleComplete={() => handleToggleComplete(reminder.id, isCompleted)}
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
          <Text style={styles.illustrationEmoji}>🌸</Text>
          <Text style={styles.illustrationText}>
            You're doing beautifully today
          </Text>
        </Animated.View>
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
    },

    // Header bar
    headerBar: {
      position: 'relative',
      overflow: 'hidden',
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.primary_fixed,
      borderTopLeftRadius: Radius.lg,
      borderTopRightRadius: Radius.lg,
      borderBottomLeftRadius: Radius.xxl + 12,
      borderBottomRightRadius: Radius.xxl + 12,
      paddingTop: Spacing.generous,
      paddingBottom: Spacing.cozy,
      paddingHorizontal: Spacing.generous + 4,
      marginTop: 0,
      marginHorizontal: -Spacing.generous,
      marginBottom: Spacing.breathe,
      minHeight: 118,
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
    menuButton: {
      width: 44,
      height: 44,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: Spacing.compact,
      zIndex: 1,
    },
    greetingWrap: {
      flex: 1,
      justifyContent: 'center',
      paddingRight: Spacing.item,
      zIndex: 1,
    },
    greetingText: {
      fontFamily: FontFamily.extraBold,
      fontSize: 24,
      lineHeight: 31,
      color: colors.primary_fixed_variant,
      letterSpacing: 0.2,
      textAlign: 'left',
    },

    // Focus Card
    focusCard: {
      backgroundColor: colors.surface_container_lowest,
      borderRadius: Radius.xl,
      padding: Spacing.generous,
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
      fontSize: 56,
      marginBottom: Spacing.generous,
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
      alignItems: 'center',
      paddingVertical: Spacing.breathe,
      marginTop: Spacing.cozy,
    },
    illustrationEmoji: {
      fontSize: 40,
      marginBottom: Spacing.compact,
    },
    illustrationText: {
      fontFamily: FontFamily.medium,
      fontSize: 16,
      color: colors.on_surface_variant,
      textAlign: 'center',
    },
  });
