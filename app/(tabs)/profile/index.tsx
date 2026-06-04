// ============================================
// Sahaara — Profile & Settings Landing
// ============================================

import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Text } from '@/components/ui/Text';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Divider, Modal } from '@/components/ui/Shared';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/context/AuthContext';
import { usePatient } from '@/context/PatientContext';
import { colors } from '@/theme/colors';
import { spacing, borderRadius } from '@/theme/spacing';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { patients, selectedPatient, selectPatient, addPatient } = usePatient();
  const [modalVisible, setModalVisible] = useState(false);
  const [newPatientName, setNewPatientName] = useState('');
  const [adding, setAdding] = useState(false);

  const email = user?.email || 'N/A';
  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Caregiver';

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await signOut();
        },
      },
    ]);
  };

  const handleAddPatient = async () => {
    if (!newPatientName.trim()) return;
    setAdding(true);
    try {
      await addPatient(newPatientName.trim());
      setNewPatientName('');
      setModalVisible(false);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to add patient');
    } finally {
      setAdding(false);
    }
  };

  const handleSelectAndNavigate = (patient: any) => {
    selectPatient(patient);
    router.push(`/(tabs)/profile/patient/${patient.id}`);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text variant="h2">Profile & Settings</Text>
        </View>

        {/* User Card */}
        <Card variant="elevated" padding="lg" style={styles.card}>
          <View style={styles.avatarRow}>
            <View style={styles.avatar}>
              <Text style={{ fontSize: 24 }}>👤</Text>
            </View>
            <View style={styles.userInfo}>
              <Text variant="h3">{userName}</Text>
              <Text variant="caption" color={colors.textSecondary}>
                Primary Caregiver
              </Text>
              <Text variant="tiny" color={colors.textTertiary} style={{ marginTop: 2 }}>
                {email}
              </Text>
            </View>
          </View>
        </Card>

        {/* Patients section (Multi-patient support UI) */}
        <Text variant="labelLarge" color={colors.textSecondary} style={styles.sectionHeader}>
          Manage Loved Ones
        </Text>

        <Card variant="elevated" padding="lg" style={styles.card}>
          {patients.length === 0 ? (
            <Text variant="body" color={colors.textTertiary}>
              No patients added yet. Add a patient to start managing care.
            </Text>
          ) : (
            patients.map((patient) => {
              const isSelected = selectedPatient?.id === patient.id;
              return (
                <TouchableOpacity
                  key={patient.id}
                  onPress={() => selectPatient(patient)}
                  style={[
                    styles.patientItem,
                    isSelected && styles.patientItemActive,
                  ]}
                  activeOpacity={0.8}
                >
                  <View style={styles.patientItemLeft}>
                    <Text style={{ fontSize: 22, marginRight: spacing.md }}>👵</Text>
                    <View>
                      <Text variant="bodySemiBold" color={isSelected ? colors.primaryDark : colors.text}>
                        {patient.name}
                      </Text>
                      <Text variant="caption" color={colors.textSecondary}>
                        {isSelected ? 'Active Care Target' : 'Inactive'}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.detailsBtn}
                    onPress={() => handleSelectAndNavigate(patient)}
                  >
                    <Text variant="captionMedium" color={colors.primary}>
                      Details ➔
                    </Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              );
            })
          )}

          <Divider />

          <Button
            title="+ Add New Patient"
            onPress={() => setModalVisible(true)}
            variant="ghost"
            fullWidth
          />
        </Card>

        {/* Sync Settings Placeholder */}
        <Text variant="labelLarge" color={colors.textSecondary} style={styles.sectionHeader}>
          Integrations
        </Text>
        <Card variant="outlined" padding="lg" style={styles.card}>
          <Text variant="bodyMedium">Google Calendar Sync</Text>
          <Text variant="caption" color={colors.textTertiary} style={{ marginTop: spacing.xs }}>
            Connect to sync appointment schedules automatically.
          </Text>
          <Button
            title="Connect Google Calendar"
            onPress={() => Alert.alert('Integration', 'Google Calendar Sync will be active in Phase 2!')}
            variant="outline"
            size="sm"
            style={{ marginTop: spacing.base, alignSelf: 'flex-start' }}
          />
        </Card>

        {/* Sign Out Button */}
        <Button
          title="Sign Out"
          onPress={handleSignOut}
          variant="danger"
          fullWidth
          size="lg"
          style={styles.signOutButton}
        />
      </ScrollView>

      {/* Add Patient Modal */}
      <Modal visible={modalVisible} onClose={() => setModalVisible(false)} title="Add New Patient">
        <Input
          label="Patient Name *"
          placeholder="Enter loved one's full name"
          value={newPatientName}
          onChangeText={setNewPatientName}
        />
        <Button
          title="Add Patient"
          onPress={handleAddPatient}
          loading={adding}
          disabled={!newPatientName.trim()}
          fullWidth
          size="lg"
        />
      </Modal>
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
    marginBottom: spacing['2xl'],
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.lg,
  },
  userInfo: {
    flex: 1,
  },
  card: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    marginBottom: spacing.sm,
  },
  patientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    borderColor: colors.borderLight,
    backgroundColor: colors.surfaceElevated,
    marginBottom: spacing.sm,
  },
  patientItemActive: {
    borderColor: colors.primaryLight,
    backgroundColor: colors.primaryFaded,
  },
  patientItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  detailsBtn: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  signOutButton: {
    marginTop: spacing.md,
  },
});
