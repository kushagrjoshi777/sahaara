// ============================================
// Sahaara — Shared Caregiving Journal
// ============================================

import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '@/components/ui/Text';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner, Divider } from '@/components/ui/Shared';
import { useJournal } from '@/hooks/useJournal';
import { useAuth } from '@/context/AuthContext';
import { usePatient } from '@/context/PatientContext';
import { colors } from '@/theme/colors';
import { spacing, borderRadius } from '@/theme/spacing';
import { formatDate } from '@/utils/dateHelpers';

const MOODS = [
  { emoji: '😊', label: 'Good' },
  { emoji: '😐', label: 'Stable' },
  { emoji: '😢', label: 'Low' },
  { emoji: '😷', label: 'Sick' },
  { emoji: '😠', label: 'Agitated' },
];

export default function JournalScreen() {
  const { user } = useAuth();
  const { selectedPatient } = usePatient();
  const { entries, loading, addEntry, deleteEntry } = useJournal();
  
  const [content, setContent] = useState('');
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const authorName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Caregiver';

  const handleSaveEntry = async () => {
    if (!content.trim()) return;
    setSubmitting(true);
    try {
      await addEntry(content.trim(), selectedMood, null);
      setContent('');
      setSelectedMood(null);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to post entry');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteEntry = (id: string) => {
    Alert.alert(
      'Delete Entry',
      'Are you sure you want to delete this journal note?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteEntry(id);
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text variant="h2">Shared Journal</Text>
        {selectedPatient && (
          <Text variant="caption" color={colors.textSecondary}>
            Care notes for {selectedPatient.name}
          </Text>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        {/* Log a New Observation */}
        <Card variant="elevated" padding="lg" style={styles.formCard}>
          <Text variant="h4" style={styles.sectionTitle}>✍ Log Daily Update</Text>
          <Input
            placeholder="Write daily recovery notes, symptoms, or medication responses..."
            value={content}
            onChangeText={setContent}
            multiline
            numberOfLines={4}
          />

          <Text variant="label" color={colors.textSecondary} style={styles.moodLabel}>
            How is their wellness/mood today?
          </Text>
          <View style={styles.moodRow}>
            {MOODS.map((mood) => (
              <TouchableOpacity
                key={mood.emoji}
                onPress={() => setSelectedMood(selectedMood === mood.emoji ? null : mood.emoji)}
                style={[
                  styles.moodButton,
                  selectedMood === mood.emoji && styles.moodButtonSelected,
                ]}
              >
                <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                <Text variant="tiny" color={selectedMood === mood.emoji ? colors.primary : colors.textSecondary}>
                  {mood.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Button
            title="Post to Care Timeline"
            onPress={handleSaveEntry}
            loading={submitting}
            disabled={!content.trim()}
            fullWidth
            size="lg"
            style={styles.postButton}
          />
        </Card>

        {/* Care Timeline */}
        <Text variant="labelLarge" color={colors.textSecondary} style={styles.timelineTitle}>
          📋 Care Timeline
        </Text>

        {loading ? (
          <LoadingSpinner />
        ) : entries.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text variant="body" color={colors.textTertiary} align="center">
              No journal entries yet.
            </Text>
            <Text variant="caption" color={colors.textTertiary} align="center" style={{ marginTop: spacing.xs }}>
              Log symptoms, doctor calls, or meals above.
            </Text>
          </View>
        ) : (
          entries.map((entry) => (
            <Card key={entry.id} variant="outlined" padding="lg" style={styles.timelineCard}>
              <View style={styles.entryHeader}>
                <View style={styles.authorRow}>
                  <Text variant="bodySemiBold" color={colors.primary}>
                    👤 {authorName}
                  </Text>
                  {entry.mood && (
                    <View style={styles.entryMood}>
                      <Text style={styles.entryMoodText}>{entry.mood} Daily State</Text>
                    </View>
                  )}
                </View>
                <TouchableOpacity onPress={() => handleDeleteEntry(entry.id)} style={styles.deleteButton}>
                  <Text variant="caption" color={colors.error}>Delete</Text>
                </TouchableOpacity>
              </View>

              <Text variant="body" style={styles.entryContent}>
                {entry.content}
              </Text>
              
              <Divider />
              
              <Text variant="caption" color={colors.textTertiary}>
                🕒 Posted on {formatDate(entry.created_at, 'MMM d, yyyy h:mm a')}
              </Text>
            </Card>
          ))
        )}
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
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  scroll: {
    padding: spacing.xl,
    paddingBottom: spacing['4xl'],
  },
  formCard: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    marginBottom: spacing.base,
  },
  moodLabel: {
    marginBottom: spacing.sm,
  },
  moodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  moodButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
    marginHorizontal: 3,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceElevated,
  },
  moodButtonSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryFaded,
  },
  moodEmoji: {
    fontSize: 20,
    marginBottom: 2,
  },
  postButton: {
    marginTop: spacing.sm,
  },
  timelineTitle: {
    marginBottom: spacing.base,
  },
  timelineCard: {
    marginBottom: spacing.base,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  entryMood: {
    backgroundColor: colors.accentFaded,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  entryMoodText: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    color: colors.accentDark,
  },
  entryContent: {
    lineHeight: 22,
  },
  deleteButton: {
    padding: spacing.xs,
  },
  emptyContainer: {
    paddingVertical: spacing['3xl'],
    alignItems: 'center',
  },
});
