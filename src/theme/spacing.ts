/**
 * Rewind — Spacing Scale
 * 
 * "This system is not a grid to be filled; it is a canvas to be composed."
 * The spacing scale is generous to maintain the "unhurried" feel.
 */

export const Spacing = {
  /** 4px — Hairline spacing for grouped inline elements */
  hair: 4,

  /** 8px — Compact: grouping related labels */
  compact: 8,

  /** 12px — Between list items (no dividers, use gaps instead) */
  item: 12,

  /** 16px — Cozy: internal card padding */
  cozy: 16,

  /** 20px — Comfortable spacing between sections within a card */
  comfortable: 20,

  /** 24px — Generous internal padding (min for cards per "Forgiveness Rule") */
  generous: 24,

  /** 32px — Breathe: section spacing */
  breathe: 32,

  /** 48px — Large separation between major content sections */
  large: 48,

  /** 64px — Solitude: top-of-page margins and hero transitions */
  solitude: 64,
} as const;

/**
 * Roundedness scale for border radii.
 * "Don't use sharp 90-degree corners."
 */
export const Radius = {
  /** 8px — Minimum softness (sm) */
  sm: 8,

  /** 16px — Standard interactive elements */
  md: 16,

  /** 24px — Standard for cards (lg) */
  lg: 24,

  /** 32px — Primary containers, organic shapes (xl) */
  xl: 32,

  /** 48px — Extra-large organic shapes (2xl) */
  xxl: 48,

  /** 9999px — Full pill shape */
  full: 9999,
} as const;

/**
 * Minimum interactive element dimensions per accessibility spec.
 */
export const TapTargets = {
  /** 56px — Minimum height for all interactive elements */
  minHeight: 56,

  /** 64px — Primary button height (exceeds 56px requirement) */
  primaryButton: 64,
} as const;
