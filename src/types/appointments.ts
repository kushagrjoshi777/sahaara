// ============================================
// Sahaara — Appointment Types
// ============================================

export type CalendarViewMode = 'month' | 'week' | 'day';

export interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  hasAppointments: boolean;
  appointmentCount: number;
}

export interface TimeSlot {
  hour: number;
  minute: number;
  label: string;
}

export const REMINDER_OPTIONS = [
  { label: 'At time of event', value: 0 },
  { label: '15 minutes before', value: 15 },
  { label: '1 hour before', value: 60 },
  { label: '1 day before', value: 1440 },
] as const;

export type ReminderMinutes = (typeof REMINDER_OPTIONS)[number]['value'];
