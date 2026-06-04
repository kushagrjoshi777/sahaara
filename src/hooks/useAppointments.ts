// ============================================
// Sahaara — useAppointments Hook
// ============================================

import { useState, useEffect, useCallback } from 'react';
import { Appointment, AppointmentInsert, AppointmentUpdate } from '../types/database';
import { appointmentService } from '../services/appointments';
import { useAuth } from '../context/AuthContext';
import { usePatient } from '../context/PatientContext';

interface UseAppointmentsReturn {
  appointments: Appointment[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  createAppointment: (data: Omit<AppointmentInsert, 'user_id'>) => Promise<Appointment>;
  updateAppointment: (id: string, data: AppointmentUpdate) => Promise<Appointment>;
  deleteAppointment: (id: string) => Promise<void>;
  getAppointmentById: (id: string) => Promise<Appointment | null>;
}

export function useAppointments(dateRange?: {
  startDate?: string;
  endDate?: string;
}): UseAppointmentsReturn {
  const { user } = useAuth();
  const { selectedPatient } = usePatient();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      const data = await appointmentService.getAppointments(user.id, {
        ...dateRange,
        patientId: selectedPatient?.id,
      });
      setAppointments(data);
    } catch (e: any) {
      setError(e.message || 'Failed to fetch appointments');
    } finally {
      setLoading(false);
    }
  }, [user, dateRange?.startDate, dateRange?.endDate, selectedPatient?.id]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const createAppointment = async (
    data: Omit<AppointmentInsert, 'user_id'>
  ): Promise<Appointment> => {
    if (!user) throw new Error('User not authenticated');

    const appointment = await appointmentService.createAppointment({
      ...data,
      user_id: user.id,
    });

    setAppointments((prev) =>
      [...prev, appointment].sort((a, b) => {
        if (a.date !== b.date) return a.date.localeCompare(b.date);
        return a.start_time.localeCompare(b.start_time);
      })
    );

    return appointment;
  };

  const updateAppointment = async (
    id: string,
    data: AppointmentUpdate
  ): Promise<Appointment> => {
    const updated = await appointmentService.updateAppointment(id, data);
    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? updated : a))
    );
    return updated;
  };

  const deleteAppointment = async (id: string): Promise<void> => {
    await appointmentService.deleteAppointment(id);
    setAppointments((prev) => prev.filter((a) => a.id !== id));
  };

  const getAppointmentById = async (id: string): Promise<Appointment | null> => {
    return appointmentService.getAppointmentById(id);
  };

  return {
    appointments,
    loading,
    error,
    refresh,
    createAppointment,
    updateAppointment,
    deleteAppointment,
    getAppointmentById,
  };
}
