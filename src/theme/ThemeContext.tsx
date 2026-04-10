/**
 * Rewind — Theme Context
 * 
 * Provides the active theme (Cherry Blossom for v1) and user name
 * to the entire app via React Context.
 */

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { AppState, Platform } from 'react-native';
import Storage from 'expo-sqlite/kv-store';
import {
  DEFAULT_THEME_NAME,
  getThemeColors,
  isThemeName,
  ThemeColors,
  ThemeName,
} from './colors';
import {
  cancelReminderNotificationsAsync,
  cancelHydrationNotificationsAsync,
  scheduleHydrationNotificationAsync,
} from '../notifications/service';
import { DEFAULT_HYDRATION_SOUND_FILE } from '../sounds/catalog';

function readPersistedValue(key: string): string | null {
  if (Platform.OS === 'web') {
    return globalThis.localStorage?.getItem(key) ?? null;
  }

  return Storage.getItemSync(key);
}

function writePersistedValue(key: string, value: string) {
  if (Platform.OS === 'web') {
    globalThis.localStorage?.setItem(key, value);
    return;
  }

  Storage.setItemSync(key, value);
}

interface ThemeContextValue {
  colors: ThemeColors;
  themeName: ThemeName;
  setThemeName: (themeName: ThemeName) => void;
  ownedThemes: ThemeName[];
  ownsTheme: (themeName: ThemeName) => boolean;
  unlockTheme: (themeName: ThemeName) => void;
  userName: string | null;
  setUserName: (name: string) => void;
  notificationsEnabled: boolean;
  setNotificationsEnabled: (enabled: boolean) => void;
  isFirstLaunch: boolean;
  setIsFirstLaunch: (val: boolean) => void;
  hydrationTimerSeconds: number | null;
  hydrationTimeRemaining: number;
  isHydrationTimerRunning: boolean;
  hydrationSoundFile: string;
  setHydrationSoundFile: (soundFile: string) => void;
  startHydrationTimer: (seconds: number) => void;
  stopHydrationTimer: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  colors: getThemeColors(DEFAULT_THEME_NAME),
  themeName: DEFAULT_THEME_NAME,
  setThemeName: () => {},
  ownedThemes: [],
  ownsTheme: () => false,
  unlockTheme: () => {},
  userName: null,
  setUserName: () => {},
  notificationsEnabled: true,
  setNotificationsEnabled: () => {},
  isFirstLaunch: true,
  setIsFirstLaunch: () => {},
  hydrationTimerSeconds: null,
  hydrationTimeRemaining: 0,
  isHydrationTimerRunning: false,
  hydrationSoundFile: DEFAULT_HYDRATION_SOUND_FILE,
  setHydrationSoundFile: () => {},
  startHydrationTimer: () => {},
  stopHydrationTimer: () => {},
});

const STORAGE_KEY_NAME = 'rewind_user_name';
const STORAGE_KEY_LAUNCHED = 'rewind_has_launched';
const STORAGE_KEY_NOTIFICATIONS = 'rewind_notifications_enabled';
const STORAGE_KEY_THEME = 'rewind_theme_name';
const STORAGE_KEY_OWNED_THEMES = 'rewind_owned_themes';
const STORAGE_KEY_HYDRATION_SOUND = 'rewind_hydration_sound_file';
const STORAGE_KEY_HYDRATION_TIMER_SECONDS = 'rewind_hydration_timer_seconds';
const STORAGE_KEY_HYDRATION_TIMER_STARTED_AT = 'rewind_hydration_timer_started_at';
const BASE_OWNED_THEMES: ThemeName[] = [
  'cherry_blossom',
  'aquatic_serenity',
  'jungle_deep',
  'golden_sun',
];

