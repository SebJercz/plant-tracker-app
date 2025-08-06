import React, { useState } from 'react';
import { View, Pressable, Alert, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Icon } from '@roninoss/icons';
import { Text } from '~/components/nativewindui/Text';
import { useColorScheme } from '~/lib/useColorScheme';

interface ImagePickerButtonProps {
  onImageSelected: (imageUri: string) => void;
  selectedImage?: string;
}

export function ImagePickerButton({ onImageSelected, selectedImage }: ImagePickerButtonProps) {
  const { colors } = useColorScheme();
  const [isLoading, setIsLoading] = useState(false);

  const requestPermissions = async () => {
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: libraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (cameraStatus !== 'granted' || libraryStatus !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Camera and photo library permissions are required to add plant photos.'
      );
      return false;
    }
    return true;
  };

  const showImagePickerOptions = () => {
    Alert.alert(
      'Select Image',
      'Choose how you want to add a photo for your plant',
      [
        {
          text: 'Take Photo',
          onPress: () => takePhoto(),
        },
        {
          text: 'Choose from Gallery',
          onPress: () => pickImageFromGallery(),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  const takePhoto = async () => {
    if (!(await requestPermissions())) return;

    setIsLoading(true);
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        onImageSelected(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const pickImageFromGallery = async () => {
    if (!(await requestPermissions())) return;

    setIsLoading(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        onImageSelected(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to select image. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="items-center mb-6">
      <Text variant="subhead" className="mb-3 font-medium text-center">
        Plant Photo
      </Text>
      
      <Pressable
        onPress={showImagePickerOptions}
        disabled={isLoading}
        className="relative"
      >
        <View className="w-24 h-24 rounded-full border-2 border-dashed border-muted-foreground items-center justify-center bg-muted/20">
          {selectedImage ? (
            <Image
              source={{ uri: selectedImage }}
              className="w-20 h-20 rounded-full"
              resizeMode="cover"
            />
          ) : (
            <View className="items-center">
              <Icon name="camera" size={24} color={colors.grey} />
              <Text variant="caption2" className="text-muted-foreground mt-1 text-center">
                Add Photo
              </Text>
            </View>
          )}
        </View>
        
        {selectedImage && (
          <View className="absolute -top-1 -right-1 w-6 h-6 bg-primary rounded-full items-center justify-center">
            <Icon name="checkmark" size={12} color="white" />
          </View>
        )}
      </Pressable>
      
      {selectedImage && (
        <Text variant="caption2" className="text-muted-foreground mt-2 text-center">
          Tap to change photo
        </Text>
      )}
    </View>
  );
} 