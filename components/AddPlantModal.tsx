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
import { Plant } from '~/store/store';

interface AddPlantModalProps {
  isVisible: boolean;
  onClose: () => void;
  plantToEdit?: Plant | null; // Optional plant to edit
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

export function AddPlantModal({ isVisible, onClose, plantToEdit }: AddPlantModalProps) {
  const { addPlant, updatePlant } = useStore();
  const { colors } = useColorScheme();
  const sheetRef = useSheetRef();
  const [plantName, setPlantName] = useState('');
  const [scientificName, setScientificName] = useState('');
  const [wateringInterval, setWateringInterval] = useState(7);
  const [selectedRoom, setSelectedRoom] = useState('living-room');
  const [selectedImage, setSelectedImage] = useState<string | undefined>();
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form with plant data when editing
  useEffect(() => {
    if (plantToEdit) {
      setPlantName(plantToEdit.name);
      setScientificName(plantToEdit.scientificName);
      setWateringInterval(plantToEdit.wateringInterval);
      setSelectedRoom(plantToEdit.room);
      setSelectedImage(plantToEdit.image);
      setNotes(plantToEdit.notes || '');
    } else {
      // Reset form for new plant
      setPlantName('');
      setScientificName('');
      setWateringInterval(7);
      setSelectedRoom('living-room');
      setSelectedImage(undefined);
      setNotes('');
    }
  }, [plantToEdit]);

  useEffect(() => {
    if (isVisible) {
      sheetRef.current?.present();
    } else {
      sheetRef.current?.dismiss();
    }
  }, [isVisible]);

  const handleSavePlant = async () => {
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
      if (plantToEdit) {
        // Update existing plant
        await updatePlant(plantToEdit.id, {
          name: plantName.trim(),
          scientificName: scientificName.trim(),
          room: selectedRoom,
          image: selectedImage || plantToEdit.image,
          wateringInterval: Math.round(wateringInterval),
          notes: notes.trim(),
        });
      } else {
        // Add new plant
        await addPlant({
          name: plantName.trim(),
          scientificName: scientificName.trim(),
          room: selectedRoom,
          image: selectedImage || getRandomDefaultImage(),
          wateringInterval: Math.round(wateringInterval),
          notes: notes.trim(),
        });
      }

      // Reset form and close modal
      setPlantName('');
      setScientificName('');
      setWateringInterval(7);
      setSelectedRoom('living-room');
      setSelectedImage(undefined);
      setNotes('');
      onClose();
    } catch (error) {
      Alert.alert('Error', `Failed to ${plantToEdit ? 'update' : 'add'} plant. Please try again.`);
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
    setNotes('');
    onClose();
  };

  const handleImageSelected = (imageUri: string) => {
    setSelectedImage(imageUri);
  };

  const isEditing = !!plantToEdit;

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
            {isEditing ? 'Edit Plant' : 'Add New Plant'}
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
          <View className="mb-4">
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

          {/* Notes Input */}
          <View className="mb-6">
            <Text variant="subhead" className="mb-2 font-medium">
              Notes
            </Text>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="Add custom notes about your plant..."
              className="border border-border rounded-lg px-3 py-2 bg-card text-foreground"
              placeholderTextColor="#666"
              editable={!isSubmitting}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
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
          <View className="flex-row gap-3 justify-center">
            <Button
              variant="secondary"
              onPress={handleCancel}
              className="flex-1 max-w-32"
              disabled={isSubmitting}
              style={{ 
                backgroundColor: 'transparent',
                borderWidth: 1,
                borderColor: '#6b7280',
                minHeight: 50,
              }}
            >
              <Text style={{ color: '#6b7280', fontSize: 16, fontWeight: '600' }}>Cancel</Text>
            </Button>
            <Button
              onPress={handleSavePlant}
              className="flex-1 max-w-32"
              disabled={isSubmitting}
              style={{ 
                backgroundColor: '#10b981', 
                minHeight: 50,
              }}
            >
              <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>
                {isSubmitting ? 'Saving...' : (isEditing ? 'Update' : 'Add Plant')}
              </Text>
            </Button>
          </View>
        </View>
      </View>
    </Sheet>
  );
} 