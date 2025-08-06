import React from 'react';
import { View, ScrollView } from 'react-native';
import { Text } from '~/components/nativewindui/Text';
import { Toggle } from '~/components/nativewindui/Toggle';
import { useStore } from '~/store/store';
import { NotificationSettings } from '~/components/NotificationSettings';

export default function SettingsModal() {
  const { manualWateringMode, setManualWateringMode } = useStore();

  const handleToggleManualMode = async (enabled: boolean) => {
    await setManualWateringMode(enabled);
  };

  return (
    <View className="flex-1 bg-background">
      <ScrollView className="flex-1">
        {/* Manual Watering Mode */}
        <View className="p-6 bg-card border-b border-border">
          <View className="flex-row items-center justify-between mb-2">
            <View className="flex-1">
              <Text variant="subhead" className="font-medium mb-1">
                Manual Watering Mode
              </Text>
              <Text variant="caption2" className="text-muted-foreground">
                When enabled, you must manually mark plants as watered
              </Text>
            </View>
            <Toggle
              value={manualWateringMode}
              onValueChange={handleToggleManualMode}
            />
          </View>
          
          <View className="mt-3 p-3 bg-muted rounded-lg">
            <Text variant="caption2" className="text-muted-foreground">
              {manualWateringMode 
                ? 'Manual mode: You control when plants are marked as watered. Progress bars will reset when you click "Mark as Watered".'
                : 'Automatic mode: Plants are automatically marked as watered at the end of their watering day.'
              }
            </Text>
          </View>
        </View>

        {/* Notification Settings */}
        <NotificationSettings />
      </ScrollView>
    </View>
  );
}
