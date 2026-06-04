// ============================================
// Sahaara UI — Text Component
// ============================================

import React from 'react';
import { Text as RNText, TextProps as RNTextProps, StyleSheet } from 'react-native';
import { textStyles } from '../../theme/typography';
import { colors } from '../../theme/colors';

export type TextVariant =
  | 'h1' | 'h2' | 'h3' | 'h4'
  | 'bodyLarge' | 'body' | 'bodyMedium' | 'bodySemiBold'
  | 'caption' | 'captionMedium' | 'tiny'
  | 'label' | 'labelLarge'
  | 'button' | 'buttonSmall'
  | 'number';

interface TextProps extends RNTextProps {
  variant?: TextVariant;
  color?: string;
  align?: 'left' | 'center' | 'right';
  children: React.ReactNode;
}

export function Text({
  variant = 'body',
  color = colors.text,
  align = 'left',
  style,
  children,
  ...props
}: TextProps) {
  return (
    <RNText
      style={[
        textStyles[variant],
        { color, textAlign: align },
        style,
      ]}
      {...props}
    >
      {children}
    </RNText>
  );
}
