import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { LocationPoint } from '../models/LocationPoint';
import { Trip } from '../models/Trip';
import { ActivityType } from '../services/activityService';
import * as gpsService from '../services/gpsService';
import * as activityService from '../services/activityService';
import * as storageService from '../services/storageService';

function haversineDistance(
  p1: LocationPoint,
  p2: LocationPoint,
): number {
  const R = 6371; // km
  const dLat = ((p2.lat - p1.lat) * Math.PI) / 180;
  const dLng = ((p2.lng - p1.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((p1.lat * Math.PI) / 180) *
      Math.cos((p2.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

interface TrackingState {
  isTracking: boolean;
  currentTrip: Trip | null;
  currentLocation: LocationPoint | null;
  currentActivity: ActivityType;
  startTracking: () => Promise<void>;
  stopTracking: () => Promise<Trip | null>;
  addPoint: (point: LocationPoint) => void;
  setCurrentLocation: (point: LocationPoint) => void;
  setActivity: (activity: ActivityType) => void;
}

export const useTrackingStore = create<TrackingState>((set, get) => ({
  isTracking: false,
  currentTrip: null,
  currentLocation: null,
  currentActivity: 'still',

  startTracking: async () => {
    const hasPermission = await gpsService.requestPermissions();
    if (!hasPermission) {
      return;
    }

    const location = await gpsService.getCurrentLocation();

    const trip: Trip = {
      id: uuidv4(),
      name: `Trip ${new Date().toLocaleDateString()}`,
      startTime: Date.now(),
      endTime: null,
      points: location ? [location] : [],
      distanceKm: 0,
      status: 'recording',
    };

    set({
      isTracking: true,
      currentTrip: trip,
      currentLocation: location,
    });

    await gpsService.startForegroundTracking((point) => {
      get().addPoint(point);
      get().setCurrentLocation(point);
    });

    activityService.startActivityDetection((activity) => {
      get().setActivity(activity);
    });

    await gpsService.startBackgroundTracking();
  },

  stopTracking: async () => {
    await gpsService.stopForegroundTracking();
    await gpsService.stopBackgroundTracking();
    activityService.stopActivityDetection();

    const { currentTrip } = get();
    if (!currentTrip) {
      set({ isTracking: false });
      return null;
    }

    const completedTrip: Trip = {
      ...currentTrip,
      endTime: Date.now(),
      status: 'completed',
    };

    await storageService.saveTrip(completedTrip);

    set({
      isTracking: false,
      currentTrip: null,
    });

    return completedTrip;
  },

  addPoint: (point: LocationPoint) => {
    set((state) => {
      if (!state.currentTrip) return state;

      const points = [...state.currentTrip.points, point];
      let distanceKm = state.currentTrip.distanceKm;

      if (points.length >= 2) {
        const prev = points[points.length - 2];
        distanceKm += haversineDistance(prev, point);
      }

      return {
        currentTrip: {
          ...state.currentTrip,
          points,
          distanceKm,
        },
      };
    });
  },

  setCurrentLocation: (point: LocationPoint) => {
    set({ currentLocation: point });
  },

  setActivity: (activity: ActivityType) => {
    set({ currentActivity: activity });
  },
}));
