import type { Sound } from '../db/types';

export const MAX_CUSTOM_SOUND_BYTES = 1_000_000;
export const SOUND_LIBRARY_DIRECTORY = 'rewind_notification_sounds';

export type BundledSoundDefinition = {
  name: string;
  emoji: string;
  fileName: string;
  notificationCapable: boolean;
  fallbackColor: string;
  backgroundColor: string;
  assetSource: number;
};

export const BUNDLED_SOUNDS: BundledSoundDefinition[] = [
  {
    name: 'Bird Calling',
    emoji: '🐦',
    fileName: 'bird_calling.wav',
    notificationCapable: true,
    fallbackColor: '#81C784',
    backgroundColor: '#E8F5E9',
    assetSource: require('../../assets/notification_sounds/bird_calling.wav'),
  },
  {
    name: 'Bird Singing',
    emoji: '🕊️',
    fileName: 'bird_singing.wav',
    notificationCapable: true,
    fallbackColor: '#64B5F6',
    backgroundColor: '#E3F2FD',
    assetSource: require('../../assets/notification_sounds/bird_singing.wav'),
  },
  {
    name: 'Digital Bell',
    emoji: '🔔',
    fileName: 'digital_bell.mp3',
    notificationCapable: true,
    fallbackColor: '#FFB74D',
    backgroundColor: '#FFF3E0',
    assetSource: require('../../assets/notification_sounds/digital_bell.mp3'),
  },
  {
    name: 'Flute Bloom',
    emoji: '🎋',
    fileName: 'flute.wav',
    notificationCapable: true,
    fallbackColor: '#BA68C8',
    backgroundColor: '#F3E5F5',
    assetSource: require('../../assets/notification_sounds/flute.wav'),
  },
  {
    name: 'Happy Bell',
    emoji: '🌸',
    fileName: 'happy_bell.wav',
    notificationCapable: true,
    fallbackColor: '#F06292',
    backgroundColor: '#FCE4EC',
    assetSource: require('../../assets/notification_sounds/happy_bell.wav'),
  },
  {
    name: 'Soft Software',
    emoji: '💧',
    fileName: 'software.wav',
    notificationCapable: true,
    fallbackColor: '#4FC3F7',
    backgroundColor: '#E1F5FE',
    assetSource: require('../../assets/notification_sounds/software.wav'),
  },
];

export const DEFAULT_NOTIFICATION_SOUND_FILE = 'happy_bell.wav';
export const DEFAULT_HYDRATION_SOUND_FILE = 'software.wav';

export type SoundVisual = {
  emoji: string;
  fallbackColor: string;
  backgroundColor: string;
  caption?: string;
};

const BUNDLED_SOUND_BY_FILE = new Map(
  BUNDLED_SOUNDS.map((definition) => [definition.fileName, definition])
);

export function buildBundledSoundUri(fileName: string) {
  return `asset://${fileName}`;
}

export function isBundledSoundUri(fileUri: string) {
  return fileUri.startsWith('asset://');
}

export function getBundledSoundFileName(fileUri: string) {
  return isBundledSoundUri(fileUri) ? fileUri.replace('asset://', '') : null;
}

export function getBundledSoundDefinitionByUri(fileUri: string) {
  const fileName = getBundledSoundFileName(fileUri);
  return fileName ? BUNDLED_SOUND_BY_FILE.get(fileName) ?? null : null;
}

export function getBundledSoundDefinitionByFile(fileName: string | null | undefined) {
  if (!fileName) {
    return null;
  }

  return BUNDLED_SOUND_BY_FILE.get(fileName) ?? null;
}

export function resolveSoundPlaybackSource(sound: Sound) {
  const bundled = getBundledSoundDefinitionByUri(sound.file_uri);
  if (bundled) {
    return bundled.assetSource;
  }

  return { uri: sound.file_uri };
}

export function getSoundVisual(sound: Sound): SoundVisual {
  const bundled = getBundledSoundDefinitionByUri(sound.file_uri);
  if (bundled) {
    return {
      emoji: bundled.emoji,
      fallbackColor: bundled.fallbackColor,
      backgroundColor: bundled.backgroundColor,
    };
  }

  if (sound.type === 'recorded') {
    return {
      emoji: '🎙️',
      fallbackColor: '#D87093',
      backgroundColor: '#FFE4ED',
      caption: 'Voice clip',
    };
  }

  return {
    emoji: '📁',
    fallbackColor: '#9B6B6B',
    backgroundColor: '#F7E5E1',
    caption: 'Uploaded clip',
  };
}

export function getNotificationSoundFile(sound: Sound | null | undefined) {
  const bundled = sound ? getBundledSoundDefinitionByUri(sound.file_uri) : null;
  if (bundled?.notificationCapable) {
    return bundled.fileName;
  }

  return DEFAULT_NOTIFICATION_SOUND_FILE;
}

export function getSoundChannelKey(sound: Sound | null | undefined) {
  return getNotificationSoundFile(sound).replace(/[^a-zA-Z0-9]+/g, '-').toLowerCase();
}
