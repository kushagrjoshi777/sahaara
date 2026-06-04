// ============================================
// Sahaara — Patient Context (Multi-Patient)
// ============================================

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Patient } from '../types/database';
import { patientService } from '../services/patients';
import { useAuth } from './AuthContext';

interface PatientContextType {
  patients: Patient[];
  selectedPatient: Patient | null;
  selectPatient: (patient: Patient) => void;
  loading: boolean;
  refreshPatients: () => Promise<void>;
  addPatient: (name: string) => Promise<Patient>;
}

const PatientContext = createContext<PatientContextType | undefined>(undefined);

export function PatientProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshPatients = useCallback(async () => {
    if (!user) {
      setPatients([]);
      setSelectedPatient(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await patientService.getPatients(user.id);
      setPatients(data);

      // Auto-select first patient if none selected
      if (data.length > 0 && !selectedPatient) {
        setSelectedPatient(data[0]);
      }
      // Clear selection if patient was deleted
      if (selectedPatient && !data.find((p) => p.id === selectedPatient.id)) {
        setSelectedPatient(data[0] || null);
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshPatients();
  }, [user]);

  const selectPatient = (patient: Patient) => {
    setSelectedPatient(patient);
  };

  const addPatient = async (name: string): Promise<Patient> => {
    if (!user) throw new Error('User not authenticated');

    const newPatient = await patientService.createPatient({
      user_id: user.id,
      name,
      date_of_birth: null,
      gender: null,
      medical_conditions: null,
      emergency_contacts: [],
      notes: null,
      avatar_url: null,
    });

    setPatients((prev) => [...prev, newPatient]);
    if (!selectedPatient) {
      setSelectedPatient(newPatient);
    }
    return newPatient;
  };

  return (
    <PatientContext.Provider
      value={{
        patients,
        selectedPatient,
        selectPatient,
        loading,
        refreshPatients,
        addPatient,
      }}
    >
      {children}
    </PatientContext.Provider>
  );
}

export function usePatient() {
  const context = useContext(PatientContext);
  if (!context) {
    throw new Error('usePatient must be used within a PatientProvider');
  }
  return context;
}
