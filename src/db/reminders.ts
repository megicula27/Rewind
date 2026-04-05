/**
 * Rewind — Reminders Data Module
 * 
 * CRUD operations for the reminders table.
 * Uses expo-sqlite async API with typed results.
 */

import { type SQLiteDatabase } from 'expo-sqlite';
import type { Reminder, CreateReminderInput, ReminderWithStatus, CompletionLog } from './types';

export async function createReminder(
  db: SQLiteDatabase,
  input: CreateReminderInput
): Promise<number> {
  const result = await db.runAsync(
    `INSERT INTO reminders (name, description, type, icon, frequency, time_hour, time_minute, day_of_week, day_of_month, sound_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    input.name,
    input.description ?? null,
    input.type,
    input.icon,
    input.frequency,
    input.time_hour,
    input.time_minute,
    input.day_of_week ?? null,
    input.day_of_month ?? null,
    input.sound_id ?? null
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
  const today = new Date().toISOString().split('T')[0];

  const completions = await db.getAllAsync<CompletionLog>(
    `SELECT * FROM completion_log WHERE date(completed_at) = ?`,
    today
  );

  return reminders.map((r) => ({
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
