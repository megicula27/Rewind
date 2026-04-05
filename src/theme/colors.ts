/**
 * Rewind — Cherry Blossom Color Palette
 * 
 * Based on the "Digital Keepsake" design system.
 * Surface hierarchy follows hand-laid paper stacking:
 *   surface (base desk) → surface_container_low → surface_container → surface_container_high
 * 
 * The "No-Line" Rule: Boundaries are defined through background color shifts, never 1px borders.
 */

export const CherryBlossom = {
  // ── Primary ────────────────────────────────────────────
  primary:                  '#D87093',   // Warm cherry-rose — actions, CTAs
  primary_container:        '#FFBCCF',   // Soft blush — high-visibility containers
  primary_fixed:            '#FFD9E2',   // Lighter fixed variant
  primary_fixed_variant:    '#C25A7C',   // Deeper cherry for gradient endpoints
  on_primary:               '#FFFFFF',   // Text on primary
  on_primary_container:     '#3E0021',   // Dark text on primary container

  // ── Secondary ──────────────────────────────────────────
  secondary:                '#9B6B6B',   // Dusty rose-brown
  secondary_container:      '#FFDAD6',   // Warm pink container
  on_secondary:             '#FFFFFF',   // Text on secondary
  on_secondary_container:   '#3B0B0B',   // Dark text on secondary container

  // ── Tertiary ───────────────────────────────────────────
  tertiary:                 '#FFF5F5',   // Whisper pink — background wash
  on_tertiary:              '#5D5757',   // Muted text on tertiary

  // ── Neutral ────────────────────────────────────────────
  neutral:                  '#5D5757',   // Warm charcoal

  // ── Surface Hierarchy ("Stacked Paper") ────────────────
  surface:                  '#FFF8F6',   // Base desk — warmest off-white
  surface_container_lowest: '#FFFFFF',   // Purest white for raised cards
  surface_container_low:    '#FFF1ED',   // Secondary content areas
  surface_container:        '#FFE9E4',   // Mid-level containers
  surface_container_high:   '#FFDDD5',   // Prominent interactive areas
  surface_container_highest:'#FFD0C6',   // Most elevated containers

  // ── On-Surface ─────────────────────────────────────────
  on_surface:               '#1F1B1B',   // Near-black for body text
  on_surface_variant:       '#524343',   // Muted/secondary text

  // ── Outline ────────────────────────────────────────────
  outline:                  '#857373',   // De-emphasized borders (if needed)
  outline_variant:          '#D8C2BF',   // Ghost borders at 20% opacity

  // ── Status ─────────────────────────────────────────────
  success:                  '#4CAF50',   // Completion checkmark green
  success_soft:             '#E8F5E9',   // Success background wash

  // ── Error ──────────────────────────────────────────────
  error:                    '#BA1A1A',
  error_container:          '#FFDAD6',
  on_error:                 '#FFFFFF',
  on_error_container:       '#410002',
} as const;

/**
 * Active theme — for now always Cherry Blossom.
 * Future themes (Sky/Ocean, Jungle, Golden Sun) will follow this same shape.
 */
export type ThemeColors = typeof CherryBlossom;
export const Colors = CherryBlossom;
