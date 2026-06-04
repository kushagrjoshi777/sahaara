// ============================================
// Sahaara — Medication Service (with Mock Mode)
// ============================================

import { supabase, IS_MOCK_MODE } from './supabase';
import { Medication, MedicationLog } from '../types/database';

let localMedications: Medication[] = [
  {
    id: 'mock-med-1',
    patient_id: 'mock-patient-uuid',
    user_id: 'mock-user-uuid',
    name: 'Lisinopril',
    dosage: '10mg',
    frequency: 'daily',
    reminder_times: ['08:00'],
    start_date: '2026-01-01',
    end_date: null,
    instructions: 'Take in the morning on an empty stomach.',
    is_active: true,
    created_at: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'mock-med-2',
    patient_id: 'mock-patient-uuid',
    user_id: 'mock-user-uuid',
    name: 'Metformin',
    dosage: '500mg',
    frequency: 'twice_daily',
    reminder_times: ['08:00', '20:00'],
    start_date: '2026-02-15',
    end_date: null,
    instructions: 'Take with breakfast and dinner meals.',
    is_active: true,
    created_at: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  }
];

let localMedicationLogs: MedicationLog[] = [
  {
    id: 'mock-log-1',
    medication_id: 'mock-med-1',
    user_id: 'mock-user-uuid',
    taken_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    scheduled_time: '08:00',
    status: 'taken',
    notes: null,
    created_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
  }
];

export const medicationService = {
  /**
   * Fetch active medications for a specific patient
   */
  async getMedications(patientId: string): Promise<Medication[]> {
    if (IS_MOCK_MODE) {
      return localMedications.filter((m) => m.patient_id === patientId);
    }

    const { data, error } = await supabase
      .from('medications')
      .select('*')
      .eq('patient_id', patientId)
      .order('name', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  /**
   * Add a new medication
   */
  async createMedication(medication: Omit<Medication, 'id' | 'created_at' | 'updated_at'>): Promise<Medication> {
    if (IS_MOCK_MODE) {
      const newMed: Medication = {
        id: 'mock-med-' + Math.random().toString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...medication,
      };
      localMedications.push(newMed);
      return newMed;
    }

    const { data, error } = await supabase
      .from('medications')
      .insert(medication)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update medication
   */
  async updateMedication(id: string, updates: Partial<Omit<Medication, 'id' | 'created_at' | 'updated_at'>>): Promise<Medication> {
    if (IS_MOCK_MODE) {
      let updated: Medication | null = null;
      localMedications = localMedications.map((m) => {
        if (m.id === id) {
          updated = { ...m, ...updates, updated_at: new Date().toISOString() };
          return updated;
        }
        return m;
      });
      if (!updated) throw new Error('Medication not found');
      return updated;
    }

    const { data, error } = await supabase
      .from('medications')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Delete medication
   */
  async deleteMedication(id: string): Promise<void> {
    if (IS_MOCK_MODE) {
      localMedications = localMedications.filter((m) => m.id !== id);
      return;
    }

    const { error } = await supabase
      .from('medications')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  /**
   * Log medication intake
   */
  async logMedicationTaken(
    medicationId: string,
    userId: string,
    scheduledTime: string,
    status: 'taken' | 'skipped' | 'missed',
    notes: string | null = null
  ): Promise<MedicationLog> {
    if (IS_MOCK_MODE) {
      const newLog: MedicationLog = {
        id: 'mock-log-' + Math.random().toString(),
        medication_id: medicationId,
        user_id: userId,
        taken_at: new Date().toISOString(),
        scheduled_time: scheduledTime,
        status,
        notes,
        created_at: new Date().toISOString(),
      };
      localMedicationLogs.unshift(newLog);
      return newLog;
    }

    const { data, error } = await supabase
      .from('medication_logs')
      .insert({
        medication_id: medicationId,
        user_id: userId,
        taken_at: new Date().toISOString(),
        scheduled_time: scheduledTime,
        status,
        notes,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Fetch medication logs for a user/patient
   */
  async getMedicationLogs(userId: string, limit: number = 30): Promise<MedicationLog[]> {
    if (IS_MOCK_MODE) {
      // Resolve medications inside the mock logs to mirror supabase's select('*, medications(*)') query
      return localMedicationLogs
        .map((log) => {
          const med = localMedications.find((m) => m.id === log.medication_id);
          return {
            ...log,
            medications: med || null,
          };
        })
        .slice(0, limit) as any;
    }

    const { data, error } = await supabase
      .from('medication_logs')
      .select('*, medications(*)')
      .eq('user_id', userId)
      .order('taken_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  },
};
