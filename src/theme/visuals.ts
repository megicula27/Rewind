import { MaterialCommunityIcons } from '@expo/vector-icons';

import type { ThemeName } from './colors';

export type ThemeIconName = keyof typeof MaterialCommunityIcons.glyphMap;

type ThemeVisualSet = {
  home: {
    emptyIcon: ThemeIconName;
    focusIcon: ThemeIconName;
    backgroundTop: ThemeIconName;
    backgroundBottom: ThemeIconName;
  };
  add: {
    headerIcon: ThemeIconName;
    backgroundTop: ThemeIconName;
    backgroundBottom: ThemeIconName;
    soundHeroIcon: ThemeIconName;
    soundHeroTitle: string;
  };
  points: {
    jarTopIcon: ThemeIconName;
    jarMiddleIcon: ThemeIconName;
    jarBottomIcon: ThemeIconName;
    streakIcons: ThemeIconName[];
    unlockNoun: string;
    backgroundTop: ThemeIconName;
    backgroundBottom: ThemeIconName;
  };
  completion: {
    chipIcon: ThemeIconName;
    chipLabel: string;
    sparkleTop: ThemeIconName;
    sparkleBottom: ThemeIconName;
    reflectionPrimary: ThemeIconName;
    reflectionSecondary: ThemeIconName;
  };
  hydration: {
    idleIcon: ThemeIconName;
    activeIcon: ThemeIconName;
  };
  profile: {
    headerIcon: ThemeIconName;
  };
};

export const ThemeVisuals: Record<ThemeName, ThemeVisualSet> = {
  cherry_blossom: {
    home: {
      emptyIcon: 'sprout',
      focusIcon: 'flower-poppy',
      backgroundTop: 'flower-tulip-outline',
      backgroundBottom: 'leaf',
    },
    add: {
      headerIcon: 'flower-tulip-outline',
      backgroundTop: 'flower-poppy',
      backgroundBottom: 'leaf',
      soundHeroIcon: 'flower-pollen-outline',
      soundHeroTitle: 'Your sound garden listens softly.',
    },
    points: {
      jarTopIcon: 'flower-pollen',
      jarMiddleIcon: 'leaf',
      jarBottomIcon: 'heart',
      streakIcons: ['flower-poppy', 'leaf'],
      unlockNoun: 'petal',
      backgroundTop: 'flower-pollen-outline',
      backgroundBottom: 'leaf',
    },
    completion: {
      chipIcon: 'sprout',
      chipLabel: 'Garden Grew!',
      sparkleTop: 'star-four-points',
      sparkleBottom: 'flower-poppy',
      reflectionPrimary: 'leaf',
      reflectionSecondary: 'heart',
    },
    hydration: {
      idleIcon: 'water-outline',
      activeIcon: 'water',
    },
    profile: {
      headerIcon: 'flower-tulip-outline',
    },
  },
  aquatic_serenity: {
    home: {
      emptyIcon: 'fish',
      focusIcon: 'fish',
      backgroundTop: 'waves',
      backgroundBottom: 'fish',
    },
    add: {
      headerIcon: 'waves',
      backgroundTop: 'fish',
      backgroundBottom: 'waves',
      soundHeroIcon: 'fish',
      soundHeroTitle: 'Your tide of reminders listens softly.',
    },
    points: {
      jarTopIcon: 'water',
      jarMiddleIcon: 'waves',
      jarBottomIcon: 'fish',
      streakIcons: ['water', 'waves'],
      unlockNoun: 'drop',
      backgroundTop: 'waves',
      backgroundBottom: 'fish',
    },
    completion: {
      chipIcon: 'waves',
      chipLabel: 'Current Rising!',
      sparkleTop: 'fish',
      sparkleBottom: 'star-four-points',
      reflectionPrimary: 'fish',
      reflectionSecondary: 'waves',
    },
    hydration: {
      idleIcon: 'water-outline',
      activeIcon: 'water',
    },
    profile: {
      headerIcon: 'waves',
    },
  },
  jungle_deep: {
    home: {
      emptyIcon: 'leaf',
      focusIcon: 'leaf',
      backgroundTop: 'pine-tree',
      backgroundBottom: 'leaf',
    },
    add: {
      headerIcon: 'pine-tree',
      backgroundTop: 'leaf',
      backgroundBottom: 'pine-tree',
      soundHeroIcon: 'leaf',
      soundHeroTitle: 'Your sound canopy listens softly.',
    },
    points: {
      jarTopIcon: 'leaf',
      jarMiddleIcon: 'pine-tree',
      jarBottomIcon: 'sprout',
      streakIcons: ['leaf', 'pine-tree'],
      unlockNoun: 'seed',
      backgroundTop: 'pine-tree',
      backgroundBottom: 'leaf',
    },
    completion: {
      chipIcon: 'leaf',
      chipLabel: 'Task Planted!',
      sparkleTop: 'leaf',
      sparkleBottom: 'pine-tree',
      reflectionPrimary: 'pine-tree',
      reflectionSecondary: 'leaf',
    },
    hydration: {
      idleIcon: 'leaf',
      activeIcon: 'leaf',
    },
    profile: {
      headerIcon: 'pine-tree',
    },
  },
  golden_sun: {
    home: {
      emptyIcon: 'white-balance-sunny',
      focusIcon: 'white-balance-sunny',
      backgroundTop: 'flower-pollen-outline',
      backgroundBottom: 'flower-outline',
    },
    add: {
      headerIcon: 'white-balance-sunny',
      backgroundTop: 'flower-pollen-outline',
      backgroundBottom: 'flower-outline',
      soundHeroIcon: 'flower-pollen-outline',
      soundHeroTitle: "You're doing great.",
    },
    points: {
      jarTopIcon: 'white-balance-sunny',
      jarMiddleIcon: 'flower-pollen-outline',
      jarBottomIcon: 'white-balance-sunny',
      streakIcons: ['flower-pollen-outline', 'white-balance-sunny'],
      unlockNoun: 'petal',
      backgroundTop: 'flower-pollen-outline',
      backgroundBottom: 'flower-outline',
    },
    completion: {
      chipIcon: 'star-circle',
      chipLabel: 'Every petal counts.',
      sparkleTop: 'flower-pollen-outline',
      sparkleBottom: 'circle-medium',
      reflectionPrimary: 'flower-pollen-outline',
      reflectionSecondary: 'format-quote-close',
    },
    hydration: {
      idleIcon: 'water-outline',
      activeIcon: 'water',
    },
    profile: {
      headerIcon: 'white-balance-sunny',
    },
  },
};

export function getThemeVisuals(themeName: ThemeName): ThemeVisualSet {
  return ThemeVisuals[themeName] ?? ThemeVisuals.cherry_blossom;
}
