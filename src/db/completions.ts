/**
 * Rewind — Completions Data Module
 */

import { type SQLiteDatabase } from 'expo-sqlite';
import type { CompletionLog } from './types';
import { formatDateKey, formatDateTimeKey } from './types';
import { updatePoints, updateStreak } from './points';

export function calculatePoints(dialValue: number): number {
  if (dialValue === 10) return 10;
  if (dialValue >= 4) return Math.round(dialValue);
  return dialValue - 4; // 0→-4, 1→-3, 2→-2, 3→-1
}

export function shouldShowConfetti(dialValue: number): boolean {
  return dialValue === 10;
}

export async function logCompletion(
  db: SQLiteDatabase,
  reminderId: number,
  dialValue: number
): Promise<CompletionLog> {
  const pointsEarned = calculatePoints(dialValue);
  const completedAt = formatDateTimeKey(new Date());

  const result = await db.runAsync(
    `INSERT INTO completion_log (reminder_id, completed_at, dial_value, points_earned)
     VALUES (?, ?, ?, ?)`,
    reminderId,
    completedAt,
    dialValue,
    pointsEarned
  );

  await updatePoints(db, pointsEarned);
  await updateStreak(db);

  return {
    id: result.lastInsertRowId,
    reminder_id: reminderId,
    completed_at: completedAt,
    dial_value: dialValue,
    points_earned: pointsEarned,
  };
}

export async function getTodayCompletions(
  db: SQLiteDatabase
): Promise<CompletionLog[]> {
  const today = formatDateKey(new Date());
  return db.getAllAsync<CompletionLog>(
    `SELECT * FROM completion_log WHERE date(completed_at) = ?`,
    today
  );
}

export async function getCompletionsForWeek(
  db: SQLiteDatabase,
  weekStart: string,
  weekEnd: string
): Promise<CompletionLog[]> {
  return db.getAllAsync<CompletionLog>(
    `SELECT * FROM completion_log 
     WHERE date(completed_at) >= ? AND date(completed_at) <= ?
     ORDER BY completed_at ASC`,
    weekStart,
    weekEnd
  );
}
