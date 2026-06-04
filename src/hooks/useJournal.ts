// ============================================
// Sahaara — useJournal Hook
// ============================================

import { useState, useEffect, useCallback } from 'react';
import { JournalEntry } from '../types/database';
import { journalService } from '../services/journal';
import { useAuth } from '../context/AuthContext';
import { usePatient } from '../context/PatientContext';

export function useJournal() {
  const { user } = useAuth();
  const { selectedPatient } = usePatient();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!selectedPatient) {
      setEntries([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await journalService.getJournalEntries(selectedPatient.id);
      setEntries(data);
    } catch (e: any) {
      setError(e.message || 'Failed to fetch journal entries');
    } finally {
      setLoading(false);
    }
  }, [selectedPatient]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addEntry = async (content: string, mood: string | null = null, images: string[] | null = null) => {
    if (!user || !selectedPatient) throw new Error('Authentication/Patient required');

    const newEntry = await journalService.createJournalEntry({
      user_id: user.id,
      patient_id: selectedPatient.id,
      content,
      mood,
      images,
    });

    setEntries((prev) => [newEntry, ...prev]);
    return newEntry;
  };

  const deleteEntry = async (id: string) => {
    await journalService.deleteJournalEntry(id);
    setEntries((prev) => prev.filter((e) => e.id !== id));
  };

  const updateEntry = async (id: string, updates: Partial<Omit<JournalEntry, 'id' | 'created_at' | 'updated_at'>>) => {
    const updated = await journalService.updateJournalEntry(id, updates);
    setEntries((prev) => prev.map((e) => (e.id === id ? updated : e)));
    return updated;
  };

  return {
    entries,
    loading,
    error,
    refresh,
    addEntry,
    deleteEntry,
    updateEntry,
  };
}
