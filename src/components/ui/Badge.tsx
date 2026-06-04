// ============================================
// Sahaara UI — Badge Component
// ============================================

import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Text } from './Text';
import { colors } from '../../theme/colors';
import { borderRadius, spacing } from '../../theme/spacing';

type BadgeVariant = 'primary' | 'accent' | 'success' | 'warning' | 'error' | 'neutral';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  style?: ViewStyle;
}

const variantColors: Record<BadgeVariant, { bg: string; text: string }> = {
  primary: { bg: colors.primaryFaded, text: colors.primaryDark },
  accent: { bg: colors.accentFaded, text: colors.accentDark },
  success: { bg: colors.successLight, text: colors.success },
  warning: { bg: colors.warningLight, text: colors.warning },
  error: { bg: colors.errorLight, text: colors.error },
  neutral: { bg: colors.surfaceElevated, text: colors.textSecondary },
};

export function Badge({ label, variant = 'primary', style }: BadgeProps) {
  const c = variantColors[variant];

  return (
    <View style={[styles.badge, { backgroundColor: c.bg }, style]}>
      <Text variant="captionMedium" color={c.text}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
  },
});
