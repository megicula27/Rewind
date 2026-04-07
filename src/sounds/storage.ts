import * as FileSystem from 'expo-file-system/legacy';

import { SOUND_LIBRARY_DIRECTORY } from './catalog';

function getExtension(nameOrUri: string) {
  const sanitized = nameOrUri.split('?')[0] ?? nameOrUri;
  const match = sanitized.match(/\.([a-zA-Z0-9]+)$/);
  return match ? `.${match[1].toLowerCase()}` : '.m4a';
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 32);
}

export async function copyClipToSoundLibraryAsync(sourceUri: string, preferredName: string) {
  const documentDirectory = FileSystem.documentDirectory;
  if (!documentDirectory) {
    return sourceUri;
  }

  const targetDirectory = `${documentDirectory}${SOUND_LIBRARY_DIRECTORY}`;
  await FileSystem.makeDirectoryAsync(targetDirectory, { intermediates: true });

  const extension = getExtension(preferredName || sourceUri);
  const fileName = `${Date.now()}-${slugify(preferredName || 'sound')}${extension}`;
  const destinationUri = `${targetDirectory}/${fileName}`;

  await FileSystem.copyAsync({
    from: sourceUri,
    to: destinationUri,
  });

  return destinationUri;
}
