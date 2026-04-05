/**
 * Rewind — Completions Data Module
 */

import { type SQLiteDatabase } from 'expo-sqlite';
import type { CompletionLog } from './types';

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

  const result = await db.runAsync(
    `INSERT INTO completion_log (reminder_id, dial_value, points_earned)
     VALUES (?, ?, ?)`,
    reminderId,
    dialValue,
    pointsEarned
  );

  await db.runAsync(
    `UPDATE points SET total_points = MAX(0, total_points + ?) WHERE id = 1`,
    pointsEarned
  );

  return {
    id: result.lastInsertRowId,
    reminder_id: reminderId,
    completed_at: new Date().toISOString(),
    dial_value: dialValue,
    points_earned: pointsEarned,
  };
}

export async function getTodayCompletions(
  db: SQLiteDatabase
): Promise<CompletionLog[]> {
  const today = new Date().toISOString().split('T')[0];
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
