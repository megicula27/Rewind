/**
 * Rewind — Typography Scale
 * 
 * Uses Plus Jakarta Sans for its round, friendly terminals.
 * Hierarchy is intentionally oversized: "unhurried and accessible."
 * 
 * Rules:
 * - Never drop below body_lg (16px) for user content
 * - Increase letter spacing on headlines for calm breathing room
 * - Use title_md (18px) for standard body copy ("letter" feel)
 */

import { TextStyle } from 'react-native';

export const FontFamily = {
  regular:    'PlusJakartaSans_400Regular',
  medium:     'PlusJakartaSans_500Medium',
  semiBold:   'PlusJakartaSans_600SemiBold',
  bold:       'PlusJakartaSans_700Bold',
  extraBold:  'PlusJakartaSans_800ExtraBold',
} as const;

/**
 * Typography scale — all sizes in pixels.
 * Letter spacing in pixels (RN doesn't use rem).
 */
export const Typography: Record<string, TextStyle> = {
  // ── Display ────────────────────────────────────────
  display_lg: {
    fontFamily: FontFamily.bold,
    fontSize: 48,
    lineHeight: 56,
    letterSpacing: 0.5,
  },
  display_md: {
    fontFamily: FontFamily.bold,
    fontSize: 44,       // 2.75rem equivalent
    lineHeight: 52,
    letterSpacing: 0.4,
  },
  display_sm: {
    fontFamily: FontFamily.semiBold,
    fontSize: 36,
    lineHeight: 44,
    letterSpacing: 0.3,
  },

  // ── Headline ───────────────────────────────────────
  headline_lg: {
    fontFamily: FontFamily.bold,
    fontSize: 32,       // 2rem equivalent
    lineHeight: 40,
    letterSpacing: 0.3,
  },
  headline_md: {
    fontFamily: FontFamily.semiBold,
    fontSize: 28,
    lineHeight: 36,
    letterSpacing: 0.2,
  },
  headline_sm: {
    fontFamily: FontFamily.semiBold,
    fontSize: 24,       // Min heading size per spec
    lineHeight: 32,
    letterSpacing: 0.2,
  },

  // ── Title ──────────────────────────────────────────
  title_lg: {
    fontFamily: FontFamily.semiBold,
    fontSize: 22,
    lineHeight: 28,
    letterSpacing: 0.1,
  },
  title_md: {
    fontFamily: FontFamily.medium,
    fontSize: 18,       // Standard body copy ("letter" feel)
    lineHeight: 26,
    letterSpacing: 0.15,
  },
  title_sm: {
    fontFamily: FontFamily.medium,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.1,
  },

  // ── Body ───────────────────────────────────────────
  body_lg: {
    fontFamily: FontFamily.regular,
    fontSize: 16,       // Minimum for user content
    lineHeight: 24,
    letterSpacing: 0.15,
  },
  body_md: {
    fontFamily: FontFamily.regular,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.1,
  },
  body_sm: {
    fontFamily: FontFamily.regular,
    fontSize: 12,       // Only for least important labels
    lineHeight: 16,
    letterSpacing: 0.1,
  },

  // ── Label ──────────────────────────────────────────
  label_lg: {
    fontFamily: FontFamily.medium,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.1,
  },
  label_md: {
    fontFamily: FontFamily.medium,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.1,
  },
  label_sm: {
    fontFamily: FontFamily.medium,
    fontSize: 11,
    lineHeight: 16,
    letterSpacing: 0.05,
  },
} as const;
