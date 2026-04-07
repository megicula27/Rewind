import { type SQLiteDatabase } from 'expo-sqlite';

import type { Sound, SoundType } from './types';
import { ensureDbSchema } from './database';
import { BUNDLED_SOUNDS, buildBundledSoundUri } from '../sounds/catalog';

type CreateSoundInput = {
  name: string;
  type: SoundType;
  file_uri: string;
  duration_ms?: number | null;
};

async function seedBundledSounds(db: SQLiteDatabase) {
  await ensureDbSchema(db);

  for (const sound of BUNDLED_SOUNDS) {
    const existing = await db.getFirstAsync<{ id: number }>(
      'SELECT id FROM sounds WHERE file_uri = ?',
      buildBundledSoundUri(sound.fileName)
    );

    if (!existing) {
      await db.runAsync(
        `INSERT INTO sounds (name, type, file_uri, duration_ms)
         VALUES (?, 'default', ?, NULL)`,
        sound.name,
        buildBundledSoundUri(sound.fileName)
      );
    }
  }
}

export async function getSounds(db: SQLiteDatabase): Promise<Sound[]> {
  await seedBundledSounds(db);
  return db.getAllAsync<Sound>('SELECT * FROM sounds ORDER BY type = \'default\' DESC, created_at ASC, id ASC');
}

export async function getSoundById(db: SQLiteDatabase, id: number): Promise<Sound | null> {
  await seedBundledSounds(db);
  return db.getFirstAsync<Sound>('SELECT * FROM sounds WHERE id = ?', id);
}

export async function createSound(db: SQLiteDatabase, input: CreateSoundInput): Promise<Sound> {
  await seedBundledSounds(db);

  const result = await db.runAsync(
    `INSERT INTO sounds (name, type, file_uri, duration_ms)
     VALUES (?, ?, ?, ?)`,
    input.name.trim(),
    input.type,
    input.file_uri,
    input.duration_ms ?? null
  );

  const created = await db.getFirstAsync<Sound>('SELECT * FROM sounds WHERE id = ?', result.lastInsertRowId);
  if (!created) {
    throw new Error('Failed to create sound.');
  }

  return created;
}

export async function deleteSound(db: SQLiteDatabase, id: number): Promise<Sound | null> {
  await seedBundledSounds(db);

  const existing = await db.getFirstAsync<Sound>('SELECT * FROM sounds WHERE id = ?', id);
  if (!existing) {
    return null;
  }

  if (existing.type === 'default') {
    throw new Error('Bundled sounds cannot be removed.');
  }

  await db.runAsync('DELETE FROM sounds WHERE id = ?', id);
  return existing;
}
