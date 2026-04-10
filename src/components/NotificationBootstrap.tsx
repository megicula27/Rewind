import { useEffect } from 'react';
import { AppState, Platform } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';

import { getReminders } from '../db/reminders';
import { getSounds } from '../db/sounds';
import { syncReminderNotificationsAsync } from '../notifications/service';
import { useTheme } from '../theme/ThemeContext';

export default function NotificationBootstrap() {
  const db = useSQLiteContext();
  const { userName, themeName, notificationsEnabled } = useTheme();

  useEffect(() => {
    if (Platform.OS === 'web') {
      return;
    }

    let isCancelled = false;

    const bootstrapNotifications = async () => {
      try {
        if (!notificationsEnabled) {
          return;
        }

        const reminders = await getReminders(db);
        const sounds = await getSounds(db);
        if (isCancelled) {
          return;
        }

        await syncReminderNotificationsAsync(reminders, sounds, {
          userName,
          themeName,
        });
      } catch (error) {
        console.error('Failed to bootstrap notifications:', error);
      }
    };

    void bootstrapNotifications();

    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        void bootstrapNotifications();
      }
    });

    return () => {
      isCancelled = true;
      subscription.remove();
    };
  }, [db, notificationsEnabled, themeName, userName]);

  return null;
}
