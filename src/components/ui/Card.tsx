// ============================================
// Sahaara UI — Card Component
// ============================================

import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { colors } from '../../theme/colors';
import { borderRadius, spacing, shadow } from '../../theme/spacing';

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  style?: ViewStyle;
}

const paddingMap = {
  none: 0,
  sm: spacing.md,
  md: spacing.base,
  lg: spacing.xl,
};

export function Card({
  children,
  onPress,
  variant = 'default',
  padding = 'md',
  style,
}: CardProps) {
  const cardStyle: ViewStyle[] = [
    styles.base,
    { padding: paddingMap[padding] },
    variant === 'elevated' && { ...shadow.md },
    variant === 'outlined' && styles.outlined,
    variant === 'default' && { ...shadow.sm },
    style as ViewStyle,
  ].filter(Boolean) as ViewStyle[];

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        style={cardStyle}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={cardStyle}>{children}</View>;
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius['2xl'],
    overflow: 'hidden',
  },
  outlined: {
    borderWidth: 1,
    borderColor: colors.border,
  },
});
