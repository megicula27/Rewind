/**
 * Rewind — Add Reminder Screen
 * 
 * Multi-section scrollable form based on the stitch design:
 *   Step 1: Type (medicine/food/exercise/custom — bento grid)
 *            + Reminder Title + Short Description
 *   Step 2: Time picker
 *   Step 3: Frequency (Daily/Weekly/Monthly) + day selector
 *   Step 4: Sound selection
 *   CTA: "Create Reminder" gradient button
 * 
 * Design adherence:
 *   - Watercolor blob backgrounds
 *   - Organic rounded shapes (xl/lg radius)
 *   - No 1px borders — boundaries via surface shifts
 *   - Min 56px tap targets on everything interactive
 *   - Warm, unhurried copy
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { Colors } from '@/src/theme/colors';
import { FontFamily } from '@/src/theme/typography';
import { Spacing, Radius, TapTargets } from '@/src/theme/spacing';
import { Elevation } from '@/src/theme/elevation';
import { useReminders } from '@/src/hooks/useReminders';
import type { ReminderType, ReminderFrequency } from '@/src/db/types';

// ── Type config ─────────────────────────────────────
const TYPES: { key: ReminderType; label: string; icon: string; materialIcon: string }[] = [
  { key: 'medicine', label: 'Medicine', icon: '💊', materialIcon: 'medical-bag' },
  { key: 'food',     label: 'Food',     icon: '🍽️', materialIcon: 'silverware-fork-knife' },
  { key: 'water',    label: 'Exercise', icon: '🏋️', materialIcon: 'dumbbell' },
  { key: 'custom',   label: 'Custom',   icon: '✏️', materialIcon: 'pencil-outline' },
];

const FREQUENCIES: { key: ReminderFrequency; label: string }[] = [
  { key: 'daily',   label: 'Daily' },
  { key: 'weekly',  label: 'Weekly' },
  { key: 'monthly', label: 'Monthly' },
];

const DAYS_OF_WEEK = [
  { key: 0, label: 'S', full: 'Sunday' },
  { key: 1, label: 'M', full: 'Monday' },
  { key: 2, label: 'T', full: 'Tuesday' },
  { key: 3, label: 'W', full: 'Wednesday' },
  { key: 4, label: 'T', full: 'Thursday' },
  { key: 5, label: 'F', full: 'Friday' },
  { key: 6, label: 'S', full: 'Saturday' },
];

const DEFAULT_SOUNDS = [
  { id: 1, name: 'Rain on a Tin Roof', icon: 'weather-rainy', color: '#90CAF9', bg: '#E3F2FD' },
  { id: 2, name: 'Soft Morning Chime', icon: 'bell-outline', color: '#FFB74D', bg: '#FFF3E0' },
  { id: 3, name: 'Forest Songbirds',   icon: 'bird', color: '#81C784', bg: '#E8F5E9' },
];

export default function AddScreen() {
  const insets = useSafeAreaInsets();
  const { addReminder } = useReminders();

  // ── Form state ─────────────────────────────
  const [selectedType, setSelectedType] = useState<ReminderType>('food');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [time, setTime] = useState(new Date(2024, 0, 1, 8, 30));
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [frequency, setFrequency] = useState<ReminderFrequency>('daily');
  const [dayOfWeek, setDayOfWeek] = useState(1); // Monday
  const [dayOfMonth, setDayOfMonth] = useState(1);
  const [selectedSound, setSelectedSound] = useState(1);
  const [isSaving, setIsSaving] = useState(false);

  const isCustom = selectedType === 'custom';
  const typeConfig = TYPES.find(t => t.key === selectedType)!;

  // Auto-generate name for non-custom types
  const getDefaultName = (type: ReminderType) => {
    switch (type) {
      case 'medicine': return 'Take Medicine';
      case 'food': return 'Meal Time';
      case 'water': return 'Exercise';
      default: return '';
    }
  };

  const handleTimeChange = (_: any, selectedDate?: Date) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setTime(selectedDate);
    }
  };

  const handleCreate = async () => {
    const reminderName = isCustom ? name.trim() : (name.trim() || getDefaultName(selectedType));
    
    if (!reminderName) {
      Alert.alert('Just one thing ✨', 'Please give your reminder a name');
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setIsSaving(true);

    try {
      await addReminder({
        name: reminderName,
        description: description.trim() || undefined,
        type: selectedType,
        icon: isCustom ? '📌' : typeConfig.icon,
        frequency,
        time_hour: time.getHours(),
        time_minute: time.getMinutes(),
        day_of_week: frequency === 'weekly' ? dayOfWeek : undefined,
        day_of_month: frequency === 'monthly' ? dayOfMonth : undefined,
      });

      // Reset form
      setName('');
      setDescription('');
      setSelectedType('food');
      setFrequency('daily');
      setTime(new Date(2024, 0, 1, 8, 30));
      
      Alert.alert('Blooming! 🌸', 'Your reminder has been created.');
    } catch (err) {
      Alert.alert('Oops', 'Something went wrong. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <LinearGradient
        colors={[Colors.surface, Colors.tertiary, Colors.surface_container_low]}
        locations={[0, 0.3, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* ── Decorative blobs ─────────────────────── */}
      <View style={[styles.blob, styles.blobTop]} />
      <View style={[styles.blob, styles.blobBottom]} />

      {/* ── Header ───────────────────────────────── */}
      <Animated.View 
        entering={FadeInDown.duration(400)}
        style={styles.header}
      >
        <LinearGradient
          colors={[`${Colors.primary_container}CC`, `${Colors.primary_container}99`]}
          style={styles.headerGradient}
        >
          <View style={styles.headerRow}>
            <Text style={styles.headerTitle}>New Reminder</Text>
          </View>
        </LinearGradient>
      </Animated.View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: 120 + insets.bottom },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Welcome ────────────────────────────── */}
        <Animated.View entering={FadeInDown.duration(500).delay(100)} style={styles.section}>
          <Text style={styles.heroTitle}>
            Let's set a{'\n'}
            <Text style={{ color: Colors.primary }}>gentle nudge</Text>.
          </Text>
          <Text style={styles.heroSubtitle}>
            Take your time. There's no rush in caring for yourself.
          </Text>
        </Animated.View>

        {/* ── Step 1: Type ───────────────────────── */}
        <Animated.View entering={FadeInDown.duration(500).delay(200)} style={styles.section}>
          <Text style={styles.stepLabel}>1. WHAT DO YOU NEED TO REMEMBER?</Text>
          {/* Row 1: Medicine + Food */}
          <View style={styles.typeRow}>
            {TYPES.slice(0, 2).map((type) => {
              const isSelected = selectedType === type.key;
              return (
                <TouchableOpacity
                  key={type.key}
                  style={[
                    styles.typeButton,
                    isSelected && styles.typeButtonActive,
                  ]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setSelectedType(type.key);
                    setName(type.key === 'custom' ? '' : getDefaultName(type.key));
                  }}
                  activeOpacity={0.7}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: isSelected }}
                  accessibilityLabel={type.label}
                >
                  <MaterialCommunityIcons
                    name={type.materialIcon as any}
                    size={32}
                    color={Colors.primary}
                    style={[isSelected && { transform: [{ scale: 1.1 }] }]}
                  />
                  <Text style={styles.typeLabel}>{type.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
          {/* Row 2: Exercise + Custom */}
          <View style={[styles.typeRow, { marginTop: Spacing.item }]}>
            {TYPES.slice(2, 4).map((type) => {
              const isSelected = selectedType === type.key;
              return (
                <TouchableOpacity
                  key={type.key}
                  style={[
                    styles.typeButton,
                    isSelected && styles.typeButtonActive,
                  ]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setSelectedType(type.key);
                    setName(type.key === 'custom' ? '' : getDefaultName(type.key));
                  }}
                  activeOpacity={0.7}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: isSelected }}
                  accessibilityLabel={type.label}
                >
                  <MaterialCommunityIcons
                    name={type.materialIcon as any}
                    size={32}
                    color={Colors.primary}
                    style={[isSelected && { transform: [{ scale: 1.1 }] }]}
                  />
                  <Text style={styles.typeLabel}>{type.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Animated.View>

        {/* ── Reminder Title ─────────────────────── */}
        <Animated.View entering={FadeInDown.duration(500).delay(300)} style={styles.section}>
          <Text style={styles.stepLabel}>REMINDER TITLE</Text>
          <TextInput
            style={styles.input}
            placeholder={isCustom ? 'e.g., Morning Pills' : `e.g., ${getDefaultName(selectedType)}`}
            placeholderTextColor={Colors.outline}
            value={name}
            onChangeText={setName}
            maxLength={60}
            accessibilityLabel="Reminder title"
          />
        </Animated.View>

        {/* ── Short Description ──────────────────── */}
        <Animated.View entering={FadeInDown.duration(500).delay(350)} style={styles.section}>
          <Text style={styles.stepLabel}>SHORT DESCRIPTION</Text>
          <TextInput
            style={[styles.input, styles.inputMultiline]}
            placeholder="e.g., Take with a light snack"
            placeholderTextColor={Colors.outline}
            value={description}
            onChangeText={setDescription}
            maxLength={200}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            accessibilityLabel="Short description"
          />
        </Animated.View>

        {/* ── Step 2: Time ───────────────────────── */}
        <Animated.View entering={FadeInDown.duration(500).delay(400)} style={styles.section}>
          <Text style={styles.stepLabel}>2. AT WHAT TIME?</Text>
          <TouchableOpacity
            style={styles.timePickerCard}
            onPress={() => setShowTimePicker(true)}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={`Selected time: ${time.getHours() % 12 || 12}:${time.getMinutes().toString().padStart(2, '0')} ${time.getHours() >= 12 ? 'PM' : 'AM'}`}
          >
            <View style={styles.timeDisplay}>
              <Text style={styles.timeDigits}>
                {(time.getHours() % 12 || 12).toString().padStart(2, '0')}
              </Text>
              <Text style={styles.timeColon}>:</Text>
              <Text style={styles.timeDigits}>
                {time.getMinutes().toString().padStart(2, '0')}
              </Text>
              <View style={styles.amPmContainer}>
                <View style={[
                  styles.amPmPill,
                  time.getHours() < 12 && styles.amPmPillActive,
                ]}>
                  <Text style={[
                    styles.amPmText,
                    time.getHours() < 12 && styles.amPmTextActive,
                  ]}>AM</Text>
                </View>
                <View style={[
                  styles.amPmPill,
                  time.getHours() >= 12 && styles.amPmPillActive,
                ]}>
                  <Text style={[
                    styles.amPmText,
                    time.getHours() >= 12 && styles.amPmTextActive,
                  ]}>PM</Text>
                </View>
              </View>
            </View>
            <Text style={styles.tapHint}>Tap to change time</Text>
          </TouchableOpacity>

          {showTimePicker && (
            <DateTimePicker
              value={time}
              mode="time"
              is24Hour={false}
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleTimeChange}
              themeVariant="light"
            />
          )}
        </Animated.View>

        {/* ── Step 3: Frequency ──────────────────── */}
        <Animated.View entering={FadeInDown.duration(500).delay(500)} style={styles.section}>
          <Text style={styles.stepLabel}>3. HOW OFTEN?</Text>
          
          {/* Frequency pills */}
          <View style={styles.frequencyRow}>
            {FREQUENCIES.map((f) => {
              const isSelected = frequency === f.key;
              return (
                <TouchableOpacity
                  key={f.key}
                  style={[
                    styles.frequencyPill,
                    isSelected && styles.frequencyPillActive,
                  ]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setFrequency(f.key);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.frequencyText,
                    isSelected && styles.frequencyTextActive,
                  ]}>
                    {f.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Weekly: Day of week selector */}
          {frequency === 'weekly' && (
            <Animated.View entering={FadeInDown.duration(300)} style={styles.daySelector}>
              <Text style={styles.daySelectorLabel}>Which day?</Text>
              <View style={styles.dayRow}>
                {DAYS_OF_WEEK.map((d) => {
                  const isSelected = dayOfWeek === d.key;
                  return (
                    <TouchableOpacity
                      key={d.key}
                      style={[
                        styles.dayCircle,
                        isSelected && styles.dayCircleActive,
                      ]}
                      onPress={() => setDayOfWeek(d.key)}
                      accessibilityLabel={d.full}
                    >
                      <Text style={[
                        styles.dayCircleText,
                        isSelected && styles.dayCircleTextActive,
                      ]}>
                        {d.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </Animated.View>
          )}

          {/* Monthly: Day of month picker */}
          {frequency === 'monthly' && (
            <Animated.View entering={FadeInDown.duration(300)} style={styles.daySelector}>
              <Text style={styles.daySelectorLabel}>Which date?</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.monthDayScroll}
              >
                {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => {
                  const isSelected = dayOfMonth === d;
                  return (
                    <TouchableOpacity
                      key={d}
                      style={[
                        styles.monthDayCircle,
                        isSelected && styles.monthDayCircleActive,
                      ]}
                      onPress={() => setDayOfMonth(d)}
                    >
                      <Text style={[
                        styles.monthDayText,
                        isSelected && styles.monthDayTextActive,
                      ]}>
                        {d}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </Animated.View>
          )}
        </Animated.View>

        {/* ── Step 4: Sound ──────────────────────── */}
        <Animated.View entering={FadeInDown.duration(500).delay(600)} style={styles.section}>
          <Text style={styles.stepLabel}>4. A SOUND TO WAKE YOUR SPIRIT</Text>

          {/* Record / Upload buttons */}
          <View style={styles.soundActions}>
            <TouchableOpacity style={styles.soundActionBtn} activeOpacity={0.7}>
              <MaterialCommunityIcons name="microphone" size={22} color={Colors.on_surface} />
              <Text style={styles.soundActionText}>Record Voice</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.soundActionBtn, styles.soundActionBtnSecondary]} activeOpacity={0.7}>
              <MaterialCommunityIcons name="upload" size={22} color={Colors.on_surface} />
              <Text style={styles.soundActionText}>Upload Clip</Text>
            </TouchableOpacity>
          </View>

          {/* Default sounds */}
          <View style={styles.soundList}>
            {DEFAULT_SOUNDS.map((sound) => {
              const isSelected = selectedSound === sound.id;
              return (
                <TouchableOpacity
                  key={sound.id}
                  style={[
                    styles.soundItem,
                    isSelected && styles.soundItemActive,
                  ]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setSelectedSound(sound.id);
                  }}
                  activeOpacity={0.7}
                >
                  <View style={[styles.soundIcon, { backgroundColor: sound.bg }]}>
                    <MaterialCommunityIcons
                      name={sound.icon as any}
                      size={22}
                      color={sound.color}
                    />
                  </View>
                  <Text style={styles.soundName}>{sound.name}</Text>
                  <MaterialCommunityIcons
                    name={isSelected ? 'radiobox-marked' : 'radiobox-blank'}
                    size={24}
                    color={isSelected ? Colors.primary : Colors.outline}
                  />
                </TouchableOpacity>
              );
            })}
          </View>
        </Animated.View>

        {/* ── CTA Button ─────────────────────────── */}
        <Animated.View entering={FadeInDown.duration(500).delay(700)} style={styles.ctaSection}>
          <TouchableOpacity
            style={styles.ctaButton}
            onPress={handleCreate}
            activeOpacity={0.85}
            disabled={isSaving}
            accessibilityRole="button"
            accessibilityLabel="Create reminder"
          >
            <LinearGradient
              colors={[Colors.primary, Colors.primary_fixed_variant]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.ctaGradient}
            >
              <Text style={styles.ctaText}>
                {isSaving ? 'Creating...' : 'Create Reminder'}
              </Text>
              <MaterialCommunityIcons
                name="check-circle"
                size={24}
                color={Colors.on_primary}
              />
            </LinearGradient>
          </TouchableOpacity>

          <Text style={styles.quoteText}>
            "Every small step is a giant leap for your heart."
          </Text>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

// ─── Styles ────────────────────────────────────────────
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.generous,
  },

  // Decorative blobs
  blob: {
    position: 'absolute',
    borderRadius: 9999,
    opacity: 0.35,
  },
  blobTop: {
    width: 300,
    height: 300,
    backgroundColor: Colors.primary_container,
    top: -80,
    left: -60,
    transform: [{ rotate: '15deg' }],
    ...({ filter: 'blur(60px)' }),
  },
  blobBottom: {
    width: 250,
    height: 250,
    backgroundColor: Colors.secondary_container,
    bottom: 100,
    right: -40,
    ...({ filter: 'blur(60px)' }),
  },

  // Header
  header: {
    overflow: 'hidden',
  },
  headerGradient: {
    paddingHorizontal: Spacing.generous,
    paddingVertical: Spacing.cozy,
    borderBottomLeftRadius: Radius.xl,
    borderBottomRightRadius: Radius.xl,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: FontFamily.bold,
    fontSize: 22,
    color: Colors.primary,
    letterSpacing: 0.2,
  },

  // Hero
  section: {
    marginTop: Spacing.breathe,
  },
  heroTitle: {
    fontFamily: FontFamily.bold,
    fontSize: 36,
    lineHeight: 44,
    color: Colors.on_surface,
    letterSpacing: -0.5,
    marginBottom: Spacing.compact,
  },
  heroSubtitle: {
    fontFamily: FontFamily.regular,
    fontSize: 18,
    lineHeight: 26,
    color: Colors.on_surface_variant,
    opacity: 0.8,
  },

  // Step labels
  stepLabel: {
    fontFamily: FontFamily.semiBold,
    fontSize: 12,
    color: Colors.primary,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: Spacing.cozy,
    marginLeft: 2,
  },

  // Type grid — explicit rows to prevent overlap
  typeRow: {
    flexDirection: 'row',
    gap: Spacing.item,
  },
  typeButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.generous,
    backgroundColor: Colors.surface_container_highest,
    borderRadius: Radius.lg,
    minHeight: 100,
    ...Elevation.low,
  },
  typeButtonActive: {
    backgroundColor: Colors.primary_container,
    ...Elevation.medium,
  },
  typeLabel: {
    fontFamily: FontFamily.bold,
    fontSize: 14,
    color: Colors.on_surface,
    marginTop: Spacing.compact,
  },

  // Input fields
  input: {
    backgroundColor: Colors.surface_container_highest,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.generous,
    paddingVertical: Spacing.cozy,
    fontFamily: FontFamily.medium,
    fontSize: 18,
    color: Colors.on_surface,
    minHeight: TapTargets.minHeight,
  },
  inputMultiline: {
    minHeight: 90,
    paddingTop: Spacing.cozy,
  },

  // Time picker
  timePickerCard: {
    backgroundColor: Colors.surface_container_low,
    borderRadius: Radius.lg,
    padding: Spacing.breathe,
    alignItems: 'center',
    ...Elevation.low,
  },
  timeDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.compact,
  },
  timeDigits: {
    fontFamily: FontFamily.extraBold,
    fontSize: 52,
    color: Colors.primary,
    letterSpacing: 1,
  },
  timeColon: {
    fontFamily: FontFamily.extraBold,
    fontSize: 48,
    color: Colors.on_surface,
    marginBottom: 4,
  },
  amPmContainer: {
    marginLeft: Spacing.cozy,
    gap: Spacing.compact,
  },
  amPmPill: {
    paddingHorizontal: Spacing.cozy,
    paddingVertical: 6,
    borderRadius: Radius.full,
  },
  amPmPillActive: {
    backgroundColor: Colors.primary,
  },
  amPmText: {
    fontFamily: FontFamily.bold,
    fontSize: 16,
    color: `${Colors.primary}66`,
  },
  amPmTextActive: {
    color: Colors.on_primary,
  },
  tapHint: {
    fontFamily: FontFamily.medium,
    fontSize: 14,
    color: Colors.on_surface_variant,
    marginTop: Spacing.cozy,
    opacity: 0.6,
  },

  // Frequency
  frequencyRow: {
    flexDirection: 'row',
    gap: Spacing.item,
    marginBottom: Spacing.cozy,
  },
  frequencyPill: {
    flex: 1,
    height: TapTargets.minHeight,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface_container_highest,
    alignItems: 'center',
    justifyContent: 'center',
  },
  frequencyPillActive: {
    backgroundColor: Colors.primary_container,
    borderWidth: 2,
    borderColor: `${Colors.primary}33`,
  },
  frequencyText: {
    fontFamily: FontFamily.bold,
    fontSize: 16,
    color: Colors.on_surface_variant,
  },
  frequencyTextActive: {
    color: Colors.primary,
  },

  // Day of week selector
  daySelector: {
    marginTop: Spacing.cozy,
  },
  daySelectorLabel: {
    fontFamily: FontFamily.medium,
    fontSize: 16,
    color: Colors.on_surface_variant,
    marginBottom: Spacing.item,
  },
  dayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
  },
  dayCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surface_container_low,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCircleActive: {
    backgroundColor: Colors.primary,
  },
  dayCircleText: {
    fontFamily: FontFamily.semiBold,
    fontSize: 15,
    color: Colors.on_surface,
  },
  dayCircleTextActive: {
    color: Colors.on_primary,
  },

  // Month day picker
  monthDayScroll: {
    paddingVertical: Spacing.compact,
    gap: Spacing.compact,
  },
  monthDayCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surface_container_low,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthDayCircleActive: {
    backgroundColor: Colors.primary,
  },
  monthDayText: {
    fontFamily: FontFamily.semiBold,
    fontSize: 14,
    color: Colors.on_surface,
  },
  monthDayTextActive: {
    color: Colors.on_primary,
  },

  // Sound
  soundActions: {
    flexDirection: 'row',
    gap: Spacing.item,
    marginBottom: Spacing.cozy,
  },
  soundActionBtn: {
    flex: 1,
    height: TapTargets.minHeight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.compact,
    backgroundColor: Colors.secondary_container,
    borderRadius: Radius.lg,
  },
  soundActionBtnSecondary: {
    backgroundColor: Colors.surface_container_highest,
  },
  soundActionText: {
    fontFamily: FontFamily.bold,
    fontSize: 14,
    color: Colors.on_surface,
  },
  soundList: {
    backgroundColor: Colors.surface_container_low,
    borderRadius: Radius.lg,
    padding: Spacing.cozy,
    gap: Spacing.compact,
  },
  soundItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.cozy,
    borderRadius: Radius.md,
    minHeight: TapTargets.minHeight,
    gap: Spacing.cozy,
  },
  soundItemActive: {
    backgroundColor: Colors.surface_container_lowest,
    borderWidth: 1,
    borderColor: `${Colors.primary}1A`,
  },
  soundIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  soundName: {
    flex: 1,
    fontFamily: FontFamily.medium,
    fontSize: 16,
    color: Colors.on_surface,
  },

  // CTA
  ctaSection: {
    marginTop: Spacing.large,
    paddingBottom: Spacing.breathe,
  },
  ctaButton: {
    borderRadius: Radius.full,
    overflow: 'hidden',
    ...Elevation.medium,
  },
  ctaGradient: {
    height: TapTargets.primaryButton,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.item,
    paddingHorizontal: Spacing.breathe,
  },
  ctaText: {
    fontFamily: FontFamily.bold,
    fontSize: 20,
    color: Colors.on_primary,
    letterSpacing: 0.3,
  },
  quoteText: {
    fontFamily: FontFamily.medium,
    fontSize: 14,
    color: Colors.on_surface_variant,
    textAlign: 'center',
    marginTop: Spacing.generous,
    fontStyle: 'italic',
    opacity: 0.6,
  },
});
