// ============================================
// Sahaara UI — Button Component
// ============================================

import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Text } from './Text';
import { colors } from '../../theme/colors';
import { borderRadius, spacing, touchTarget } from '../../theme/spacing';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  style?: ViewStyle;
}

const variantStyles: Record<ButtonVariant, { bg: string; text: string; border: string }> = {
  primary: { bg: colors.primary, text: colors.white, border: colors.primary },
  secondary: { bg: colors.primaryDark, text: colors.white, border: colors.primaryDark },
  outline: { bg: colors.transparent, text: colors.primary, border: colors.primary },
  ghost: { bg: colors.transparent, text: colors.primary, border: colors.transparent },
  danger: { bg: colors.error, text: colors.white, border: colors.error },
};

const sizeStyles: Record<ButtonSize, { height: number; px: number; textVariant: 'button' | 'buttonSmall' }> = {
  sm: { height: 44, px: spacing.base, textVariant: 'buttonSmall' },
  md: { height: touchTarget.min, px: spacing.xl, textVariant: 'button' },
  lg: { height: touchTarget.comfortable, px: spacing['2xl'], textVariant: 'button' },
};

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  style,
}: ButtonProps) {
  const v = variantStyles[variant];
  const s = sizeStyles[size];
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.75}
      style={[
        styles.base,
        {
          backgroundColor: v.bg,
          borderColor: v.border,
          height: s.height,
          paddingHorizontal: s.px,
          opacity: isDisabled ? 0.5 : 1,
        },
        variant === 'outline' && styles.outlined,
        fullWidth && styles.fullWidth,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={v.text} size="small" />
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <View style={styles.iconLeft}>{icon}</View>
          )}
          <Text
            variant={s.textVariant}
            color={v.text}
            style={icon ? (iconPosition === 'left' ? styles.titleWithIcon : styles.titleWithIconRight) : undefined}
          >
            {title}
          </Text>
          {icon && iconPosition === 'right' && (
            <View style={styles.iconRight}>{icon}</View>
          )}
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.lg,
    borderWidth: 1.5,
    minWidth: 72,
  },
  outlined: {
    borderWidth: 1.5,
  },
  fullWidth: {
    width: '100%',
  },
  iconLeft: {
    marginRight: spacing.sm,
  },
  iconRight: {
    marginLeft: spacing.sm,
  },
  titleWithIcon: {
    marginLeft: spacing.xs,
  },
  titleWithIconRight: {
    marginRight: spacing.xs,
  },
});
