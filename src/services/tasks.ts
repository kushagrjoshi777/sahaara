// ============================================
// Sahaara — Tasks Service (with Mock Mode)
// ============================================

import { supabase, IS_MOCK_MODE } from './supabase';

export interface Task {
  id: string;
  patient_id: string;
  user_id: string;
  title: string;
  completed: boolean;
  created_at: string;
}

let localTasks: Task[] = [
  {
    id: 'mock-task-1',
    patient_id: 'mock-patient-uuid',
    user_id: 'mock-user-uuid',
    title: 'Schedule appointment with ophthalmologist',
    completed: false,
    created_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'mock-task-2',
    patient_id: 'mock-patient-uuid',
    user_id: 'mock-user-uuid',
    title: 'Pick up Lisinopril medication refill from CVS',
    completed: false,
    created_at: new Date().toISOString(),
  },
  {
    id: 'mock-task-3',
    patient_id: 'mock-patient-uuid',
    user_id: 'mock-user-uuid',
    title: 'Prepare healthy breakfast and monitor BP',
    completed: true,
    created_at: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
  }
];

export const taskService = {
  async getTasks(patientId: string): Promise<Task[]> {
    if (IS_MOCK_MODE) {
      return localTasks
        .filter((t) => t.patient_id === patientId)
        .sort((a, b) => b.created_at.localeCompare(a.created_at));
    }

    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch {
      // Fallback
      return localTasks
        .filter((t) => t.patient_id === patientId)
        .sort((a, b) => b.created_at.localeCompare(a.created_at));
    }
  },

  async createTask(patientId: string, userId: string, title: string): Promise<Task> {
    const newTask: Omit<Task, 'id' | 'created_at'> = {
      patient_id: patientId,
      user_id: userId,
      title,
      completed: false,
    };

    if (IS_MOCK_MODE) {
      const mockTask: Task = {
        id: Math.random().toString(),
        created_at: new Date().toISOString(),
        ...newTask,
      };
      localTasks.unshift(mockTask);
      return mockTask;
    }

    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert(newTask)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (e) {
      const mockTask: Task = {
        id: Math.random().toString(),
        created_at: new Date().toISOString(),
        ...newTask,
      };
      localTasks.unshift(mockTask);
      return mockTask;
    }
  },

  async toggleTaskCompleted(id: string, completed: boolean): Promise<void> {
    if (IS_MOCK_MODE) {
      localTasks = localTasks.map((t) => (t.id === id ? { ...t, completed } : t));
      return;
    }

    try {
      const { error } = await supabase
        .from('tasks')
        .update({ completed })
        .eq('id', id);

      if (error) throw error;
    } catch {
      localTasks = localTasks.map((t) => (t.id === id ? { ...t, completed } : t));
    }
  },

  async deleteTask(id: string): Promise<void> {
    if (IS_MOCK_MODE) {
      localTasks = localTasks.filter((t) => t.id !== id);
      return;
    }

    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch {
      localTasks = localTasks.filter((t) => t.id !== id);
    }
  },
};
