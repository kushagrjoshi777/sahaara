// ============================================
// Sahaara — Patient Service (with Mock Mode)
// ============================================

import { supabase, IS_MOCK_MODE } from './supabase';
import { Patient, PatientInsert, PatientUpdate } from '../types/database';

let localPatients: Patient[] = [
  {
    id: 'mock-patient-uuid',
    user_id: 'mock-user-uuid',
    name: 'Sarah Connor',
    date_of_birth: '1965-11-10',
    gender: 'female',
    medical_conditions: ['Hypertension', 'Mild Cognitive Impairment'],
    emergency_contacts: [
      { name: 'John Connor', phone: '555-0199', relationship: 'Son' }
    ],
    notes: 'Loves gardening and listening to classical music. Needs assistance with morning medications.',
    avatar_url: null,
    created_at: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  }
];

export const patientService = {
  /**
   * Get all patients for a user
   */
  async getPatients(userId: string): Promise<Patient[]> {
    if (IS_MOCK_MODE) {
      return [...localPatients];
    }

    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('user_id', userId)
      .order('name', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  /**
   * Get a single patient by ID
   */
  async getPatientById(id: string): Promise<Patient | null> {
    if (IS_MOCK_MODE) {
      return localPatients.find((p) => p.id === id) || null;
    }

    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Create a new patient
   */
  async createPatient(patient: PatientInsert): Promise<Patient> {
    if (IS_MOCK_MODE) {
      const newPatient: Patient = {
        id: Math.random().toString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...patient,
      };
      localPatients.push(newPatient);
      return newPatient;
    }

    const { data, error } = await supabase
      .from('patients')
      .insert(patient)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update an existing patient
   */
  async updatePatient(id: string, updates: PatientUpdate): Promise<Patient> {
    if (IS_MOCK_MODE) {
      let updated: Patient | null = null;
      localPatients = localPatients.map((p) => {
        if (p.id === id) {
          updated = { ...p, ...updates, updated_at: new Date().toISOString() };
          return updated;
        }
        return p;
      });
      if (!updated) throw new Error('Patient not found');
      return updated;
    }

    const { data, error } = await supabase
      .from('patients')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Delete a patient
   */
  async deletePatient(id: string): Promise<void> {
    if (IS_MOCK_MODE) {
      localPatients = localPatients.filter((p) => p.id !== id);
      return;
    }

    const { error } = await supabase
      .from('patients')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};
