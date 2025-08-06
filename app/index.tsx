import React, { useState, useEffect } from 'react';
import { View, FlatList } from 'react-native';
import { Text } from '~/components/nativewindui/Text';
import { PlantCard } from '~/components/PlantCard';
import { FloatingActionButton } from '~/components/FloatingActionButton';
import { AddPlantModal } from '~/components/AddPlantModal';
import { PlantDetailModal } from '~/components/PlantDetailModal';
import { SearchAndFilter } from '~/components/SearchAndFilter';
import { useStore } from '~/store/store';
import { Plant } from '~/store/store';

export default function HomeScreen() {
  const { plants, isLoading, loadPlants, getFilteredPlants, debugTimeOffset } = useStore();
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [selectedPlant, setSelectedPlant] = useState<Plant | null>(null);
  const [plantToEdit, setPlantToEdit] = useState<Plant | null>(null);

  useEffect(() => {
    loadPlants();
  }, []);

  // Get filtered plants
  const filteredPlants = getFilteredPlants();

  const handlePlantPress = (plant: Plant) => {
    setSelectedPlant(plant);
    setIsDetailModalVisible(true);
  };

  const handleEditPlant = (plant: Plant) => {
    setPlantToEdit(plant);
    setIsAddModalVisible(true);
  };

  const handleCloseAddModal = () => {
    setIsAddModalVisible(false);
    setPlantToEdit(null);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalVisible(false);
    setSelectedPlant(null);
  };

  const renderPlantCard = ({ item }: { item: Plant }) => (
    <PlantCard plant={item} onPress={() => handlePlantPress(item)} />
  );

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text>Loading plants...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      {/* Debug Banner */}
      {debugTimeOffset !== 0 && (
        <View className="bg-yellow-500 p-2">
          <Text className="text-center text-black font-medium">
            Debug: {debugTimeOffset > 0 ? '+' : ''}{debugTimeOffset} days from now
          </Text>
        </View>
      )}

      {/* Search and Filter */}
      <SearchAndFilter />

      {/* Plants Grid */}
      <FlatList
        data={filteredPlants}
        renderItem={renderPlantCard}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={{ gap: 12 }}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
      />

      {/* Floating Action Button */}
      <FloatingActionButton onPress={() => setIsAddModalVisible(true)} />

      {/* Add/Edit Plant Modal */}
      <AddPlantModal
        isVisible={isAddModalVisible}
        onClose={handleCloseAddModal}
        plantToEdit={plantToEdit}
      />

      {/* Plant Detail Modal */}
      <PlantDetailModal
        isVisible={isDetailModalVisible}
        onClose={handleCloseDetailModal}
        plant={selectedPlant}
        onEditPlant={handleEditPlant}
      />
    </View>
  );
}
