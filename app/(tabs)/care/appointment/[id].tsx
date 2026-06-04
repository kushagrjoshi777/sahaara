// ============================================
// Sahaara — View Appointment Detail Screen
// ============================================

import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Text } from '@/components/ui/Text';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/Shared';
import { useAppointments } from '@/hooks/useAppointments';
import { usePatient } from '@/context/PatientContext';
import { colors } from '@/theme/colors';
import { spacing, borderRadius } from '@/theme/spacing';
import { formatDate, formatTime } from '@/utils/dateHelpers';
import { Appointment } from '@/types/database';

export default function AppointmentDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getAppointmentById, deleteAppointment } = useAppointments();
  const { selectedPatient } = usePatient();
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAppointment() {
      if (!id) return;
      try {
        const data = await getAppointmentById(id);
        setAppointment(data);
      } catch (e: any) {
        Alert.alert('Error', e.message || 'Failed to load appointment details');
      } finally {
        setLoading(false);
      }
    }
    loadAppointment();
  }, [id]);

  const handleDelete = () => {
    if (!appointment) return;
    Alert.alert(
      'Delete Appointment',
      'Are you sure you want to delete this appointment?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAppointment(appointment.id);
              router.back();
            } catch (e: any) {
              Alert.alert('Error', e.message || 'Failed to delete appointment');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  if (!appointment) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text variant="h3">Appointment not found</Text>
          <Button title="Back" onPress={() => router.back()} style={{ marginTop: spacing.md }} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text variant="body" color={colors.primary}>◀ Back</Text>
        </TouchableOpacity>
        <Text variant="h3">Appointment Details</Text>
        <TouchableOpacity onPress={() => router.push(`/(tabs)/care/appointment/edit/${appointment.id}`)} style={styles.editButton}>
          <Text variant="body" color={colors.primary}>Edit</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Card variant="elevated" padding="lg" style={styles.mainCard}>
          <View style={styles.accentBar} />
          
          <Text variant="h2" style={styles.title}>
            {appointment.title}
          </Text>

          {selectedPatient && (
            <View style={styles.patientBadge}>
              <Text variant="captionMedium" color={colors.primary}>
                Patient: {selectedPatient.name}
              </Text>
            </View>
          )}

          <View style={styles.infoSection}>
            <Text variant="label" color={colors.textSecondary}>Date</Text>
            <Text variant="bodyLarge" style={styles.infoValue}>
              📅 {formatDate(appointment.date, 'EEEE, MMMM d, yyyy')}
            </Text>
          </View>

          <View style={styles.infoSection}>
            <Text variant="label" color={colors.textSecondary}>Time</Text>
            <Text variant="bodyLarge" style={styles.infoValue}>
              ⏰ {formatTime(appointment.start_time)}
              {appointment.end_time ? ` - ${formatTime(appointment.end_time)}` : ''}
            </Text>
          </View>

          {appointment.doctor_name && (
            <View style={styles.infoSection}>
              <Text variant="label" color={colors.textSecondary}>Doctor</Text>
              <Text variant="bodyLarge" style={styles.infoValue}>
                👨‍⚕️ {appointment.doctor_name}
              </Text>
            </View>
          )}

          {appointment.location && (
            <View style={styles.infoSection}>
              <Text variant="label" color={colors.textSecondary}>Location</Text>
              <Text variant="bodyLarge" style={styles.infoValue}>
                📍 {appointment.location}
              </Text>
            </View>
          )}

          {appointment.notes && (
            <View style={styles.infoSection}>
              <Text variant="label" color={colors.textSecondary}>Notes</Text>
              <Text variant="body" style={styles.notesText}>
                {appointment.notes}
              </Text>
            </View>
          )}
        </Card>

        {/* Delete Action */}
        <Button
          title="Delete Appointment"
          onPress={handleDelete}
          variant="danger"
          fullWidth
          size="lg"
          style={styles.deleteButton}
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
  backButton: {
    width: 60,
  },
  editButton: {
    width: 60,
    alignItems: 'flex-end',
  },
  scroll: {
    padding: spacing.xl,
  },
  mainCard: {
    marginBottom: spacing.xl,
    position: 'relative',
  },
  accentBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 6,
    backgroundColor: colors.primary,
  },
  title: {
    marginBottom: spacing.sm,
    paddingLeft: spacing.sm,
  },
  patientBadge: {
    backgroundColor: colors.primaryFaded,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
    alignSelf: 'flex-start',
    marginBottom: spacing.lg,
    marginLeft: spacing.sm,
  },
  infoSection: {
    marginBottom: spacing.lg,
    paddingLeft: spacing.sm,
  },
  infoValue: {
    marginTop: spacing.xs,
  },
  notesText: {
    marginTop: spacing.xs,
    lineHeight: 22,
  },
  deleteButton: {
    marginTop: spacing.md,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
});
