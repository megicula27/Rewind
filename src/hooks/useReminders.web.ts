import { useCallback, useEffect, useState } from 'react';

import type { CompletionLog, CreateReminderInput, Reminder, ReminderWithStatus } from '../db/types';
import { formatDateKey, formatDateTimeKey } from '../db/types';
import { readJson, writeJson } from '../web/storage';

const REMINDERS_KEY = 'rewind_web_reminders';
const COMPLETIONS_KEY = 'rewind_web_completions';
const POINTS_KEY = 'rewind_web_points';

function calculatePoints(dialValue: number): number {
  if (dialValue === 10) return 10;
  if (dialValue >= 4) return Math.round(dialValue);
  return dialValue - 4;
}

function loadReminders() {
  return readJson<Reminder[]>(REMINDERS_KEY, []);
}

function saveReminders(reminders: Reminder[]) {
  writeJson(REMINDERS_KEY, reminders);
}

function loadCompletions() {
  return readJson<CompletionLog[]>(COMPLETIONS_KEY, []);
}

function saveCompletions(completions: CompletionLog[]) {
  writeJson(COMPLETIONS_KEY, completions);
}

function updatePointsForCompletion(dialValue: number, completedAt: string) {
  const snapshot = readJson(POINTS_KEY, {
    id: 1,
    total_points: 0,
    current_streak: 0,
    best_streak: 0,
    last_active_date: null as string | null,
  });

  const today = completedAt.slice(0, 10);
  const yesterdayDate = new Date(`${today}T00:00:00`);
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterday = formatDateKey(yesterdayDate);

  let streak = snapshot.current_streak;
  if (snapshot.last_active_date === today) {
    streak = snapshot.current_streak;
  } else if (snapshot.last_active_date === yesterday) {
    streak += 1;
  } else {
    streak = 1;
  }

  writeJson(POINTS_KEY, {
    ...snapshot,
    total_points: Math.max(0, snapshot.total_points + calculatePoints(dialValue)),
    current_streak: streak,
    best_streak: Math.max(snapshot.best_streak, streak),
    last_active_date: today,
  });
}

function isReminderDueToday(reminder: Reminder, today: Date) {
  if (reminder.frequency === 'daily') return true;
  if (reminder.frequency === 'weekly') return reminder.day_of_week === today.getDay();
  if (reminder.frequency === 'monthly') return reminder.day_of_month === today.getDate();
  if (reminder.frequency === 'once') return reminder.once_date === formatDateKey(today);
  return false;
}

function buildTodaySnapshot(): ReminderWithStatus[] {
  const now = new Date();
  const today = formatDateKey(now);
  const reminders = loadReminders();
  const completions = loadCompletions().filter((item) => item.completed_at.slice(0, 10) === today);

  return reminders
    .filter((reminder) => isReminderDueToday(reminder, now))
    .sort((a, b) => {
      if (a.time_hour !== b.time_hour) return a.time_hour - b.time_hour;
      return a.time_minute - b.time_minute;
    })
    .map((reminder) => ({
      ...reminder,
      todayCompletion: completions.find((completion) => completion.reminder_id === reminder.id) ?? null,
    }));
}

export function useReminders() {
  const [reminders, setReminders] = useState<ReminderWithStatus[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setReminders(buildTodaySnapshot());
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addReminder = useCallback(async (input: CreateReminderInput) => {
    const remindersSnapshot = loadReminders();
    const nextId = remindersSnapshot.reduce((max, reminder) => Math.max(max, reminder.id), 0) + 1;
    const timestamp = formatDateTimeKey(new Date());

    saveReminders([
      ...remindersSnapshot,
      {
        id: nextId,
        name: input.name,
        description: input.description ?? null,
        type: input.type,
        icon: input.icon,
        frequency: input.frequency,
        time_hour: input.time_hour,
        time_minute: input.time_minute,
        day_of_week: input.day_of_week ?? null,
        day_of_month: input.day_of_month ?? null,
        once_date: input.once_date ?? null,
        sound_id: input.sound_id ?? null,
        is_active: 1,
        created_at: timestamp,
        updated_at: timestamp,
      },
    ]);

    await refresh();
  }, [refresh]);

  const completeReminder = useCallback(async (reminderId: number, dialValue: number) => {
    const completions = loadCompletions();
    const completedAt = formatDateTimeKey(new Date());
    const nextId = completions.reduce((max, item) => Math.max(max, item.id), 0) + 1;

    saveCompletions([
      ...completions,
      {
        id: nextId,
        reminder_id: reminderId,
        completed_at: completedAt,
        dial_value: dialValue,
        points_earned: calculatePoints(dialValue),
      },
    ]);

    updatePointsForCompletion(dialValue, completedAt);
    await refresh();
  }, [refresh]);

  const removeReminder = useCallback(async (reminderId: number) => {
    saveReminders(loadReminders().filter((reminder) => reminder.id !== reminderId));
    saveCompletions(loadCompletions().filter((completion) => completion.reminder_id !== reminderId));
    await refresh();
  }, [refresh]);

  return {
    reminders,
    loading,
    refresh,
    addReminder,
    completeReminder,
    removeReminder,
  };
}
