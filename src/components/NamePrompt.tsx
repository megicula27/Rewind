/**
 * Rewind — NamePrompt
 * 
 * First-launch name prompt with smooth fade-in/fade-out transition.
 * Warm, welcoming copy. Large input field. Cherry Blossom styled.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../theme/colors';
import { FontFamily, Typography } from '../theme/typography';
import { Spacing, Radius, TapTargets } from '../theme/spacing';

interface NamePromptProps {
  onSubmit: (name: string) => void;
}

export default function NamePrompt({ onSubmit }: NamePromptProps) {
  const [name, setName] = useState('');
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withTiming(1, { 
      duration: 600, 
      easing: Easing.bezier(0.4, 0, 0.2, 1) 
    });
  }, []);

  const handleSubmit = () => {
    if (name.trim().length > 0) {
      opacity.value = withTiming(0, { 
        duration: 400, 
        easing: Easing.bezier(0.4, 0, 0.2, 1) 
      });
      // Delay the callback to let the fade-out complete
      setTimeout(() => onSubmit(name.trim()), 450);
    }
  };

  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.container, containerStyle]}>
      <LinearGradient
        colors={[Colors.surface, Colors.tertiary, Colors.primary_container]}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFill}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          <Text style={styles.blossom}>🌸</Text>
          <Text style={styles.title}>Welcome to Rewind</Text>
          <Text style={styles.subtitle}>
            A gentle place for your daily reminders.{'\n'}
            What should we call you?
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Your name"
            placeholderTextColor={Colors.outline}
            value={name}
            onChangeText={setName}
            autoFocus
            maxLength={24}
            returnKeyType="done"
            onSubmitEditing={handleSubmit}
            accessibilityLabel="Enter your name"
          />

          <TouchableOpacity
            style={[
              styles.button,
              name.trim().length === 0 && styles.buttonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={name.trim().length === 0}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Continue"
          >
            <LinearGradient
              colors={[Colors.primary, Colors.primary_fixed_variant]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.buttonGradient}
            >
              <Text style={styles.buttonText}>Let's bloom together 🌷</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
  },
  keyboardView: {
    flex: 1,
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: Spacing.breathe,
    alignItems: 'center',
  },
  blossom: {
    fontSize: 64,
    marginBottom: Spacing.generous,
  },
  title: {
    fontFamily: FontFamily.bold,
    fontSize: 32,
    color: Colors.on_surface,
    textAlign: 'center',
    marginBottom: Spacing.compact,
    letterSpacing: 0.3,
  },
  subtitle: {
    fontFamily: FontFamily.regular,
    fontSize: 18,
    color: Colors.on_surface_variant,
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: Spacing.breathe,
  },
  input: {
    width: '100%',
    height: TapTargets.minHeight,
    backgroundColor: Colors.surface_container_highest,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.generous,
    fontFamily: FontFamily.medium,
    fontSize: 18,
    color: Colors.on_surface,
    marginBottom: Spacing.generous,
    textAlign: 'center',
  },
  button: {
    width: '100%',
    borderRadius: Radius.full,
    overflow: 'hidden',
    ...({ elevation: 2 }),
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonGradient: {
    height: TapTargets.primaryButton,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.breathe,
  },
  buttonText: {
    fontFamily: FontFamily.bold,
    fontSize: 18,
    color: Colors.on_primary,
    letterSpacing: 0.2,
  },
});
