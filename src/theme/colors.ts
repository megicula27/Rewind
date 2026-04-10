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

export const AquaticSerenity = {
  primary:                  '#475D82',
  primary_container:        '#C7D8F1',
  primary_fixed:            '#D9E7FA',
  primary_fixed_variant:    '#3D5478',
  on_primary:               '#FFFFFF',
  on_primary_container:     '#11243D',

  secondary:                '#2B6485',
  secondary_container:      '#C8EAF7',
  on_secondary:             '#FFFFFF',
  on_secondary_container:   '#0B2B3C',

  tertiary:                 '#A8DADC',
  on_tertiary:              '#244C56',

  neutral:                  '#4E5A57',

  surface:                  '#F3FCF0',
  surface_container_lowest: '#FCFFFB',
  surface_container_low:    '#EDF6EA',
  surface_container:        '#E5EFE3',
  surface_container_high:   '#DCE5D9',
  surface_container_highest:'#D2DDD1',

  on_surface:               '#161D16',
  on_surface_variant:       '#5A6A63',

  outline:                  '#8FA3A7',
  outline_variant:          '#C1C7CE',

  success:                  '#4F8C7A',
  success_soft:             '#DCEFE8',

  error:                    '#B3261E',
  error_container:          '#F9DEDC',
  on_error:                 '#FFFFFF',
  on_error_container:       '#410E0B',
} as const;

export const JungleDeep = {
  primary:                  '#556B2F',
  primary_container:        '#D7E7B3',
  primary_fixed:            '#EEF5D8',
  primary_fixed_variant:    '#3E5219',
  on_primary:               '#FFFFFF',
  on_primary_container:     '#233007',

  secondary:                '#8B4513',
  secondary_container:      '#FFD9C2',
  on_secondary:             '#FFFFFF',
  on_secondary_container:   '#3D1A05',

  tertiary:                 '#A9BA9D',
  on_tertiary:              '#34422B',

  neutral:                  '#5F5D3C',

  surface:                  '#F5F5DC',
  surface_container_lowest: '#FCFCEE',
  surface_container_low:    '#F2F1D7',
  surface_container:        '#ECEACD',
  surface_container_high:   '#E4E4CC',
  surface_container_highest:'#D7D9BF',

  on_surface:               '#1B1D0E',
  on_surface_variant:       '#5D614D',

  outline:                  '#9AA184',
  outline_variant:          '#C5C8B8',

  success:                  '#556B2F',
  success_soft:             '#E2EAD3',

  error:                    '#BA1A1A',
  error_container:          '#FFDAD6',
  on_error:                 '#FFFFFF',
  on_error_container:       '#410002',
} as const;

export const GoldenSun = {
  primary:                  '#904800',
  primary_container:        '#F1C40F',
  primary_fixed:            '#FFF2BF',
  primary_fixed_variant:    '#904800',
  on_primary:               '#FFF0E8',
  on_primary_container:     '#594700',

  secondary:                '#6F5900',
  secondary_container:      '#FED023',
  on_secondary:             '#FFF9E6',
  on_secondary_container:   '#594700',

  tertiary:                 '#FFCC80',
  on_tertiary:              '#7A4A00',

  neutral:                  '#7A684C',

  surface:                  '#FCF6E3',
  surface_container_lowest: '#FFFFFF',
  surface_container_low:    '#F7F1DC',
  surface_container:        '#F2EAD1',
  surface_container_high:   '#EAE1C5',
  surface_container_highest:'#DFD5B7',

  on_surface:               '#312F23',
  on_surface_variant:       '#7E7056',

  outline:                  '#A28D6E',
  outline_variant:          '#B2AD9C',

  success:                  '#B18E00',
  success_soft:             '#FFF3B8',

  error:                    '#BA1A1A',
  error_container:          '#FFDAD6',
  on_error:                 '#FFFFFF',
  on_error_container:       '#410002',
} as const;

/**
 * Active theme — for now always Cherry Blossom.
 * Future themes (Sky/Ocean, Jungle, Golden Sun) will follow this same shape.
 */
export type ThemeColors = {
  [Key in keyof typeof CherryBlossom]: string;
};
export type ThemeName = 'cherry_blossom' | 'aquatic_serenity' | 'jungle_deep' | 'golden_sun';

export const DEFAULT_THEME_NAME: ThemeName = 'aquatic_serenity';

export const ThemePalettes: Record<ThemeName, ThemeColors> = {
  cherry_blossom: CherryBlossom,
  aquatic_serenity: AquaticSerenity,
  jungle_deep: JungleDeep,
  golden_sun: GoldenSun,
};

export function isThemeName(value: string | null | undefined): value is ThemeName {
  return (
    value === 'cherry_blossom' ||
    value === 'aquatic_serenity' ||
    value === 'jungle_deep' ||
    value === 'golden_sun'
  );
}

export function getThemeColors(themeName: ThemeName | string): ThemeColors {
  return ThemePalettes[(themeName as ThemeName) ?? DEFAULT_THEME_NAME] ?? ThemePalettes[DEFAULT_THEME_NAME];
}

export const Colors: ThemeColors = CherryBlossom;
