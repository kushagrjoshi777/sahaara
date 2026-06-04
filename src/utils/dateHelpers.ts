// ============================================
// Sahaara — Date Helpers
// ============================================

import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  isSameDay,
  isSameMonth,
  isToday,
  parseISO,
  differenceInMinutes,
  setHours,
  setMinutes,
} from 'date-fns';

/**
 * Get all days for a month calendar grid (includes prev/next month padding)
 */
export function getCalendarDays(date: Date): Date[] {
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const days: Date[] = [];
  let current = calendarStart;

  while (current <= calendarEnd) {
    days.push(current);
    current = addDays(current, 1);
  }

  return days;
}

/**
 * Get days for a week view
 */
export function getWeekDays(date: Date): Date[] {
  const weekStart = startOfWeek(date, { weekStartsOn: 0 });
  const days: Date[] = [];

  for (let i = 0; i < 7; i++) {
    days.push(addDays(weekStart, i));
  }

  return days;
}

/**
 * Format a date for display
 */
export function formatDate(date: string | Date, formatStr: string = 'MMM d, yyyy'): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, formatStr);
}

/**
 * Format a time string (HH:mm:ss) for display
 */
export function formatTime(time: string): string {
  const [hours, minutes] = time.split(':').map(Number);
  const date = setMinutes(setHours(new Date(), hours), minutes);
  return format(date, 'h:mm a');
}

/**
 * Format date as ISO date string (YYYY-MM-DD)
 */
export function toDateString(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

/**
 * Get relative time description (e.g., "in 30 minutes", "2 hours ago")
 */
export function getRelativeTime(dateStr: string, timeStr: string): string {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const date = parseISO(dateStr);
  const target = setMinutes(setHours(date, hours), minutes);
  const now = new Date();
  const diff = differenceInMinutes(target, now);

  if (diff < 0) return 'Past';
  if (diff < 1) return 'Now';
  if (diff < 60) return `In ${diff} min`;
  if (diff < 1440) return `In ${Math.floor(diff / 60)}h`;
  return `In ${Math.floor(diff / 1440)}d`;
}

/**
 * Get greeting based on time of day
 */
export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}

/**
 * Get day abbreviations for calendar header
 */
export const DAY_ABBREVIATIONS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/**
 * Get month name and year for calendar header
 */
export function getMonthYearLabel(date: Date): string {
  return format(date, 'MMMM yyyy');
}

export {
  addDays,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  isSameDay,
  isSameMonth,
  isToday,
  parseISO,
  startOfWeek,
  startOfMonth,
  endOfMonth,
  format,
};
