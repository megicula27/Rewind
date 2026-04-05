/**
 * Rewind — Theme Context
 * 
 * Provides the active theme (Cherry Blossom for v1) and user name
 * to the entire app via React Context.
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import Storage from 'expo-sqlite/kv-store';
import { Colors, ThemeColors } from './colors';

interface ThemeContextValue {
  colors: ThemeColors;
  themeName: string;
  userName: string | null;
  setUserName: (name: string) => void;
  isFirstLaunch: boolean;
  setIsFirstLaunch: (val: boolean) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  colors: Colors,
  themeName: 'cherry_blossom',
  userName: null,
  setUserName: () => {},
  isFirstLaunch: true,
  setIsFirstLaunch: () => {},
});

const STORAGE_KEY_NAME = 'rewind_user_name';
const STORAGE_KEY_LAUNCHED = 'rewind_has_launched';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [userName, setUserNameState] = useState<string | null>(null);
  const [isFirstLaunch, setIsFirstLaunchState] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Load persisted values
    const storedName = Storage.getItemSync(STORAGE_KEY_NAME);
    const hasLaunched = Storage.getItemSync(STORAGE_KEY_LAUNCHED);
    
    if (storedName) {
      setUserNameState(storedName);
    }
    if (hasLaunched === 'true') {
      setIsFirstLaunchState(false);
    }
    setIsLoaded(true);
  }, []);

  const setUserName = (name: string) => {
    setUserNameState(name);
    Storage.setItemSync(STORAGE_KEY_NAME, name);
    Storage.setItemSync(STORAGE_KEY_LAUNCHED, 'true');
    setIsFirstLaunchState(false);
  };

  const setIsFirstLaunch = (val: boolean) => {
    setIsFirstLaunchState(val);
    if (!val) {
      Storage.setItemSync(STORAGE_KEY_LAUNCHED, 'true');
    }
  };

  if (!isLoaded) return null;

  return (
    <ThemeContext.Provider
      value={{
        colors: Colors,
        themeName: 'cherry_blossom',
        userName,
        setUserName,
        isFirstLaunch,
        setIsFirstLaunch,
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
