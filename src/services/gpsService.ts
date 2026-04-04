import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { LocationPoint } from '../models/LocationPoint';

const BACKGROUND_LOCATION_TASK = 'background-location-task';

export type LocationCallback = (point: LocationPoint) => void;

let foregroundSubscription: Location.LocationSubscription | null = null;

export async function requestPermissions(): Promise<boolean> {
  const { status: foregroundStatus } =
    await Location.requestForegroundPermissionsAsync();
  if (foregroundStatus !== 'granted') {
    return false;
  }

  const { status: backgroundStatus } =
    await Location.requestBackgroundPermissionsAsync();
  return backgroundStatus === 'granted';
}

export async function getCurrentLocation(): Promise<LocationPoint | null> {
  try {
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });
    return mapLocationToPoint(location);
  } catch {
    return null;
  }
}

export async function startForegroundTracking(
  callback: LocationCallback,
): Promise<void> {
  await stopForegroundTracking();

  foregroundSubscription = await Location.watchPositionAsync(
    {
      accuracy: Location.Accuracy.High,
      timeInterval: 2000,
      distanceInterval: 5,
    },
    (location) => {
      callback(mapLocationToPoint(location));
    },
  );
}

export async function stopForegroundTracking(): Promise<void> {
  if (foregroundSubscription) {
    foregroundSubscription.remove();
    foregroundSubscription = null;
  }
}

export function defineBackgroundTask(callback: LocationCallback): void {
  TaskManager.defineTask(
    BACKGROUND_LOCATION_TASK,
    async ({
      data,
      error,
    }: TaskManager.TaskManagerTaskBody<{ locations: Location.LocationObject[] }>) => {
      if (error) {
        return;
      }
      if (data) {
        const { locations } = data;
        for (const loc of locations) {
          callback(mapLocationToPoint(loc));
        }
      }
    },
  );
}

export async function startBackgroundTracking(): Promise<void> {
  const isRegistered = await TaskManager.isTaskRegisteredAsync(
    BACKGROUND_LOCATION_TASK,
  );
  if (isRegistered) {
    return;
  }

  await Location.startLocationUpdatesAsync(BACKGROUND_LOCATION_TASK, {
    accuracy: Location.Accuracy.High,
    timeInterval: 5000,
    distanceInterval: 10,
    deferredUpdatesInterval: 5000,
    showsBackgroundLocationIndicator: true,
    foregroundService: {
      notificationTitle: 'GPS Trip Tracker',
      notificationBody: 'Tracking your trip in the background',
      notificationColor: '#2196F3',
    },
  });
}

export async function stopBackgroundTracking(): Promise<void> {
  const isRegistered = await TaskManager.isTaskRegisteredAsync(
    BACKGROUND_LOCATION_TASK,
  );
  if (isRegistered) {
    await Location.stopLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
  }
}

function mapLocationToPoint(location: Location.LocationObject): LocationPoint {
  return {
    lat: location.coords.latitude,
    lng: location.coords.longitude,
    timestamp: location.timestamp,
    speed: Math.max(0, location.coords.speed ?? 0),
    heading: location.coords.heading ?? 0,
    altitude: location.coords.altitude ?? 0,
  };
}
