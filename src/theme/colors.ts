// ============================================
// Sahaara Design System — Colors
// ============================================

export const colors = {
  // Primary brand palette
  primary: 'rgb(107, 167, 215)',
  primaryLight: 'rgb(167, 200, 230)',
  primaryDark: 'rgb(67, 127, 185)',
  primaryFaded: 'rgba(107, 167, 215, 0.12)',

  // Accent
  accent: '#93C572',
  accentLight: '#B5D89E',
  accentDark: '#6DA34D',
  accentFaded: 'rgba(147, 197, 114, 0.12)',

  // Backgrounds
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
  borderFocus: 'rgb(107, 167, 215)',

  // Semantic
  success: '#4CAF50',
  successLight: 'rgba(76, 175, 80, 0.12)',
  warning: '#FF9800',
  warningLight: 'rgba(255, 152, 0, 0.12)',
  error: '#EF5350',
  errorLight: 'rgba(239, 83, 80, 0.12)',
  info: 'rgb(107, 167, 215)',
  infoLight: 'rgba(107, 167, 215, 0.12)',

  // Utility
  white: '#FFFFFF',
  black: '#1A1A1A',
  overlay: 'rgba(0, 0, 0, 0.45)',
  transparent: 'transparent',

  // Calendar
  calendarToday: 'rgb(107, 167, 215)',
  calendarSelected: 'rgb(67, 127, 185)',
  calendarDot: '#93C572',
} as const;

export type ColorKey = keyof typeof colors;
