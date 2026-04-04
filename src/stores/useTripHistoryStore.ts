import { create } from 'zustand';
import { Trip } from '../models/Trip';
import * as storageService from '../services/storageService';

interface TripHistoryState {
  trips: Trip[];
  isLoading: boolean;
  loadTrips: () => Promise<void>;
  deleteTrip: (id: string) => Promise<void>;
  getTripById: (id: string) => Trip | undefined;
}

export const useTripHistoryStore = create<TripHistoryState>((set, get) => ({
  trips: [],
  isLoading: false,

  loadTrips: async () => {
    set({ isLoading: true });
    const trips = await storageService.loadTrips();
    // Sort by most recent first
    trips.sort((a, b) => b.startTime - a.startTime);
    set({ trips, isLoading: false });
  },

  deleteTrip: async (id: string) => {
    await storageService.deleteTrip(id);
    set((state) => ({
      trips: state.trips.filter((t) => t.id !== id),
    }));
  },

  getTripById: (id: string) => {
    return get().trips.find((t) => t.id === id);
  },
}));
