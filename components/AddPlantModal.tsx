import React, { useState, useEffect } from 'react';
import { View, TextInput, Alert, ScrollView } from 'react-native';
import { Sheet, useSheetRef } from '~/components/nativewindui/Sheet';
import { Slider } from '~/components/nativewindui/Slider';
import { Text } from '~/components/nativewindui/Text';
import { Button } from '~/components/nativewindui/Button';
import { Picker, PickerItem } from '~/components/nativewindui/Picker';
import { ImagePickerButton } from '~/components/ImagePickerButton';
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

// Array of default plant images to choose from randomly
const DEFAULT_PLANT_IMAGES = [
  'https://images.unsplash.com/photo-1466781783364-36c955e42a7f?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1593691509543-c55fb32e5cee?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1593691509543-c55fb32e5cee?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1520412099551-62b6bafeb5bb?w=400&h=400&fit=crop',
];

const getRandomDefaultImage = () => {
  const randomIndex = Math.floor(Math.random() * DEFAULT_PLANT_IMAGES.length);
  return DEFAULT_PLANT_IMAGES[randomIndex];
};

export function AddPlantModal({ isVisible, onClose }: AddPlantModalProps) {
  const { addPlant } = useStore();
  const { colors } = useColorScheme();
  const sheetRef = useSheetRef();
  const [plantName, setPlantName] = useState('');
  const [scientificName, setScientificName] = useState('');
  const [wateringInterval, setWateringInterval] = useState(7);
  const [selectedRoom, setSelectedRoom] = useState('living-room');
  const [selectedImage, setSelectedImage] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isVisible) {
      sheetRef.current?.present();
    } else {
      sheetRef.current?.dismiss();
    }
  }, [isVisible]);

  const handleAddPlant = async () => {
    if (!plantName.trim()) {
      Alert.alert('Error', 'Please enter a plant name');
      return;
    }

    if (!scientificName.trim()) {
      Alert.alert('Error', 'Please enter a scientific name');
      return;
    }

    setIsSubmitting(true);
    try {
      // Add the new plant with custom image or random default
      await addPlant({
        name: plantName.trim(),
        scientificName: scientificName.trim(),
        room: selectedRoom,
        image: selectedImage || getRandomDefaultImage(),
        lastWatered: new Date(),
        wateringInterval: Math.round(wateringInterval),
      });

      // Reset form and close modal
      setPlantName('');
      setScientificName('');
      setWateringInterval(7);
      setSelectedRoom('living-room');
      setSelectedImage(undefined);
      onClose();
    } catch (error) {
      Alert.alert('Error', 'Failed to add plant. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setPlantName('');
    setScientificName('');
    setWateringInterval(7);
    setSelectedRoom('living-room');
    setSelectedImage(undefined);
    onClose();
  };

  const handleImageSelected = (imageUri: string) => {
    setSelectedImage(imageUri);
  };

  return (
    <Sheet 
      ref={sheetRef}
      snapPoints={['95%']}
      onDismiss={onClose}
    >
      <View className="flex-1 bg-card" style={{ position: 'relative' }}>
        {/* Header */}
        <View className="p-6 pb-4 border-b border-border">
          <Text variant="title2" className="text-center font-semibold">
            Add New Plant
          </Text>
        </View>

        {/* Scrollable Content */}
        <ScrollView className="flex-1" contentContainerClassName="p-6 pb-32">
          {/* Plant Photo Picker */}
          <ImagePickerButton 
            onImageSelected={handleImageSelected}
            selectedImage={selectedImage}
          />

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
              editable={!isSubmitting}
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
              editable={!isSubmitting}
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
              enabled={!isSubmitting}
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
          <View className="mb-6">
            <Text variant="subhead" className="mb-2 font-medium">
              Watering Frequency: {Math.round(wateringInterval)} days
            </Text>
            <Slider
              value={wateringInterval}
              onValueChange={setWateringInterval}
              minimumValue={1}
              maximumValue={30}
              step={1}
              disabled={isSubmitting}
            />
            <View className="flex-row justify-between mt-1">
              <Text variant="caption2" className="text-muted-foreground">1 day</Text>
              <Text variant="caption2" className="text-muted-foreground">30 days</Text>
            </View>
          </View>
        </ScrollView>

        {/* Action Buttons - Fixed at bottom with debug styling */}
        <View 
          className="p-6 border-t border-border bg-red-500"
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
              variant="secondary"
              onPress={handleCancel}
              className="flex-1"
              disabled={isSubmitting}
              style={{ backgroundColor: 'blue', minHeight: 50 }}
            >
              <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>CANCEL</Text>
            </Button>
            <Button
              onPress={handleAddPlant}
              className="flex-1"
              disabled={isSubmitting}
              style={{ backgroundColor: 'green', minHeight: 50 }}
            >
              <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>
                {isSubmitting ? 'Adding...' : 'ADD PLANT'}
              </Text>
            </Button>
          </View>
        </View>
      </View>
    </Sheet>
  );
} 