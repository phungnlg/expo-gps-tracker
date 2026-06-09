import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { GeofenceZone, GeofenceCenter } from '../models/GeofenceZone';
import { LocationPoint } from '../models/LocationPoint';
import * as storageService from '../services/storageService';

interface GeofenceState {
  zones: GeofenceZone[];
  triggeredZoneIds: string[];
  loadZones: () => Promise<void>;
  addZone: (name: string, center: GeofenceCenter, radiusMeters: number) => Promise<void>;
  removeZone: (id: string) => Promise<void>;
  toggleZone: (id: string) => Promise<void>;
  checkGeofence: (location: LocationPoint) => string[];
}

function distanceBetween(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371000; // meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

const DEMO_ZONES: GeofenceZone[] = [
  { id: 'demo-z1', name: 'Home', center: { lat: 10.7769, lng: 106.7009 }, radiusMeters: 150, isActive: true },
  { id: 'demo-z2', name: 'Office', center: { lat: 10.7905, lng: 106.6822 }, radiusMeters: 200, isActive: true },
  { id: 'demo-z3', name: 'Gym', center: { lat: 10.7626, lng: 106.6822 }, radiusMeters: 100, isActive: false },
];

export const useGeofenceStore = create<GeofenceState>((set, get) => ({
  zones: DEMO_ZONES,
  triggeredZoneIds: ['demo-z1'],

  loadZones: async () => {
    const zones = await storageService.loadGeofences();
    set({ zones: zones.length ? zones : DEMO_ZONES });
  },

  addZone: async (name: string, center: GeofenceCenter, radiusMeters: number) => {
    const zone: GeofenceZone = {
      id: uuidv4(),
      name,
      center,
      radiusMeters,
      isActive: true,
    };
    const zones = [...get().zones, zone];
    set({ zones });
    await storageService.saveGeofences(zones);
  },

  removeZone: async (id: string) => {
    const zones = get().zones.filter((z) => z.id !== id);
    set({ zones });
    await storageService.saveGeofences(zones);
  },

  toggleZone: async (id: string) => {
    const zones = get().zones.map((z) =>
      z.id === id ? { ...z, isActive: !z.isActive } : z,
    );
    set({ zones });
    await storageService.saveGeofences(zones);
  },

  checkGeofence: (location: LocationPoint) => {
    const { zones } = get();
    const triggeredIds: string[] = [];

    for (const zone of zones) {
      if (!zone.isActive) continue;

      const dist = distanceBetween(
        location.lat,
        location.lng,
        zone.center.lat,
        zone.center.lng,
      );

      if (dist <= zone.radiusMeters) {
        triggeredIds.push(zone.id);
      }
    }

    set({ triggeredZoneIds: triggeredIds });
    return triggeredIds;
  },
}));
