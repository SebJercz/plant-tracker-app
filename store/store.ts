import { create } from 'zustand';

export interface Plant {
  id: string;
  name: string;
  image: string;
  lastWatered: Date;
  wateringInterval: number; // in days
}

export interface PlantState {
  plants: Plant[];
  addPlant: (plant: Omit<Plant, 'id'>) => void;
  removePlant: (id: string) => void;
  updatePlant: (id: string, updates: Partial<Plant>) => void;
  waterPlant: (id: string) => void;
}

export const useStore = create<PlantState>((set) => ({
  plants: [
    {
      id: '1',
      name: 'Plant 1',
      image: 'https://images.unsplash.com/photo-1466781783364-36c955e42a7f?w=400&h=400&fit=crop',
      lastWatered: new Date(),
      wateringInterval: 7,
    },
    {
      id: '2',
      name: 'Plant 2',
      image: 'https://images.unsplash.com/photo-1593691509543-c55fb32e5cee?w=400&h=400&fit=crop',
      lastWatered: new Date(),
      wateringInterval: 7,
    },
    {
      id: '3',
      name: 'Plant 3',
      image: 'https://images.unsplash.com/photo-1593691509543-c55fb32e5cee?w=400&h=400&fit=crop',
      lastWatered: new Date(),
      wateringInterval: 7,
    },
  ],
  addPlant: (plant) => set((state) => ({
    plants: [...state.plants, { ...plant, id: Date.now().toString() }]
  })),
  removePlant: (id) => set((state) => ({
    plants: state.plants.filter(plant => plant.id !== id)
  })),
  updatePlant: (id, updates) => set((state) => ({
    plants: state.plants.map(plant => 
      plant.id === id ? { ...plant, ...updates } : plant
    )
  })),
  waterPlant: (id) => set((state) => ({
    plants: state.plants.map(plant => 
      plant.id === id ? { ...plant, lastWatered: new Date() } : plant
    )
  })),
}));
