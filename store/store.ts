import { create } from 'zustand';
import * as FileSystem from 'expo-file-system';
import { notificationService, NotificationSettings } from '~/lib/notifications';

export interface Plant {
  id: string;
  name: string;
  scientificName: string;
  room: string;
  image: string;
  lastWatered: Date;
  wateringInterval: number; // in days
  notes?: string; // Optional custom notes
  effectiveLastWatered?: Date; // For automatic mode tracking
}

export interface PlantState {
  plants: Plant[];
  isLoading: boolean;
  manualWateringMode: boolean;
  debugTimeOffset: number;
  searchTerm: string;
  filterType: 'default' | 'alphabetical' | 'room' | 'watering-priority';
  notificationSettings: NotificationSettings;
  addPlant: (plant: Omit<Plant, 'id' | 'lastWatered'>) => Promise<void>;
  removePlant: (id: string) => Promise<void>;
  updatePlant: (id: string, updates: Partial<Plant>) => Promise<void>;
  waterPlant: (id: string) => Promise<void>;
  loadPlants: () => Promise<void>;
  setManualWateringMode: (enabled: boolean) => Promise<void>;
  setDebugTimeOffset: (offset: number) => void;
  setSearchTerm: (term: string) => void;
  setFilterType: (type: 'default' | 'alphabetical' | 'room' | 'watering-priority') => Promise<void>;
  getFilteredPlants: () => Plant[];
  setNotificationSettings: (settings: Partial<NotificationSettings>) => Promise<void>;
  testNotification: () => Promise<void>;
  testBackgroundNotification: () => Promise<void>;
}

// File paths for data storage
const PLANTS_DATA_FILE = `${FileSystem.documentDirectory || ''}plants.json`;
const PLANTS_IMAGES_DIR = `${FileSystem.documentDirectory || ''}plant-images/`;
// Settings file path
const SETTINGS_FILE = `${FileSystem.documentDirectory}settings.json`;

