import React, { useMemo } from 'react';
import { View, Pressable } from 'react-native';
import { Avatar, AvatarFallback, AvatarImage } from '~/components/nativewindui/Avatar';
import { ProgressIndicator } from '~/components/nativewindui/ProgressIndicator';
import { Text } from '~/components/nativewindui/Text';
import { Plant } from '~/store/store';

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
  // Calculate watering progress with better precision handling and memoization
  const { progress, needsWatering, daysLeft } = useMemo(() => {
    const now = new Date();
    const timeSinceLastWatered = now.getTime() - plant.lastWatered.getTime();
    const daysSinceLastWatered = Math.floor(timeSinceLastWatered / (1000 * 60 * 60 * 24));
    const progress = Math.min(Math.max(0, (daysSinceLastWatered / plant.wateringInterval) * 100), 100);
    const needsWatering = daysSinceLastWatered >= plant.wateringInterval;
    const daysLeft = Math.max(0, plant.wateringInterval - daysSinceLastWatered);
    
    return { progress, needsWatering, daysLeft };
  }, [plant.lastWatered, plant.wateringInterval]);

  return (
    <Pressable onPress={onPress}>
      <View className="bg-card rounded-xl border border-border p-3 shadow-sm">
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
          className="text-center text-muted-foreground mb-2"
          numberOfLines={1}
        >
          {getRoomDisplayName(plant.room)}
        </Text>

        {/* Watering Progress */}
        <View className="mb-2">
          <ProgressIndicator 
            value={progress} 
            className={needsWatering ? "bg-destructive" : ""}
          />
        </View>

        {/* Status Text */}
        <Text 
          variant="caption2" 
          className={`text-center ${needsWatering ? 'text-destructive font-medium' : 'text-muted-foreground'}`}
        >
          {needsWatering 
            ? 'Needs watering!' 
            : `${daysLeft} days left`
          }
        </Text>
      </View>
    </Pressable>
  );
});

PlantCard.displayName = 'PlantCard'; 