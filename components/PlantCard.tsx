import React from 'react';
import { View, Pressable } from 'react-native';
import { Avatar, AvatarFallback, AvatarImage } from '~/components/nativewindui/Avatar';
import { ProgressIndicator } from '~/components/nativewindui/ProgressIndicator';
import { Text } from '~/components/nativewindui/Text';
import { Plant } from '~/store/store';

interface PlantCardProps {
  plant: Plant;
  onPress?: () => void;
}

export function PlantCard({ plant, onPress }: PlantCardProps) {
  // Calculate watering progress with better precision handling
  const now = new Date();
  const timeSinceLastWatered = now.getTime() - plant.lastWatered.getTime();
  const daysSinceLastWatered = Math.floor(timeSinceLastWatered / (1000 * 60 * 60 * 24));
  const progress = Math.min(Math.max(0, (daysSinceLastWatered / plant.wateringInterval) * 100), 100);
  
  // Determine if plant needs watering
  const needsWatering = daysSinceLastWatered >= plant.wateringInterval;

  return (
    <Pressable onPress={onPress}>
      <View className="bg-card rounded-xl border border-border p-3 shadow-sm">
        {/* Plant Image */}
        <View className="items-center mb-3">
          <Avatar className="w-20 h-20">
            <AvatarImage source={{ uri: plant.image }} />
            <AvatarFallback>
              <Text className="text-lg font-semibold">🌱</Text>
            </AvatarFallback>
          </Avatar>
        </View>

        {/* Plant Name */}
        <Text 
          variant="subhead" 
          className="text-center font-medium mb-2"
          numberOfLines={1}
        >
          {plant.name}
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
            : `${Math.max(0, plant.wateringInterval - daysSinceLastWatered)} days left`
          }
        </Text>
      </View>
    </Pressable>
  );
} 