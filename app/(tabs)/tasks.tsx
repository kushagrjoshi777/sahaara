// ============================================
// Sahaara — Dedicated Tasks / Checklist Tab
// ============================================

import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '@/components/ui/Text';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Divider, LoadingSpinner, EmptyState } from '@/components/ui/Shared';
import { useTasks } from '@/hooks/useTasks';
import { usePatient } from '@/context/PatientContext';
import { colors } from '@/theme/colors';
import { spacing, borderRadius, shadow } from '@/theme/spacing';
import { formatDate } from '@/utils/dateHelpers';

type FilterMode = 'all' | 'pending' | 'completed';

export default function TasksScreen() {
  const { tasks, loading, addTask, toggleTask, deleteTask } = useTasks();
  const { selectedPatient } = usePatient();
  const [filter, setFilter] = useState<FilterMode>('all');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleAddTask = async () => {
    if (!newTaskTitle.trim()) return;
    setSubmitting(true);
    try {
      await addTask(newTaskTitle.trim());
      setNewTaskTitle('');
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to add task');
    } finally {
      setSubmitting(false);
    }
  };

  const completedCount = tasks.filter((t) => t.completed).length;
  const totalCount = tasks.length;
  const completionRate = totalCount > 0 ? completedCount / totalCount : 0;

  const filteredTasks = tasks.filter((t) => {
    if (filter === 'pending') return !t.completed;
    if (filter === 'completed') return t.completed;
    return true;
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text variant="h2">Checklist</Text>
          <Text variant="caption" color={colors.textSecondary}>
            {formatDate(new Date(), 'EEEE, MMMM d')}
          </Text>
        </View>
        {selectedPatient && (
          <View style={styles.patientBadge}>
            <Text variant="tiny" color={colors.primary}>
              ❤️ {selectedPatient.name}
            </Text>
          </View>
        )}
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Progress Card */}
          {selectedPatient && totalCount > 0 && (
            <Card variant="elevated" padding="lg" style={styles.progressCard}>
              <View style={styles.progressHeader}>
                <Text variant="bodyMedium">Daily Completion</Text>
                <Text variant="bodySemiBold" color={colors.primary}>
                  {completedCount} of {totalCount} ({Math.round(completionRate * 100)}%)
                </Text>
              </View>
              <View style={styles.progressBarBg}>
                <View
                  style={[
                    styles.progressBarFill,
                    { width: `${completionRate * 100}%` },
                  ]}
                />
              </View>
              <Text variant="caption" color={colors.textSecondary} style={{ marginTop: spacing.sm }}>
                {completionRate === 1 
                  ? '🌸 Fantastic! All tasks completed today.' 
                  : '✨ Supporting your loved one step by step.'}
              </Text>
            </Card>
          )}

          {/* Quick Add Form */}
          <Card variant="outlined" padding="md" style={styles.addCard}>
            <View style={styles.addRow}>
              <View style={{ flex: 1 }}>
                <Input
                  placeholder="Add a task (e.g., Water plants, prepare medication)..."
                  value={newTaskTitle}
                  onChangeText={setNewTaskTitle}
                  containerStyle={{ marginBottom: 0 }}
                />
              </View>
              <Button
                title="Add"
                onPress={handleAddTask}
                loading={submitting}
                disabled={!newTaskTitle.trim()}
                size="sm"
                style={styles.addBtn}
              />
            </View>
          </Card>

          {/* Filter Chips */}
          <View style={styles.filterRow}>
            {(['all', 'pending', 'completed'] as FilterMode[]).map((mode) => (
              <TouchableOpacity
                key={mode}
                onPress={() => setFilter(mode)}
                style={[
                  styles.filterChip,
                  filter === mode && styles.filterChipActive,
                ]}
              >
                <Text
                  variant="captionMedium"
                  color={filter === mode ? colors.white : colors.textSecondary}
                  style={{ textTransform: 'capitalize' }}
                >
                  {mode}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Checklist Items */}
          {loading ? (
            <LoadingSpinner />
          ) : filteredTasks.length === 0 ? (
            <EmptyState
              title={
                filter === 'all'
                  ? 'All clear!'
                  : filter === 'pending'
                  ? 'No pending tasks!'
                  : 'No completed tasks yet.'
              }
              message={
                filter === 'all'
                  ? 'Enjoy your peaceful day, or add a task above.'
                  : 'Tasks you need to complete will show up here.'
              }
              icon={<Text style={{ fontSize: 40 }}>🌸</Text>}
            />
          ) : (
            filteredTasks.map((task) => (
              <Card
                key={task.id}
                variant="outlined"
                padding="md"
                style={StyleSheet.flatten([
                  styles.taskCard,
                  task.completed ? styles.taskCardCompleted : null,
                ])}
              >
                <View style={styles.taskContent}>
                  <TouchableOpacity
                    onPress={() => toggleTask(task.id, !task.completed)}
                    style={styles.taskTouch}
                  >
                    <View
                      style={[
                        styles.checkbox,
                        task.completed && styles.checkboxChecked,
                      ]}
                    >
                      {task.completed && (
                        <Text style={styles.checkIcon}>✓</Text>
                      )}
                    </View>
                    <Text
                      variant="bodyMedium"
                      style={[
                        styles.taskText,
                        task.completed && styles.taskTextCompleted,
                      ]}
                    >
                      {task.title}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => deleteTask(task.id)}
                    style={styles.deleteBtnContainer}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Text style={styles.deleteIcon}>✕</Text>
                  </TouchableOpacity>
                </View>
              </Card>
            ))
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  patientBadge: {
    backgroundColor: colors.primaryFaded,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.full,
  },
  scroll: {
    padding: spacing.xl,
    paddingBottom: spacing['4xl'],
  },
  progressCard: {
    marginBottom: spacing.base,
    backgroundColor: colors.surface,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.accent, // Sage Green accent!
    borderRadius: borderRadius.full,
  },
  addCard: {
    marginBottom: spacing.base,
    backgroundColor: colors.surface,
    borderColor: colors.borderLight,
  },
  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  addBtn: {
    height: 48,
    paddingHorizontal: spacing.lg,
  },
  filterRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.base,
    marginTop: spacing.xs,
  },
  filterChip: {
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.base,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  taskCard: {
    marginBottom: spacing.sm,
    backgroundColor: colors.surface,
    borderColor: colors.borderLight,
  },
  taskCardCompleted: {
    opacity: 0.7,
    backgroundColor: colors.surfaceElevated,
  },
  taskContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  taskTouch: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: spacing.md,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: borderRadius.sm,
    borderWidth: 2,
    borderColor: colors.textSecondary,
    marginRight: spacing.base,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    borderColor: colors.accent,
    backgroundColor: colors.accent,
  },
  checkIcon: {
    color: colors.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
  taskText: {
    flex: 1,
    color: colors.text,
  },
  taskTextCompleted: {
    textDecorationLine: 'line-through',
    color: colors.textTertiary,
  },
  deleteBtnContainer: {
    padding: spacing.xs,
  },
  deleteIcon: {
    color: colors.textTertiary,
    fontSize: 16,
  },
});
