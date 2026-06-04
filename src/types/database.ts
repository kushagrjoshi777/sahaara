// ============================================
// Sahaara — Database Types
// ============================================

export interface User {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  google_access_token: string | null;
  google_refresh_token: string | null;
  google_token_expiry: string | null;
  notification_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface Patient {
  id: string;
  user_id: string;
  name: string;
  date_of_birth: string | null;
  gender: 'male' | 'female' | 'other' | 'prefer_not_to_say' | null;
  medical_conditions: string[] | null;
  emergency_contacts: EmergencyContact[];
  notes: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface EmergencyContact {
  name: string;
  phone: string;
  relationship: string;
}

export interface Medication {
  id: string;
  patient_id: string;
  user_id: string;
  name: string;
  dosage: string | null;
  frequency: 'daily' | 'twice_daily' | 'three_times_daily' | 'weekly' | 'as_needed';
  reminder_times: string[] | null;
  start_date: string;
  end_date: string | null;
  instructions: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface MedicationLog {
  id: string;
  medication_id: string;
  user_id: string;
  taken_at: string;
  scheduled_time: string;
  status: 'taken' | 'missed' | 'skipped';
  notes: string | null;
  created_at: string;
}

export interface Appointment {
  id: string;
  user_id: string;
  patient_id: string | null;
  title: string;
  doctor_name: string | null;
  location: string | null;
  date: string;
  start_time: string;
  end_time: string | null;
  notes: string | null;
  reminder_minutes: number[];
  google_event_id: string | null;
  is_synced: boolean;
  created_at: string;
  updated_at: string;
}

export interface JournalEntry {
  id: string;
  user_id: string;
  patient_id: string | null;
  content: string;
  images: string[] | null;
  mood: string | null;
  created_at: string;
  updated_at: string;
}

export interface NotificationPreference {
  id: string;
  user_id: string;
  appointment_reminders: boolean;
  medication_reminders: boolean;
  default_reminder_minutes: number[];
  created_at: string;
  updated_at: string;
}

// Insert types (omit auto-generated fields)
export type AppointmentInsert = Omit<Appointment, 'id' | 'created_at' | 'updated_at'>;
export type AppointmentUpdate = Partial<Omit<Appointment, 'id' | 'user_id' | 'created_at' | 'updated_at'>>;
export type PatientInsert = Omit<Patient, 'id' | 'created_at' | 'updated_at'>;
export type PatientUpdate = Partial<Omit<Patient, 'id' | 'user_id' | 'created_at' | 'updated_at'>>;
