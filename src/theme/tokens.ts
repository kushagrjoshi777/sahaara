// ============================================
// Sahaara Design Tokens — Centralized
// ============================================

export const tokens = {
  colors: {
    // Brand
    primary: '#6BA7D8',
    primaryLight: '#A8D0F0',
    primaryDark: '#4F8CC0',
    primaryFaded: 'rgba(107,167,216,0.14)',

    accent: '#7BBE8A',
    accentLight: '#A7D5A8',
    accentDark: '#5E9A66',
    accentFaded: 'rgba(123,190,138,0.12)',

    // Backgrounds
    background: '#F7F3ED',
    surface: '#FFFFFF',
    surfaceElevated: '#F3EEE6',
    surfacePressed: '#E8E4DD',

    // Text
    text: '#2E3A45',
    textSecondary: '#5B6A78',
    textTertiary: '#8A97A6',
    textInverse: '#FFFFFF',

    // Borders
    border: '#D9D7CF',
    borderLight: '#E6E2D8',
    borderFocus: '#6BA7D8',

    // Semantic
    success: '#7BBE8A',
    successLight: 'rgba(123,190,138,0.10)',
    warning: '#E3A15F',
    warningLight: 'rgba(227,161,95,0.10)',
    error: '#E57373',
    errorLight: 'rgba(229,115,115,0.10)',

    // Utility
    white: '#FFFFFF',
    black: '#1A1A1A',
    overlay: 'rgba(0,0,0,0.40)',
    transparent: 'transparent',

    // Calendar accents
    calendarToday: '#6BA7D8',
    calendarSelected: '#4F8CC0',
    calendarDot: '#7BBE8A',
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
