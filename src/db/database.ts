/**
 * Rewind — Database Initialization & Migrations
 * 
 * Uses PRAGMA user_version for schema versioning.
 * Each migration block advances the version number.
 */

import { type SQLiteDatabase } from 'expo-sqlite';

const DATABASE_VERSION = 1;

export const DATABASE_NAME = 'rewind.db';

export async function migrateDbIfNeeded(db: SQLiteDatabase) {
  const result = await db.getFirstAsync<{ user_version: number }>(
    'PRAGMA user_version'
  );
  let currentVersion = result?.user_version ?? 0;

  if (currentVersion >= DATABASE_VERSION) return;

  if (currentVersion === 0) {
    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      PRAGMA foreign_keys = ON;

      CREATE TABLE IF NOT EXISTS sounds (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        name        TEXT    NOT NULL,
        type        TEXT    NOT NULL DEFAULT 'default',
        file_uri    TEXT    NOT NULL,
        duration_ms INTEGER,
        created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS reminders (
        id            INTEGER PRIMARY KEY AUTOINCREMENT,
        name          TEXT    NOT NULL,
        description   TEXT,
        type          TEXT    NOT NULL DEFAULT 'custom',
        icon          TEXT    NOT NULL DEFAULT '📌',
        frequency     TEXT    NOT NULL DEFAULT 'daily',
        time_hour     INTEGER NOT NULL,
        time_minute   INTEGER NOT NULL,
        day_of_week   INTEGER,
        day_of_month  INTEGER,
        sound_id      INTEGER,
        is_active     INTEGER NOT NULL DEFAULT 1,
        created_at    TEXT    NOT NULL DEFAULT (datetime('now')),
        updated_at    TEXT    NOT NULL DEFAULT (datetime('now')),
        FOREIGN KEY (sound_id) REFERENCES sounds(id) ON DELETE SET NULL
      );

      CREATE TABLE IF NOT EXISTS completion_log (
        id            INTEGER PRIMARY KEY AUTOINCREMENT,
        reminder_id   INTEGER NOT NULL,
        completed_at  TEXT    NOT NULL DEFAULT (datetime('now')),
        dial_value    INTEGER NOT NULL DEFAULT 10,
        points_earned INTEGER NOT NULL DEFAULT 0,
        FOREIGN KEY (reminder_id) REFERENCES reminders(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS points (
        id             INTEGER PRIMARY KEY CHECK (id = 1),
        total_points   INTEGER NOT NULL DEFAULT 0,
        current_streak INTEGER NOT NULL DEFAULT 0,
        best_streak    INTEGER NOT NULL DEFAULT 0,
        last_active_date TEXT
      );

      CREATE TABLE IF NOT EXISTS hydration_log (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        logged_at   TEXT    NOT NULL DEFAULT (datetime('now')),
        glasses     INTEGER NOT NULL DEFAULT 1
      );

      INSERT OR IGNORE INTO points (id, total_points, current_streak, best_streak)
        VALUES (1, 0, 0, 0);
    `);
    currentVersion = 1;
  }

  // Future: if (currentVersion === 1) { ... currentVersion = 2; }

  await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
}
