import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import QuoteFooter from '@/src/components/QuoteFooter';
import { useSounds } from '@/src/hooks/useSounds';
import {
  DEFAULT_HYDRATION_SOUND_FILE,
  getBundledSoundDefinitionByUri,
  getSoundVisual,
} from '@/src/sounds/catalog';
import { Colors, type ThemeName } from '@/src/theme/colors';
import { Elevation } from '@/src/theme/elevation';
import { Radius, Spacing } from '@/src/theme/spacing';
import { useTheme } from '@/src/theme/ThemeContext';
import { getThemeVisuals } from '@/src/theme/visuals';
import { FontFamily } from '@/src/theme/typography';

type ThemeOption = {
  id: ThemeName;
  title: string;
  subtitle: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  accent: string;
  accentSoft: string;
};

type SectionKey = 'notifications' | 'water' | 'name' | 'themes';

const THEME_OPTIONS: ThemeOption[] = [
  {
    id: 'cherry_blossom',
    title: 'Sakura Bloom',
    subtitle: 'Classic warmth',
    icon: 'flower-poppy',
    accent: '#D87093',
    accentSoft: '#FFE4EC',
  },
  {
    id: 'aquatic_serenity',
    title: 'Aquatic Serenity',
    subtitle: 'Calm tidal glow',
    icon: 'waves',
    accent: '#475D82',
    accentSoft: '#DCEAF9',
  },
  {
    id: 'jungle_deep',
    title: 'Jungle Deep',
    subtitle: 'Earthy canopy calm',
    icon: 'pine-tree',
    accent: '#556B2F',
    accentSoft: '#E7EED0',
  },
  {
    id: 'golden_sun',
    title: 'Golden Sunburst',
    subtitle: 'Warm sunlit glow',
    icon: 'white-balance-sunny',
    accent: '#904800',
    accentSoft: '#FFE2A6',
  },
];

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const {
    colors,
    userName,
    setUserName,
    notificationsEnabled,
    setNotificationsEnabled,
    themeName,
    setThemeName,
    hydrationSoundFile,
    setHydrationSoundFile,
  } = useTheme();
  const { sounds, loading: soundsLoading } = useSounds();
  const styles = createStyles(colors);
  const visuals = getThemeVisuals(themeName);
  const [draftName, setDraftName] = useState(userName ?? '');
  const [expandedSections, setExpandedSections] = useState<Record<SectionKey, boolean>>({
    notifications: false,
    water: false,
    name: false,
    themes: false,
  });

  useEffect(() => {
    setDraftName(userName ?? '');
  }, [userName]);

  const bundledHydrationSounds = useMemo(
    () => sounds.filter((sound) => Boolean(getBundledSoundDefinitionByUri(sound.file_uri))),
    [sounds]
  );

  const activeThemeTitle =
    THEME_OPTIONS.find((theme) => theme.id === themeName)?.title ?? 'Theme selected';

  const activeHydrationSound =
    bundledHydrationSounds.find(
      (sound) => getBundledSoundDefinitionByUri(sound.file_uri)?.fileName === hydrationSoundFile
    ) ??
    bundledHydrationSounds.find(
      (sound) =>
        getBundledSoundDefinitionByUri(sound.file_uri)?.fileName === DEFAULT_HYDRATION_SOUND_FILE
    ) ??
    bundledHydrationSounds[0] ??
    null;

  const toggleSection = (section: SectionKey) => {
    setExpandedSections((current) => ({
      ...current,
      [section]: !current[section],
    }));
  };

  const saveName = () => {
    const trimmed = draftName.trim();
    if (!trimmed) {
      Alert.alert('Name needed', 'Please enter a name before saving.');
      return;
    }

    setUserName(trimmed);
    Alert.alert('Saved', 'Your profile name has been updated.');
  };

  const handleThemePress = (theme: ThemeOption) => {
    if (theme.id === themeName) {
      Alert.alert('Theme active', `${theme.title} is already your active theme.`);
      return;
    }

    setThemeName(theme.id);
    Alert.alert('Theme changed', `${theme.title} is now active across the app.`);
  };

  const handleHydrationSoundPress = (fileName: string, soundName: string) => {
    if (fileName === hydrationSoundFile) {
      return;
    }

    setHydrationSoundFile(fileName);
    Alert.alert('Water sound changed', `${soundName} will now be used for hydration reminders.`);
  };

  const headerPaddingTop = insets.top + Spacing.compact;

  return (
    <View style={styles.screen}>
      <LinearGradient
        colors={[colors.surface, colors.tertiary, colors.surface_container_low]}
        locations={[0, 0.4, 1]}
        style={StyleSheet.absoluteFill}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 120 + insets.bottom }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.headerCard, { paddingTop: headerPaddingTop }]}>
          <View style={styles.headerGlow} />
          <View style={styles.headerTitleRow}>
            <View style={styles.headerBadge}>
              <MaterialCommunityIcons
                name={visuals.profile.headerIcon}
                size={17}
                color={colors.primary_fixed_variant}
              />
            </View>
            <Text style={styles.headerTitle}>Profile & Settings</Text>
          </View>
        </View>

        <View style={styles.section}>
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={() => toggleSection('notifications')}
            style={styles.sectionHeaderCard}
          >
            <View style={styles.sectionHeaderCopy}>
              <Text style={styles.sectionLabel}>Notifications</Text>
              <Text style={styles.sectionSummary}>
                {notificationsEnabled ? 'Scheduled reminders are on' : 'Scheduled reminders are off'}
              </Text>
            </View>
            <View style={styles.sectionChevron}>
              <MaterialCommunityIcons
                name={expandedSections.notifications ? 'chevron-up' : 'chevron-down'}
                size={22}
                color={colors.primary_fixed_variant}
              />
            </View>
          </TouchableOpacity>
          {expandedSections.notifications ? (
            <View style={styles.settingCard}>
              <View style={styles.settingCopy}>
                <Text style={styles.settingTitle}>Reminder notifications</Text>
                <Text style={styles.settingSubtitle}>
                  Turn scheduled reminder alerts on or off across the app.
                </Text>
              </View>

              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: colors.outline_variant, true: colors.primary_container }}
                thumbColor={notificationsEnabled ? colors.primary : colors.surface_container_lowest}
              />
            </View>
          ) : null}
        </View>

        <View style={styles.section}>
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={() => toggleSection('water')}
            style={styles.sectionHeaderCard}
          >
            <View style={styles.sectionHeaderCopy}>
              <Text style={styles.sectionLabel}>Water Settings</Text>
              <Text style={styles.sectionSummary}>
                {activeHydrationSound?.name ?? 'Choose a hydration sound'}
              </Text>
            </View>
            <View style={styles.sectionChevron}>
              <MaterialCommunityIcons
                name={expandedSections.water ? 'chevron-up' : 'chevron-down'}
                size={22}
                color={colors.primary_fixed_variant}
              />
            </View>
          </TouchableOpacity>
          {expandedSections.water ? (
            <View style={styles.editorCard}>
              <Text style={styles.inputLabel}>Hydration timer sound</Text>
              <Text style={styles.settingSubtitle}>
                Pick the bundled tone that should play for your repeating water reminder.
              </Text>

              {soundsLoading ? (
                <Text style={styles.soundLoadingText}>Loading your sound library...</Text>
              ) : (
                bundledHydrationSounds.map((sound) => {
                  const definition = getBundledSoundDefinitionByUri(sound.file_uri);
                  const visual = getSoundVisual(sound);
                  const fileName = definition?.fileName ?? DEFAULT_HYDRATION_SOUND_FILE;
                  const isSelected = fileName === hydrationSoundFile;

                  return (
                    <TouchableOpacity
                      key={sound.id}
                      activeOpacity={0.85}
                      onPress={() => handleHydrationSoundPress(fileName, sound.name)}
                      style={[styles.soundRow, isSelected && styles.soundRowActive]}
                    >
                      <View style={[styles.soundBubble, { backgroundColor: visual.backgroundColor }]}>
                        <Text style={styles.soundEmoji}>{visual.emoji}</Text>
                      </View>

                      <View style={styles.soundMeta}>
                        <Text style={styles.soundName}>{sound.name}</Text>
                        <Text style={styles.soundCaption}>Bundled notification tone</Text>
                      </View>

                      <MaterialCommunityIcons
                        name={isSelected ? 'radiobox-marked' : 'radiobox-blank'}
                        size={24}
                        color={isSelected ? colors.primary : colors.outline}
                      />
                    </TouchableOpacity>
                  );
                })
              )}
            </View>
          ) : null}
        </View>

        <View style={styles.section}>
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={() => toggleSection('name')}
            style={styles.sectionHeaderCard}
          >
            <View style={styles.sectionHeaderCopy}>
              <Text style={styles.sectionLabel}>Change Name</Text>
              <Text style={styles.sectionSummary}>{userName?.trim() || 'Set your display name'}</Text>
            </View>
            <View style={styles.sectionChevron}>
              <MaterialCommunityIcons
                name={expandedSections.name ? 'chevron-up' : 'chevron-down'}
                size={22}
                color={colors.primary_fixed_variant}
              />
            </View>
          </TouchableOpacity>
          {expandedSections.name ? (
            <View style={styles.editorCard}>
              <Text style={styles.inputLabel}>What should Rewind call you?</Text>
              <TextInput
                value={draftName}
                onChangeText={setDraftName}
                placeholder="Your name"
                placeholderTextColor={colors.outline}
                style={styles.nameInput}
                maxLength={40}
              />
              <TouchableOpacity style={styles.saveButton} activeOpacity={0.85} onPress={saveName}>
                <Text style={styles.saveButtonText}>Save Name</Text>
              </TouchableOpacity>
            </View>
          ) : null}
        </View>

        <View style={styles.section}>
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={() => toggleSection('themes')}
            style={styles.sectionHeaderCard}
          >
            <View style={styles.sectionHeaderCopy}>
              <Text style={styles.sectionLabel}>Theme Selection</Text>
              <Text style={styles.sectionSummary}>{activeThemeTitle}</Text>
            </View>
            <View style={styles.sectionChevron}>
              <MaterialCommunityIcons
                name={expandedSections.themes ? 'chevron-up' : 'chevron-down'}
                size={22}
                color={colors.primary_fixed_variant}
              />
            </View>
          </TouchableOpacity>
          {expandedSections.themes ? (
            <View style={styles.themeGrid}>
              {THEME_OPTIONS.map((theme) => {
                const isActive = theme.id === themeName;

                return (
                  <TouchableOpacity
                    key={theme.id}
                    activeOpacity={0.88}
                    style={[
                      styles.themeCard,
                      isActive && styles.themeCardActive,
                      {
                        backgroundColor: isActive
                          ? colors.primary_fixed
                          : colors.surface_container_lowest,
                      },
                    ]}
                    onPress={() => handleThemePress(theme)}
                  >
                    <LinearGradient
                      colors={[`${theme.accentSoft}F4`, `${theme.accent}26`]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={StyleSheet.absoluteFill}
                    />
                    <MaterialCommunityIcons
                      name={theme.icon}
                      size={102}
                      color={`${theme.accent}2C`}
                      style={styles.themeArt}
                    />

                    <Text style={styles.themeTitle}>{theme.title}</Text>
                    <Text style={styles.themeSubtitle}>{theme.subtitle}</Text>

                    <View
                      style={[
                        styles.themeButton,
                        isActive ? styles.themeButtonActive : styles.themeButtonLocked,
                      ]}
                    >
                      <Text
                        style={[
                          styles.themeButtonText,
                          !isActive && styles.themeButtonTextLocked,
                        ]}
                        numberOfLines={1}
                      >
                        {isActive ? 'Active Theme' : 'Try Theme'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : null}
        </View>

        <QuoteFooter scope="profile-tab-footer" shift={5} />
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
    headerCard: {
      marginHorizontal: -Spacing.generous,
      paddingHorizontal: Spacing.generous,
      paddingBottom: Spacing.generous,
      backgroundColor: colors.primary_fixed,
      borderBottomLeftRadius: Radius.xxl + 12,
      borderBottomRightRadius: Radius.xxl + 12,
      overflow: 'hidden',
      position: 'relative',
    },
    headerGlow: {
      position: 'absolute',
      top: -16,
      right: -12,
      width: 140,
      height: 140,
      borderRadius: 70,
      backgroundColor: colors.primary_container,
      opacity: 0.22,
    },
    headerBadge: {
      width: 34,
      height: 34,
      borderRadius: 17,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primary_container,
      ...Elevation.low,
    },
    headerTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.item,
      paddingTop: 2,
    },
    headerTitle: {
      fontFamily: FontFamily.extraBold,
      fontSize: 30,
      lineHeight: 36,
      color: colors.primary_fixed_variant,
    },
    section: {
      gap: Spacing.cozy,
    },
    sectionHeaderCard: {
      minHeight: 72,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: Spacing.item,
      paddingHorizontal: Spacing.generous,
      paddingVertical: Spacing.cozy,
      borderRadius: Radius.xl,
      backgroundColor: colors.surface_container_lowest,
      ...Elevation.low,
    },
    sectionHeaderCopy: {
      flex: 1,
      gap: 4,
    },
    sectionLabel: {
      fontFamily: FontFamily.semiBold,
      fontSize: 12,
      letterSpacing: 1.4,
      textTransform: 'uppercase',
      color: colors.primary_fixed_variant,
    },
    sectionSummary: {
      fontFamily: FontFamily.bold,
      fontSize: 18,
      lineHeight: 24,
      color: colors.on_surface,
    },
    sectionChevron: {
      width: 34,
      height: 34,
      borderRadius: 17,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primary_fixed,
    },
    settingCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.cozy,
      padding: Spacing.generous,
      borderRadius: Radius.xl,
      backgroundColor: colors.surface_container_low,
      ...Elevation.low,
    },
    settingCopy: {
      flex: 1,
      gap: Spacing.hair,
    },
    settingTitle: {
      fontFamily: FontFamily.bold,
      fontSize: 19,
      color: colors.on_surface,
    },
    settingSubtitle: {
      fontFamily: FontFamily.regular,
      fontSize: 14,
      lineHeight: 20,
      color: colors.on_surface_variant,
    },
    editorCard: {
      padding: Spacing.generous,
      borderRadius: Radius.xl,
      backgroundColor: colors.surface_container_low,
      gap: Spacing.cozy,
      ...Elevation.low,
    },
    inputLabel: {
      fontFamily: FontFamily.medium,
      fontSize: 15,
      color: colors.on_surface_variant,
    },
    nameInput: {
      minHeight: 56,
      borderRadius: Radius.lg,
      backgroundColor: colors.primary_fixed,
      paddingHorizontal: Spacing.generous,
      fontFamily: FontFamily.medium,
      fontSize: 18,
      color: colors.on_surface,
    },
    saveButton: {
      minHeight: 52,
      borderRadius: Radius.full,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: Spacing.generous,
    },
    saveButtonText: {
      fontFamily: FontFamily.bold,
      fontSize: 16,
      color: colors.on_primary,
    },
    soundLoadingText: {
      fontFamily: FontFamily.medium,
      fontSize: 15,
      color: colors.on_surface_variant,
      paddingVertical: Spacing.compact,
    },
    soundRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.cozy,
      minHeight: 58,
      paddingHorizontal: Spacing.cozy,
      paddingVertical: Spacing.compact,
      borderRadius: Radius.lg,
      backgroundColor: colors.surface_container_lowest,
    },
    soundRowActive: {
      backgroundColor: colors.primary_fixed,
    },
    soundBubble: {
      width: 42,
      height: 42,
      borderRadius: 21,
      alignItems: 'center',
      justifyContent: 'center',
    },
    soundEmoji: {
      fontSize: 20,
    },
    soundMeta: {
      flex: 1,
    },
    soundName: {
      fontFamily: FontFamily.bold,
      fontSize: 16,
      color: colors.on_surface,
    },
    soundCaption: {
      marginTop: 2,
      fontFamily: FontFamily.medium,
      fontSize: 13,
      color: colors.on_surface_variant,
    },
    themeGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: Spacing.item,
    },
    themeCard: {
      width: '47%',
      minHeight: 208,
      borderRadius: Radius.xl,
      padding: Spacing.generous,
      overflow: 'hidden',
      justifyContent: 'flex-end',
      ...Elevation.low,
    },
    themeCardActive: {
      borderWidth: 1,
      borderColor: `${colors.primary}24`,
    },
    themeArt: {
      position: 'absolute',
      top: 8,
      right: -8,
    },
    themeTitle: {
      maxWidth: '78%',
      fontFamily: FontFamily.bold,
      fontSize: 22,
      lineHeight: 27,
      color: colors.on_surface,
      marginBottom: Spacing.hair,
    },
    themeSubtitle: {
      fontFamily: FontFamily.medium,
      fontSize: 14,
      color: colors.primary_fixed_variant,
      marginBottom: Spacing.cozy,
    },
    themeButton: {
      minHeight: 46,
      borderRadius: Radius.full,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: Spacing.compact,
    },
    themeButtonActive: {
      backgroundColor: colors.primary,
    },
    themeButtonLocked: {
      backgroundColor: colors.surface_container_lowest,
      borderWidth: 1,
      borderColor: `${colors.primary}1E`,
    },
    themeButtonText: {
      fontFamily: FontFamily.bold,
      fontSize: 13,
      lineHeight: 16,
      textAlign: 'center',
      color: colors.on_primary,
    },
    themeButtonTextLocked: {
      color: colors.primary_fixed_variant,
    },
  });