function getHydrationTimeRemaining(seconds: number, startedAt: number, now = Date.now()) {
  const intervalMs = seconds * 1000;
  const elapsedMs = Math.max(0, now - startedAt);
  const remainderMs = elapsedMs % intervalMs;

  if (remainderMs === 0) {
    return seconds;
  }

  return Math.max(1, Math.ceil((intervalMs - remainderMs) / 1000));
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeName, setThemeNameState] = useState<ThemeName>(DEFAULT_THEME_NAME);
  const [ownedThemes, setOwnedThemes] = useState<ThemeName[]>(BASE_OWNED_THEMES);
  const [userName, setUserNameState] = useState<string | null>(null);
  const [notificationsEnabled, setNotificationsEnabledState] = useState(true);
  const [isFirstLaunch, setIsFirstLaunchState] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hydrationTimerSeconds, setHydrationTimerSeconds] = useState<number | null>(null);
  const [hydrationTimerStartedAt, setHydrationTimerStartedAt] = useState<number | null>(null);
  const [hydrationTimeRemaining, setHydrationTimeRemaining] = useState(0);
  const [isHydrationTimerRunning, setIsHydrationTimerRunning] = useState(false);
  const [hydrationSoundFile, setHydrationSoundFileState] = useState(DEFAULT_HYDRATION_SOUND_FILE);
  const colors = getThemeColors(themeName);

  useEffect(() => {
    // Load persisted values
    const storedTheme = readPersistedValue(STORAGE_KEY_THEME);
    const storedName = readPersistedValue(STORAGE_KEY_NAME);
    const hasLaunched = readPersistedValue(STORAGE_KEY_LAUNCHED);
    const storedNotificationsEnabled = readPersistedValue(STORAGE_KEY_NOTIFICATIONS);
    const storedOwnedThemes = readPersistedValue(STORAGE_KEY_OWNED_THEMES);
    const storedHydrationSound = readPersistedValue(STORAGE_KEY_HYDRATION_SOUND);
    const storedHydrationTimerSeconds = readPersistedValue(STORAGE_KEY_HYDRATION_TIMER_SECONDS);
    const storedHydrationTimerStartedAt = readPersistedValue(STORAGE_KEY_HYDRATION_TIMER_STARTED_AT);

    if (isThemeName(storedTheme)) {
      setThemeNameState(storedTheme);
    }
    if (storedOwnedThemes) {
      try {
        const parsedOwnedThemes = JSON.parse(storedOwnedThemes);
        if (Array.isArray(parsedOwnedThemes)) {
          const nextOwnedThemes = Array.from(
            new Set([
              ...BASE_OWNED_THEMES,
              ...parsedOwnedThemes.filter((item): item is ThemeName => isThemeName(item)),
            ])
          );
          setOwnedThemes(nextOwnedThemes);
        }
      } catch {
        setOwnedThemes(BASE_OWNED_THEMES);
      }
    }
    if (storedHydrationSound) {
      setHydrationSoundFileState(storedHydrationSound);
    }
    if (storedName) {
      setUserNameState(storedName);
    }
    if (hasLaunched === 'true') {
      setIsFirstLaunchState(false);
    }
    if (storedNotificationsEnabled === 'false') {
      setNotificationsEnabledState(false);
    }
    if (storedHydrationTimerSeconds && storedHydrationTimerStartedAt) {
      const parsedSeconds = Number(storedHydrationTimerSeconds);
      const parsedStartedAt = Number(storedHydrationTimerStartedAt);

      if (Number.isFinite(parsedSeconds) && parsedSeconds > 0 && Number.isFinite(parsedStartedAt) && parsedStartedAt > 0) {
        setHydrationTimerSeconds(parsedSeconds);
        setHydrationTimerStartedAt(parsedStartedAt);
        setIsHydrationTimerRunning(true);
        setHydrationTimeRemaining(getHydrationTimeRemaining(parsedSeconds, parsedStartedAt));
      }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!isHydrationTimerRunning || !hydrationTimerSeconds || !hydrationTimerStartedAt) {
      return;
    }

    const syncHydrationClock = () => {
      setHydrationTimeRemaining(getHydrationTimeRemaining(hydrationTimerSeconds, hydrationTimerStartedAt));
    };

    syncHydrationClock();

    const intervalId = setInterval(() => {
      syncHydrationClock();
    }, 1000);

    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        syncHydrationClock();
      }
    });

    return () => {
      clearInterval(intervalId);
      subscription.remove();
    };
  }, [hydrationTimerSeconds, hydrationTimerStartedAt, isHydrationTimerRunning]);

  const setUserName = (name: string) => {
    setUserNameState(name);
    writePersistedValue(STORAGE_KEY_NAME, name);
    writePersistedValue(STORAGE_KEY_LAUNCHED, 'true');
    setIsFirstLaunchState(false);
  };

  const setIsFirstLaunch = (val: boolean) => {
    setIsFirstLaunchState(val);
    if (!val) {
      writePersistedValue(STORAGE_KEY_LAUNCHED, 'true');
    }
  };

  const setThemeName = useCallback((nextThemeName: ThemeName) => {
    setThemeNameState(nextThemeName);
    writePersistedValue(STORAGE_KEY_THEME, nextThemeName);
  }, []);

  const ownsTheme = useCallback((candidateThemeName: ThemeName) => {
    return ownedThemes.includes(candidateThemeName);
  }, [ownedThemes]);

  const unlockTheme = useCallback((nextThemeName: ThemeName) => {
    setOwnedThemes((previous) => {
      if (previous.includes(nextThemeName)) {
        return previous;
      }

      const updated = [...previous, nextThemeName];
      writePersistedValue(STORAGE_KEY_OWNED_THEMES, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const setHydrationSoundFile = useCallback((soundFile: string) => {
    setHydrationSoundFileState(soundFile);
    writePersistedValue(STORAGE_KEY_HYDRATION_SOUND, soundFile);
  }, []);

  const setNotificationsEnabled = useCallback((enabled: boolean) => {
    setNotificationsEnabledState(enabled);
    writePersistedValue(STORAGE_KEY_NOTIFICATIONS, enabled ? 'true' : 'false');

    if (!enabled) {
      void Promise.all([
        cancelReminderNotificationsAsync(),
        cancelHydrationNotificationsAsync(),
      ]);
    }
  }, []);

  const startHydrationTimer = useCallback((seconds: number) => {
    const startedAt = Date.now();
    setHydrationTimerSeconds(seconds);
    setHydrationTimerStartedAt(startedAt);
    setHydrationTimeRemaining(seconds);
    setIsHydrationTimerRunning(true);
    writePersistedValue(STORAGE_KEY_HYDRATION_TIMER_SECONDS, String(seconds));
    writePersistedValue(STORAGE_KEY_HYDRATION_TIMER_STARTED_AT, String(startedAt));
    if (notificationsEnabled) {
      void scheduleHydrationNotificationAsync(seconds, {
        userName,
        themeName,
      }, true, hydrationSoundFile);
    }
  }, [hydrationSoundFile, notificationsEnabled, themeName, userName]);

  useEffect(() => {
    if (!isHydrationTimerRunning || !hydrationTimerSeconds || !notificationsEnabled) {
      return;
    }

    void scheduleHydrationNotificationAsync(hydrationTimerSeconds, {
      userName,
      themeName,
    }, true, hydrationSoundFile);
  }, [hydrationSoundFile, hydrationTimerSeconds, isHydrationTimerRunning, notificationsEnabled, themeName, userName]);

  const stopHydrationTimer = useCallback(() => {
    setIsHydrationTimerRunning(false);
    setHydrationTimerSeconds(null);
    setHydrationTimerStartedAt(null);
    setHydrationTimeRemaining(0);
    writePersistedValue(STORAGE_KEY_HYDRATION_TIMER_SECONDS, '');
    writePersistedValue(STORAGE_KEY_HYDRATION_TIMER_STARTED_AT, '');
    void cancelHydrationNotificationsAsync();
  }, []);

  if (!isLoaded) return null;

  return (
    <ThemeContext.Provider
      value={{
        colors,
        themeName,
        setThemeName,
        ownedThemes,
        ownsTheme,
        unlockTheme,
        userName,
        setUserName,
        notificationsEnabled,
        setNotificationsEnabled,
        isFirstLaunch,
        setIsFirstLaunch,
        hydrationTimerSeconds,
        hydrationTimeRemaining,
        isHydrationTimerRunning,
        hydrationSoundFile,
        setHydrationSoundFile,
        startHydrationTimer,
        stopHydrationTimer,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return ctx;
}
