// ============================================
// Sahaara Design Tokens — Centralized
// ============================================

export const tokens = {
  colors: {
    // Brand
    primary: '#6BA7D7', // sky blue
    primaryLight: '#A7C8E6',
    primaryDark: '#437FB9',
    primaryFaded: 'rgba(107,167,215,0.12)',

    accent: '#93C572', // pistachio green
    accentLight: '#B5D89E',
    accentDark: '#6DA34D',
    accentFaded: 'rgba(147,197,114,0.12)',

    // Backgrounds (warm beige base)
    background: '#FAF9F6',
    surface: '#FFFFFF',
    surfaceElevated: '#F5F3F0',
    surfacePressed: '#EDEBE7',

    // Text
    text: '#2D3142',
    textSecondary: '#6B7280',
    textTertiary: '#9CA3AF',
    textInverse: '#FFFFFF',

    // Borders
    border: '#E8E6E1',
    borderLight: '#F0EEEA',
    borderFocus: '#6BA7D7',

    // Semantic
    success: '#4CAF50',
    warning: '#FF9800',
    error: '#EF5350',

    // Utility
    white: '#FFFFFF',
    black: '#1A1A1A',
    overlay: 'rgba(0,0,0,0.45)',
    transparent: 'transparent',

    // Calendar accents
    calendarToday: '#6BA7D7',
    calendarSelected: '#437FB9',
    calendarDot: '#93C572',
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    base: 16,
    lg: 20,
    xl: 24,
    '2xl': 32,
    '3xl': 40,
    '4xl': 48,
    '5xl': 64,
  },

  radius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    '2xl': 24,
    full: 9999,
  },

  iconSize: {
    sm: 18,
    md: 22,
    lg: 26,
    xl: 32,
    '2xl': 40,
  },

  touch: {
    min: 48,
    comfortable: 56,
  },

  shadow: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 3,
      elevation: 1,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 3,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 16,
      elevation: 6,
    },
  },

  typography: {
    fontFamily: {
      regular: 'Inter_400Regular',
      medium: 'Inter_500Medium',
      semiBold: 'Inter_600SemiBold',
      bold: 'Inter_700Bold',
    },
    fontSize: {
      xs: 12,
      sm: 14,
      base: 16,
      md: 17,
      lg: 18,
      xl: 20,
      '2xl': 24,
      '3xl': 28,
      '4xl': 32,
      '5xl': 40,
    },
    lineHeight: {
      xs: 16,
      sm: 20,
      base: 24,
      md: 26,
      lg: 28,
      xl: 30,
      '2xl': 32,
      '3xl': 36,
      '4xl': 40,
      '5xl': 48,
    },
    letterSpacing: {
      tight: -0.5,
      normal: 0,
      wide: 0.3,
      wider: 0.5,
    },
  },
} as const;

export type Tokens = typeof tokens;
