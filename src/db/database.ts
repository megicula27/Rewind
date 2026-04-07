/**
 * Rewind — Database Initialization & Migrations
 * 
 * Uses PRAGMA user_version for schema versioning.
 * Each migration block advances the version number.
 */

import { type SQLiteDatabase } from 'expo-sqlite';

const DATABASE_VERSION = 3;

export const DATABASE_NAME = 'rewind.db';

async function getTableColumns(db: SQLiteDatabase, tableName: string) {
  const columns = await db.getAllAsync<{ name: string }>(`PRAGMA table_info(${tableName})`);
  return new Set(columns.map((column) => column.name));
}

export async function ensureDbSchema(db: SQLiteDatabase) {
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
      once_date     TEXT,
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
      id               INTEGER PRIMARY KEY CHECK (id = 1),
      total_points     INTEGER NOT NULL DEFAULT 0,
      current_streak   INTEGER NOT NULL DEFAULT 0,
      best_streak      INTEGER NOT NULL DEFAULT 0,
      last_active_date TEXT
    );

    CREATE TABLE IF NOT EXISTS hydration_log (
      id        INTEGER PRIMARY KEY AUTOINCREMENT,
      logged_at TEXT    NOT NULL DEFAULT (datetime('now')),
      glasses   INTEGER NOT NULL DEFAULT 1
    );

    INSERT OR IGNORE INTO points (id, total_points, current_streak, best_streak)
      VALUES (1, 0, 0, 0);
  `);

  const reminderColumns = await getTableColumns(db, 'reminders');
  const alterStatements: string[] = [];

  if (!reminderColumns.has('description')) {
    alterStatements.push(`ALTER TABLE reminders ADD COLUMN description TEXT;`);
  }
  if (!reminderColumns.has('type')) {
    alterStatements.push(`ALTER TABLE reminders ADD COLUMN type TEXT NOT NULL DEFAULT 'custom';`);
  }
  if (!reminderColumns.has('icon')) {
    alterStatements.push(`ALTER TABLE reminders ADD COLUMN icon TEXT NOT NULL DEFAULT '📌';`);
  }
  if (!reminderColumns.has('frequency')) {
    alterStatements.push(`ALTER TABLE reminders ADD COLUMN frequency TEXT NOT NULL DEFAULT 'daily';`);
  }
  if (!reminderColumns.has('time_hour')) {
    alterStatements.push(`ALTER TABLE reminders ADD COLUMN time_hour INTEGER NOT NULL DEFAULT 0;`);
  }
  if (!reminderColumns.has('time_minute')) {
    alterStatements.push(`ALTER TABLE reminders ADD COLUMN time_minute INTEGER NOT NULL DEFAULT 0;`);
  }
  if (!reminderColumns.has('day_of_week')) {
    alterStatements.push(`ALTER TABLE reminders ADD COLUMN day_of_week INTEGER;`);
  }
  if (!reminderColumns.has('day_of_month')) {
    alterStatements.push(`ALTER TABLE reminders ADD COLUMN day_of_month INTEGER;`);
  }
  if (!reminderColumns.has('once_date')) {
    alterStatements.push(`ALTER TABLE reminders ADD COLUMN once_date TEXT;`);
  }
  if (!reminderColumns.has('sound_id')) {
    alterStatements.push(`ALTER TABLE reminders ADD COLUMN sound_id INTEGER;`);
  }
  if (!reminderColumns.has('is_active')) {
    alterStatements.push(`ALTER TABLE reminders ADD COLUMN is_active INTEGER NOT NULL DEFAULT 1;`);
  }
  if (!reminderColumns.has('created_at')) {
    alterStatements.push(`ALTER TABLE reminders ADD COLUMN created_at TEXT;`);
  }
  if (!reminderColumns.has('updated_at')) {
    alterStatements.push(`ALTER TABLE reminders ADD COLUMN updated_at TEXT;`);
  }

  if (alterStatements.length > 0) {
    await db.execAsync(alterStatements.join('\n'));
  }
}

export async function migrateDbIfNeeded(db: SQLiteDatabase) {
  const result = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  const currentVersion = result?.user_version ?? 0;

  if (currentVersion >= DATABASE_VERSION) return;

  await ensureDbSchema(db);

  if (false) {
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
        once_date     TEXT,
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
  }

  if (false) {
    const onceDateExists = true;
    if (!onceDateExists) {
      await db.execAsync(`
        ALTER TABLE reminders ADD COLUMN once_date TEXT;
      `);
    }
  }

  await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
}
