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

import React, { useEffect, useState } from 'react';
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
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';

import { Colors } from '@/src/theme/colors';
import { FontFamily } from '@/src/theme/typography';
import { Spacing, Radius, TapTargets } from '@/src/theme/spacing';
import { Elevation } from '@/src/theme/elevation';
import { useReminders } from '@/src/hooks/useReminders';
import { useSounds } from '@/src/hooks/useSounds';
import SoundStudioSheet from '@/src/components/SoundStudioSheet';
import QuoteFooter from '@/src/components/QuoteFooter';
import type { ReminderType, ReminderFrequency, Sound } from '@/src/db/types';
import { formatDateKey, formatReminderDate } from '@/src/db/types';
import {
  getSoundVisual,
  MAX_CUSTOM_SOUND_BYTES,
  resolveSoundPlaybackSource,
} from '@/src/sounds/catalog';
import { copyClipToSoundLibraryAsync } from '@/src/sounds/storage';

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
  { key: 'once',    label: 'Once' },
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

function formatDurationLabel(durationMs: number | null) {
  if (!durationMs || durationMs <= 0) {
    return null;
  }

  const totalSeconds = Math.max(1, Math.round(durationMs / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function createCurrentReminderTime() {
  const now = new Date();
  return new Date(2024, 0, 1, now.getHours(), now.getMinutes(), 0, 0);
}

export default function AddScreen() {
  const insets = useSafeAreaInsets();
  const { addReminder } = useReminders();
  const { sounds, loading: soundsLoading, createCustomSound, removeCustomSound } = useSounds();
  const previewPlayer = useAudioPlayer(null);
  const previewStatus = useAudioPlayerStatus(previewPlayer);

  // ── Form state ─────────────────────────────
  const [selectedType, setSelectedType] = useState<ReminderType>('food');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [time, setTime] = useState(() => createCurrentReminderTime());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [frequency, setFrequency] = useState<ReminderFrequency>('daily');
  const [dayOfWeek, setDayOfWeek] = useState(1); // Monday
  const [dayOfMonth, setDayOfMonth] = useState(1);
  const [onceDate, setOnceDate] = useState(new Date());
  const [showOnceDatePicker, setShowOnceDatePicker] = useState(false);
  const [selectedSound, setSelectedSound] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingSound, setIsUploadingSound] = useState(false);
  const [previewingSoundId, setPreviewingSoundId] = useState<number | null>(null);
  const [isStudioOpen, setIsStudioOpen] = useState(false);

  const isCustom = selectedType === 'custom';
  const typeConfig = TYPES.find(t => t.key === selectedType)!;
  const selectedSoundRecord = sounds.find((sound) => sound.id === selectedSound) ?? sounds[0] ?? null;

  useEffect(() => {
    if (!selectedSound && sounds.length > 0) {
      setSelectedSound(sounds[0].id);
    }
  }, [selectedSound, sounds]);

  useEffect(() => {
    if (!previewStatus.playing && previewingSoundId !== null) {
      setPreviewingSoundId(null);
    }
  }, [previewStatus.playing, previewingSoundId]);

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

  const handleOnceDateChange = (_: any, selectedDate?: Date) => {
    setShowOnceDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setOnceDate(selectedDate);
    }
  };

  const handlePreviewSound = async (sound: Sound) => {
    try {
      if (previewingSoundId === sound.id && previewStatus.playing) {
        previewPlayer.pause();
        setPreviewingSoundId(null);
        return;
      }

      previewPlayer.replace(resolveSoundPlaybackSource(sound));
      await previewPlayer.seekTo(0);
      previewPlayer.play();
      setPreviewingSoundId(sound.id);
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.error('Failed to preview sound:', error);
      Alert.alert('Preview unavailable', 'That clip could not be previewed right now.');
    }
  };

  const saveCustomClip = async (input: {
    name: string;
    uri: string;
    durationMs: number | null;
    type: 'recorded' | 'file';
  }) => {
    const copiedUri = await copyClipToSoundLibraryAsync(input.uri, input.name);
    const created = await createCustomSound({
      name: input.name,
      type: input.type,
      fileUri: copiedUri,
      durationMs: input.durationMs ?? null,
    });

    setSelectedSound(created.id);
    await handlePreviewSound(created);
  };

  const handleRecordedSoundSaved = async (recording: {
    name: string;
    uri: string;
    durationMs: number;
    fileSize: number;
  }) => {
    await saveCustomClip({
      name: recording.name,
      uri: recording.uri,
      durationMs: recording.durationMs,
      type: 'recorded',
    });
  };

  const handleUploadSound = async () => {
    try {
      setIsUploadingSound(true);

      const result = await DocumentPicker.getDocumentAsync({
        type: ['audio/*'],
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (result.canceled || !result.assets?.[0]) {
        return;
      }

      const asset = result.assets[0];
      const fileSize = asset.size ?? 0;
      if (fileSize > MAX_CUSTOM_SOUND_BYTES) {
        Alert.alert(
          'Clip is too large',
          'Please choose an audio clip under 1 MB so reminders stay lightweight.'
        );
        return;
      }

      const info = await FileSystem.getInfoAsync(asset.uri);
      if (!info.exists) {
        throw new Error('Picked clip was unavailable.');
      }

      await saveCustomClip({
        name: asset.name.replace(/\.[^.]+$/, '') || 'Uploaded Clip',
        uri: asset.uri,
        durationMs: null,
        type: 'file',
      });
    } catch (error) {
      console.error('Failed to upload sound:', error);
      Alert.alert('Upload did not work', 'Please try another clip or try again.');
    } finally {
      setIsUploadingSound(false);
    }
  };

  const handleRemoveSound = (sound: Sound) => {
    if (sound.type === 'default') {
      return;
    }

    Alert.alert(
      'Remove sound?',
      `Remove "${sound.name}" from your sound garden?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              if (previewingSoundId === sound.id && previewStatus.playing) {
                previewPlayer.pause();
                setPreviewingSoundId(null);
              }

              await removeCustomSound(sound.id);
              if (selectedSound === sound.id) {
                const fallback = sounds.find((item) => item.id !== sound.id && item.type === 'default') ?? sounds.find((item) => item.id !== sound.id) ?? null;
                setSelectedSound(fallback?.id ?? null);
              }
            } catch (error) {
              console.error('Failed to remove sound:', error);
              Alert.alert('Could not remove sound', 'Please try again in a moment.');
            }
          },
        },
      ]
    );
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
        once_date: frequency === 'once' ? formatDateKey(onceDate) : undefined,
        sound_id: selectedSoundRecord?.id ?? undefined,
      });

      // Reset form
      setName('');
      setDescription('');
      setSelectedType('food');
      setFrequency('daily');
      setTime(createCurrentReminderTime());
      setOnceDate(new Date());
      setSelectedSound(sounds[0]?.id ?? null);
      
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
          colors={[`${Colors.primary_fixed}F5`, `${Colors.primary_fixed}D8`]}
          style={styles.headerGradient}
        >
          <View style={styles.headerRow}>
            <View style={styles.headerEmojiBadge}>
              <Text style={styles.headerEmoji}>🌸</Text>
            </View>
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

          {frequency === 'once' && (
            <Animated.View entering={FadeInDown.duration(300)} style={styles.daySelector}>
              <Text style={styles.daySelectorLabel}>Which day?</Text>
              <TouchableOpacity
                style={styles.onceDateCard}
                onPress={() => setShowOnceDatePicker(true)}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel={`Selected date: ${formatReminderDate(formatDateKey(onceDate))}`}
              >
                <View>
                  <Text style={styles.onceDateValue}>{formatReminderDate(formatDateKey(onceDate))}</Text>
                  <Text style={styles.onceDateHint}>Tap to choose a one-time reminder date</Text>
                </View>
                <MaterialCommunityIcons name="calendar-month-outline" size={24} color={Colors.primary} />
              </TouchableOpacity>

              {showOnceDatePicker && (
                <DateTimePicker
                  value={onceDate}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={handleOnceDateChange}
                  themeVariant="light"
                  minimumDate={new Date()}
                />
              )}
            </Animated.View>
          )}
        </Animated.View>

        {/* ── Step 4: Sound ──────────────────────── */}
        <Animated.View entering={FadeInDown.duration(500).delay(600)} style={styles.section}>
          <Text style={styles.stepLabel}>4. A SOUND TO WAKE YOUR SPIRIT</Text>

          {/* Record / Upload buttons */}
          <View style={styles.soundActions}>
            <TouchableOpacity
              style={styles.soundActionBtn}
              activeOpacity={0.7}
              onPress={() => setIsStudioOpen(true)}
            >
              <MaterialCommunityIcons name="microphone" size={22} color={Colors.on_surface} />
              <Text style={styles.soundActionText}>Record Voice</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.soundActionBtn, styles.soundActionBtnSecondary]}
              activeOpacity={0.7}
              onPress={handleUploadSound}
              disabled={isUploadingSound}
            >
              <MaterialCommunityIcons name="upload" size={22} color={Colors.on_surface} />
              <Text style={styles.soundActionText}>
                {isUploadingSound ? 'Uploading...' : 'Upload Clip'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.soundHeroCard}>
            <LinearGradient
              colors={['#FFE2EB', '#FFF7F9']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.soundHeroGradient}
            >
              <View style={styles.soundHeroCopy}>
                <Text style={styles.soundHeroTitle}>Sakura listens softly.</Text>
                <Text style={styles.soundHeroSubtitle}>
                  Bundled sounds ring inside notifications now. Recorded and uploaded clips are
                  saved, previewable, and ready in your sound garden.
                </Text>
              </View>
              <View style={styles.soundHeroBadge}>
                <Text style={styles.soundHeroBadgeText}>1 MB max</Text>
              </View>
            </LinearGradient>
          </View>

          <View style={styles.soundList}>
            {soundsLoading ? (
              <Text style={styles.soundLoadingText}>Preparing your sound garden...</Text>
            ) : (
              sounds.map((sound) => {
                const isSelected = selectedSound === sound.id;
                const isPreviewing = previewingSoundId === sound.id && previewStatus.playing;
                const visual = getSoundVisual(sound);
                const durationLabel = formatDurationLabel(sound.duration_ms);

                return (
                  <TouchableOpacity
                    key={sound.id}
                    style={[styles.soundItem, isSelected && styles.soundItemActive]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setSelectedSound(sound.id);
                    }}
                    onLongPress={() => handleRemoveSound(sound)}
                    delayLongPress={320}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.soundIconBubble, { backgroundColor: visual.backgroundColor }]}>
                      <Text style={styles.soundEmoji}>{visual.emoji}</Text>
                    </View>

                    <View style={styles.soundMeta}>
                      <Text style={styles.soundName}>{sound.name}</Text>
                      <Text style={styles.soundCaption}>
                        {durationLabel ?? visual.caption ?? (sound.type === 'default' ? 'Bundled tone' : 'Custom clip')}
                      </Text>
                    </View>

                    <TouchableOpacity
                      style={[styles.previewButton, isPreviewing && styles.previewButtonActive]}
                      onPress={() => {
                        void handlePreviewSound(sound);
                      }}
                      activeOpacity={0.7}
                    >
                      <MaterialCommunityIcons
                        name={isPreviewing ? 'pause' : 'play'}
                        size={18}
                        color={isPreviewing ? Colors.on_primary : Colors.primary}
                      />
                    </TouchableOpacity>

                    <MaterialCommunityIcons
                      name={isSelected ? 'radiobox-marked' : 'radiobox-blank'}
                      size={24}
                      color={isSelected ? Colors.primary : Colors.outline}
                    />
                  </TouchableOpacity>
                );
              })
            )}
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

          <QuoteFooter scope="add-tab-footer" />
        </Animated.View>
      </ScrollView>

      <SoundStudioSheet
        visible={isStudioOpen}
        onClose={() => setIsStudioOpen(false)}
        onSave={handleRecordedSoundSaved}
      />
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
    backgroundColor: Colors.primary_fixed,
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
    gap: Spacing.compact,
  },
  headerEmojiBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary_container,
    ...Elevation.low,
  },
  headerEmoji: {
    fontSize: 17,
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
    backgroundColor: Colors.primary_fixed,
    borderRadius: Radius.lg,
    minHeight: 100,
    ...Elevation.low,
  },
  typeButtonActive: {
    backgroundColor: Colors.primary_container,
    ...Elevation.low,
  },
  typeLabel: {
    fontFamily: FontFamily.bold,
    fontSize: 14,
    color: Colors.on_surface,
    marginTop: Spacing.compact,
  },

  // Input fields
  input: {
    backgroundColor: Colors.primary_fixed,
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
    backgroundColor: Colors.tertiary,
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
    backgroundColor: Colors.primary_fixed,
    alignItems: 'center',
    justifyContent: 'center',
    ...Elevation.low,
  },
  frequencyPillActive: {
    backgroundColor: Colors.primary_container,
    borderWidth: 1,
    borderColor: `${Colors.primary}22`,
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
    backgroundColor: Colors.primary_fixed,
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
    backgroundColor: Colors.primary_fixed,
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
  onceDateCard: {
    backgroundColor: Colors.tertiary,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.generous,
    paddingVertical: Spacing.cozy,
    minHeight: TapTargets.minHeight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...Elevation.low,
  },
  onceDateValue: {
    fontFamily: FontFamily.bold,
    fontSize: 18,
    color: Colors.on_surface,
    marginBottom: 4,
  },
  onceDateHint: {
    fontFamily: FontFamily.medium,
    fontSize: 14,
    color: Colors.on_surface_variant,
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
    backgroundColor: Colors.primary_fixed,
    borderRadius: Radius.lg,
    ...Elevation.low,
  },
  soundActionBtnSecondary: {
    backgroundColor: Colors.tertiary,
  },
  soundActionText: {
    fontFamily: FontFamily.bold,
    fontSize: 14,
    color: Colors.on_surface,
  },
  soundHeroCard: {
    borderRadius: Radius.xl,
    overflow: 'hidden',
    marginBottom: Spacing.cozy,
    ...Elevation.low,
  },
  soundHeroGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.item,
    padding: Spacing.generous,
  },
  soundHeroCopy: {
    flex: 1,
  },
  soundHeroTitle: {
    fontFamily: FontFamily.bold,
    fontSize: 19,
    color: Colors.on_surface,
    marginBottom: 6,
  },
  soundHeroSubtitle: {
    fontFamily: FontFamily.medium,
    fontSize: 14,
    lineHeight: 21,
    color: Colors.on_surface_variant,
  },
  soundHeroBadge: {
    minWidth: 74,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface_container_lowest,
  },
  soundHeroBadgeText: {
    fontFamily: FontFamily.bold,
    fontSize: 13,
    color: Colors.primary,
  },
  soundList: {
    backgroundColor: Colors.tertiary,
    borderRadius: Radius.lg,
    padding: Spacing.cozy,
    gap: Spacing.compact,
  },
  soundLoadingText: {
    fontFamily: FontFamily.medium,
    fontSize: 15,
    color: Colors.on_surface_variant,
    paddingVertical: Spacing.cozy,
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
    backgroundColor: Colors.primary_fixed,
    borderWidth: 1,
    borderColor: `${Colors.primary}1A`,
    ...Elevation.low,
  },
  soundIconBubble: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
  soundEmoji: {
    fontSize: 22,
  },
  soundMeta: {
    flex: 1,
  },
  soundName: {
    fontFamily: FontFamily.bold,
    fontSize: 16,
    color: Colors.on_surface,
  },
  soundCaption: {
    fontFamily: FontFamily.medium,
    fontSize: 13,
    color: Colors.on_surface_variant,
    marginTop: 3,
  },
  previewButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary_container,
  },
  previewButtonActive: {
    backgroundColor: Colors.primary,
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
});
