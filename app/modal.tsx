import { Icon } from '@roninoss/icons';
import { StatusBar } from 'expo-status-bar';
import { Platform, View, ScrollView } from 'react-native';

import { Text } from '~/components/nativewindui/Text';
import { Toggle } from '~/components/nativewindui/Toggle';
import { useColorScheme } from '~/lib/useColorScheme';
import { useStore } from '~/store/store';

export default function ModalScreen() {
  const { colors, colorScheme } = useColorScheme();
  const { manualWateringMode, setManualWateringMode } = useStore();

  const handleToggleManualWatering = async (enabled: boolean) => {
    await setManualWateringMode(enabled);
  };

  return (
    <>
      <StatusBar
        style={Platform.OS === 'ios' ? 'light' : colorScheme === 'dark' ? 'light' : 'dark'}
      />
      <ScrollView className="flex-1 bg-background">
        <View className="p-6">
          <Text variant="title2" className="mb-6 font-semibold">
            Settings
          </Text>

          {/* Manual Watering Mode Setting */}
          <View className="mb-6">
            <View className="flex-row items-center justify-between mb-2">
              <View className="flex-1">
                <Text variant="subhead" className="font-medium">
                  Manual Watering Mode
                </Text>
                <Text variant="caption2" className="text-muted-foreground mt-1">
                  When enabled, you must manually mark plants as watered. When disabled, watering is tracked automatically.
                </Text>
              </View>
              <Toggle
                value={manualWateringMode}
                onValueChange={handleToggleManualWatering}
              />
            </View>
          </View>

          {/* App Info */}
          <View className="mt-8 p-4 bg-muted rounded-lg">
            <View className="items-center">
              <Icon name="leaf-outline" size={32} color={colors.grey} />
              <Text variant="subhead" className="mt-2 font-medium text-center">
                Plant Tracker
              </Text>
              <Text variant="caption2" className="text-muted-foreground text-center mt-1">
                Keep your plants healthy and thriving
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </>
  );
}
