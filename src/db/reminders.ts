/**
 * Rewind — Reminders Data Module
 * 
 * CRUD operations for the reminders table.
 * Uses expo-sqlite async API with typed results.
 */

import { type SQLiteDatabase } from 'expo-sqlite';
import type { Reminder, CreateReminderInput, ReminderWithStatus, CompletionLog } from './types';
import { formatDateKey } from './types';
import { ensureDbSchema } from './database';

export async function createReminder(
  db: SQLiteDatabase,
  input: CreateReminderInput
): Promise<number> {
  await ensureDbSchema(db);

  const normalizedInput = {
    name: input.name.trim(),
    description: input.description?.trim() || null,
    type: input.type,
    icon: input.icon,
    frequency: input.frequency,
    time_hour: Number(input.time_hour),
    time_minute: Number(input.time_minute),
    day_of_week: input.day_of_week ?? null,
    day_of_month: input.day_of_month ?? null,
    once_date: input.once_date ?? null,
    interval_value: input.interval_value ?? null,
    interval_unit: input.interval_unit ?? null,
    sound_id: input.sound_id ?? null,
  };

  const result = await db.runAsync(
    `INSERT INTO reminders (name, description, type, icon, frequency, time_hour, time_minute, day_of_week, day_of_month, once_date, interval_value, interval_unit, sound_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      normalizedInput.name,
      normalizedInput.description,
      normalizedInput.type,
      normalizedInput.icon,
      normalizedInput.frequency,
      normalizedInput.time_hour,
      normalizedInput.time_minute,
      normalizedInput.day_of_week,
      normalizedInput.day_of_month,
      normalizedInput.once_date,
      normalizedInput.interval_value,
      normalizedInput.interval_unit,
      normalizedInput.sound_id,
    ]
  );
  return result.lastInsertRowId;
}

export async function getReminders(
  db: SQLiteDatabase,
  activeOnly = true
): Promise<Reminder[]> {
  const where = activeOnly ? 'WHERE is_active = 1' : '';
  return db.getAllAsync<Reminder>(
    `SELECT * FROM reminders ${where} ORDER BY time_hour ASC, time_minute ASC`
  );
}

export async function getRemindersWithTodayStatus(
  db: SQLiteDatabase
): Promise<ReminderWithStatus[]> {
  const reminders = await getReminders(db);
  const now = new Date();
  const today = formatDateKey(now);
  const todayDayOfWeek = now.getDay();
  const todayDayOfMonth = now.getDate();

  const completions = await db.getAllAsync<CompletionLog>(
    `SELECT * FROM completion_log WHERE date(completed_at) = ?`,
    today
  );

  return reminders
    .filter((reminder) => {
      if (reminder.frequency === 'daily') return true;
      if (reminder.frequency === 'weekly') return reminder.day_of_week === todayDayOfWeek;
      if (reminder.frequency === 'monthly') return reminder.day_of_month === todayDayOfMonth;
      if (reminder.frequency === 'once') return reminder.once_date === today;
      if (reminder.frequency === 'custom_interval') {
        if (!reminder.interval_value || !reminder.interval_unit) {
          return false;
        }

        const startDate = new Date(reminder.created_at.replace(' ', 'T'));
        startDate.setHours(0, 0, 0, 0);
        const compareDate = new Date(now);
        compareDate.setHours(0, 0, 0, 0);

        if (reminder.interval_unit === 'day') {
          const diffDays = Math.floor((compareDate.getTime() - startDate.getTime()) / 86400000);
          return diffDays >= 0 && diffDays % reminder.interval_value === 0;
        }

        if (reminder.day_of_month !== todayDayOfMonth) {
          return false;
        }

        const diffMonths =
          (compareDate.getFullYear() - startDate.getFullYear()) * 12 +
          (compareDate.getMonth() - startDate.getMonth());
        return diffMonths >= 0 && diffMonths % reminder.interval_value === 0;
      }
      return false;
    })
    .map((r) => ({
      ...r,
      todayCompletion: completions.find((c) => c.reminder_id === r.id) ?? null,
    }));
}

export async function getReminderById(
  db: SQLiteDatabase,
  id: number
): Promise<Reminder | null> {
  return db.getFirstAsync<Reminder>('SELECT * FROM reminders WHERE id = ?', id);
}

export async function updateReminder(
  db: SQLiteDatabase,
  id: number,
  updates: Partial<CreateReminderInput>
): Promise<void> {
  const fields: string[] = [];
  const values: any[] = [];

  if (updates.name !== undefined) { fields.push('name = ?'); values.push(updates.name); }
  if (updates.description !== undefined) { fields.push('description = ?'); values.push(updates.description); }
  if (updates.type !== undefined) { fields.push('type = ?'); values.push(updates.type); }
  if (updates.icon !== undefined) { fields.push('icon = ?'); values.push(updates.icon); }
  if (updates.frequency !== undefined) { fields.push('frequency = ?'); values.push(updates.frequency); }
  if (updates.time_hour !== undefined) { fields.push('time_hour = ?'); values.push(updates.time_hour); }
  if (updates.time_minute !== undefined) { fields.push('time_minute = ?'); values.push(updates.time_minute); }
  if (updates.day_of_week !== undefined) { fields.push('day_of_week = ?'); values.push(updates.day_of_week); }
  if (updates.day_of_month !== undefined) { fields.push('day_of_month = ?'); values.push(updates.day_of_month); }
  if (updates.once_date !== undefined) { fields.push('once_date = ?'); values.push(updates.once_date); }
  if (updates.interval_value !== undefined) { fields.push('interval_value = ?'); values.push(updates.interval_value); }
  if (updates.interval_unit !== undefined) { fields.push('interval_unit = ?'); values.push(updates.interval_unit); }
  if (updates.sound_id !== undefined) { fields.push('sound_id = ?'); values.push(updates.sound_id); }

  if (fields.length === 0) return;

  fields.push("updated_at = datetime('now')");
  values.push(id);

  await db.runAsync(
    `UPDATE reminders SET ${fields.join(', ')} WHERE id = ?`,
    ...values
  );
}

export async function deleteReminder(
  db: SQLiteDatabase,
  id: number
): Promise<void> {
  await db.runAsync('DELETE FROM reminders WHERE id = ?', id);
}

export async function toggleReminder(
  db: SQLiteDatabase,
  id: number,
  isActive: boolean
): Promise<void> {
  await db.runAsync(
    "UPDATE reminders SET is_active = ?, updated_at = datetime('now') WHERE id = ?",
    isActive ? 1 : 0,
    id
  );
}
