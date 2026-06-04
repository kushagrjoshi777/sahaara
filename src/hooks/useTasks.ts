// ============================================
// Sahaara — useTasks Hook
// ============================================

import { useState, useEffect, useCallback } from 'react';
import { useNavigation } from 'expo-router';
import { Task, taskService } from '../services/tasks';
import { useAuth } from '../context/AuthContext';
import { usePatient } from '../context/PatientContext';

export function useTasks() {
  const { user } = useAuth();
  const { selectedPatient } = usePatient();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  const refresh = useCallback(async () => {
    if (!selectedPatient) {
      setTasks([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await taskService.getTasks(selectedPatient.id);
      setTasks(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [selectedPatient]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      refresh();
    });
    return unsubscribe;
  }, [navigation, refresh]);

  const addTask = async (title: string) => {
    if (!user || !selectedPatient) throw new Error('Authentication/Patient required');
    const task = await taskService.createTask(selectedPatient.id, user.id, title);
    setTasks((prev) => [task, ...prev]);
    return task;
  };

  const toggleTask = async (id: string, completed: boolean) => {
    await taskService.toggleTaskCompleted(id, completed);
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, completed } : t)));
  };

  const deleteTask = async (id: string) => {
    await taskService.deleteTask(id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  return {
    tasks,
    loading,
    refresh,
    addTask,
    toggleTask,
    deleteTask,
  };
}
