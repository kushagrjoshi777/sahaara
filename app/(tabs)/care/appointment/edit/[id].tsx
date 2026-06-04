// ============================================
// Sahaara — Edit Appointment Screen
// ============================================

import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Text } from '@/components/ui/Text';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/Shared';
import { useAppointments } from '@/hooks/useAppointments';
import { REMINDER_OPTIONS } from '@/types/appointments';
import { colors } from '@/theme/colors';
import { spacing, borderRadius } from '@/theme/spacing';
import { toDateString } from '@/utils/dateHelpers';

export default function EditAppointmentScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getAppointmentById, updateAppointment } = useAppointments();

  const [title, setTitle] = useState('');
  const [doctorName, setDoctorName] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedReminders, setSelectedReminders] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadAppointment() {
      if (!id) return;
      try {
        const appt = await getAppointmentById(id);
        if (appt) {
          setTitle(appt.title);
          setDoctorName(appt.doctor_name || '');
          setLocation(appt.location || '');
          setDate(appt.date);
          
          // Remove seconds from times (HH:MM:SS -> HH:MM)
          setStartTime(appt.start_time.substring(0, 5));
          setEndTime(appt.end_time ? appt.end_time.substring(0, 5) : '');
          
          setNotes(appt.notes || '');
          setSelectedReminders(appt.reminder_minutes || []);
        }
      } catch (e: any) {
        Alert.alert('Error', e.message || 'Failed to load appointment');
        router.back();
      } finally {
        setLoading(false);
      }
    }
    loadAppointment();
  }, [id]);

  const isValid = title.trim().length > 0 && date.length > 0 && startTime.length > 0;

  const toggleReminder = (minutes: number) => {
    setSelectedReminders((prev) =>
      prev.includes(minutes)
        ? prev.filter((m) => m !== minutes)
        : [...prev, minutes]
    );
  };

  const handleSave = async () => {
    if (!isValid || !id) return;

    setSaving(true);
    try {
      await updateAppointment(id, {
        title: title.trim(),
        doctor_name: doctorName.trim() || null,
        location: location.trim() || null,
        date,
        start_time: startTime.length === 5 ? startTime + ':00' : startTime,
        end_time: endTime ? (endTime.length === 5 ? endTime + ':00' : endTime) : null,
        notes: notes.trim() || null,
        reminder_minutes: selectedReminders,
      });
      
      // Navigate back and force refresh/update in details screen
      router.dismissAll();
      router.push(`/(tabs)/care`);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to update appointment');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.cancelButton}>
          <Text variant="body" color={colors.primary}>Cancel</Text>
        </TouchableOpacity>
        <Text variant="h3">Edit Appointment</Text>
        <View style={styles.cancelButton} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
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
          title="Save Changes"
          onPress={handleSave}
          loading={saving}
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
