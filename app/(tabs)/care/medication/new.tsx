// ============================================
// Sahaara — Add New Medication Screen
// ============================================

import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Text } from '@/components/ui/Text';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useMedications } from '@/hooks/useMedications';
import { usePatient } from '@/context/PatientContext';
import { colors } from '@/theme/colors';
import { spacing, borderRadius } from '@/theme/spacing';
import { toDateString } from '@/utils/dateHelpers';

const FREQUENCY_OPTIONS = [
  { label: 'Once Daily', value: 'daily' },
  { label: 'Twice Daily', value: 'twice_daily' },
  { label: 'Three Times Daily', value: 'three_times_daily' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'As Needed', value: 'as_needed' },
] as const;

export default function NewMedicationScreen() {
  const router = useRouter();
  const { addMedication } = useMedications();
  const { selectedPatient } = usePatient();

  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState<typeof FREQUENCY_OPTIONS[number]['value']>('daily');
  const [instructions, setInstructions] = useState('');
  
  // Reminder Times
  const [reminderTimes, setReminderTimes] = useState<string[]>(['08:00']);
  const [newTime, setNewTime] = useState('');
  
  const [startDate, setStartDate] = useState(toDateString(new Date()));
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);

  const isValid = name.trim().length > 0 && startDate.length > 0;

  const handleAddReminderTime = () => {
    // Validate HH:MM
    const timeRegex = /^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!newTime.trim() || !timeRegex.test(newTime.trim())) {
      Alert.alert('Validation', 'Please enter a valid time in HH:MM format (e.g. 08:00 or 19:30).');
      return;
    }
    
    // Auto pad single digit hour if necessary
    let formatted = newTime.trim();
    if (formatted.length === 4) {
      formatted = '0' + formatted;
    }
    
    if (reminderTimes.includes(formatted)) {
      setNewTime('');
      return;
    }
    setReminderTimes([...reminderTimes, formatted].sort());
    setNewTime('');
  };

  const handleRemoveReminderTime = (index: number) => {
    setReminderTimes(reminderTimes.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!isValid) return;
    setLoading(true);
    try {
      await addMedication({
        name: name.trim(),
        dosage: dosage.trim() || null,
        frequency,
        reminder_times: reminderTimes.length > 0 ? reminderTimes : null,
        instructions: instructions.trim() || null,
        start_date: startDate,
        end_date: endDate.trim() || null,
        is_active: true,
      });
      router.back();
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to add medication');
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
        <Text variant="h3">New Medication</Text>
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
          label="Medication Name *"
          placeholder="e.g. Lisinopril"
          value={name}
          onChangeText={setName}
        />

        <Input
          label="Dosage"
          placeholder="e.g. 10mg, 1 tablet, 5ml"
          value={dosage}
          onChangeText={setDosage}
        />

        {/* Frequency Selector */}
        <View style={styles.section}>
          <Text variant="label" color={colors.textSecondary} style={styles.sectionLabel}>
            Frequency
          </Text>
          <View style={styles.freqChips}>
            {FREQUENCY_OPTIONS.map((opt) => {
              const isSelected = frequency === opt.value;
              return (
                <TouchableOpacity
                  key={opt.value}
                  onPress={() => setFrequency(opt.value)}
                  style={[
                    styles.chip,
                    isSelected && styles.chipSelected,
                  ]}
                >
                  <Text
                    variant="caption"
                    color={isSelected ? colors.white : colors.textSecondary}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Reminder Times Form */}
        <View style={styles.section}>
          <Text variant="label" color={colors.textSecondary} style={styles.sectionLabel}>
            Reminder Times
          </Text>
          
          <View style={styles.reminderInputRow}>
            <View style={{ flex: 1 }}>
              <Input
                placeholder="HH:MM (e.g. 08:00)"
                value={newTime}
                onChangeText={setNewTime}
                containerStyle={{ marginBottom: 0 }}
              />
            </View>
            <Button
              title="Add Time"
              onPress={handleAddReminderTime}
              size="sm"
              style={styles.addTimeBtn}
            />
          </View>

          <View style={styles.timeChipsContainer}>
            {reminderTimes.map((time, idx) => (
              <View key={idx} style={styles.timeChip}>
                <Text variant="caption" color={colors.primaryDark}>
                  🕒 {time}
                </Text>
                <TouchableOpacity onPress={() => handleRemoveReminderTime(idx)}>
                  <Text style={styles.removeTimeIcon}> ✕</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        <Input
          label="Instructions"
          placeholder="e.g. Take with food, avoid grapefruit..."
          value={instructions}
          onChangeText={setInstructions}
          multiline
          numberOfLines={2}
        />

        {/* Dates */}
        <View style={styles.timeRow}>
          <View style={styles.timeField}>
            <Input
              label="Start Date *"
              placeholder="YYYY-MM-DD"
              value={startDate}
              onChangeText={setStartDate}
            />
          </View>
          <View style={styles.timeField}>
            <Input
              label="End Date"
              placeholder="Optional"
              value={endDate}
              onChangeText={setEndDate}
            />
          </View>
        </View>

        {/* Save Button */}
        <Button
          title="Save Medication"
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
  section: {
    marginBottom: spacing.xl,
  },
  sectionLabel: {
    marginBottom: spacing.sm,
  },
  freqChips: {
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
  reminderInputRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  addTimeBtn: {
    height: 48,
    paddingHorizontal: spacing.lg,
  },
  timeChipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  timeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryFaded,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.full,
  },
  removeTimeIcon: {
    color: colors.primaryDark,
    fontSize: 12,
    fontWeight: 'bold',
  },
  timeRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  timeField: {
    flex: 1,
  },
  saveButton: {
    marginTop: spacing.md,
  },
});
