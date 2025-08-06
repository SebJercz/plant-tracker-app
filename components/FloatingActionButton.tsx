import React from 'react';
import { Pressable, View } from 'react-native';
import { Icon } from '@roninoss/icons';
import { useColorScheme } from '~/lib/useColorScheme';

interface FloatingActionButtonProps {
  onPress: () => void;
  icon?: string;
  size?: number;
}

export function FloatingActionButton({ 
  onPress, 
  icon = "plus", 
  size = 24 
}: FloatingActionButtonProps) {
  const { colors } = useColorScheme();

  return (
    <View 
      className="absolute bottom-6 right-6"
      style={{ zIndex: 9999 }}
      pointerEvents="box-none"
    >
      <Pressable
        onPress={onPress}
        className="w-14 h-14 rounded-full items-center justify-center shadow-lg"
        style={{
          backgroundColor: '#10b981',
          shadowColor: '#10b981',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8,
        }}
      >
        <Icon name={icon} size={size} color="white" />
      </Pressable>
    </View>
  );
} 