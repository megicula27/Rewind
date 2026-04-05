/**
 * Rewind — Modal Screen (placeholder for future use)
 */

import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/src/theme/colors';
import { FontFamily } from '@/src/theme/typography';
import { Spacing, Radius } from '@/src/theme/spacing';

export default function ModalScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🌸</Text>
      <Text style={styles.subtitle}>Modal</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => router.back()}
        activeOpacity={0.7}
      >
        <Text style={styles.buttonText}>Go back</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    padding: Spacing.breathe,
  },
  title: {
    fontSize: 48,
    marginBottom: Spacing.cozy,
  },
  subtitle: {
    fontFamily: FontFamily.bold,
    fontSize: 24,
    color: Colors.on_surface,
    marginBottom: Spacing.generous,
  },
  button: {
    paddingHorizontal: Spacing.breathe,
    paddingVertical: Spacing.cozy,
    backgroundColor: Colors.primary_container,
    borderRadius: Radius.full,
  },
  buttonText: {
    fontFamily: FontFamily.semiBold,
    fontSize: 16,
    color: Colors.primary,
  },
});