// Ensure images directory exists
const ensureImagesDirectory = async () => {
  if (!FileSystem.documentDirectory) {
    throw new Error('Document directory not available');
  }
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

// Helper function to save settings to file
const saveSettingsToFile = async (settings: {
  manualWateringMode: boolean;
  searchTerm: string;
  filterType: 'default' | 'alphabetical' | 'room' | 'watering-priority';
  notificationSettings: NotificationSettings;
}) => {
  if (!FileSystem.documentDirectory) return;
  
  try {
    await FileSystem.writeAsStringAsync(SETTINGS_FILE, JSON.stringify(settings));
  } catch (error) {
    console.error('Failed to save settings:', error);
  }
};

// Helper function to load settings from file
const loadSettingsFromFile = async (): Promise<{
  manualWateringMode: boolean;
  searchTerm: string;
  filterType: 'default' | 'alphabetical' | 'room' | 'watering-priority';
  notificationSettings: NotificationSettings;
}> => {
  if (!FileSystem.documentDirectory) {
    return { 
      manualWateringMode: false, 
      searchTerm: '', 
      filterType: 'default',
      notificationSettings: notificationService.getSettings()
    };
  }
  
  try {
    // Check if settings file exists before trying to read it
    const fileInfo = await FileSystem.getInfoAsync(SETTINGS_FILE);
    if (!fileInfo.exists) {
      console.log('Settings file does not exist yet, using defaults');
      return { 
        manualWateringMode: false, 
        searchTerm: '', 
        filterType: 'default',
        notificationSettings: notificationService.getSettings()
      };
    }
    
    const settingsContent = await FileSystem.readAsStringAsync(SETTINGS_FILE);
    const settings = JSON.parse(settingsContent);
    return {
      manualWateringMode: settings.manualWateringMode ?? false,
      searchTerm: settings.searchTerm ?? '',
      filterType: settings.filterType ?? 'default',
      notificationSettings: settings.notificationSettings ?? notificationService.getSettings(),
    };
  } catch (error) {
    console.error('Failed to load settings:', error);
    return { 
      manualWateringMode: false, 
      searchTerm: '', 
      filterType: 'default',
      notificationSettings: notificationService.getSettings()
    };
  }
};

// Copy image to app's file system if it's a local file
const copyImageToAppStorage = async (imageUri: string, plantId: string): Promise<string> => {
  // If it's already a local file in our app directory, return as is
  if (FileSystem.documentDirectory && imageUri.startsWith(FileSystem.documentDirectory)) {
    return imageUri;
  }
  
  // If it's a remote URL, keep it as is
  if (imageUri.startsWith('http')) {
    return imageUri;
  }
  
  // If it's a local file from camera/gallery, copy it to our app directory
  try {
    if (!FileSystem.documentDirectory) {
      return imageUri; // Return original if document directory not available
    }
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

// Helper function to get current time with debug offset
export const getCurrentTimeWithOffset = (offset: number = 0): Date => {
  const now = new Date();
  if (offset === 0) return now;
  
  const offsetTime = new Date(now.getTime() + (offset * 24 * 60 * 60 * 1000));
  return offsetTime;
};

// Helper function to get effective last watered time (considering auto-watering)
export const getEffectiveLastWatered = (plant: Plant, currentTime: Date, manualWateringMode: boolean): Date => {
  if (manualWateringMode) {
    // In manual mode, always return the actual last watered date
    return plant.lastWatered;
  }
  
  // In automatic mode, we need to calculate when the plant was last effectively watered
  // This should reset every N days where N is the watering interval
  
  const timeSinceLastWatered = currentTime.getTime() - plant.lastWatered.getTime();
  const daysSinceLastWatered = Math.floor(timeSinceLastWatered / (1000 * 60 * 60 * 24));
  
  // For automatic mode, we want to show "Ready to water" on the exact day
  // and then reset the next day. So we calculate when the last complete cycle ended.
  // If we're on day 3 of a 3-day cycle, we want to show "Ready to water"
  // If we're on day 4, we want to show 2 days left (as if it was watered on day 3)
  
  if (daysSinceLastWatered >= plant.wateringInterval) {
    // We're at or past the watering day
    // Calculate when the last complete cycle ended
    // We want to reset the day AFTER the watering day, so we subtract 1 from the cycle calculation
    const completeCycles = Math.floor((daysSinceLastWatered - 1) / plant.wateringInterval);
    const lastCycleEnd = new Date(
      plant.lastWatered.getTime() + (completeCycles * plant.wateringInterval * 24 * 60 * 60 * 1000)
    );
    return lastCycleEnd;
  } else {
    // We're before the watering day, use original last watered time
    return plant.lastWatered;
  }
};

// Helper function to get the display date for "Last watered" field
export const getDisplayLastWateredDate = (plant: Plant, currentTime: Date, manualWateringMode: boolean): Date => {
  if (manualWateringMode) {
    return plant.lastWatered;
  }
  
  // In automatic mode, show the effective last watered date
  return getEffectiveLastWatered(plant, currentTime, manualWateringMode);
};

export const useStore = create<PlantState>((set, get) => ({
  plants: [],
  isLoading: false,
  manualWateringMode: false, // Initialize the new setting
  debugTimeOffset: 0, // Initialize debug time offset
  searchTerm: '',
  filterType: 'default',
  notificationSettings: notificationService.getSettings(),

  loadPlants: async () => {
    try {
      set({ isLoading: true });
      const plants = await loadPlantsFromFile();
      const settings = await loadSettingsFromFile();
      set({ 
        plants, 
        isLoading: false, 
        manualWateringMode: settings.manualWateringMode, 
        searchTerm: settings.searchTerm, 
        filterType: settings.filterType,
        notificationSettings: settings.notificationSettings
      });
      
      // Schedule notifications for all plants
      await notificationService.schedulePlantReminders(plants);
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
      lastWatered: new Date(),
    };
    
    const updatedPlants = [...get().plants, newPlant];
    set({ plants: updatedPlants });
    
    // Save to file
    await savePlantsToFile(updatedPlants);
    
    // Reschedule notifications
    await notificationService.schedulePlantReminders(updatedPlants);
  },

  removePlant: async (id) => {
    const updatedPlants = get().plants.filter(plant => plant.id !== id);
    set({ plants: updatedPlants });
    
    // Save to file
    await savePlantsToFile(updatedPlants);
    
    // Reschedule notifications
    await notificationService.schedulePlantReminders(updatedPlants);
  },

  updatePlant: async (id, updates) => {
    const updatedPlants = get().plants.map(plant => 
      plant.id === id ? { ...plant, ...updates } : plant
    );
    set({ plants: updatedPlants });
    
    // Save to file
    await savePlantsToFile(updatedPlants);
    
    // Reschedule notifications
    await notificationService.schedulePlantReminders(updatedPlants);
  },

  waterPlant: async (id) => {
    const updatedPlants = get().plants.map(plant => 
      plant.id === id ? { ...plant, lastWatered: new Date() } : plant
    );
    set({ plants: updatedPlants });
    
    // Save to file
    await savePlantsToFile(updatedPlants);
    
    // Reschedule notifications
    await notificationService.schedulePlantReminders(updatedPlants);
  },

  setManualWateringMode: async (enabled) => {
    set({ manualWateringMode: enabled });
    // Save to file
    await saveSettingsToFile({ manualWateringMode: enabled, searchTerm: get().searchTerm, filterType: get().filterType, notificationSettings: get().notificationSettings });
  },

  setDebugTimeOffset: (offset) => {
    set({ debugTimeOffset: offset });
  },

  setSearchTerm: (term) => {
    set({ searchTerm: term });
  },

  setFilterType: async (type) => {
    set({ filterType: type });
    // Save to file
    await saveSettingsToFile({ manualWateringMode: get().manualWateringMode, searchTerm: get().searchTerm, filterType: type, notificationSettings: get().notificationSettings });
  },

  getFilteredPlants: () => {
    const { plants, searchTerm, filterType } = get();

    let filteredPlants = [...plants];

    if (searchTerm) {
      filteredPlants = filteredPlants.filter(plant =>
        plant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plant.scientificName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plant.notes?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterType === 'alphabetical') {
      filteredPlants.sort((a, b) => a.name.localeCompare(b.name));
    } else if (filterType === 'room') {
      filteredPlants.sort((a, b) => a.room.localeCompare(b.room));
    } else if (filterType === 'watering-priority') {
      // Sort by effective last watered date, descending (most urgent to least urgent)
      filteredPlants.sort((a, b) => {
        const effectiveLastWateredA = getEffectiveLastWatered(a, new Date(), get().manualWateringMode);
        const effectiveLastWateredB = getEffectiveLastWatered(b, new Date(), get().manualWateringMode);
        return effectiveLastWateredB.getTime() - effectiveLastWateredA.getTime();
      });
    }

    return filteredPlants;
  },

  setNotificationSettings: async (settings) => {
    const updatedSettings = { ...get().notificationSettings, ...settings };
    set({ notificationSettings: updatedSettings });
    await notificationService.updateSettings(updatedSettings);
    
    // Reschedule notifications with new settings
    await notificationService.schedulePlantReminders(get().plants);
    
    // Save to file
    await saveSettingsToFile({ 
      manualWateringMode: get().manualWateringMode, 
      searchTerm: get().searchTerm, 
      filterType: get().filterType,
      notificationSettings: updatedSettings
    });
  },

  testNotification: async () => {
    await notificationService.testNotification();
  },

  testBackgroundNotification: async () => {
    await notificationService.testBackgroundNotification();
  },
}));
