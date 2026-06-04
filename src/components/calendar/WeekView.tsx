// ============================================
// Sahaara — WeekView Component
// ============================================

import React from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Text } from '../ui/Text';
import { colors } from '../../theme/colors';
import { spacing, borderRadius } from '../../theme/spacing';
import { isSameDay, isToday, format, toDateString } from '../../utils/dateHelpers';
import { Appointment } from '../../types/database';

const SCREEN_WIDTH = Dimensions.get('window').width;
const DAY_WIDTH = (SCREEN_WIDTH - spacing.base * 2) / 7;

interface WeekViewProps {
  weekDays: Date[];
  selectedDate: Date;
  appointments: Appointment[];
  onSelectDate: (date: Date) => void;
}

export function WeekView({
  weekDays,
  selectedDate,
  appointments,
  onSelectDate,
}: WeekViewProps) {
  const appointmentsByDate = appointments.reduce<Record<string, number>>((acc, apt) => {
    acc[apt.date] = (acc[apt.date] || 0) + 1;
    return acc;
  }, {});

  return (
    <View style={styles.container}>
      <View style={styles.weekRow}>
        {weekDays.map((date, index) => {
          const isTodayDate = isToday(date);
          const isSelected = isSameDay(date, selectedDate);
          const dateStr = toDateString(date);
          const count = appointmentsByDate[dateStr] || 0;

          return (
            <TouchableOpacity
              key={index}
              onPress={() => onSelectDate(date)}
              style={[
                styles.dayColumn,
                isSelected && styles.selectedColumn,
                isTodayDate && !isSelected && styles.todayColumn,
              ]}
              activeOpacity={0.6}
            >
              <Text
                variant="tiny"
                color={isSelected ? colors.white : colors.textTertiary}
                align="center"
              >
                {format(date, 'EEE')}
              </Text>
              <Text
                variant="h4"
                color={
                  isSelected
                    ? colors.white
                    : isTodayDate
                    ? colors.primary
                    : colors.text
                }
                align="center"
                style={styles.dateNumber}
              >
                {date.getDate()}
              </Text>
              {count > 0 && (
                <View
                  style={[
                    styles.badge,
                    isSelected && styles.badgeSelected,
                  ]}
                >
                  <Text
                    variant="tiny"
                    color={isSelected ? colors.primary : colors.white}
                    align="center"
                  >
                    {count}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayColumn: {
    width: DAY_WIDTH - 4,
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
  },
  selectedColumn: {
    backgroundColor: colors.calendarSelected,
  },
  todayColumn: {
    backgroundColor: colors.primaryFaded,
  },
  dateNumber: {
    marginTop: spacing.xs,
  },
  badge: {
    marginTop: spacing.xs,
    backgroundColor: colors.accent,
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeSelected: {
    backgroundColor: colors.white,
  },
});
