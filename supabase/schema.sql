-- ============================================================================
-- SAHAARA DATABASE SCHEMA
-- ============================================================================
-- SQL Script for Supabase SQL Editor.
-- Configures schemas, relational structures, indexes, RLS policies, and triggers.

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. USERS PROFILE TABLE
-- ============================================
-- Extends Supabase auth.users with custom profile data
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  google_access_token TEXT,         -- For Google Calendar sync (Phase 2)
  google_refresh_token TEXT,
  google_token_expiry TIMESTAMPTZ,
  notification_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. PATIENTS TABLE
-- ============================================
-- Loved ones being cared for. Supports multiple patients per user.
CREATE TABLE public.patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  date_of_birth DATE,
  gender TEXT CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
  medical_conditions TEXT[],
  emergency_contacts JSONB DEFAULT '[]'::JSONB,
  notes TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 3. APPOINTMENTS TABLE
-- ============================================
-- Doctor appointments, checkups, sessions.
CREATE TABLE public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES public.patients(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  doctor_name TEXT,
  location TEXT,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME,
  notes TEXT,
  reminder_minutes INTEGER[] DEFAULT '{15}'::INTEGER[],
  google_event_id TEXT,             -- For Google Calendar sync (Phase 2)
  is_synced BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 4. MEDICATIONS TABLE (Future scope - ready schema)
-- ============================================
CREATE TABLE public.medications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  dosage TEXT,
  frequency TEXT NOT NULL,          -- 'daily', 'weekly', etc.
  reminder_times TIME[],
  start_date DATE NOT NULL,
  end_date DATE,
  instructions TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 5. MEDICATION LOGS TABLE (Future scope - ready schema)
-- ============================================
CREATE TABLE public.medication_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  medication_id UUID NOT NULL REFERENCES public.medications(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  taken_at TIMESTAMPTZ DEFAULT NOW(),
  scheduled_time TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('taken', 'missed', 'skipped')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 6. JOURNAL ENTRIES TABLE (Future scope - ready schema)
-- ============================================
CREATE TABLE public.journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES public.patients(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  images TEXT[],                    -- Array of image storage URLs
  mood TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 7. NOTIFICATION PREFERENCES TABLE
-- ============================================
CREATE TABLE public.notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  appointment_reminders BOOLEAN DEFAULT true,
  medication_reminders BOOLEAN DEFAULT true,
  default_reminder_minutes INTEGER[] DEFAULT '{15, 60}'::INTEGER[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- ============================================================================
-- INDEXES FOR HIGH PERFORMANCE
-- ============================================================================
CREATE INDEX idx_patients_user_id ON public.patients(user_id);
CREATE INDEX idx_appointments_user_id ON public.appointments(user_id);
CREATE INDEX idx_appointments_date ON public.appointments(date);
CREATE INDEX idx_medications_patient_id ON public.medications(patient_id);
CREATE INDEX idx_medication_logs_medication_id ON public.medication_logs(medication_id);
CREATE INDEX idx_journal_entries_user_id ON public.journal_entries(user_id);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medication_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

-- 1. Users Policies
CREATE POLICY "Users can select own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 2. Patients Policies
CREATE POLICY "Users can CRUD own patients" ON public.patients
  FOR ALL USING (auth.uid() = user_id);

-- 3. Appointments Policies
CREATE POLICY "Users can CRUD own appointments" ON public.appointments
  FOR ALL USING (auth.uid() = user_id);

-- 4. Medications Policies
CREATE POLICY "Users can CRUD own medications" ON public.medications
  FOR ALL USING (auth.uid() = user_id);

-- 5. Medication Logs Policies
CREATE POLICY "Users can CRUD own medication logs" ON public.medication_logs
  FOR ALL USING (auth.uid() = user_id);

-- 6. Journal Entries Policies
CREATE POLICY "Users can CRUD own journal entries" ON public.journal_entries
  FOR ALL USING (auth.uid() = user_id);

-- 7. Notification Preferences Policies
CREATE POLICY "Users can CRUD own notification preferences" ON public.notification_preferences
  FOR ALL USING (auth.uid() = user_id);

-- ============================================================================
-- AUTOMATED TRIGGERS
-- ============================================================================

-- Function to handle new user registration in Supabase auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert into public.users
  INSERT INTO public.users (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  
  -- Insert into default notification preferences
  INSERT INTO public.notification_preferences (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to execute handler when a new row is added to auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 8. TASKS TABLE (Family Care Checklist)
-- ============================================
CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX idx_tasks_patient_id ON public.tasks(patient_id);
CREATE INDEX idx_tasks_user_id ON public.tasks(user_id);

-- Enable RLS
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Policies for Tasks
CREATE POLICY "Users can CRUD own tasks" ON public.tasks
  FOR ALL USING (auth.uid() = user_id);

