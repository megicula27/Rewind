import React, { useEffect, useState } from 'react';
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
import { Colors } from '@/src/theme/colors';
import { Elevation } from '@/src/theme/elevation';
import { Radius, Spacing } from '@/src/theme/spacing';
import { useTheme } from '@/src/theme/ThemeContext';
import { FontFamily } from '@/src/theme/typography';

type ThemeOption = {
  id: string;
  title: string;
  subtitle: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  accent: string;
  accentSoft: string;
  available: boolean;
};

const THEME_OPTIONS: ThemeOption[] = [
  {
    id: 'cherry_blossom',
    title: 'Sakura Bloom',
    subtitle: 'Active now',
    icon: 'flower-poppy',
    accent: '#D87093',
    accentSoft: '#FFE4EC',
    available: true,
  },
  {
    id: 'sky_ocean',
    title: 'Sky & Ocean',
    subtitle: 'Reward shop unlock',
    icon: 'weather-partly-cloudy',
    accent: '#6C9FCF',
    accentSoft: '#DDECF8',
    available: false,
  },
  {
    id: 'jungle_deep',
    title: 'Jungle Deep',
    subtitle: 'Reward shop unlock',
    icon: 'pine-tree',
    accent: '#7C9070',
    accentSoft: '#E3ECD8',
    available: false,
  },
  {
    id: 'golden_sun',
    title: 'Golden Sun',
    subtitle: 'Reward shop unlock',
    icon: 'white-balance-sunny',
    accent: '#D7A347',
    accentSoft: '#FBE8BC',
    available: false,
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
  } = useTheme();
  const styles = createStyles(colors);
  const [draftName, setDraftName] = useState(userName ?? '');

  useEffect(() => {
    setDraftName(userName ?? '');
  }, [userName]);

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
    if (!theme.available) {
      Alert.alert('Locked for now', `${theme.title} will plug into the reward unlock flow next.`);
      return;
    }

    Alert.alert('Theme active', `${theme.title} is already your active theme.`);
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
              <MaterialCommunityIcons name="flower-tulip-outline" size={17} color={colors.primary_fixed_variant} />
            </View>
            <Text style={styles.headerTitle}>Profile & Settings</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Notifications</Text>
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
          <Text style={styles.helperText}>
            Helpful tip: the 10 second water timer is still the fastest way to test alerts.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Change Name</Text>
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
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Theme Selection</Text>
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
                    { backgroundColor: isActive ? colors.primary_fixed : colors.surface_container_lowest },
                  ]}
                  onPress={() => handleThemePress(theme)}
                >
                  <LinearGradient
                    colors={[`${theme.accentSoft}F4`, `${theme.accent}26`]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={StyleSheet.absoluteFill}
                  />

                  <View style={styles.themeIconWrap}>
                    <MaterialCommunityIcons name={theme.icon} size={26} color={theme.accent} />
                    {!theme.available ? (
                      <View style={styles.themeLockBadge}>
                        <MaterialCommunityIcons name="lock" size={12} color={colors.surface} />
                      </View>
                    ) : null}
                  </View>

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
                      {isActive ? 'Active Theme' : 'Keep Blooming'}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Quick Tips</Text>
          <View style={styles.tipsCard}>
            <Text style={styles.tipLine}>Use the water timer for a quick notification check.</Text>
            <Text style={styles.tipLine}>Long press reminders or custom sounds to remove them.</Text>
            <Text style={styles.tipLine}>Reward themes are staged here so the unlock flow can plug in later.</Text>
          </View>
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
    sectionLabel: {
      fontFamily: FontFamily.semiBold,
      fontSize: 12,
      letterSpacing: 1.4,
      textTransform: 'uppercase',
      color: colors.primary_fixed_variant,
    },
    settingCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.cozy,
      padding: Spacing.generous,
      borderRadius: Radius.xl,
      backgroundColor: colors.surface_container_lowest,
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
    helperText: {
      fontFamily: FontFamily.medium,
      fontSize: 14,
      lineHeight: 20,
      color: colors.on_surface_variant,
    },
    editorCard: {
      padding: Spacing.generous,
      borderRadius: Radius.xl,
      backgroundColor: colors.surface_container_lowest,
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
    themeIconWrap: {
      position: 'absolute',
      top: Spacing.generous,
      left: Spacing.generous,
      width: 62,
      height: 62,
      borderRadius: 22,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(255,255,255,0.58)',
    },
    themeLockBadge: {
      position: 'absolute',
      top: -4,
      right: -4,
      width: 22,
      height: 22,
      borderRadius: 11,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primary_fixed_variant,
    },
    themeTitle: {
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
    tipsCard: {
      padding: Spacing.generous,
      borderRadius: Radius.xl,
      backgroundColor: colors.surface_container_lowest,
      gap: Spacing.item,
      ...Elevation.low,
    },
    tipLine: {
      fontFamily: FontFamily.medium,
      fontSize: 15,
      lineHeight: 22,
      color: colors.on_surface_variant,
    },
  });
