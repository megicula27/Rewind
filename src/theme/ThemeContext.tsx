/**
 * Rewind — Theme Context
 * 
 * Provides the active theme (Cherry Blossom for v1) and user name
 * to the entire app via React Context.
 */

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Platform } from 'react-native';
import Storage from 'expo-sqlite/kv-store';
import { Colors, ThemeColors } from './colors';
import {
  cancelReminderNotificationsAsync,
  cancelHydrationNotificationsAsync,
  scheduleHydrationNotificationAsync,
} from '../notifications/service';

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
  themeName: string;
  userName: string | null;
  setUserName: (name: string) => void;
  notificationsEnabled: boolean;
  setNotificationsEnabled: (enabled: boolean) => void;
  isFirstLaunch: boolean;
  setIsFirstLaunch: (val: boolean) => void;
  hydrationTimerSeconds: number | null;
  hydrationTimeRemaining: number;
  isHydrationTimerRunning: boolean;
  startHydrationTimer: (seconds: number) => void;
  stopHydrationTimer: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  colors: Colors,
  themeName: 'cherry_blossom',
  userName: null,
  setUserName: () => {},
  notificationsEnabled: true,
  setNotificationsEnabled: () => {},
  isFirstLaunch: true,
  setIsFirstLaunch: () => {},
  hydrationTimerSeconds: null,
  hydrationTimeRemaining: 0,
  isHydrationTimerRunning: false,
  startHydrationTimer: () => {},
  stopHydrationTimer: () => {},
});

const STORAGE_KEY_NAME = 'rewind_user_name';
const STORAGE_KEY_LAUNCHED = 'rewind_has_launched';
const STORAGE_KEY_NOTIFICATIONS = 'rewind_notifications_enabled';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [userName, setUserNameState] = useState<string | null>(null);
  const [notificationsEnabled, setNotificationsEnabledState] = useState(true);
  const [isFirstLaunch, setIsFirstLaunchState] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hydrationTimerSeconds, setHydrationTimerSeconds] = useState<number | null>(null);
  const [hydrationTimeRemaining, setHydrationTimeRemaining] = useState(0);
  const [isHydrationTimerRunning, setIsHydrationTimerRunning] = useState(false);

  useEffect(() => {
    // Load persisted values
    const storedName = readPersistedValue(STORAGE_KEY_NAME);
    const hasLaunched = readPersistedValue(STORAGE_KEY_LAUNCHED);
    const storedNotificationsEnabled = readPersistedValue(STORAGE_KEY_NOTIFICATIONS);
    
    if (storedName) {
      setUserNameState(storedName);
    }
    if (hasLaunched === 'true') {
      setIsFirstLaunchState(false);
    }
    if (storedNotificationsEnabled === 'false') {
      setNotificationsEnabledState(false);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!isHydrationTimerRunning || !hydrationTimerSeconds || hydrationTimeRemaining <= 0) {
      return;
    }

    const intervalId = setInterval(() => {
      setHydrationTimeRemaining((previous) => {
        if (previous <= 1) {
          return hydrationTimerSeconds;
        }

        return previous - 1;
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [hydrationTimerSeconds, hydrationTimeRemaining, isHydrationTimerRunning]);

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
    setHydrationTimerSeconds(seconds);
    setHydrationTimeRemaining(seconds);
    setIsHydrationTimerRunning(true);
    if (notificationsEnabled) {
      void scheduleHydrationNotificationAsync(seconds, {
        userName,
        themeName: 'cherry_blossom',
      }, true);
    }
  }, [notificationsEnabled, userName]);

  const stopHydrationTimer = useCallback(() => {
    setIsHydrationTimerRunning(false);
    setHydrationTimerSeconds(null);
    setHydrationTimeRemaining(0);
    void cancelHydrationNotificationsAsync();
  }, []);

  if (!isLoaded) return null;

  return (
    <ThemeContext.Provider
      value={{
        colors: Colors,
        themeName: 'cherry_blossom',
        userName,
        setUserName,
        notificationsEnabled,
        setNotificationsEnabled,
        isFirstLaunch,
        setIsFirstLaunch,
        hydrationTimerSeconds,
        hydrationTimeRemaining,
        isHydrationTimerRunning,
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
