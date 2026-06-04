// ============================================
// Sahaara — Journal Service (with Mock Mode)
// ============================================

import { supabase, IS_MOCK_MODE } from './supabase';
import { JournalEntry } from '../types/database';

let localJournalEntries: JournalEntry[] = [
  {
    id: 'mock-journal-1',
    user_id: 'mock-user-uuid',
    patient_id: 'mock-patient-uuid',
    content: 'Sarah had a very pleasant afternoon. We took a short 15-minute stroll around the neighborhood. She was highly alert and recognized our neighbors. Appetite has been excellent today.',
    images: null,
    mood: '😊',
    created_at: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
  },
  {
    id: 'mock-journal-2',
    user_id: 'mock-user-uuid',
    patient_id: 'mock-patient-uuid',
    content: 'Felt slightly dizzy in the morning after standing up too fast. We measured blood pressure which was 138/85 (slightly high). Monitored her resting state and had her drink plenty of water. She felt much better by lunchtime.',
    images: null,
    mood: '😐',
    created_at: new Date(Date.now() - 26 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 26 * 3600 * 1000).toISOString(),
  }
];

export const journalService = {
  /**
   * Get all journal entries for a patient
   */
  async getJournalEntries(patientId: string): Promise<JournalEntry[]> {
    if (IS_MOCK_MODE) {
      return localJournalEntries
        .filter((e) => e.patient_id === patientId)
        .sort((a, b) => b.created_at.localeCompare(a.created_at));
    }

    const { data, error } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  /**
   * Create a new journal entry
   */
  async createJournalEntry(entry: Omit<JournalEntry, 'id' | 'created_at' | 'updated_at'>): Promise<JournalEntry> {
    if (IS_MOCK_MODE) {
      const newEntry: JournalEntry = {
        id: 'mock-journal-' + Math.random().toString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...entry,
      };
      localJournalEntries.unshift(newEntry);
      return newEntry;
    }

    const { data, error } = await supabase
      .from('journal_entries')
      .insert(entry)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update a journal entry
   */
  async updateJournalEntry(id: string, updates: Partial<Omit<JournalEntry, 'id' | 'created_at' | 'updated_at'>>): Promise<JournalEntry> {
    if (IS_MOCK_MODE) {
      let updated: JournalEntry | null = null;
      localJournalEntries = localJournalEntries.map((e) => {
        if (e.id === id) {
          updated = { ...e, ...updates, updated_at: new Date().toISOString() };
          return updated;
        }
        return e;
      });
      if (!updated) throw new Error('Journal entry not found');
      return updated;
    }

    const { data, error } = await supabase
      .from('journal_entries')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Delete a journal entry
   */
  async deleteJournalEntry(id: string): Promise<void> {
    if (IS_MOCK_MODE) {
      localJournalEntries = localJournalEntries.filter((e) => e.id !== id);
      return;
    }

    const { error } = await supabase
      .from('journal_entries')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};
