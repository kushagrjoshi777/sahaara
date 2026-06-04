// ============================================
// Sahaara — CalendarHeader Component
// ============================================

import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from '../ui/Text';
import { IconButton } from '../ui/IconButton';
import { colors } from '../../theme/colors';
import { spacing, borderRadius } from '../../theme/spacing';
import { CalendarViewMode } from '../../types/appointments';
import { getMonthYearLabel, formatDate } from '../../utils/dateHelpers';

interface CalendarHeaderProps {
  currentMonth: Date;
  selectedDate: Date;
  viewMode: CalendarViewMode;
  onViewModeChange: (mode: CalendarViewMode) => void;
  onNavigateBack: () => void;
  onNavigateForward: () => void;
  onToday: () => void;
}

const viewModes: { key: CalendarViewMode; label: string }[] = [
  { key: 'month', label: 'Month' },
  { key: 'week', label: 'Week' },
  { key: 'day', label: 'Day' },
];

export function CalendarHeader({
  currentMonth,
  selectedDate,
  viewMode,
  onViewModeChange,
  onNavigateBack,
  onNavigateForward,
  onToday,
}: CalendarHeaderProps) {
  const title =
    viewMode === 'day'
      ? formatDate(selectedDate, 'EEEE, MMMM d')
      : getMonthYearLabel(currentMonth);

  return (
    <View style={styles.container}>
      {/* Title + Navigation */}
      <View style={styles.titleRow}>
        <View style={styles.navButtons}>
          <IconButton
            icon={<Text variant="bodyMedium" color={colors.primary}>◀</Text>}
            onPress={onNavigateBack}
            variant="ghost"
            size={40}
            accessibilityLabel="Previous"
          />
          <TouchableOpacity onPress={onToday} style={styles.titleButton}>
            <Text variant="h3">{title}</Text>
          </TouchableOpacity>
          <IconButton
            icon={<Text variant="bodyMedium" color={colors.primary}>▶</Text>}
            onPress={onNavigateForward}
            variant="ghost"
            size={40}
            accessibilityLabel="Next"
          />
        </View>
      </View>

      {/* View Mode Toggle */}
      <View style={styles.viewToggle}>
        {viewModes.map(({ key, label }) => (
          <TouchableOpacity
            key={key}
            onPress={() => onViewModeChange(key)}
            style={[
              styles.viewButton,
              viewMode === key && styles.viewButtonActive,
            ]}
          >
            <Text
              variant="captionMedium"
              color={viewMode === key ? colors.white : colors.textSecondary}
            >
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.base,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    backgroundColor: colors.surface,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  navButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  titleButton: {
    paddingHorizontal: spacing.md,
  },
  viewToggle: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.md,
    padding: 3,
  },
  viewButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: borderRadius.sm,
  },
  viewButtonActive: {
    backgroundColor: colors.primary,
  },
});
