import AsyncStorage from '@react-native-async-storage/async-storage';
import { Trip } from '../models/Trip';
import { GeofenceZone } from '../models/GeofenceZone';

const TRIPS_KEY = '@gps_tracker/trips';
const GEOFENCES_KEY = '@gps_tracker/geofences';

// --- Trip persistence ---

export async function saveTrips(trips: Trip[]): Promise<void> {
  const json = JSON.stringify(trips);
  await AsyncStorage.setItem(TRIPS_KEY, json);
}

export async function loadTrips(): Promise<Trip[]> {
  const json = await AsyncStorage.getItem(TRIPS_KEY);
  if (!json) {
    return [];
  }
  try {
    return JSON.parse(json) as Trip[];
  } catch {
    return [];
  }
}

export async function saveTrip(trip: Trip): Promise<void> {
  const trips = await loadTrips();
  const existingIndex = trips.findIndex((t) => t.id === trip.id);
  if (existingIndex >= 0) {
    trips[existingIndex] = trip;
  } else {
    trips.push(trip);
  }
  await saveTrips(trips);
}

export async function deleteTrip(tripId: string): Promise<void> {
  const trips = await loadTrips();
  const filtered = trips.filter((t) => t.id !== tripId);
  await saveTrips(filtered);
}

// --- Geofence persistence ---

export async function saveGeofences(zones: GeofenceZone[]): Promise<void> {
  const json = JSON.stringify(zones);
  await AsyncStorage.setItem(GEOFENCES_KEY, json);
}

export async function loadGeofences(): Promise<GeofenceZone[]> {
  const json = await AsyncStorage.getItem(GEOFENCES_KEY);
  if (!json) {
    return [];
  }
  try {
    return JSON.parse(json) as GeofenceZone[];
  } catch {
    return [];
  }
}
