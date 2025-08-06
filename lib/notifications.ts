import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Plant } from '~/store/store';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowList: true,
  }),
});

export interface NotificationSettings {
  enabled: boolean;
  time: string; // Format: "HH:MM" (24-hour)
}

export class NotificationService {
  private static instance: NotificationService;
  private settings: NotificationSettings = {
    enabled: true,
    time: '09:00', // Default to 9:00 AM
  };

  private constructor() {}

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  async initialize(): Promise<void> {
    // Request permissions
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.log('Notification permissions not granted');
      return;
    }

    // Configure for Android
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('plant-reminders', {
        name: 'Plant Watering Reminders',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }
  }

  async schedulePlantReminders(plants: Plant[]): Promise<void> {
    // Cancel all existing notifications
    await this.cancelAllNotifications();

    if (!this.settings.enabled) {
      return;
    }

    const [hours, minutes] = this.settings.time.split(':').map(Number);
    
    for (const plant of plants) {
      await this.schedulePlantReminder(plant, hours, minutes);
    }
  }

  private async schedulePlantReminder(plant: Plant, hours: number, minutes: number): Promise<void> {
    const now = new Date();
    const nextWateringDate = this.getNextWateringDate(plant, now);
    
    if (!nextWateringDate) {
      return; // Plant doesn't need watering
    }

    // Don't schedule notifications for plants that were watered very recently (within last 2 hours)
    const timeSinceWatered = now.getTime() - plant.lastWatered.getTime();
    const hoursSinceWatered = timeSinceWatered / (1000 * 60 * 60);
    if (hoursSinceWatered < 2) {
      console.log(`Skipping notification for ${plant.name} - watered recently (${hoursSinceWatered.toFixed(1)} hours ago)`);
      return;
    }

    // Set notification time for the watering day
    const notificationDate = new Date(nextWateringDate);
    notificationDate.setHours(hours, minutes, 0, 0);

    // If the notification time has already passed today, schedule for the next watering cycle
    if (notificationDate <= now) {
      // Calculate the next watering date
      const lastWatered = new Date(plant.lastWatered);
      const nextWatering = new Date(lastWatered);
      nextWatering.setDate(nextWatering.getDate() + plant.wateringInterval);
      
      // Set notification time for the next watering cycle
      notificationDate.setTime(nextWatering.getTime());
      notificationDate.setHours(hours, minutes, 0, 0);
    }

    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title: '🌱 Time to water your plant!',
        body: `${plant.name} needs watering today.`,
        data: { plantId: plant.id, plantName: plant.name },
        sound: true,
        priority: Notifications.AndroidNotificationPriority.MAX,
        interruptionLevel: 'timeSensitive',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: notificationDate,
      },
    });

    console.log(`Scheduled notification for ${plant.name} at ${notificationDate.toLocaleString()}`);
  }

  private getNextWateringDate(plant: Plant, currentDate: Date): Date | null {
    const lastWatered = new Date(plant.lastWatered);
    const daysSinceWatered = Math.floor((currentDate.getTime() - lastWatered.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysSinceWatered >= plant.wateringInterval) {
      // Plant needs watering today
      return currentDate;
    } else {
      // Calculate next watering date
      const nextWatering = new Date(lastWatered);
      nextWatering.setDate(nextWatering.getDate() + plant.wateringInterval);
      return nextWatering;
    }
  }

  async cancelAllNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  async updateSettings(settings: Partial<NotificationSettings>): Promise<void> {
    this.settings = { ...this.settings, ...settings };
    
    // Reschedule notifications with new settings
    // Note: We'll need to get plants from the store, so this will be called from the store
  }

  getSettings(): NotificationSettings {
    return { ...this.settings };
  }

  async testNotification(): Promise<void> {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🌱 Test Notification',
        body: 'This is a test notification for plant watering reminders.',
        sound: true,
        priority: Notifications.AndroidNotificationPriority.MAX,
        interruptionLevel: 'timeSensitive',
      },
      trigger: null, // Immediate notification
    });
  }

  async testBackgroundNotification(): Promise<void> {
    // Schedule a notification for 30 seconds from now to test background functionality
    console.log('Starting background notification test...');
    
    try {
      console.log(`Current time: ${new Date().toLocaleString()}`);
      console.log(`Scheduling for 30 seconds from now`);
      
      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          title: '🌱 Background Test',
          body: 'This notification was scheduled while the app was open and should appear even if the app is closed.',
          sound: true,
          data: { type: 'background-test' },
          priority: Notifications.AndroidNotificationPriority.MAX,
          interruptionLevel: 'timeSensitive',
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: 30, // 30 seconds
        },
      });

      console.log(`Background test notification scheduled successfully`);
      console.log(`Notification ID: ${identifier}`);
      
      // Wait a moment and then check scheduled notifications
      setTimeout(async () => {
        try {
          const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
          console.log(`Total scheduled notifications: ${scheduledNotifications.length}`);
          scheduledNotifications.forEach((notification, index) => {
            console.log(`Notification ${index + 1}:`, {
              id: notification.identifier,
              title: notification.content.title,
              body: notification.content.body,
              trigger: notification.trigger,
            });
          });
        } catch (error) {
          console.error('Error checking scheduled notifications:', error);
        }
      }, 1000);
      
    } catch (error) {
      console.error('Error scheduling background notification:', error);
    }
  }
}

export const notificationService = NotificationService.getInstance(); 