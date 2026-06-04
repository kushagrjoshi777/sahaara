// ============================================
// Sahaara — DailyAgenda Component
// ============================================

import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Text } from '../ui/Text';
import { AppointmentCard } from './AppointmentCard';
import { EmptyState } from '../ui/Shared';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { Appointment } from '../../types/database';
import { formatDate, toDateString, isSameDay } from '../../utils/dateHelpers';

interface DailyAgendaProps {
  selectedDate: Date;
  appointments: Appointment[];
  onAppointmentPress: (appointment: Appointment) => void;
}

export function DailyAgenda({
  selectedDate,
  appointments,
  onAppointmentPress,
}: DailyAgendaProps) {
  const dateStr = toDateString(selectedDate);
  const dayAppointments = appointments.filter((a) => a.date === dateStr);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="labelLarge" color={colors.textSecondary}>
          {formatDate(selectedDate, 'EEEE, MMMM d, yyyy')}
        </Text>
        <Text variant="caption" color={colors.textTertiary}>
          {dayAppointments.length} appointment{dayAppointments.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {dayAppointments.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text variant="body" color={colors.textTertiary} align="center">
            No appointments for this day
          </Text>
          <Text variant="caption" color={colors.textTertiary} align="center" style={{ marginTop: spacing.xs }}>
            Tap + to add one
          </Text>
        </View>
      ) : (
        <View style={styles.list}>
          {dayAppointments.map((appointment) => (
            <AppointmentCard
              key={appointment.id}
              appointment={appointment}
              onPress={onAppointmentPress}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.base,
    paddingTop: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  list: {
    flex: 1,
  },
  emptyContainer: {
    paddingVertical: spacing['3xl'],
    alignItems: 'center',
  },
});
