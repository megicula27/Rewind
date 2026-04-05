/**
 * Rewind — Points Data Module
 */

import { type SQLiteDatabase } from 'expo-sqlite';
import type { Points } from './types';

export async function getPoints(db: SQLiteDatabase): Promise<Points> {
  const row = await db.getFirstAsync<Points>(
    'SELECT * FROM points WHERE id = 1'
  );
  return row ?? { id: 1, total_points: 0, current_streak: 0, best_streak: 0, last_active_date: null };
}

export async function updateStreak(db: SQLiteDatabase): Promise<Points> {
  const points = await getPoints(db);
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  let newStreak = points.current_streak;
  let newBest = points.best_streak;

  if (points.last_active_date === today) {
    return points;
  } else if (points.last_active_date === yesterday) {
    newStreak += 1;
  } else {
    newStreak = 1;
  }

  newBest = Math.max(newBest, newStreak);

  await db.runAsync(
    `UPDATE points SET current_streak = ?, best_streak = ?, last_active_date = ? WHERE id = 1`,
    newStreak,
    newBest,
    today
  );

  return { ...points, current_streak: newStreak, best_streak: newBest, last_active_date: today };
}

export async function updatePoints(
  db: SQLiteDatabase,
  delta: number
): Promise<number> {
  await db.runAsync(
    `UPDATE points SET total_points = MAX(0, total_points + ?) WHERE id = 1`,
    delta
  );
  const updated = await getPoints(db);
  return updated.total_points;
}
