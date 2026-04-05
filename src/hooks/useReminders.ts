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
import { getRemindersWithTodayStatus, createReminder } from '../db/reminders';
import { logCompletion } from '../db/completions';

export function useReminders() {
  const db = useSQLiteContext();
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
    } catch (err) {
      console.error('Failed to create reminder:', err);
      throw err;
    }
  }, [db, refresh]);

  const completeReminder = useCallback(async (reminderId: number, dialValue: number) => {
    try {
      await logCompletion(db, reminderId, dialValue);
      await refresh();
    } catch (err) {
      console.error('Failed to log completion:', err);
      throw err;
    }
  }, [db, refresh]);

  return {
    reminders,
    loading,
    refresh,
    addReminder,
    completeReminder,
  };
}
