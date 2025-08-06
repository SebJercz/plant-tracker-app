import React, { useState, useEffect, useMemo } from 'react';
import { View, Alert, ScrollView } from 'react-native';
import { Sheet, useSheetRef } from '~/components/nativewindui/Sheet';
import { Text } from '~/components/nativewindui/Text';
import { Button } from '~/components/nativewindui/Button';
import { Avatar, AvatarFallback, AvatarImage } from '~/components/nativewindui/Avatar';
import { ProgressIndicator } from '~/components/nativewindui/ProgressIndicator';
import { useStore, getCurrentTimeWithOffset, getEffectiveLastWatered, getDisplayLastWateredDate } from '~/store/store';
import { Plant } from '~/store/store';

interface PlantDetailModalProps {
  isVisible: boolean;
  onClose: () => void;
  plant: Plant | null;
  onEditPlant: (plant: Plant) => void;
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

export function PlantDetailModal({ isVisible, onClose, plant, onEditPlant }: PlantDetailModalProps) {
  const { removePlant, waterPlant, manualWateringMode, debugTimeOffset, plants } = useStore();
  const sheetRef = useSheetRef();
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (isVisible) {
      sheetRef.current?.present();
    } else {
      sheetRef.current?.dismiss();
    }
  }, [isVisible]);

  // Get fresh plant data from store to ensure we have the latest data
  const freshPlant = plant ? plants.find(p => p.id === plant.id) || plant : null;

  // Calculate watering progress with memoization to prevent Reanimated warnings
  // Move this before the early return to avoid hooks order issues
  const { progress, needsWatering, daysLeft, isReadyToWater, isOverdue, overdueDays } = useMemo(() => {
    console.log('PlantDetailModal useMemo recalculating for plant:', freshPlant?.id, 'lastWatered:', freshPlant?.lastWatered);
    
    if (!freshPlant) {
      return { progress: 0, needsWatering: false, daysLeft: 0, isReadyToWater: false, isOverdue: false, overdueDays: 0 };
    }
    
    const now = getCurrentTimeWithOffset(debugTimeOffset);
    const effectiveLastWatered = getEffectiveLastWatered(freshPlant, now, manualWateringMode);
    const timeSinceLastWatered = now.getTime() - effectiveLastWatered.getTime();
    const daysSinceLastWatered = Math.floor(timeSinceLastWatered / (1000 * 60 * 60 * 24));
    
    // In manual mode, if the plant was watered today (within the same day), reset progress to 0
    let adjustedDaysSinceLastWatered = daysSinceLastWatered;
    if (manualWateringMode) {
      const today = new Date();
      const wateredDate = new Date(freshPlant.lastWatered);
      const isWateredToday = today.toDateString() === wateredDate.toDateString();
      
      if (isWateredToday) {
        adjustedDaysSinceLastWatered = 0;
      }
    }
    
    const progress = Math.floor(Math.min(Math.max(0, (adjustedDaysSinceLastWatered / freshPlant.wateringInterval) * 100), 100));
    const needsWatering = adjustedDaysSinceLastWatered >= freshPlant.wateringInterval;
    const daysLeft = Math.max(0, freshPlant.wateringInterval - adjustedDaysSinceLastWatered);
    
    // Plant is ready to water on the exact day it needs watering
    const isReadyToWater = adjustedDaysSinceLastWatered === freshPlant.wateringInterval;
    
    // Plant is overdue (day after watering is due)
    const isOverdue = adjustedDaysSinceLastWatered > freshPlant.wateringInterval;
    
    // Calculate overdue days
    const overdueDays = Math.max(0, adjustedDaysSinceLastWatered - freshPlant.wateringInterval);
    
    console.log('Detailed calculation:', {
      now: now.toISOString(),
      effectiveLastWatered: effectiveLastWatered.toISOString(),
      timeSinceLastWatered,
      daysSinceLastWatered,
      adjustedDaysSinceLastWatered,
      wateringInterval: freshPlant.wateringInterval,
      progress,
      daysLeft,
      isOverdue,
      overdueDays,
      manualWateringMode
    });
    
    return { progress, needsWatering, daysLeft, isReadyToWater, isOverdue, overdueDays };
  }, [freshPlant?.id, freshPlant?.lastWatered, freshPlant?.wateringInterval, debugTimeOffset, manualWateringMode]);

  if (!freshPlant) return null;

  const handleWaterPlant = async () => {
    try {
      await waterPlant(freshPlant.id);
      // Don't close modal immediately - let user see the progress reset
      // The progress will update automatically due to the store change
    } catch (error) {
      Alert.alert('Error', 'Failed to update watering time. Please try again.');
    }
  };

  const handleDeletePlant = () => {
    Alert.alert(
      'Delete Plant',
      `Are you sure you want to delete "${freshPlant.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setIsDeleting(true);
            try {
              await removePlant(freshPlant.id);
              onClose();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete plant. Please try again.');
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ]
    );
  };

  const handleEditPlant = () => {
    onEditPlant(freshPlant);
    onClose();
  };

  return (
    <Sheet 
      ref={sheetRef}
      snapPoints={['85%']}
      onDismiss={onClose}
    >
      <View className="flex-1 bg-card" style={{ position: 'relative' }}>
        {/* Header */}
        <View className="p-6 pb-4 border-b border-border">
          <Text variant="title2" className="text-center font-semibold">
            Plant Details
          </Text>
        </View>

        {/* Scrollable Content */}
        <ScrollView className="flex-1" contentContainerClassName="p-6 pb-32">
          {/* Plant Image */}
          <View className="items-center mb-6">
            <Avatar className="w-32 h-32" alt={freshPlant.name}>
              <AvatarImage source={{ uri: freshPlant.image }} />
              <AvatarFallback>
                <Text className="text-3xl">🌱</Text>
              </AvatarFallback>
            </Avatar>
          </View>

          {/* Plant Name */}
          <View className="mb-4">
            <Text variant="title3" className="font-semibold mb-1">
              {freshPlant.name}
            </Text>
            <Text variant="subhead" className="text-muted-foreground italic">
              {freshPlant.scientificName}
            </Text>
          </View>

          {/* Room Location */}
          <View className="mb-4">
            <Text variant="subhead" className="font-medium mb-1">
              Location
            </Text>
            <Text variant="body" className="text-muted-foreground">
              {getRoomDisplayName(freshPlant.room)}
            </Text>
          </View>

          {/* Watering Status */}
          <View className="mb-4">
            <Text variant="subhead" className="font-medium mb-2">
              Watering Status
            </Text>
            {/* Debug: Show progress value */}
            <Text variant="caption2" className="text-muted-foreground mb-2">
              Debug - Progress: {progress}%, Days Left: {daysLeft}
            </Text>
            <ProgressIndicator 
              key={`progress-${freshPlant.id}-${freshPlant.lastWatered.getTime()}`}
              value={progress} 
              className={isOverdue ? "bg-destructive" : isReadyToWater ? "bg-green-500" : ""}
            />
            <View className="flex-row justify-between mt-2">
              <Text variant="caption2" className="text-muted-foreground">
                Last watered: {getDisplayLastWateredDate(freshPlant, getCurrentTimeWithOffset(debugTimeOffset), manualWateringMode).toLocaleDateString()}
              </Text>
              <Text 
                variant="caption2" 
                className={needsWatering ? 'text-destructive font-medium' : 'text-muted-foreground'}
              >
                {needsWatering 
                  ? (isReadyToWater ? 'Ready to water!' : 
                     isOverdue ? `${overdueDays} day${overdueDays !== 1 ? 's' : ''} overdue!` : 'Needs watering!') 
                  : `${daysLeft} days left`
                }
              </Text>
            </View>
            <Text variant="caption2" className="text-muted-foreground mt-1">
              Watering interval: {freshPlant.wateringInterval} days
            </Text>
            
            {/* Manual watering mode info */}
            {!manualWateringMode && (
              <Text variant="caption2" className="text-muted-foreground mt-2 italic">
                Automatic watering mode: Plants are marked as watered automatically
              </Text>
            )}
          </View>

          {/* Water Plant Button - Only show if manual watering mode is enabled */}
          {manualWateringMode && (
            <View className="mb-4">
              <Button
                onPress={handleWaterPlant}
                className="w-full"
                style={{ backgroundColor: 'blue', minHeight: 50 }}
              >
                <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>
                  Mark as Watered
                </Text>
              </Button>
            </View>
          )}

          {/* Notes */}
          {freshPlant.notes && (
            <View className="mb-4">
              <Text variant="subhead" className="font-medium mb-2">
                Notes
              </Text>
              <View className="bg-muted p-3 rounded-lg">
                <Text variant="body" className="text-foreground">
                  {freshPlant.notes}
                </Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Action Buttons - Fixed at bottom */}
        <View 
          className="p-6 border-t border-border bg-card"
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 1000,
            minHeight: 80,
          }}
        >
          <View className="flex-row gap-3">
            <Button
              onPress={handleEditPlant}
              className="flex-1"
              style={{ backgroundColor: 'green', minHeight: 50 }}
            >
              <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>
                Edit Plant
              </Text>
            </Button>
            <Button
              onPress={handleDeletePlant}
              className="flex-1"
              disabled={isDeleting}
              style={{ backgroundColor: 'red', minHeight: 50 }}
            >
              <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>
                {isDeleting ? 'Deleting...' : 'Delete Plant'}
              </Text>
            </Button>
          </View>
        </View>
      </View>
    </Sheet>
  );
} 