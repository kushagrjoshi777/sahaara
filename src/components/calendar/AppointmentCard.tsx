// ============================================
// Sahaara — AppointmentCard Component
// ============================================

import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from '../ui/Text';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { colors } from '../../theme/colors';
import { spacing, borderRadius, shadow } from '../../theme/spacing';
import { Appointment } from '../../types/database';
import { formatTime } from '../../utils/dateHelpers';

interface AppointmentCardProps {
  appointment: Appointment;
  onPress?: (appointment: Appointment) => void;
  compact?: boolean;
}

export function AppointmentCard({ appointment, onPress, compact = false }: AppointmentCardProps) {
  return (
    <TouchableOpacity
      onPress={() => onPress?.(appointment)}
      activeOpacity={0.7}
      style={[styles.container, compact && styles.compactContainer]}
    >
      <View style={styles.accent} />
      <View style={styles.content}>
        <View style={styles.header}>
          <Text variant={compact ? 'bodyMedium' : 'bodySemiBold'} numberOfLines={1} style={styles.title}>
            {appointment.title}
          </Text>
          <Text variant="captionMedium" color={colors.primary}>
            {formatTime(appointment.start_time)}
            {appointment.end_time ? ` - ${formatTime(appointment.end_time)}` : ''}
          </Text>
        </View>

        {!compact && (
          <>
            {appointment.doctor_name && (
              <View style={styles.row}>
                <MaterialCommunityIcons name="stethoscope" size={14} color={colors.textSecondary} />
                <Text variant="caption" color={colors.textSecondary} style={{ marginLeft: spacing.sm }}>
                  {appointment.doctor_name}
                </Text>
              </View>
            )}
            {appointment.location && (
              <View style={styles.row}>
                <MaterialCommunityIcons name="map-marker-outline" size={14} color={colors.textSecondary} />
                <Text variant="caption" color={colors.textSecondary} style={{ marginLeft: spacing.sm }}>
                  {appointment.location}
                </Text>
              </View>
            )}
          </>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    overflow: 'hidden',
    ...shadow.sm,
  },
  compactContainer: {
    marginBottom: spacing.xs,
  },
  accent: {
    width: 4,
    backgroundColor: colors.primary,
  },
  content: {
    flex: 1,
    padding: spacing.base,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    flex: 1,
    marginRight: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
});
