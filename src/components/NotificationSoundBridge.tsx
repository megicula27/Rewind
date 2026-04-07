import { useEffect } from 'react';
import { AppState, Platform } from 'react-native';
import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';

import { addNotificationReceivedListener } from '../notifications/expoNotifications';
import { getBundledSoundDefinitionByFile } from '../sounds/catalog';

const FALLBACK_CLEANUP_MS = 15_000;

export default function NotificationSoundBridge() {
  useEffect(() => {
    if (Platform.OS === 'web') {
      return;
    }

    let activeCleanup: (() => void) | null = null;

    const stopActivePlayback = () => {
      activeCleanup?.();
      activeCleanup = null;
    };

    const playForegroundSound = async (soundFile: string) => {
      const bundledSound = getBundledSoundDefinitionByFile(soundFile);
      if (!bundledSound) {
        return;
      }

      stopActivePlayback();

      try {
        await setAudioModeAsync({
          playsInSilentMode: true,
          interruptionMode: 'mixWithOthers',
          allowsRecording: false,
          shouldPlayInBackground: false,
          shouldRouteThroughEarpiece: false,
        });
      } catch (error) {
        console.warn('Failed to configure foreground notification audio:', error);
      }

      const player = createAudioPlayer(bundledSound.assetSource, {
        keepAudioSessionActive: true,
        updateInterval: 120,
      });

      let isCleanedUp = false;
      const statusSubscription = player.addListener('playbackStatusUpdate', (status) => {
        if (status.didJustFinish || (!status.playing && status.currentTime > 0 && status.duration > 0)) {
          cleanup();
        }
      });

      const timeoutId = setTimeout(() => {
        cleanup();
      }, FALLBACK_CLEANUP_MS);

      const cleanup = () => {
        if (isCleanedUp) {
          return;
        }

        isCleanedUp = true;
        clearTimeout(timeoutId);
        statusSubscription.remove();

        try {
          player.pause();
        } catch {}

        try {
          player.remove();
        } catch {}

        if (activeCleanup === cleanup) {
          activeCleanup = null;
        }
      };

      activeCleanup = cleanup;
      player.volume = 1;
      player.play();
    };

    const subscription = addNotificationReceivedListener((notification) => {
      if (AppState.currentState !== 'active') {
        return;
      }

      const soundFile = notification.request.content.data?.soundFile;
      if (typeof soundFile !== 'string') {
        return;
      }

      void playForegroundSound(soundFile);
    });

    return () => {
      subscription.remove();
      stopActivePlayback();
    };
  }, []);

  return null;
}
