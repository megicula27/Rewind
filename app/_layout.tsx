/**
 * Rewind — Root Layout
 * 
 * Sets up:
 * - Plus Jakarta Sans font loading
 * - SQLiteProvider with migrations
 * - Theme provider (Cherry Blossom)
 * - Stack navigator with fade transitions
 * - First-launch name prompt
 */

import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet, Platform } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { SQLiteProvider } from 'expo-sqlite';
import {
  useFonts,
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from '@expo-google-fonts/plus-jakarta-sans';
import 'react-native-reanimated';

import { ThemeProvider, useTheme } from '@/src/theme/ThemeContext';
import { Colors } from '@/src/theme/colors';
import { DATABASE_NAME, migrateDbIfNeeded } from '@/src/db/database';
import NamePrompt from '@/src/components/NamePrompt';
import NotificationBootstrap from '@/src/components/NotificationBootstrap';
import NotificationSoundBridge from '@/src/components/NotificationSoundBridge';

// Keep splash screen visible while loading fonts
SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  anchor: '(tabs)',
};

function AppContent() {
  const { isFirstLaunch, setUserName } = useTheme();

  const handleNameSubmit = (name: string) => {
    setUserName(name);
  };

  return (
    <View style={styles.container}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: Colors.surface },
          animation: 'fade',
          animationDuration: 400,
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="modal"
          options={{
            presentation: 'modal',
            title: 'Modal',
            animation: 'slide_from_bottom',
          }}
        />
      </Stack>

      {/* First-launch name prompt overlay */}
      {isFirstLaunch && <NamePrompt onSubmit={handleNameSubmit} />}
      
      <StatusBar style="dark" />
    </View>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  if (Platform.OS === 'web') {
    return (
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <NotificationSoundBridge />
      <SQLiteProvider databaseName={DATABASE_NAME} onInit={migrateDbIfNeeded}>
        <NotificationBootstrap />
        <AppContent />
      </SQLiteProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
});
