// ============================================
// Sahaara — useMedications Hook
// ============================================

import { useState, useEffect, useCallback } from 'react';
import { Medication, MedicationLog } from '../types/database';
import { medicationService } from '../services/medications';
import { useAuth } from '../context/AuthContext';
import { usePatient } from '../context/PatientContext';

export function useMedications() {
  const { user } = useAuth();
  const { selectedPatient } = usePatient();
  const [medications, setMedications] = useState<Medication[]>([]);
  const [logs, setLogs] = useState<MedicationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!selectedPatient) {
      setMedications([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await medicationService.getMedications(selectedPatient.id);
      setMedications(data);

      if (user) {
        const logData = await medicationService.getMedicationLogs(user.id);
        setLogs(logData);
      }
    } catch (e: any) {
      setError(e.message || 'Failed to fetch medications');
    } finally {
      setLoading(false);
    }
  }, [selectedPatient, user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addMedication = async (data: Omit<Medication, 'id' | 'created_at' | 'updated_at' | 'user_id' | 'patient_id'>) => {
    if (!user || !selectedPatient) throw new Error('Authentication/Patient required');
    
    const newMed = await medicationService.createMedication({
      ...data,
      user_id: user.id,
      patient_id: selectedPatient.id,
    });
    setMedications((prev) => [...prev, newMed]);
    return newMed;
  };

  const deleteMedication = async (id: string) => {
    await medicationService.deleteMedication(id);
    setMedications((prev) => prev.filter((m) => m.id !== id));
  };

  const updateMedication = async (id: string, updates: Partial<Omit<Medication, 'id' | 'created_at' | 'updated_at'>>) => {
    const updated = await medicationService.updateMedication(id, updates);
    setMedications((prev) => prev.map((m) => (m.id === id ? updated : m)));
    return updated;
  };

  const logMedicationTaken = async (medicationId: string, scheduledTime: string, status: 'taken' | 'skipped' | 'missed') => {
    if (!user) throw new Error('Authentication required');
    const log = await medicationService.logMedicationTaken(medicationId, user.id, scheduledTime, status);
    setLogs((prev) => [log, ...prev]);
    return log;
  };

  return {
    medications,
    logs,
    loading,
    error,
    refresh,
    addMedication,
    deleteMedication,
    updateMedication,
    logMedicationTaken,
  };
}
