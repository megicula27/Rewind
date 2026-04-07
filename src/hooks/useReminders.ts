/**
 * Rewind — useReminders Hook
 * 
 * Bridges the SQLite data layer to React components.
 * Provides today's reminders with completion status, 
 * plus functions to refresh and create reminders.
 */

import { useState, useEffect, useCallback } from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import type { ReminderWithStatus, CreateReminderInput } from '../db/types';
import { getRemindersWithTodayStatus, createReminder, deleteReminder, getReminders } from '../db/reminders';
import { getSounds } from '../db/sounds';
import { logCompletion } from '../db/completions';
import { syncReminderNotificationsAsync } from '../notifications/service';
import { useTheme } from '../theme/ThemeContext';

export function useReminders() {
  const db = useSQLiteContext();
  const { userName, themeName } = useTheme();
  const [reminders, setReminders] = useState<ReminderWithStatus[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const data = await getRemindersWithTodayStatus(db);
      setReminders(data);
    } catch (err) {
      console.error('Failed to load reminders:', err);
    } finally {
      setLoading(false);
    }
  }, [db]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addReminder = useCallback(async (input: CreateReminderInput) => {
    try {
      await createReminder(db, input);
      await refresh();
      void (async () => {
        try {
          const activeReminders = await getReminders(db);
          const sounds = await getSounds(db);
          await syncReminderNotificationsAsync(activeReminders, sounds, {
            userName,
            themeName,
          });
        } catch (error) {
          console.error('Failed to sync notifications after creating reminder:', error);
        }
      })();
    } catch (err) {
      console.error('Failed to create reminder:', err);
      throw err;
    }
  }, [db, refresh, themeName, userName]);

  const completeReminder = useCallback(async (reminderId: number, dialValue: number) => {
    try {
      await logCompletion(db, reminderId, dialValue);
      await refresh();
    } catch (err) {
      console.error('Failed to log completion:', err);
      throw err;
    }
  }, [db, refresh]);

  const removeReminder = useCallback(async (reminderId: number) => {
    try {
      await deleteReminder(db, reminderId);
      await refresh();
      void (async () => {
        try {
          const activeReminders = await getReminders(db);
          const sounds = await getSounds(db);
          await syncReminderNotificationsAsync(activeReminders, sounds, {
            userName,
            themeName,
          });
        } catch (error) {
          console.error('Failed to sync notifications after removing reminder:', error);
        }
      })();
    } catch (err) {
      console.error('Failed to delete reminder:', err);
      throw err;
    }
  }, [db, refresh, themeName, userName]);

  return {
    reminders,
    loading,
    refresh,
    addReminder,
    completeReminder,
    removeReminder,
  };
}
