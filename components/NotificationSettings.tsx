import React, { useState } from 'react';
import { View, Alert } from 'react-native';
import { Text } from '~/components/nativewindui/Text';
import { Button } from '~/components/nativewindui/Button';
import { Toggle } from '~/components/nativewindui/Toggle';
import { Picker, PickerItem } from '~/components/nativewindui/Picker';
import { useStore } from '~/store/store';
import { useColorScheme } from '~/lib/useColorScheme';

export function NotificationSettings() {
  const { notificationSettings, setNotificationSettings } = useStore();
  const { colors } = useColorScheme();
  const [isUpdating, setIsUpdating] = useState(false);

  const timeOptions = [
    { label: '6:00 AM', value: '06:00' },
    { label: '7:00 AM', value: '07:00' },
    { label: '8:00 AM', value: '08:00' },
    { label: '9:00 AM', value: '09:00' },
    { label: '10:00 AM', value: '10:00' },
    { label: '11:00 AM', value: '11:00' },
    { label: '12:00 PM', value: '12:00' },
    { label: '1:00 PM', value: '13:00' },
    { label: '2:00 PM', value: '14:00' },
    { label: '3:00 PM', value: '15:00' },
    { label: '4:00 PM', value: '16:00' },
    { label: '5:00 PM', value: '17:00' },
    { label: '6:00 PM', value: '18:00' },
    { label: '7:00 PM', value: '19:00' },
    { label: '8:00 PM', value: '20:00' },
  ];

  const handleToggleNotifications = async (enabled: boolean) => {
    setIsUpdating(true);
    try {
      await setNotificationSettings({ enabled });
    } catch (error) {
      Alert.alert('Error', 'Failed to update notification settings');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleTimeChange = async (time: string) => {
    setIsUpdating(true);
    try {
      await setNotificationSettings({ time });
    } catch (error) {
      Alert.alert('Error', 'Failed to update notification time');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <View className="p-6 bg-card border-b border-border">
      <Text variant="title3" className="font-semibold mb-4">
        🌱 Plant Watering Notifications
      </Text>

      {/* Enable/Disable Notifications */}
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-1">
          <Text variant="subhead" className="font-medium mb-1">
            Enable Notifications
          </Text>
          <Text variant="caption2" className="text-muted-foreground">
            Get reminded when your plants need watering
          </Text>
        </View>
        <Toggle
          value={notificationSettings.enabled}
          onValueChange={handleToggleNotifications}
          disabled={isUpdating}
        />
      </View>

      {/* Notification Time */}
      {notificationSettings.enabled && (
        <View className="mb-4">
          <Text variant="subhead" className="font-medium mb-2">
            Notification Time
          </Text>
          <Text variant="caption2" className="text-muted-foreground mb-2">
            Choose when you want to receive watering reminders
          </Text>
          <Picker
            selectedValue={notificationSettings.time}
            onValueChange={handleTimeChange}
            enabled={!isUpdating}
          >
            {timeOptions.map((option) => (
              <PickerItem
                key={option.value}
                label={option.label}
                value={option.value}
                color={colors.foreground}
                style={{
                  backgroundColor: colors.root,
                }}
              />
            ))}
          </Picker>
        </View>
      )}

      {/* Info Text */}
      <View className="mt-4 p-3 bg-muted rounded-lg">
        <Text variant="caption2" className="text-muted-foreground">
          Notifications will be sent on the day each plant needs watering. 
          The notification will include the plant's custom name.
        </Text>
      </View>
    </View>
  );
} 