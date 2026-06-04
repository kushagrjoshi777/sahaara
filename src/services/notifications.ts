// ============================================
// Sahaara — Notification Service
// ============================================

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure notification behavior when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const notificationService = {
  /**
   * Request permission for push/local notifications
   */
  async requestPermissions(): Promise<boolean> {
    if (Platform.OS === 'web') return false;
    
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    return finalStatus === 'granted';
  },

  /**
   * Check if notification permission is granted
   */
  async hasPermissions(): Promise<boolean> {
    if (Platform.OS === 'web') return false;
    const { status } = await Notifications.getPermissionsAsync();
    return status === 'granted';
  },

  /**
   * Schedule a notification for an appointment
   */
  async scheduleAppointmentNotification(
    appointmentId: string,
    title: string,
    doctorName: string | null,
    dateStr: string,
    timeStr: string,
    leadMinutes: number
  ): Promise<string | null> {
    if (Platform.OS === 'web') return null;

    const hasPermission = await this.requestPermissions();
    if (!hasPermission) return null;

    // Parse date and time
    const [hours, minutes] = timeStr.split(':').map(Number);
    const eventDate = new Date(dateStr);
    eventDate.setHours(hours, minutes, 0, 0);

    // Subtract lead minutes
    const triggerDate = new Date(eventDate.getTime() - leadMinutes * 60 * 1000);

    // If trigger date is in the past, don't schedule
    if (triggerDate.getTime() <= Date.now()) {
      return null;
    }

    const doctorText = doctorName ? ` with ${doctorName}` : '';
    const body = leadMinutes === 0
      ? `Your appointment "${title}"${doctorText} is starting now!`
      : `Upcoming appointment "${title}"${doctorText} in ${leadMinutes} minutes.`;

    const trigger: any = { date: triggerDate };

    try {
      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          title: '📅 Appointment Reminder',
          body,
          data: { type: 'appointment', appointmentId },
        },
        trigger,
      });
      return identifier;
    } catch (error) {
      console.error('Failed to schedule appointment notification:', error);
      return null;
    }
  },

  /**
   * Schedule a daily recurring notification for medication
   */
  async scheduleMedicationNotification(
    medicationId: string,
    medicineName: string,
    dosage: string | null,
    timeStr: string
  ): Promise<string | null> {
    if (Platform.OS === 'web') return null;

    const hasPermission = await this.requestPermissions();
    if (!hasPermission) return null;

    const [hour, minute] = timeStr.split(':').map(Number);
    const dosageText = dosage ? ` (${dosage})` : '';

    try {
      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          title: '💊 Medication Reminder',
          body: `It is time to take ${medicineName}${dosageText}.`,
          data: { type: 'medication', medicationId },
        },
        trigger: {
          type: 'calendar',
          hour,
          minute,
          repeats: true,
        } as any,
      });
      return identifier;
    } catch (error) {
      console.error('Failed to schedule medication notification:', error);
      return null;
    }
  },

  /**
   * Cancel a scheduled notification
   */
  async cancelNotification(identifier: string): Promise<void> {
    if (Platform.OS === 'web') return;
    try {
      await Notifications.cancelScheduledNotificationAsync(identifier);
    } catch (error) {
      console.error('Failed to cancel notification:', error);
    }
  },

  /**
   * Cancel all scheduled notifications
   */
  async cancelAllNotifications(): Promise<void> {
    if (Platform.OS === 'web') return;
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Failed to cancel all notifications:', error);
    }
  },
};
