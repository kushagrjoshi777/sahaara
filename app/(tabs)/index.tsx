// ============================================
// Sahaara — Home Dashboard
// ============================================

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Text } from '@/components/ui/Text';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Divider, LoadingSpinner } from '@/components/ui/Shared';
import { useAuth } from '@/context/AuthContext';
import { usePatient } from '@/context/PatientContext';
import { useAppointments } from '@/hooks/useAppointments';
import { useMedications } from '@/hooks/useMedications';
import { useJournal } from '@/hooks/useJournal';
import { useTasks } from '@/hooks/useTasks';
import { colors } from '@/theme/colors';
import { spacing, borderRadius, shadow } from '@/theme/spacing';
import { getGreeting, formatDate, formatTime } from '@/utils/dateHelpers';

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { selectedPatient } = usePatient();
  const greeting = getGreeting();
  
  // Custom Hooks
  const { appointments, loading: apptsLoading } = useAppointments();
  const { medications, logs, logMedicationTaken, refresh: refreshMeds } = useMedications();
  const { entries, loading: journalLoading } = useJournal();
  const { tasks, addTask, toggleTask, deleteTask } = useTasks();

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [addingTask, setAddingTask] = useState(false);

  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Caregiver';

  // Get Next Appointment
  const nextAppointment = appointments.find((appt) => {
    const apptDate = new Date(appt.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return apptDate >= today;
  });

  // Get Next Medication
  const nextMedication = medications[0]; // Simple logic for demo: return first active medication

  // Get Recent Journal Entry
  const recentEntry = entries[0];

  const handleMarkMedTaken = async (medId: string, name: string) => {
    try {
      await logMedicationTaken(medId, '08:00', 'taken');
      Alert.alert('Medication Logged', `${name} has been marked as taken successfully!`);
      refreshMeds();
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to log medication');
    }
  };

  const handleAddTask = async () => {
    if (!newTaskTitle.trim()) return;
    setAddingTask(true);
    try {
      await addTask(newTaskTitle.trim());
      setNewTaskTitle('');
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to add task');
    } finally {
      setAddingTask(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Soothing Greeting and Active Patient Header */}
        <View style={styles.header}>
          <Text variant="h2" color={colors.textSecondary}>{greeting},</Text>
          <Text variant="h1" color={colors.primary} style={styles.userName}>
            {userName}
          </Text>
          {selectedPatient ? (
            <View style={styles.patientBadge}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                <MaterialCommunityIcons name="heart-outline" size={16} color={colors.primaryDark} />
                <Text variant="bodyMedium" color={colors.primaryDark}>
                  caring for: <Text variant="bodySemiBold" color={colors.primary}>{selectedPatient.name}</Text>
                </Text>
              </View>
            </View>
          ) : (
            <Text variant="body" color={colors.textTertiary}>No patient selected. Go to Profile to select/add.</Text>
          )}
        </View>

        {/* 1. Upcoming Medication Card */}
        <Card variant="elevated" padding="lg" style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderWithIcon}>
              <MaterialCommunityIcons name="pill" size={20} color={colors.primary} />
              <Text variant="h3" style={{ marginLeft: spacing.sm }}>Next Medication</Text>
            </View>
          </View>
          {nextMedication ? (
            <View style={styles.medContent}>
              <TouchableOpacity
                onPress={() => router.push('/(tabs)/care')}
                activeOpacity={0.7}
                style={styles.medDetails}
              >
                <Text variant="h4">{nextMedication.name}</Text>
                <Text variant="body" color={colors.textSecondary} style={{ marginTop: 2 }}>
                  Dosage: {nextMedication.dosage || '1 tab'} | {nextMedication.frequency}
                </Text>
                <Text variant="captionMedium" color={colors.primary} style={{ marginTop: 4 }}>
                  Scheduled: Morning {nextMedication.reminder_times ? nextMedication.reminder_times[0] : '08:00 AM'}
                </Text>
              </TouchableOpacity>
              <Button
                title="Taken"
                onPress={() => handleMarkMedTaken(nextMedication.id, nextMedication.name)}
                variant="secondary"
                size="sm"
                style={styles.medButton}
              />
            </View>
          ) : (
            <View style={styles.emptyCardContent}>
              <Text variant="body" color={colors.textSecondary}>No medications scheduled.</Text>
              <Button
                title="+ Add Med"
                onPress={() => router.push('/(tabs)/care/medication/new')}
                variant="ghost"
                size="sm"
                style={{ marginTop: spacing.sm }}
              />
            </View>
          )}
        </Card>

        {/* 2. Upcoming Appointment Card */}
        <Card variant="elevated" padding="lg" style={styles.card}>
            <View style={styles.cardHeader}>
            <View style={styles.cardHeaderWithIcon}>
              <MaterialCommunityIcons name="calendar-month" size={20} color={colors.primary} />
              <Text variant="h3" style={{ marginLeft: spacing.sm }}>Next Appointment</Text>
            </View>
          </View>
          {nextAppointment ? (
            <TouchableOpacity
              onPress={() => router.push(`/(tabs)/care/appointment/${nextAppointment.id}`)}
              activeOpacity={0.7}
            >
              <Text variant="h4">{nextAppointment.title}</Text>
                <Text variant="body" color={colors.textSecondary} style={{ marginTop: 2 }}>
                {nextAppointment.doctor_name || 'General Practitioner'}
              </Text>
              <Text variant="bodyMedium" color={colors.primary} style={{ marginTop: 4 }}>
                {formatDate(nextAppointment.date, 'EEEE, MMM d')} at {formatTime(nextAppointment.start_time)}
              </Text>
              {nextAppointment.location && (
                <Text variant="caption" color={colors.textSecondary} style={{ marginTop: 4 }}>
                  {nextAppointment.location}
                </Text>
              )}
            </TouchableOpacity>
          ) : (
            <View style={styles.emptyCardContent}>
              <Text variant="body" color={colors.textSecondary}>No upcoming appointments scheduled.</Text>
              <Button
                title="Book Appointment"
                onPress={() => router.push('/(tabs)/care/appointment/new')}
                variant="ghost"
                size="sm"
                style={{ marginTop: spacing.sm }}
              />
            </View>
          )}
        </Card>

        {/* 3. Family Care Checklist Card */}
          <Card variant="elevated" padding="lg" style={styles.card}>
            <TouchableOpacity
            onPress={() => router.push('/(tabs)/tasks')}
            activeOpacity={0.7}
            style={styles.cardHeader}
          >
            <View style={styles.cardHeaderWithIcon}>
              <MaterialCommunityIcons name="check-circle-outline" size={20} color={colors.primary} />
              <Text variant="h3" style={{ marginLeft: spacing.sm }}>Family Tasks</Text>
            </View>
          </TouchableOpacity>
          
          {/* Quick Add Task */}
          <View style={styles.addTaskRow}>
            <View style={{ flex: 1 }}>
              <Input
                placeholder="Buy milk, refill prescriptions..."
                value={newTaskTitle}
                onChangeText={setNewTaskTitle}
                containerStyle={{ marginBottom: 0 }}
              />
            </View>
            <Button
              title="Add"
              onPress={handleAddTask}
              loading={addingTask}
              disabled={!newTaskTitle.trim()}
              size="sm"
              style={styles.addTaskBtn}
            />
          </View>

          <Divider />

          {/* Tasks List */}
          {tasks.length === 0 ? (
            <Text variant="body" color={colors.textSecondary} align="center" style={{ marginVertical: spacing.md }}>
              All tasks completed! Add tasks above.
            </Text>
          ) : (
            tasks.map((task) => (
              <View key={task.id} style={styles.taskRow}>
                <TouchableOpacity
                  onPress={() => toggleTask(task.id, !task.completed)}
                  style={styles.taskTouch}
                >
                  <Text style={styles.taskCheckbox}>
                    <MaterialCommunityIcons
                      name={task.completed ? 'checkbox-marked' : 'checkbox-blank-outline'}
                      size={18}
                      color={task.completed ? colors.primary : colors.textSecondary}
                    />
                  </Text>
                  <Text
                    variant="body"
                    style={[
                      styles.taskText,
                      task.completed && styles.taskTextCompleted,
                    ]}
                  >
                    {task.title}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => deleteTask(task.id)}>
                  <MaterialCommunityIcons name="trash-can-outline" size={18} color={colors.textTertiary} />
                </TouchableOpacity>
              </View>
            ))
          )}
        </Card>

        {/* 4. Recent Journal Entry Card */}
        <Card variant="elevated" padding="lg" style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderWithIcon}>
              <MaterialCommunityIcons name="file-document-outline" size={20} color={colors.primary} />
              <Text variant="h3" style={{ marginLeft: spacing.sm }}>Recent Journal Entry</Text>
            </View>
          </View>
          {recentEntry ? (
            <TouchableOpacity onPress={() => router.push('/(tabs)/journal')} activeOpacity={0.7}>
              <View style={styles.journalMeta}>
                <Text variant="captionMedium" color={colors.primary}>
                  Caregiver log
                </Text>
                {recentEntry.mood && (
                  <View style={styles.journalMood}>
                    <Text style={{ fontSize: 12 }}>{recentEntry.mood} state</Text>
                  </View>
                )}
              </View>
              <Text variant="body" numberOfLines={3} style={styles.journalContent}>
                "{recentEntry.content}"
              </Text>
              <Text variant="caption" color={colors.textTertiary} style={{ marginTop: spacing.sm }}>
                Logged on {formatDate(recentEntry.created_at, 'MMM d, yyyy h:mm a')}
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.emptyCardContent}>
              <Text variant="body" color={colors.textSecondary}>No journal updates posted yet.</Text>
              <Button
                title="Write Entry"
                onPress={() => router.push('/(tabs)/journal')}
                variant="ghost"
                size="sm"
                style={{ marginTop: spacing.sm }}
              />
            </View>
          )}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    padding: spacing.xl,
    paddingBottom: spacing['4xl'],
  },
  header: {
    marginBottom: spacing.xl,
    padding: spacing.lg,
    borderRadius: borderRadius['2xl'],
    backgroundColor: colors.surface,
    ...shadow.sm,
  },
  userName: {
    marginTop: spacing.xs,
  },
  patientBadge: {
    backgroundColor: colors.primaryFaded,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.base,
    borderRadius: borderRadius.md,
    alignSelf: 'flex-start',
    marginTop: spacing.sm,
  },
  card: {
    marginBottom: spacing.base,
  },
  cardHeader: {
    marginBottom: spacing.md,
  },
  cardHeaderWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  medContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  medDetails: {
    flex: 1,
    marginRight: spacing.md,
  },
  medButton: {
    paddingHorizontal: spacing.md,
  },
  emptyCardContent: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  addTaskRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
  },
  addTaskBtn: {
    height: 48,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  taskTouch: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  taskCheckbox: {
    fontSize: 20,
    marginRight: spacing.sm,
  },
  taskText: {
    flex: 1,
  },
  taskTextCompleted: {
    textDecorationLine: 'line-through',
    color: colors.textTertiary,
  },
  deleteTask: {
    fontSize: 14,
    padding: spacing.xs,
  },
  journalMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  journalMood: {
    backgroundColor: colors.accentFaded,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  journalContent: {
    fontStyle: 'italic',
    lineHeight: 20,
  },
});
