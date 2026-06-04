// ============================================
// Sahaara — Appointment Service (with Mock Mode)
// ============================================

import { supabase, IS_MOCK_MODE } from './supabase';
import { Appointment, AppointmentInsert, AppointmentUpdate } from '../types/database';
import { toDateString, addDays } from '../utils/dateHelpers';

let localAppointments: Appointment[] = [
  {
    id: 'mock-appt-1',
    user_id: 'mock-user-uuid',
    patient_id: 'mock-patient-uuid',
    title: 'Routine Cardiology Checkup',
    doctor_name: 'Dr. Evelyn Carter',
    location: 'St. Jude Hospital, Clinic B',
    date: toDateString(new Date()),
    start_time: '14:30:00',
    end_time: '15:30:00',
    notes: 'Bring updated medication list and log of blood pressure readings.',
    reminder_minutes: [15, 60],
    google_event_id: null,
    is_synced: false,
    created_at: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'mock-appt-2',
    user_id: 'mock-user-uuid',
    patient_id: 'mock-patient-uuid',
    title: 'Dental Cleaning & X-Ray',
    doctor_name: 'Dr. Marcus Vance',
    location: 'Vance Family Dental, Suite 400',
    date: toDateString(addDays(new Date(), 2)),
    start_time: '10:00:00',
    end_time: '11:00:00',
    notes: 'Pre-medication required 1 hour before appointment.',
    reminder_minutes: [30],
    google_event_id: null,
    is_synced: false,
    created_at: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  }
];

export const appointmentService = {
  /**
   * Get all appointments for a user, optionally filtered by date range and patient
   */
  async getAppointments(
    userId: string,
    options?: {
      startDate?: string;
      endDate?: string;
      patientId?: string;
    }
  ): Promise<Appointment[]> {
    if (IS_MOCK_MODE) {
      let filtered = [...localAppointments];
      if (options?.startDate) {
        filtered = filtered.filter((a) => a.date >= options.startDate!);
      }
      if (options?.endDate) {
        filtered = filtered.filter((a) => a.date <= options.endDate!);
      }
      if (options?.patientId) {
        filtered = filtered.filter((a) => a.patient_id === options.patientId);
      }
      return filtered.sort((a, b) => {
        if (a.date !== b.date) return a.date.localeCompare(b.date);
        return a.start_time.localeCompare(b.start_time);
      });
    }

    let query = supabase
      .from('appointments')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: true })
      .order('start_time', { ascending: true });

    if (options?.startDate) {
      query = query.gte('date', options.startDate);
    }
    if (options?.endDate) {
      query = query.lte('date', options.endDate);
    }
    if (options?.patientId) {
      query = query.eq('patient_id', options.patientId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  /**
   * Get a single appointment by ID
   */
  async getAppointmentById(id: string): Promise<Appointment | null> {
    if (IS_MOCK_MODE) {
      return localAppointments.find((a) => a.id === id) || null;
    }

    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Create a new appointment
   */
  async createAppointment(appointment: AppointmentInsert): Promise<Appointment> {
    if (IS_MOCK_MODE) {
      const newAppt: Appointment = {
        id: Math.random().toString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...appointment,
      };
      localAppointments.push(newAppt);
      return newAppt;
    }

    const { data, error } = await supabase
      .from('appointments')
      .insert(appointment)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update an existing appointment
   */
  async updateAppointment(id: string, updates: AppointmentUpdate): Promise<Appointment> {
    if (IS_MOCK_MODE) {
      let updated: Appointment | null = null;
      localAppointments = localAppointments.map((a) => {
        if (a.id === id) {
          updated = { ...a, ...updates, updated_at: new Date().toISOString() };
          return updated;
        }
        return a;
      });
      if (!updated) throw new Error('Appointment not found');
      return updated;
    }

    const { data, error } = await supabase
      .from('appointments')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Delete an appointment
   */
  async deleteAppointment(id: string): Promise<void> {
    if (IS_MOCK_MODE) {
      localAppointments = localAppointments.filter((a) => a.id !== id);
      return;
    }

    const { error } = await supabase
      .from('appointments')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  /**
   * Get upcoming appointments (from today forward)
   */
  async getUpcomingAppointments(
    userId: string,
    limit: number = 10,
    patientId?: string
  ): Promise<Appointment[]> {
    if (IS_MOCK_MODE) {
      const today = toDateString(new Date());
      let filtered = localAppointments.filter((a) => a.date >= today);
      if (patientId) {
        filtered = filtered.filter((a) => a.patient_id === patientId);
      }
      return filtered
        .sort((a, b) => {
          if (a.date !== b.date) return a.date.localeCompare(b.date);
          return a.start_time.localeCompare(b.start_time);
        })
        .slice(0, limit);
    }

    const today = new Date().toISOString().split('T')[0];
    let query = supabase
      .from('appointments')
      .select('*')
      .eq('user_id', userId)
      .gte('date', today)
      .order('date', { ascending: true })
      .order('start_time', { ascending: true })
      .limit(limit);

    if (patientId) {
      query = query.eq('patient_id', patientId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  /**
   * Get appointments for a specific date
   */
  async getAppointmentsByDate(
    userId: string,
    date: string,
    patientId?: string
  ): Promise<Appointment[]> {
    if (IS_MOCK_MODE) {
      let filtered = localAppointments.filter((a) => a.date === date);
      if (patientId) {
        filtered = filtered.filter((a) => a.patient_id === patientId);
      }
      return filtered.sort((a, b) => a.start_time.localeCompare(b.start_time));
    }

    let query = supabase
      .from('appointments')
      .select('*')
      .eq('user_id', userId)
      .eq('date', date)
      .order('start_time', { ascending: true });

    if (patientId) {
      query = query.eq('patient_id', patientId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },
};
