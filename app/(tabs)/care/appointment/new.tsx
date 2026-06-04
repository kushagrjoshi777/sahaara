// ============================================
// Sahaara — Create Appointment Screen
// ============================================

import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Text } from '@/components/ui/Text';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAppointments } from '@/hooks/useAppointments';
import { usePatient } from '@/context/PatientContext';
import { REMINDER_OPTIONS } from '@/types/appointments';
import { colors } from '@/theme/colors';
import { spacing, borderRadius } from '@/theme/spacing';
import { toDateString } from '@/utils/dateHelpers';

export default function NewAppointmentScreen() {
  const router = useRouter();
  const { createAppointment } = useAppointments();
  const { selectedPatient } = usePatient();

  const [title, setTitle] = useState('');
  const [doctorName, setDoctorName] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState(toDateString(new Date()));
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedReminders, setSelectedReminders] = useState<number[]>([15]);
  const [loading, setLoading] = useState(false);

  const isValid = title.trim().length > 0 && date.length > 0 && startTime.length > 0;

  const toggleReminder = (minutes: number) => {
    setSelectedReminders((prev) =>
      prev.includes(minutes)
        ? prev.filter((m) => m !== minutes)
        : [...prev, minutes]
    );
  };

  const handleSave = async () => {
    if (!isValid) return;

    setLoading(true);
    try {
      await createAppointment({
        title: title.trim(),
        doctor_name: doctorName.trim() || null,
        location: location.trim() || null,
        date,
        start_time: startTime + ':00',
        end_time: endTime ? endTime + ':00' : null,
        notes: notes.trim() || null,
        reminder_minutes: selectedReminders,
        patient_id: selectedPatient?.id || null,
        google_event_id: null,
        is_synced: false,
      });
      router.back();
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to create appointment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.cancelButton}>
          <Text variant="body" color={colors.primary}>Cancel</Text>
        </TouchableOpacity>
        <Text variant="h3">New Appointment</Text>
        <View style={styles.cancelButton} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {selectedPatient && (
          <View style={styles.patientBadge}>
            <Text variant="captionMedium" color={colors.primary}>
              For {selectedPatient.name}
            </Text>
          </View>
        )}

        <Input
          label="Appointment Title *"
          placeholder="e.g., Cardiology Checkup"
          value={title}
          onChangeText={setTitle}
        />

        <Input
          label="Doctor Name"
          placeholder="e.g., Dr. Smith"
          value={doctorName}
          onChangeText={setDoctorName}
        />

        <Input
          label="Location"
          placeholder="e.g., City Hospital, Room 204"
          value={location}
          onChangeText={setLocation}
        />

        {/* Date Input */}
        <Input
          label="Date *"
          placeholder="YYYY-MM-DD"
          value={date}
          onChangeText={setDate}
        />

        {/* Time Inputs */}
        <View style={styles.timeRow}>
          <View style={styles.timeField}>
            <Input
              label="Start Time *"
              placeholder="HH:MM"
              value={startTime}
              onChangeText={setStartTime}
            />
          </View>
          <View style={styles.timeField}>
            <Input
              label="End Time"
              placeholder="HH:MM"
              value={endTime}
              onChangeText={setEndTime}
            />
          </View>
        </View>

        <Input
          label="Notes"
          placeholder="Any additional notes..."
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={3}
        />

        {/* Reminders */}
        <View style={styles.remindersSection}>
          <Text variant="label" color={colors.textSecondary} style={styles.remindersLabel}>
            Reminders
          </Text>
          <View style={styles.reminderChips}>
            {REMINDER_OPTIONS.map(({ label, value }) => {
              const isSelected = selectedReminders.includes(value);
              return (
                <TouchableOpacity
                  key={value}
                  onPress={() => toggleReminder(value)}
                  style={[
                    styles.chip,
                    isSelected && styles.chipSelected,
                  ]}
                >
                  <Text
                    variant="caption"
                    color={isSelected ? colors.white : colors.textSecondary}
                  >
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Save Button */}
        <Button
          title="Save Appointment"
          onPress={handleSave}
          loading={loading}
          disabled={!isValid}
          fullWidth
          size="lg"
          style={styles.saveButton}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    backgroundColor: colors.surface,
  },
  cancelButton: {
    width: 60,
  },
  scroll: {
    padding: spacing.xl,
    paddingBottom: spacing['4xl'],
  },
  patientBadge: {
    backgroundColor: colors.primaryFaded,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.base,
    borderRadius: borderRadius.md,
    alignSelf: 'flex-start',
    marginBottom: spacing.xl,
  },
  timeRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  timeField: {
    flex: 1,
  },
  remindersSection: {
    marginBottom: spacing.xl,
  },
  remindersLabel: {
    marginBottom: spacing.sm,
  },
  reminderChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  saveButton: {
    marginTop: spacing.md,
  },
});
