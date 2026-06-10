// ============================================
// Sahaara — Patient Profile Details & Edit
// ============================================

import React, { useEffect, useState } from 'react';
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
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Text } from '@/components/ui/Text';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Divider, LoadingSpinner } from '@/components/ui/Shared';
import { patientService } from '@/services/patients';
import { Patient, EmergencyContact } from '@/types/database';
import { colors } from '@/theme/colors';
import { spacing, borderRadius } from '@/theme/spacing';

export default function PatientDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'other' | 'prefer_not_to_say' | null>(null);
  const [notes, setNotes] = useState('');
  
  // Medical Conditions
  const [conditions, setConditions] = useState<string[]>([]);
  const [newCondition, setNewCondition] = useState('');

  // Emergency Contacts
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactRelation, setContactRelation] = useState('');

  useEffect(() => {
    async function loadPatient() {
      if (!id) return;
      try {
        const data = await patientService.getPatientById(id);
        if (data) {
          setPatient(data);
          setName(data.name);
          setDob(data.date_of_birth || '');
          setGender(data.gender);
          setNotes(data.notes || '');
          setConditions(data.medical_conditions || []);
          setContacts(data.emergency_contacts || []);
        }
      } catch (e: any) {
        Alert.alert('Error', e.message || 'Failed to load patient profile');
        router.back();
      } finally {
        setLoading(false);
      }
    }
    loadPatient();
  }, [id]);

  const handleSave = async () => {
    if (!id || !name.trim()) return;
    setSaving(true);
    try {
      await patientService.updatePatient(id, {
        name: name.trim(),
        date_of_birth: dob.trim() || null,
        gender,
        notes: notes.trim() || null,
        medical_conditions: conditions.length > 0 ? conditions : null,
        emergency_contacts: contacts,
      });
      Alert.alert('Success', 'Patient profile updated successfully!');
      router.back();
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to update patient profile');
    } finally {
      setSaving(false);
    }
  };

  const handleAddCondition = () => {
    if (!newCondition.trim()) return;
    if (conditions.includes(newCondition.trim())) {
      setNewCondition('');
      return;
    }
    setConditions([...conditions, newCondition.trim()]);
    setNewCondition('');
  };

  const handleRemoveCondition = (index: number) => {
    setConditions(conditions.filter((_, i) => i !== index));
  };

  const handleAddContact = () => {
    if (!contactName.trim() || !contactPhone.trim() || !contactRelation.trim()) {
      Alert.alert('Validation', 'Please fill in name, relationship, and phone number.');
      return;
    }
    const newContact: EmergencyContact = {
      name: contactName.trim(),
      phone: contactPhone.trim(),
      relationship: contactRelation.trim(),
    };
    setContacts([...contacts, newContact]);
    setContactName('');
    setContactPhone('');
    setContactRelation('');
  };

  const handleRemoveContact = (index: number) => {
    setContacts(contacts.filter((_, i) => i !== index));
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text variant="body" color={colors.primary}>◀ Back</Text>
        </TouchableOpacity>
        <Text variant="h3">Medical Profile</Text>
        <View style={styles.backBtn} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* General Information */}
          <Card variant="elevated" padding="lg" style={styles.card}>
            <Text variant="h4" color={colors.primary} style={styles.sectionTitle}>
              General Information
            </Text>
            <Input
              label="Loved One's Name *"
              placeholder="e.g. Sarah Connor"
              value={name}
              onChangeText={setName}
            />
            <Input
              label="Date of Birth"
              placeholder="YYYY-MM-DD"
              value={dob}
              onChangeText={setDob}
            />
            
            <Text variant="label" color={colors.textSecondary} style={{ marginBottom: spacing.sm }}>
              Gender
            </Text>
            <View style={styles.genderRow}>
              {(['male', 'female', 'other', 'prefer_not_to_say'] as const).map((g) => (
                <TouchableOpacity
                  key={g}
                  onPress={() => setGender(g)}
                  style={[
                    styles.genderButton,
                    gender === g && styles.genderButtonActive,
                  ]}
                >
                  <Text
                    variant="tiny"
                    color={gender === g ? colors.white : colors.textSecondary}
                    style={{ textTransform: 'capitalize' }}
                  >
                    {g === 'prefer_not_to_say' ? 'Prefer Not To Say' : g}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Card>

          {/* Medical Conditions */}
          <Card variant="elevated" padding="lg" style={styles.card}>
            <Text variant="h4" color={colors.primary} style={styles.sectionTitle}>
              Medical Conditions
            </Text>
            <View style={styles.tagInputRow}>
              <View style={{ flex: 1 }}>
                <Input
                  placeholder="Add a condition (e.g. Hypertension)"
                  value={newCondition}
                  onChangeText={setNewCondition}
                  containerStyle={{ marginBottom: 0 }}
                />
              </View>
              <Button title="Add" onPress={handleAddCondition} size="sm" style={styles.addTagBtn} />
            </View>

            <View style={styles.tagsContainer}>
              {conditions.length === 0 ? (
                <Text variant="caption" color={colors.textTertiary}>
                  No medical conditions listed.
                </Text>
              ) : (
                conditions.map((c, index) => (
                  <View key={index} style={styles.tag}>
                    <Text variant="caption" color={colors.primaryDark}>
                      {c}
                    </Text>
                        <TouchableOpacity onPress={() => handleRemoveCondition(index)}>
                          <MaterialCommunityIcons name="close" size={12} color={colors.primaryDark} />
                        </TouchableOpacity>
                  </View>
                ))
              )}
            </View>
          </Card>

          {/* Emergency Contacts */}
          <Card variant="elevated" padding="lg" style={styles.card}>
            <Text variant="h4" color={colors.primary} style={styles.sectionTitle}>
              Emergency Contacts
            </Text>
            
            {/* Contacts list */}
            {contacts.map((contact, index) => (
              <View key={index} style={styles.contactItem}>
                <View style={{ flex: 1 }}>
                  <Text variant="bodyMedium">
                    {contact.name} ({contact.relationship})
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                    <MaterialCommunityIcons name="phone-outline" size={14} color={colors.textSecondary} />
                    <Text variant="caption" color={colors.textSecondary}>{contact.phone}</Text>
                  </View>
                </View>
                <TouchableOpacity onPress={() => handleRemoveContact(index)} style={styles.removeContactBtn}>
                  <Text variant="caption" color={colors.error}>Remove</Text>
                </TouchableOpacity>
              </View>
            ))}

            <Divider />

            {/* Quick add contact fields */}
            <Text variant="label" color={colors.textSecondary} style={{ marginBottom: spacing.xs }}>
              Add Contact
            </Text>
            <View style={styles.contactForm}>
              <Input
                placeholder="Name"
                value={contactName}
                onChangeText={setContactName}
                containerStyle={styles.halfInput}
              />
              <Input
                placeholder="Relationship"
                value={contactRelation}
                onChangeText={setContactRelation}
                containerStyle={styles.halfInput}
              />
            </View>
            <Input
              placeholder="Phone number"
              value={contactPhone}
              onChangeText={setContactPhone}
              keyboardType="phone-pad"
            />
            <Button
              title="+ Add Contact"
              onPress={handleAddContact}
              variant="outline"
              size="sm"
              style={{ marginTop: spacing.xs }}
            />
          </Card>

          {/* Care Notes */}
          <Card variant="elevated" padding="lg" style={styles.card}>
            <Text variant="h4" color={colors.primary} style={styles.sectionTitle}>
              Care Notes
            </Text>
            <Input
              placeholder="Dietary details, sleep schedules, special habits, preferences..."
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={4}
            />
          </Card>

          <Button
            title="Save Profile Changes"
            onPress={handleSave}
            loading={saving}
            disabled={!name.trim()}
            fullWidth
            size="lg"
            style={styles.saveButton}
          />
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
    paddingVertical: spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    backgroundColor: colors.surface,
  },
  backBtn: {
    width: 60,
  },
  scroll: {
    padding: spacing.xl,
    paddingBottom: spacing['4xl'],
  },
  card: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    marginBottom: spacing.base,
  },
  genderRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  genderButton: {
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  genderButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tagInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  addTagBtn: {
    height: 48,
    paddingHorizontal: spacing.lg,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryFaded,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.full,
  },
  removeTagIcon: {
    color: colors.primaryDark,
    fontSize: 12,
    fontWeight: 'bold',
  },
  contactItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  removeContactBtn: {
    padding: spacing.xs,
  },
  contactForm: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  halfInput: {
    flex: 1,
  },
  saveButton: {
    marginVertical: spacing.md,
  },
});
