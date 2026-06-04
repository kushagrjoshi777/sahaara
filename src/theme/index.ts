// ============================================
// Sahaara Design System — Unified Theme Export
// ============================================

export { colors } from './colors';
export type { ColorKey } from './colors';
export { fontFamily, fontSize, lineHeight, letterSpacing, textStyles } from './typography';
export { spacing, borderRadius, iconSize, touchTarget, shadow } from './spacing';

// Convenience combined theme object
import { colors } from './colors';
import { fontFamily, fontSize, lineHeight, textStyles } from './typography';
import { spacing, borderRadius, iconSize, touchTarget, shadow } from './spacing';

export const theme = {
  colors,
  fontFamily,
  fontSize,
  lineHeight,
  textStyles,
  spacing,
  borderRadius,
  iconSize,
  touchTarget,
  shadow,
} as const;

export default theme;
