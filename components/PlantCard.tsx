import React, { useMemo } from 'react';
import { View, Pressable } from 'react-native';
import { Avatar, AvatarFallback, AvatarImage } from '~/components/nativewindui/Avatar';
import { ProgressIndicator } from '~/components/nativewindui/ProgressIndicator';
import { Text } from '~/components/nativewindui/Text';
import { Plant, useStore, getCurrentTimeWithOffset, getEffectiveLastWatered } from '~/store/store';

interface PlantCardProps {
  plant: Plant;
  onPress?: () => void;
}

const getRoomDisplayName = (roomValue: string): string => {
  const roomMap: { [key: string]: string } = {
    'living-room': 'Living Room',
    'kitchen': 'Kitchen',
    'bathroom': 'Bathroom',
    'bedroom': 'Bedroom',
    'office': 'Office',
  };
  return roomMap[roomValue] || roomValue;
};

export const PlantCard = React.memo(({ plant, onPress }: PlantCardProps) => {
  const { debugTimeOffset, manualWateringMode } = useStore();
  
  // Calculate watering progress with better precision handling and memoization
  const { progress, needsWatering, daysLeft, isReadyToWater, shouldShowGreenBackground, shouldShowRedBackground, overdueDays } = useMemo(() => {
    const now = getCurrentTimeWithOffset(debugTimeOffset);
    const effectiveLastWatered = getEffectiveLastWatered(plant, now, manualWateringMode);
    const timeSinceLastWatered = now.getTime() - effectiveLastWatered.getTime();
    const daysSinceLastWatered = Math.floor(timeSinceLastWatered / (1000 * 60 * 60 * 24));
    const progress = Math.floor(Math.min(Math.max(0, (daysSinceLastWatered / plant.wateringInterval) * 100), 100));
    const needsWatering = daysSinceLastWatered >= plant.wateringInterval;
    const daysLeft = Math.max(0, plant.wateringInterval - daysSinceLastWatered);
    
    // Plant is ready to water on the exact day it needs watering
    const isReadyToWater = daysSinceLastWatered === plant.wateringInterval;
    
    // Show green background when plant needs watering (exact day)
    const shouldShowGreenBackground = daysSinceLastWatered === plant.wateringInterval;
    
    // Show red background when plant is overdue (day after watering is due)
    const shouldShowRedBackground = daysSinceLastWatered > plant.wateringInterval;
    
    // Calculate overdue days
    const overdueDays = Math.max(0, daysSinceLastWatered - plant.wateringInterval);
    
    return { progress, needsWatering, daysLeft, isReadyToWater, shouldShowGreenBackground, shouldShowRedBackground, overdueDays };
  }, [plant.lastWatered, plant.wateringInterval, debugTimeOffset, manualWateringMode]);

  return (
    <Pressable onPress={onPress} style={{ flex: 1 }}>
      <View 
        className={`rounded-xl border border-border p-4 shadow-sm flex-1 ${
          shouldShowRedBackground ? 'bg-red-50/50 border-red-200/50' :
          shouldShowGreenBackground ? 'bg-emerald-50/50 border-emerald-200/50' : 'bg-card'
        }`}
      >
        {/* Plant Image */}
        <View className="items-center mb-3">
          <Avatar className="w-20 h-20" alt={plant.name}>
            <AvatarImage source={{ uri: plant.image }} />
            <AvatarFallback>
              <Text className="text-lg font-semibold">🌱</Text>
            </AvatarFallback>
          </Avatar>
        </View>

        {/* Plant Name */}
        <Text 
          variant="subhead" 
          className="text-center font-medium mb-1"
          numberOfLines={1}
        >
          {plant.name}
        </Text>

        {/* Room Location */}
        <Text 
          variant="caption2" 
          className="text-center text-muted-foreground mb-3"
          numberOfLines={1}
        >
          {getRoomDisplayName(plant.room)}
        </Text>

        {/* Watering Progress */}
        <View className="mb-2">
          <ProgressIndicator 
            value={progress} 
            className={isReadyToWater ? "bg-emerald-500" : shouldShowRedBackground ? "bg-rose-500" : ""}
          />
        </View>

        {/* Status Text */}
        <Text 
          variant="caption2" 
          className={`text-center ${needsWatering ? 'text-rose-600 font-medium' : 'text-muted-foreground'}`}
        >
          {needsWatering 
            ? (isReadyToWater ? 'Ready to water!' : 
               shouldShowRedBackground ? `${overdueDays} day${overdueDays !== 1 ? 's' : ''} overdue!` : 'Needs watering!') 
            : `${daysLeft} days left`
          }
        </Text>
      </View>
    </Pressable>
  );
});

PlantCard.displayName = 'PlantCard'; 