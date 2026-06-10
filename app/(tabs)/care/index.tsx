// ============================================
// Sahaara — Care Tab (Appointments & Medications)
// ============================================

import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Text } from '../../../src/components/ui/Text';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Card } from '../../../src/components/ui/Card';
import { Button } from '../../../src/components/ui/Button';
import { CalendarHeader } from '../../../src/components/calendar/CalendarHeader';
import { MonthView } from '../../../src/components/calendar/MonthView';
import { WeekView } from '../../../src/components/calendar/WeekView';
import { DailyAgenda } from '../../../src/components/calendar/DailyAgenda';
import { LoadingSpinner, Divider, EmptyState } from '../../../src/components/ui/Shared';
import { useCalendar } from '../../../src/hooks/useCalendar';
import { useAppointments } from '../../../src/hooks/useAppointments';
import { useMedications } from '../../../src/hooks/useMedications';
import { usePatient } from '../../../src/context/PatientContext';
import { colors } from '../../../src/theme/colors';
import { spacing, borderRadius, shadow } from '../../../src/theme/spacing';
import { Appointment, Medication } from '../../../src/types/database';
import { formatDate, formatTime } from '../../../src/utils/dateHelpers';

type CareSubTab = 'appointments' | 'medications';

export default function CalendarScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<CareSubTab>('appointments');
  const { selectedPatient } = usePatient();

  // Calendar & Appointments hooks
  const {
    selectedDate,
    setSelectedDate,
    viewMode,
    setViewMode,
    navigateForward,
    navigateBack,
    goToToday,
    calendarDays,
    weekDays,
    currentMonth,
    dateRange,
  } = useCalendar();

  const { appointments, loading: apptsLoading } = useAppointments(dateRange);

  // Medications hooks
  const { medications, logs, loading: medsLoading, logMedicationTaken, refresh: refreshMeds } = useMedications();

  const handleAppointmentPress = (appointment: Appointment) => {
    router.push(`/(tabs)/care/appointment/${appointment.id}`);
  };

  const handleNewAppointment = () => {
    router.push('/(tabs)/care/appointment/new');
  };

  const handleNewMedication = () => {
    router.push('/(tabs)/care/medication/new');
  };

  const handleMedEdit = (med: Medication) => {
    router.push(`/(tabs)/care/medication/edit/${med.id}`);
  };

  const handleMarkMedTaken = async (med: Medication) => {
    const scheduledTime = med.reminder_times ? med.reminder_times[0] : '08:00';
    try {
      await logMedicationTaken(med.id, scheduledTime, 'taken');
      Alert.alert('Medication Logged', `${med.name} was successfully marked as taken.`);
      refreshMeds();
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to log medication intake');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Top Header */}
      <View style={styles.topBar}>
        <View>
          <Text variant="h2">Care Center</Text>
          {selectedPatient && (
            <Text variant="caption" color={colors.textSecondary}>
              Managing care for {selectedPatient.name}
            </Text>
          )}
        </View>
      </View>

      {/* Navigation Sub-Tabs */}
      <View style={styles.tabSelectorBg}>
          <TouchableOpacity
          style={[styles.tabButton, activeTab === 'appointments' && styles.tabButtonActive]}
          onPress={() => setActiveTab('appointments')}
        >
          <View style={styles.tabWithIcon}>
            <MaterialCommunityIcons name="calendar-month-outline" size={18} color={activeTab === 'appointments' ? colors.primaryDark : colors.textSecondary} />
            <Text
              variant="bodyMedium"
              color={activeTab === 'appointments' ? colors.primaryDark : colors.textSecondary}
              style={{ marginLeft: spacing.sm }}
            >
              Appointments
            </Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'medications' && styles.tabButtonActive]}
          onPress={() => setActiveTab('medications')}
        >
          <View style={styles.tabWithIcon}>
            <MaterialCommunityIcons name="pill" size={18} color={activeTab === 'medications' ? colors.primaryDark : colors.textSecondary} />
            <Text
              variant="bodyMedium"
              color={activeTab === 'medications' ? colors.primaryDark : colors.textSecondary}
              style={{ marginLeft: spacing.sm }}
            >
              Medications
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {activeTab === 'appointments' ? (
        <>
          {/* Calendar Controls */}
          <CalendarHeader
            currentMonth={currentMonth}
            selectedDate={selectedDate}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            onNavigateBack={navigateBack}
            onNavigateForward={navigateForward}
            onToday={goToToday}
          />

          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            {/* Calendar View */}
            {viewMode === 'month' && (
              <MonthView
                calendarDays={calendarDays}
                currentMonth={currentMonth}
                selectedDate={selectedDate}
                appointments={appointments}
                onSelectDate={setSelectedDate}
              />
            )}

            {viewMode === 'week' && (
              <WeekView
                weekDays={weekDays}
                selectedDate={selectedDate}
                appointments={appointments}
                onSelectDate={setSelectedDate}
              />
            )}

            {/* Daily Agenda (shown below all views) */}
            {apptsLoading ? (
              <LoadingSpinner />
            ) : (
              <DailyAgenda
                selectedDate={selectedDate}
                appointments={appointments}
                onAppointmentPress={handleAppointmentPress}
              />
            )}
          </ScrollView>

          {/* FAB - Add Appointment */}
          <TouchableOpacity
            style={styles.fab}
            onPress={handleNewAppointment}
            activeOpacity={0.8}
          >
            <Text variant="h2" color={colors.white}>+</Text>
          </TouchableOpacity>
        </>
      ) : (
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.medsScroll} showsVerticalScrollIndicator={false}>
          {/* Medications checklist / overview */}
          <View style={styles.medsSection}>
            <Text variant="labelLarge" color={colors.textSecondary} style={{ marginBottom: spacing.md }}>
              Active Medications
            </Text>

            {medsLoading ? (
              <LoadingSpinner />
            ) : medications.length === 0 ? (
              <EmptyState
                title="No Medications Added"
                message="Add daily prescriptions or over-the-counter medication schedules for your loved one."
                icon={<MaterialCommunityIcons name="pill" size={40} color={colors.primary} />}
                action={
                  <Button
                    title="+ Add Medication"
                    onPress={handleNewMedication}
                    variant="primary"
                    size="sm"
                  />
                }
              />
            ) : (
              medications.map((med) => (
                <Card key={med.id} variant="elevated" padding="lg" style={styles.medCard}>
                  <View style={styles.medCardHeader}>
                    <View style={{ flex: 1 }}>
                      <Text variant="h4">{med.name}</Text>
                      <Text variant="caption" color={colors.textSecondary} style={{ marginTop: 2 }}>
                        {med.dosage || 'No dosage'} | {med.frequency}
                      </Text>
                    </View>
                    <TouchableOpacity onPress={() => handleMedEdit(med)} style={styles.editMedLink}>
                      <Text variant="captionMedium" color={colors.primary}>Edit</Text>
                    </TouchableOpacity>
                  </View>

                  <Divider />

                  <View style={styles.medCardFooter}>
                    <View style={{ flex: 1 }}>
                      <Text variant="captionMedium" color={colors.primary}>
                        Reminders: {med.reminder_times ? med.reminder_times.map(formatTime).join(', ') : 'None'}
                      </Text>
                      {med.instructions && (
                        <Text variant="tiny" color={colors.textTertiary} style={{ marginTop: 4 }}>
                          Instructions: {med.instructions}
                        </Text>
                      )}
                    </View>
                    <Button
                      title="Log Intake"
                      onPress={() => handleMarkMedTaken(med)}
                      variant="secondary"
                      size="sm"
                      style={styles.logMedBtn}
                    />
                  </View>
                </Card>
              ))
            )}
          </View>

          {/* Medication Intake Logs */}
          <View style={styles.medsSection}>
            <Text variant="labelLarge" color={colors.textSecondary} style={{ marginBottom: spacing.md, marginTop: spacing.base }}>
              Medication History Log
            </Text>
            {medsLoading ? (
              <LoadingSpinner />
            ) : logs.length === 0 ? (
              <Text variant="caption" color={colors.textTertiary} align="center" style={{ paddingVertical: spacing.lg }}>
                No medication logs recorded today.
              </Text>
            ) : (
              logs.map((log) => {
                const medName = (log as any).medications?.name || 'Medication';
                const medDosage = (log as any).medications?.dosage || '';
                return (
                  <Card key={log.id} variant="outlined" padding="md" style={styles.logItem}>
                    <View style={styles.logRow}>
                      <MaterialCommunityIcons name="checkbox-marked" size={18} color={colors.primary} style={{ marginRight: spacing.md }} />
                      <View style={{ flex: 1 }}>
                        <Text variant="bodyMedium">
                          {medName} {medDosage ? `(${medDosage})` : ''} taken
                        </Text>
                        <Text variant="caption" color={colors.textTertiary}>
                          Scheduled for {formatTime(log.scheduled_time)} | Logged at {formatDate(log.taken_at, 'h:mm a')}
                        </Text>
                      </View>
                    </View>
                  </Card>
                );
              })
            )}
          </View>

          {/* FAB - Add Medication */}
          <TouchableOpacity
            style={styles.fab}
            onPress={handleNewMedication}
            activeOpacity={0.8}
          >
            <Text variant="h2" color={colors.white}>+</Text>
          </TouchableOpacity>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    ...shadow.sm,
  },
  tabSelectorBg: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceElevated,
    padding: spacing.xs,
    marginHorizontal: spacing.xl,
    marginBottom: spacing.base,
    borderRadius: borderRadius['2xl'],
  },
  tabButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: borderRadius.md,
  },
  tabWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tabButtonActive: {
    backgroundColor: colors.surface,
    ...shadow.sm,
  },
  scrollView: {
    flex: 1,
  },
  medsScroll: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing['5xl'],
  },
  medsSection: {
    width: '100%',
  },
  medCard: {
    marginBottom: spacing.base,
    backgroundColor: colors.surface,
  },
  medCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  editMedLink: {
    padding: spacing.xs,
  },
  medCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  logMedBtn: {
    paddingHorizontal: spacing.md,
  },
  logItem: {
    marginBottom: spacing.xs,
    backgroundColor: colors.surface,
    borderColor: colors.borderLight,
  },
  logRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: spacing.xl,
    right: spacing.xl,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.lg,
  },
});
