import React from 'react';
import { View, TextInput } from 'react-native';
import { Text } from '~/components/nativewindui/Text';
import { Picker, PickerItem } from '~/components/nativewindui/Picker';
import { useStore } from '~/store/store';
import { useColorScheme } from '~/lib/useColorScheme';

export function SearchAndFilter() {
  const { searchTerm, filterType, setSearchTerm, setFilterType } = useStore();
  const { colors } = useColorScheme();

  const filterOptions = [
    { label: 'Default Order', value: 'default' },
    { label: 'Alphabetical', value: 'alphabetical' },
    { label: 'By Room', value: 'room' },
    { label: 'Watering Priority', value: 'watering-priority' },
  ];

  return (
    <View className="p-4 bg-card border-b border-border">
      {/* Search Bar */}
      <View className="mb-3">
        <TextInput
          placeholder="Search plants by name, scientific name, or notes..."
          value={searchTerm}
          onChangeText={setSearchTerm}
          className="border border-border rounded-lg px-3 py-2 bg-card text-foreground"
          placeholderTextColor="#666"
        />
      </View>

      {/* Filter Dropdown */}
      <View>
        <Text variant="caption2" className="text-muted-foreground mb-1">
          Sort by:
        </Text>
        <Picker
          selectedValue={filterType}
          onValueChange={(value) => setFilterType(value as any)}
        >
          {filterOptions.map((option) => (
            <PickerItem
              key={option.value}
              label={option.label}
              value={option.value}
              color={colors.foreground}
              style={{
                backgroundColor: colors.root,
              }}
            />
          ))}
        </Picker>
      </View>
    </View>
  );
} 