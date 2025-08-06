import { create } from 'zustand';
import * as FileSystem from 'expo-file-system';

export interface Plant {
  id: string;
  name: string;
  scientificName: string;
  room: string;
  image: string;
  lastWatered: Date;
  wateringInterval: number; // in days
}

export interface PlantState {
  plants: Plant[];
  isLoading: boolean;
  addPlant: (plant: Omit<Plant, 'id'>) => Promise<void>;
  removePlant: (id: string) => Promise<void>;
  updatePlant: (id: string, updates: Partial<Plant>) => Promise<void>;
  waterPlant: (id: string) => Promise<void>;
  loadPlants: () => Promise<void>;
}

// File paths for data storage
const PLANTS_DATA_FILE = `${FileSystem.documentDirectory}plants.json`;
const PLANTS_IMAGES_DIR = `${FileSystem.documentDirectory}plant-images/`;

// Ensure images directory exists
const ensureImagesDirectory = async () => {
  const dirInfo = await FileSystem.getInfoAsync(PLANTS_IMAGES_DIR);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(PLANTS_IMAGES_DIR, { intermediates: true });
  }
};

// Save plants data to file
const savePlantsToFile = async (plants: Plant[]) => {
  try {
    const plantsData = plants.map(plant => ({
      ...plant,
      lastWatered: plant.lastWatered.toISOString(),
    }));
    await FileSystem.writeAsStringAsync(PLANTS_DATA_FILE, JSON.stringify(plantsData));
  } catch (error) {
    console.error('Error saving plants data:', error);
  }
};

// Load plants data from file
const loadPlantsFromFile = async (): Promise<Plant[]> => {
  try {
    const fileInfo = await FileSystem.getInfoAsync(PLANTS_DATA_FILE);
    if (!fileInfo.exists) {
      return [];
    }
    
    const data = await FileSystem.readAsStringAsync(PLANTS_DATA_FILE);
    const plantsData = JSON.parse(data);
    
    return plantsData.map((plant: any) => ({
      ...plant,
      lastWatered: new Date(plant.lastWatered),
    }));
  } catch (error) {
    console.error('Error loading plants data:', error);
    return [];
  }
};

// Copy image to app's file system if it's a local file
const copyImageToAppStorage = async (imageUri: string, plantId: string): Promise<string> => {
  // If it's already a local file in our app directory, return as is
  if (imageUri.startsWith(FileSystem.documentDirectory)) {
    return imageUri;
  }
  
  // If it's a remote URL, keep it as is
  if (imageUri.startsWith('http')) {
    return imageUri;
  }
  
  // If it's a local file from camera/gallery, copy it to our app directory
  try {
    await ensureImagesDirectory();
    const fileName = `plant-${plantId}.jpg`;
    const destinationUri = `${PLANTS_IMAGES_DIR}${fileName}`;
    
    await FileSystem.copyAsync({
      from: imageUri,
      to: destinationUri,
    });
    
    return destinationUri;
  } catch (error) {
    console.error('Error copying image:', error);
    return imageUri; // Return original if copy fails
  }
};

export const useStore = create<PlantState>((set, get) => ({
  plants: [],
  isLoading: false,

  loadPlants: async () => {
    set({ isLoading: true });
    try {
      const plants = await loadPlantsFromFile();
      set({ plants, isLoading: false });
    } catch (error) {
      console.error('Error loading plants:', error);
      set({ isLoading: false });
    }
  },

  addPlant: async (plant) => {
    const newPlantId = Date.now().toString();
    
    // Copy image to app storage if it's a local file
    const processedImageUri = await copyImageToAppStorage(plant.image, newPlantId);
    
    const newPlant: Plant = {
      ...plant,
      id: newPlantId,
      image: processedImageUri,
    };
    
    const updatedPlants = [...get().plants, newPlant];
    set({ plants: updatedPlants });
    
    // Save to file
    await savePlantsToFile(updatedPlants);
  },

  removePlant: async (id) => {
    const plant = get().plants.find(p => p.id === id);
    const updatedPlants = get().plants.filter(plant => plant.id !== id);
    set({ plants: updatedPlants });
    
    // Delete image file if it's in our app directory
    if (plant && plant.image.startsWith(FileSystem.documentDirectory)) {
      try {
        await FileSystem.deleteAsync(plant.image);
      } catch (error) {
        console.error('Error deleting image file:', error);
      }
    }
    
    // Save to file
    await savePlantsToFile(updatedPlants);
  },

  updatePlant: async (id, updates) => {
    const updatedPlants = get().plants.map(plant => 
      plant.id === id ? { ...plant, ...updates } : plant
    );
    set({ plants: updatedPlants });
    
    // Save to file
    await savePlantsToFile(updatedPlants);
  },

  waterPlant: async (id) => {
    const updatedPlants = get().plants.map(plant => 
      plant.id === id ? { ...plant, lastWatered: new Date() } : plant
    );
    set({ plants: updatedPlants });
    
    // Save to file
    await savePlantsToFile(updatedPlants);
  },
}));
