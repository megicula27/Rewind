import { useCallback, useEffect, useState } from 'react';

import type { Sound, SoundType } from '../db/types';
import { BUNDLED_SOUNDS, buildBundledSoundUri } from '../sounds/catalog';
import { readJson, writeJson } from '../web/storage';

const SOUNDS_KEY = 'rewind_web_sounds';

function buildDefaultSounds(): Sound[] {
  const now = new Date().toISOString();
  return BUNDLED_SOUNDS.map((sound, index) => ({
    id: index + 1,
    name: sound.name,
    type: 'default',
    file_uri: buildBundledSoundUri(sound.fileName),
    duration_ms: null,
    created_at: now,
  }));
}

function loadSounds() {
  const defaults = buildDefaultSounds();
  const saved = readJson<Sound[]>(SOUNDS_KEY, []);
  if (saved.length === 0) {
    writeJson(SOUNDS_KEY, defaults);
    return defaults;
  }

  const existingUris = new Set(saved.map((sound) => sound.file_uri));
  const merged = [
    ...saved,
    ...defaults.filter((sound) => !existingUris.has(sound.file_uri)),
  ];

  writeJson(SOUNDS_KEY, merged);
  return merged;
}

type CreateCustomSoundInput = {
  name: string;
  type: SoundType;
  fileUri: string;
  durationMs?: number | null;
};

export function useSounds() {
  const [loading, setLoading] = useState(true);
  const [sounds, setSounds] = useState<Sound[]>([]);

  const refresh = useCallback(async () => {
    setSounds(loadSounds());
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const createCustomSound = useCallback(async (input: CreateCustomSoundInput) => {
    const snapshot = loadSounds();
    const nextId = snapshot.reduce((max, sound) => Math.max(max, sound.id), 0) + 1;
    const createdAt = new Date().toISOString();
    const created: Sound = {
      id: nextId,
      name: input.name,
      type: input.type,
      file_uri: input.fileUri,
      duration_ms: input.durationMs ?? null,
      created_at: createdAt,
    };

    writeJson(SOUNDS_KEY, [...snapshot, created]);
    await refresh();
    return created;
  }, [refresh]);

  const removeCustomSound = useCallback(async (soundId: number) => {
    const snapshot = loadSounds();
    const existing = snapshot.find((sound) => sound.id === soundId) ?? null;
    if (!existing || existing.type === 'default') {
      return existing;
    }

    writeJson(
      SOUNDS_KEY,
      snapshot.filter((sound) => sound.id !== soundId)
    );
    await refresh();
    return existing;
  }, [refresh]);

  return {
    loading,
    sounds,
    refresh,
    createCustomSound,
    removeCustomSound,
  };
}
