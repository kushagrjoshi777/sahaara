// ============================================
// Sahaara — MonthView Component
// ============================================

import React from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Text } from '../ui/Text';
import { colors } from '../../theme/colors';
import { spacing, borderRadius } from '../../theme/spacing';
import { isSameDay, isSameMonth, isToday, DAY_ABBREVIATIONS } from '../../utils/dateHelpers';
import { Appointment } from '../../types/database';
import { toDateString } from '../../utils/dateHelpers';

const SCREEN_WIDTH = Dimensions.get('window').width;
const DAY_SIZE = (SCREEN_WIDTH - spacing.base * 2) / 7;

interface MonthViewProps {
  calendarDays: Date[];
  currentMonth: Date;
  selectedDate: Date;
  appointments: Appointment[];
  onSelectDate: (date: Date) => void;
}

export function MonthView({
  calendarDays,
  currentMonth,
  selectedDate,
  appointments,
  onSelectDate,
}: MonthViewProps) {
  // Group appointments by date
  const appointmentsByDate = appointments.reduce<Record<string, number>>((acc, apt) => {
    acc[apt.date] = (acc[apt.date] || 0) + 1;
    return acc;
  }, {});

  return (
    <View style={styles.container}>
      {/* Day headers */}
      <View style={styles.headerRow}>
        {DAY_ABBREVIATIONS.map((day) => (
          <View key={day} style={styles.headerCell}>
            <Text variant="captionMedium" color={colors.textTertiary} align="center">
              {day}
            </Text>
          </View>
        ))}
      </View>

      {/* Calendar grid */}
      <View style={styles.grid}>
        {calendarDays.map((date, index) => {
          const dateStr = toDateString(date);
          const isCurrentMonth = isSameMonth(date, currentMonth);
          const isTodayDate = isToday(date);
          const isSelected = isSameDay(date, selectedDate);
          const count = appointmentsByDate[dateStr] || 0;

          return (
            <TouchableOpacity
              key={index}
              onPress={() => onSelectDate(date)}
              style={[
                styles.dayCell,
                isSelected && styles.selectedCell,
                isTodayDate && !isSelected && styles.todayCell,
              ]}
              activeOpacity={0.6}
            >
              <Text
                variant="bodyMedium"
                color={
                  isSelected
                    ? colors.white
                    : isTodayDate
                    ? colors.primary
                    : isCurrentMonth
                    ? colors.text
                    : colors.textTertiary
                }
                align="center"
              >
                {date.getDate()}
              </Text>
              {count > 0 && (
                <View style={styles.dotContainer}>
                  <View
                    style={[
                      styles.dot,
                      isSelected && styles.dotSelected,
                    ]}
                  />
                  {count > 1 && (
                    <View
                      style={[
                        styles.dot,
                        { backgroundColor: colors.accent },
                        isSelected && styles.dotSelected,
                      ]}
                    />
                  )}
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
  },
  headerRow: {
    flexDirection: 'row',
    paddingBottom: spacing.sm,
  },
  headerCell: {
    width: DAY_SIZE,
    alignItems: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: DAY_SIZE,
    height: DAY_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: DAY_SIZE / 2,
  },
  selectedCell: {
    backgroundColor: colors.calendarSelected,
  },
  todayCell: {
    backgroundColor: colors.primaryFaded,
  },
  dotContainer: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 6,
    gap: 3,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: colors.calendarDot,
  },
  dotSelected: {
    backgroundColor: colors.white,
  },
});
