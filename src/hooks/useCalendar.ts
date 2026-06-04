// ============================================
// Sahaara — useCalendar Hook
// ============================================

import { useState, useMemo, useCallback } from 'react';
import { CalendarViewMode } from '../types/appointments';
import {
  getCalendarDays,
  getWeekDays,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  addDays,
  isSameDay,
  isToday,
  isSameMonth,
  toDateString,
  startOfMonth,
  endOfMonth,
  startOfWeek,
} from '../utils/dateHelpers';

interface UseCalendarReturn {
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  viewMode: CalendarViewMode;
  setViewMode: (mode: CalendarViewMode) => void;
  navigateForward: () => void;
  navigateBack: () => void;
  goToToday: () => void;
  calendarDays: Date[];
  weekDays: Date[];
  currentMonth: Date;
  dateRange: { startDate: string; endDate: string };
}

export function useCalendar(): UseCalendarReturn {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<CalendarViewMode>('month');
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

  const navigateForward = useCallback(() => {
    if (viewMode === 'month') {
      setCurrentMonth((prev) => addMonths(prev, 1));
    } else if (viewMode === 'week') {
      setSelectedDate((prev) => addWeeks(prev, 1));
      setCurrentMonth((prev) => addWeeks(prev, 1));
    } else {
      setSelectedDate((prev) => addDays(prev, 1));
    }
  }, [viewMode]);

  const navigateBack = useCallback(() => {
    if (viewMode === 'month') {
      setCurrentMonth((prev) => subMonths(prev, 1));
    } else if (viewMode === 'week') {
      setSelectedDate((prev) => subWeeks(prev, 1));
      setCurrentMonth((prev) => subWeeks(prev, 1));
    } else {
      setSelectedDate((prev) => addDays(prev, -1));
    }
  }, [viewMode]);

  const goToToday = useCallback(() => {
    const today = new Date();
    setSelectedDate(today);
    setCurrentMonth(today);
  }, []);

  const calendarDays = useMemo(
    () => getCalendarDays(currentMonth),
    [currentMonth]
  );

  const weekDays = useMemo(
    () => getWeekDays(selectedDate),
    [selectedDate]
  );

  const dateRange = useMemo(() => {
    if (viewMode === 'month') {
      return {
        startDate: toDateString(calendarDays[0]),
        endDate: toDateString(calendarDays[calendarDays.length - 1]),
      };
    }
    if (viewMode === 'week') {
      return {
        startDate: toDateString(weekDays[0]),
        endDate: toDateString(weekDays[6]),
      };
    }
    return {
      startDate: toDateString(selectedDate),
      endDate: toDateString(selectedDate),
    };
  }, [viewMode, calendarDays, weekDays, selectedDate]);

  return {
    selectedDate,
    setSelectedDate,
    viewMode,
    setViewMode,
    navigateForward,
    navigateBack,
    goToToday,
    calendarDays,
    weekDays,
    currentMonth,
    dateRange,
  };
}
