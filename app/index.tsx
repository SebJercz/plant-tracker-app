import { useHeaderHeight } from '@react-navigation/elements';
import { cssInterop } from 'nativewind';
import * as React from 'react';
import {
  View,
  FlatList,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@roninoss/icons';

import { PlantCard } from '~/components/PlantCard';
import { useColorScheme } from '~/lib/useColorScheme';
import { useStore } from '~/store/store';
import { Text } from '~/components/nativewindui/Text';

cssInterop(FlatList, {
  className: 'style',
  contentContainerClassName: 'contentContainerStyle',
});

export default function Screen() {
  const { plants } = useStore();
  const insets = useSafeAreaInsets();
  const dimensions = useWindowDimensions();
  const headerHeight = useHeaderHeight();
  const { colors } = useColorScheme();

  const handlePlantPress = (plantId: string) => {
    // TODO: Navigate to plant detail screen
    console.log('Plant pressed:', plantId);
  };

  const renderPlantItem = ({ item }: { item: any }) => (
    <View className="flex-1 p-2">
      <PlantCard 
        plant={item} 
        onPress={() => handlePlantPress(item.id)}
      />
    </View>
  );

  const renderEmptyState = () => {
    const height = dimensions.height - headerHeight - insets.bottom - insets.top;
    
    return (
      <View style={{ height }} className="flex-1 items-center justify-center gap-1 px-12">
        <Icon name="plus" size={42} color={colors.grey} />
        <Text variant="title3" className="pb-1 text-center font-semibold">
          No Plants Added
        </Text>
        <Text color="tertiary" variant="subhead" className="pb-4 text-center">
          Add your first plant to start tracking your garden!
        </Text>
      </View>
    );
  };

  return (
    <FlatList
      data={plants}
      renderItem={renderPlantItem}
      keyExtractor={(item) => item.id}
      numColumns={2}
      contentContainerClassName="py-4 android:pb-12"
      ListEmptyComponent={plants.length === 0 ? renderEmptyState : undefined}
      showsVerticalScrollIndicator={false}
    />
  );
}
