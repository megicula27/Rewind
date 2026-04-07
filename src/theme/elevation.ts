/**
 * Rewind — Elevation & Depth Tokens
 * 
 * "Depth is a feeling, not a technical shadow."
 * Shadows use on_surface color (#1F1B1B) rather than pure black
 * for natural ambient occlusion.
 */

import { Platform, ViewStyle } from 'react-native';
import { Colors } from './colors';

function webBoxShadow(value: string): ViewStyle {
  return Platform.OS === 'web' ? ({ boxShadow: value } as ViewStyle) : {};
}

/**
 * Ambient shadow styles — extra-diffused for the organic feel.
 * Use sparingly; prefer tonal layering (surface hierarchy) for depth.
 */
export const Elevation: Record<string, ViewStyle> = {
  /** No shadow — flat on surface */
  none: Platform.OS === 'web'
    ? webBoxShadow('none')
    : {
        shadowColor: 'transparent',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0,
        shadowRadius: 0,
        elevation: 0,
      },

  /** Subtle lift — for cards resting on surface */
  low: Platform.OS === 'web'
    ? webBoxShadow('0px 2px 16px rgba(31, 27, 27, 0.04)')
    : {
        shadowColor: Colors.on_surface,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 16,
        elevation: 1,
      },

  /** Medium lift — interactive cards, pressed states */
  medium: Platform.OS === 'web'
    ? webBoxShadow('0px 4px 24px rgba(31, 27, 27, 0.05)')
    : {
        shadowColor: Colors.on_surface,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 24,
        elevation: 2,
      },

  /** High lift — floating elements like FABs */
  high: Platform.OS === 'web'
    ? webBoxShadow('0px 8px 32px rgba(31, 27, 27, 0.06)')
    : {
        shadowColor: Colors.on_surface,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.06,
        shadowRadius: 32,
        elevation: 4,
      },
} as const;

/**
 * Ghost border style — only when a border is required for high-contrast accessibility.
 * Uses outline_variant at 20% opacity. 100% opaque borders are strictly prohibited.
 */
export const GhostBorder: ViewStyle = {
  borderWidth: 1,
  borderColor: `${Colors.outline_variant}33`, // 20% opacity
};
