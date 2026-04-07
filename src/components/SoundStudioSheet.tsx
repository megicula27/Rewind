import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import {
  AudioQuality,
  IOSOutputFormat,
  RecordingPresets,
  getRecordingPermissionsAsync,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from 'expo-audio';
import * as FileSystem from 'expo-file-system/legacy';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { Colors } from '../theme/colors';
import { Elevation } from '../theme/elevation';
import { FontFamily } from '../theme/typography';
import { Radius, Spacing, TapTargets } from '../theme/spacing';
import { MAX_CUSTOM_SOUND_BYTES } from '../sounds/catalog';

type SavedRecording = {
  name: string;
  uri: string;
  durationMs: number;
  fileSize: number;
};

type Props = {
  visible: boolean;
  onClose: () => void;
  onSave: (recording: SavedRecording) => Promise<void>;
};

const WAVE_MULTIPLIERS = [0.34, 0.56, 0.82, 1, 0.74, 0.48, 0.38, 0.62, 0.9, 0.7, 0.44, 0.3];

const RECORDING_OPTIONS = {
  ...RecordingPresets.HIGH_QUALITY,
  extension: '.m4a',
  sampleRate: 22050,
  numberOfChannels: 1,
  bitRate: 64000,
  isMeteringEnabled: true,
  android: {
    extension: '.m4a',
    outputFormat: 'mpeg4' as const,
    audioEncoder: 'aac' as const,
    maxFileSize: MAX_CUSTOM_SOUND_BYTES,
  },
  ios: {
    extension: '.m4a',
    outputFormat: IOSOutputFormat.MPEG4AAC,
    audioQuality: AudioQuality.MEDIUM,
    linearPCMBitDepth: 16,
    linearPCMIsBigEndian: false,
    linearPCMIsFloat: false,
  },
};

function formatDuration(durationMs: number) {
  const totalSeconds = Math.max(0, Math.floor(durationMs / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function normalizeMetering(metering?: number) {
  if (typeof metering !== 'number') {
    return 0.16;
  }

  const floor = -60;
  const clamped = Math.max(floor, Math.min(0, metering));
  return (clamped - floor) / Math.abs(floor);
}

export default function SoundStudioSheet({ visible, onClose, onSave }: Props) {
  const recorder = useAudioRecorder(RECORDING_OPTIONS);
  const recorderState = useAudioRecorderState(recorder, 120);
  const waveValues = useRef(WAVE_MULTIPLIERS.map(() => new Animated.Value(18))).current;

  const [draftName, setDraftName] = useState('');
  const [draftUri, setDraftUri] = useState<string | null>(null);
  const [draftDurationMs, setDraftDurationMs] = useState(0);
  const [draftFileSize, setDraftFileSize] = useState(0);
  const [isBusy, setIsBusy] = useState(false);

  const canSave = !!draftUri && !recorderState.isRecording && !isBusy;
  const level = normalizeMetering(recorderState.metering);

  useEffect(() => {
    Animated.parallel(
      waveValues.map((value, index) =>
        Animated.timing(value, {
          toValue: 18 + level * 74 * WAVE_MULTIPLIERS[index],
          duration: 150,
          useNativeDriver: false,
        })
      )
    ).start();
  }, [level, waveValues]);

  useEffect(() => {
    if (!visible) {
      setDraftName('');
      setDraftUri(null);
      setDraftDurationMs(0);
      setDraftFileSize(0);
    }
  }, [visible]);

  const title = useMemo(() => {
    if (recorderState.isRecording) {
      return 'Recording your bloom';
    }
    if (draftUri) {
      return 'Voice clip ready';
    }
    return 'Voice studio';
  }, [draftUri, recorderState.isRecording]);

  const handleDismiss = async () => {
    if (recorderState.isRecording) {
      await recorder.stop();
    }
    onClose();
  };

  const ensurePermission = async () => {
    const current = await getRecordingPermissionsAsync();
    if (current.granted) {
      return true;
    }

    const requested = await requestRecordingPermissionsAsync();
    return requested.granted;
  };

  const startRecording = async () => {
    if (isBusy) {
      return;
    }

    const allowed = await ensurePermission();
    if (!allowed) {
      Alert.alert('Microphone needed', 'Please allow microphone access to record your voice clip.');
      return;
    }

    try {
      setIsBusy(true);
      setDraftUri(null);
      setDraftDurationMs(0);
      setDraftFileSize(0);

      await setAudioModeAsync({
        playsInSilentMode: true,
        allowsRecording: true,
        shouldPlayInBackground: false,
      });
      await recorder.prepareToRecordAsync(RECORDING_OPTIONS);
      recorder.record();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
      console.error('Failed to start recording:', error);
      Alert.alert('Recording did not start', 'Please try again in a second.');
    } finally {
      setIsBusy(false);
    }
  };

  const stopRecording = async () => {
    if (isBusy) {
      return;
    }

    try {
      setIsBusy(true);
      await recorder.stop();

      const uri = recorder.uri ?? recorderState.url;
      if (!uri) {
        throw new Error('No recording URI was returned.');
      }

      const info = await FileSystem.getInfoAsync(uri);
      const size = info.exists && typeof info.size === 'number' ? info.size : 0;

      if (size > MAX_CUSTOM_SOUND_BYTES) {
        await FileSystem.deleteAsync(uri, { idempotent: true });
        Alert.alert(
          'Clip is a bit too large',
          'Please keep voice clips under 1 MB so reminders stay quick and lightweight.'
        );
        return;
      }

      setDraftUri(uri);
      setDraftDurationMs(recorderState.durationMillis);
      setDraftFileSize(size);
      if (!draftName.trim()) {
        setDraftName(`Voice Bloom ${new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`);
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Failed to stop recording:', error);
      Alert.alert('Could not save recording', 'Please try one more time.');
    } finally {
      await setAudioModeAsync({
        playsInSilentMode: true,
        allowsRecording: false,
        shouldPlayInBackground: false,
      });
      setIsBusy(false);
    }
  };

  const handleSave = async () => {
    if (!draftUri) {
      return;
    }

    try {
      setIsBusy(true);
      await onSave({
        name: draftName.trim() || 'Voice Bloom',
        uri: draftUri,
        durationMs: draftDurationMs,
        fileSize: draftFileSize,
      });
      onClose();
    } catch (error) {
      console.error('Failed to save recorded sound:', error);
      Alert.alert('Could not keep this clip', 'The recording exists, but I could not add it to your sound list yet.');
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <Modal
      animationType="slide"
      visible={visible}
      transparent
      onRequestClose={handleDismiss}
    >
      <Pressable style={styles.backdrop} onPress={handleDismiss}>
        <Pressable style={styles.sheet} onPress={(event) => event.stopPropagation()}>
          <LinearGradient
            colors={[Colors.surface_container_lowest, Colors.tertiary, Colors.surface_container_low]}
            style={styles.gradient}
          >
            <View style={styles.handle} />
            <Text style={styles.eyebrow}>SAKURA SOUND STUDIO</Text>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>
              Record a soft voice nudge with a wave that moves as you speak.
            </Text>

            <View style={styles.waveShell}>
              <LinearGradient
                colors={['#FFE7EF', '#FFF6F8', '#FEEEF4']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.waveGradient}
              >
                <View style={styles.waveRow}>
                  {waveValues.map((animatedHeight, index) => (
                    <Animated.View
                      key={`wave-${index}`}
                      style={[
                        styles.waveBar,
                        {
                          height: animatedHeight,
                          opacity: recorderState.isRecording ? 1 : 0.55,
                          transform: [{ translateY: index % 2 === 0 ? 4 : -4 }],
                        },
                      ]}
                    />
                  ))}
                </View>
                <Text style={styles.timerText}>
                  {formatDuration(recorderState.isRecording ? recorderState.durationMillis : draftDurationMs)}
                </Text>
              </LinearGradient>
            </View>

            <TextInput
              style={styles.nameInput}
              value={draftName}
              onChangeText={setDraftName}
              placeholder="Name this clip"
              placeholderTextColor={`${Colors.on_surface_variant}88`}
              maxLength={32}
            />

            <View style={styles.metaRow}>
              <View style={styles.metaPill}>
                <MaterialCommunityIcons name="microphone-outline" size={16} color={Colors.primary} />
                <Text style={styles.metaText}>Under 1 MB</Text>
              </View>
              <View style={styles.metaPill}>
                <MaterialCommunityIcons name="waves" size={16} color={Colors.primary} />
                <Text style={styles.metaText}>
                  {draftFileSize > 0 ? `${Math.max(1, Math.round(draftFileSize / 1024))} KB` : 'Voice-ready'}
                </Text>
              </View>
            </View>

            <View style={styles.actionRow}>
              <Pressable
                style={[styles.roundButton, styles.secondaryButton]}
                onPress={handleDismiss}
                disabled={isBusy}
              >
                <MaterialCommunityIcons name="close" size={24} color={Colors.on_surface} />
              </Pressable>

              <Pressable
                style={[styles.recordButton, recorderState.isRecording && styles.recordButtonActive]}
                onPress={recorderState.isRecording ? stopRecording : startRecording}
                disabled={isBusy}
              >
                <LinearGradient
                  colors={
                    recorderState.isRecording
                      ? [Colors.primary_fixed_variant, Colors.primary]
                      : [Colors.primary, '#F49AB6']
                  }
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.recordGradient}
                >
                  <MaterialCommunityIcons
                    name={recorderState.isRecording ? 'stop' : 'microphone'}
                    size={28}
                    color={Colors.on_primary}
                  />
                </LinearGradient>
              </Pressable>

              <Pressable
                style={[
                  styles.roundButton,
                  styles.saveButton,
                  !canSave && styles.roundButtonDisabled,
                ]}
                onPress={handleSave}
                disabled={!canSave}
              >
                <MaterialCommunityIcons name="content-save-outline" size={24} color={Colors.on_primary} />
              </Pressable>
            </View>

            <Text style={styles.helperText}>
              Tap the center bloom to {recorderState.isRecording ? 'stop' : 'start'} recording.
            </Text>
            {Platform.OS === 'ios' && (
              <Text style={styles.platformHint}>
                iPhone recordings stay in-app for now, and notification playback will use bundled theme sounds.
              </Text>
            )}
          </LinearGradient>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(31, 27, 27, 0.28)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    overflow: 'hidden',
    ...Elevation.high,
  },
  gradient: {
    paddingHorizontal: Spacing.generous,
    paddingTop: Spacing.cozy,
    paddingBottom: Spacing.large,
  },
  handle: {
    alignSelf: 'center',
    width: 64,
    height: 6,
    borderRadius: Radius.full,
    backgroundColor: `${Colors.primary}33`,
    marginBottom: Spacing.cozy,
  },
  eyebrow: {
    fontFamily: FontFamily.bold,
    fontSize: 12,
    letterSpacing: 1.5,
    color: Colors.primary,
    marginBottom: Spacing.compact,
  },
  title: {
    fontFamily: FontFamily.extraBold,
    fontSize: 30,
    lineHeight: 36,
    color: Colors.on_surface,
  },
  subtitle: {
    fontFamily: FontFamily.medium,
    fontSize: 16,
    lineHeight: 24,
    color: Colors.on_surface_variant,
    marginTop: Spacing.compact,
  },
  waveShell: {
    marginTop: Spacing.breathe,
    borderRadius: Radius.xl,
    overflow: 'hidden',
    ...Elevation.medium,
  },
  waveGradient: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.generous,
    paddingVertical: Spacing.large,
  },
  waveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minHeight: 100,
  },
  waveBar: {
    width: 10,
    borderRadius: Radius.full,
    backgroundColor: Colors.primary,
  },
  timerText: {
    fontFamily: FontFamily.bold,
    fontSize: 22,
    color: Colors.primary_fixed_variant,
    marginTop: Spacing.cozy,
  },
  nameInput: {
    backgroundColor: Colors.surface_container_lowest,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.generous,
    paddingVertical: Spacing.cozy,
    minHeight: TapTargets.minHeight,
    marginTop: Spacing.breathe,
    color: Colors.on_surface,
    fontFamily: FontFamily.medium,
    fontSize: 17,
  },
  metaRow: {
    flexDirection: 'row',
    gap: Spacing.item,
    marginTop: Spacing.cozy,
  },
  metaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.surface_container,
    borderRadius: Radius.full,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  metaText: {
    fontFamily: FontFamily.bold,
    fontSize: 13,
    color: Colors.on_surface_variant,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.item,
    marginTop: Spacing.breathe,
  },
  roundButton: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButton: {
    backgroundColor: Colors.surface_container_lowest,
  },
  saveButton: {
    backgroundColor: Colors.primary,
  },
  roundButtonDisabled: {
    opacity: 0.35,
  },
  recordButton: {
    width: 88,
    height: 88,
    borderRadius: 44,
    overflow: 'hidden',
    ...Elevation.high,
  },
  recordButtonActive: {
    transform: [{ scale: 1.03 }],
  },
  recordGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  helperText: {
    fontFamily: FontFamily.medium,
    fontSize: 14,
    color: Colors.on_surface_variant,
    textAlign: 'center',
    marginTop: Spacing.cozy,
  },
  platformHint: {
    fontFamily: FontFamily.medium,
    fontSize: 12,
    lineHeight: 18,
    color: Colors.on_surface_variant,
    opacity: 0.7,
    textAlign: 'center',
    marginTop: Spacing.compact,
  },
});
