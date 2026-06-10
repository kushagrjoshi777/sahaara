// ============================================
// Sahaara UI — Input Component
// ============================================

import React, { useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TextInputProps,
  ViewStyle,
  TouchableOpacity,
} from 'react-native';
import { Text } from './Text';
import { colors } from '../../theme/colors';
import { fontFamily, fontSize } from '../../theme/typography';
import { borderRadius, spacing, touchTarget } from '../../theme/spacing';

interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string | null;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
  containerStyle?: ViewStyle;
  multiline?: boolean;
  numberOfLines?: number;
}

export function Input({
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  onRightIconPress,
  containerStyle,
  multiline = false,
  numberOfLines = 1,
  ...inputProps
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);

  const borderColor = error
    ? colors.error
    : isFocused
    ? colors.borderFocus
    : colors.border;

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text variant="label" color={colors.textSecondary} style={styles.label}>
          {label}
        </Text>
      )}
      <View
        style={[
          styles.inputContainer,
          { borderColor },
          isFocused && styles.focused,
          multiline && styles.multiline,
          error ? styles.errorBorder : null,
        ]}
      >
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
        <TextInput
          style={[
            styles.input,
            leftIcon ? { paddingLeft: 0 } : null,
            rightIcon ? { paddingRight: 0 } : null,
            multiline && { height: numberOfLines * 24, textAlignVertical: 'top' },
          ]}
          placeholderTextColor={colors.textTertiary}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          multiline={multiline}
          numberOfLines={numberOfLines}
          {...inputProps}
        />
        {rightIcon && (
          <TouchableOpacity
            onPress={onRightIconPress}
            style={styles.rightIcon}
            disabled={!onRightIconPress}
          >
            {rightIcon}
          </TouchableOpacity>
        )}
      </View>
      {error && (
        <Text variant="caption" color={colors.error} style={styles.helper}>
          {error}
        </Text>
      )}
      {hint && !error && (
        <Text variant="caption" color={colors.textTertiary} style={styles.helper}>
          {hint}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.base,
  },
  label: {
    marginBottom: spacing.sm,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: borderRadius['2xl'],
    minHeight: touchTarget.min,
    paddingHorizontal: spacing.base,
  },
  focused: {
    borderWidth: 2,
    borderColor: colors.borderFocus,
    backgroundColor: colors.white,
  },
  multiline: {
    minHeight: 100,
    alignItems: 'flex-start',
    paddingVertical: spacing.md,
  },
  errorBorder: {
    borderColor: colors.error,
  },
  input: {
    flex: 1,
    fontFamily: fontFamily.regular,
    fontSize: fontSize.base,
    color: colors.text,
    paddingVertical: spacing.md,
  },
  leftIcon: {
    marginRight: spacing.md,
  },
  rightIcon: {
    marginLeft: spacing.md,
    padding: spacing.xs,
  },
  helper: {
    marginTop: spacing.xs,
    marginLeft: spacing.xs,
  },
});
