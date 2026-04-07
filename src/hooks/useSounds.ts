import { useCallback, useEffect, useState } from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import * as FileSystem from 'expo-file-system/legacy';

import type { Sound, SoundType } from '../db/types';
import { createSound, deleteSound, getSounds } from '../db/sounds';
import { getReminders } from '../db/reminders';
import { syncReminderNotificationsAsync } from '../notifications/service';
import { useTheme } from '../theme/ThemeContext';

type CreateCustomSoundInput = {
  name: string;
  type: SoundType;
  fileUri: string;
  durationMs?: number | null;
};

export function useSounds() {
  const db = useSQLiteContext();
  const { userName, themeName } = useTheme();
  const [loading, setLoading] = useState(true);
  const [sounds, setSounds] = useState<Sound[]>([]);

  const refresh = useCallback(async () => {
    try {
      const snapshot = await getSounds(db);
      setSounds(snapshot);
    } catch (error) {
      console.error('Failed to load sounds:', error);
    } finally {
      setLoading(false);
    }
  }, [db]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const createCustomSound = useCallback(
    async (input: CreateCustomSoundInput) => {
      const created = await createSound(db, {
        name: input.name,
        type: input.type,
        file_uri: input.fileUri,
        duration_ms: input.durationMs ?? null,
      });

      await refresh();
      return created;
    },
    [db, refresh]
  );

  const removeCustomSound = useCallback(
    async (soundId: number) => {
      const removed = await deleteSound(db, soundId);
      if (removed?.file_uri && removed.file_uri.startsWith('file://')) {
        try {
          await FileSystem.deleteAsync(removed.file_uri, { idempotent: true });
        } catch (error) {
          console.warn('Failed to delete sound file from disk:', error);
        }
      }

      const nextSounds = await getSounds(db);
      setSounds(nextSounds);

      void (async () => {
        try {
          const reminders = await getReminders(db);
          await syncReminderNotificationsAsync(reminders, nextSounds, {
            userName,
            themeName,
          });
        } catch (error) {
          console.error('Failed to resync notifications after removing sound:', error);
        }
      })();

      return removed;
    },
    [db, themeName, userName]
  );

  return {
    loading,
    sounds,
    refresh,
    createCustomSound,
    removeCustomSound,
  };
}
