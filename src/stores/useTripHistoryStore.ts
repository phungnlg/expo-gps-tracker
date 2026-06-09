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

const DEMO_TRIPS: Trip[] = [
  { id: 'demo-1', name: 'Morning Run', startTime: Date.now() - 10800000, endTime: Date.now() - 8880000, points: [], distanceKm: 5.4, status: 'completed' },
  { id: 'demo-2', name: 'Commute to Office', startTime: Date.now() - 28800000, endTime: Date.now() - 27360000, points: [], distanceKm: 12.8, status: 'completed' },
  { id: 'demo-3', name: 'Evening Walk', startTime: Date.now() - 100800000, endTime: Date.now() - 99720000, points: [], distanceKm: 2.1, status: 'completed' },
];

export const useTripHistoryStore = create<TripHistoryState>((set, get) => ({
  trips: DEMO_TRIPS,
  isLoading: false,

  loadTrips: async () => {
    set({ isLoading: true });
    const trips = await storageService.loadTrips();
    // Sort by most recent first
    trips.sort((a, b) => b.startTime - a.startTime);
    set({ trips: trips.length ? trips : DEMO_TRIPS, isLoading: false });
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
