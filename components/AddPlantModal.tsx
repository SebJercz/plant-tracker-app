import React, { useState, useEffect } from 'react';
import { View, TextInput, Alert, ScrollView } from 'react-native';
import { Sheet, useSheetRef } from '~/components/nativewindui/Sheet';
import { Slider } from '~/components/nativewindui/Slider';
import { Text } from '~/components/nativewindui/Text';
import { Button } from '~/components/nativewindui/Button';
import { Picker, PickerItem } from '~/components/nativewindui/Picker';
import { useStore } from '~/store/store';
import { useColorScheme } from '~/lib/useColorScheme';

interface AddPlantModalProps {
  isVisible: boolean;
  onClose: () => void;
}

const ROOM_OPTIONS = [
  { label: 'Living Room', value: 'living-room' },
  { label: 'Kitchen', value: 'kitchen' },
  { label: 'Bathroom', value: 'bathroom' },
  { label: 'Bedroom', value: 'bedroom' },
  { label: 'Office', value: 'office' },
];

export function AddPlantModal({ isVisible, onClose }: AddPlantModalProps) {
  const { addPlant } = useStore();
  const { colors } = useColorScheme();
  const sheetRef = useSheetRef();
  const [plantName, setPlantName] = useState('');
  const [scientificName, setScientificName] = useState('');
  const [wateringInterval, setWateringInterval] = useState(7);
  const [selectedRoom, setSelectedRoom] = useState('living-room');

  useEffect(() => {
    if (isVisible) {
      sheetRef.current?.present();
    } else {
      sheetRef.current?.dismiss();
    }
  }, [isVisible]);

  const handleAddPlant = () => {
    if (!plantName.trim()) {
      Alert.alert('Error', 'Please enter a plant name');
      return;
    }

    if (!scientificName.trim()) {
      Alert.alert('Error', 'Please enter a scientific name');
      return;
    }

    // Add the new plant
    addPlant({
      name: plantName.trim(),
      scientificName: scientificName.trim(),
      room: selectedRoom,
      image: 'https://images.unsplash.com/photo-1466781783364-36c955e42a7f?w=400&h=400&fit=crop', // Default image for now
      lastWatered: new Date(),
      wateringInterval: Math.round(wateringInterval),
    });

    // Reset form and close modal
    setPlantName('');
    setScientificName('');
    setWateringInterval(7);
    setSelectedRoom('living-room');
    onClose();
  };

  const handleCancel = () => {
    setPlantName('');
    setScientificName('');
    setWateringInterval(7);
    setSelectedRoom('living-room');
    onClose();
  };

  return (
    <Sheet 
      ref={sheetRef}
      snapPoints={['75%']}
      onDismiss={onClose}
    >
      <ScrollView className="flex-1" contentContainerClassName="p-6">
        <Text variant="title2" className="text-center mb-6 font-semibold">
          Add New Plant
        </Text>

        {/* Plant Name Input */}
        <View className="mb-4">
          <Text variant="subhead" className="mb-2 font-medium">
            Plant Name
          </Text>
          <TextInput
            value={plantName}
            onChangeText={setPlantName}
            placeholder="Enter plant name"
            className="border border-border rounded-lg px-3 py-2 bg-card text-foreground"
            placeholderTextColor="#666"
          />
        </View>

        {/* Scientific Name Input */}
        <View className="mb-4">
          <Text variant="subhead" className="mb-2 font-medium">
            Scientific Name
          </Text>
          <TextInput
            value={scientificName}
            onChangeText={setScientificName}
            placeholder="Enter scientific name"
            className="border border-border rounded-lg px-3 py-2 bg-card text-foreground"
            placeholderTextColor="#666"
          />
        </View>

        {/* Room Selection */}
        <View className="mb-4">
          <Text variant="subhead" className="mb-2 font-medium">
            Room Location
          </Text>
          <Picker
            selectedValue={selectedRoom}
            onValueChange={(itemValue) => setSelectedRoom(itemValue)}
          >
            {ROOM_OPTIONS.map((room) => (
              <PickerItem
                key={room.value}
                label={room.label}
                value={room.value}
                color={colors.foreground}
                style={{
                  backgroundColor: colors.root,
                }}
              />
            ))}
          </Picker>
        </View>

        {/* Watering Frequency Slider */}
        <View className="mb-8">
          <Text variant="subhead" className="mb-2 font-medium">
            Watering Frequency: {Math.round(wateringInterval)} days
          </Text>
          <Slider
            value={wateringInterval}
            onValueChange={setWateringInterval}
            minimumValue={1}
            maximumValue={30}
            step={1}
          />
          <View className="flex-row justify-between mt-1">
            <Text variant="caption2" className="text-muted-foreground">1 day</Text>
            <Text variant="caption2" className="text-muted-foreground">30 days</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View className="flex-row gap-3 pt-4">
          <Button
            variant="secondary"
            onPress={handleCancel}
            className="flex-1"
          >
            <Text>Cancel</Text>
          </Button>
          <Button
            onPress={handleAddPlant}
            className="flex-1"
          >
            <Text>Add Plant</Text>
          </Button>
        </View>
      </ScrollView>
    </Sheet>
  );
} 