import { Accelerometer } from 'expo-sensors';

export type ActivityType = 'still' | 'walking' | 'running' | 'driving';

export type ActivityCallback = (activity: ActivityType) => void;

interface AccelData {
  x: number;
  y: number;
  z: number;
}

let subscription: ReturnType<typeof Accelerometer.addListener> | null = null;
let recentReadings: number[] = [];

const WINDOW_SIZE = 20;

// Thresholds for magnitude variance of accelerometer data
const STILL_THRESHOLD = 0.02;
const WALKING_THRESHOLD = 0.15;
const RUNNING_THRESHOLD = 0.6;
// Above running threshold => driving (steady but fast, typically lower variance
// than running but detected via GPS speed - here we use a simplified heuristic)

export function startActivityDetection(callback: ActivityCallback): void {
  stopActivityDetection();
  recentReadings = [];

  Accelerometer.setUpdateInterval(100);

  subscription = Accelerometer.addListener((data: AccelData) => {
    const magnitude = Math.sqrt(data.x ** 2 + data.y ** 2 + data.z ** 2);
    recentReadings.push(magnitude);

    if (recentReadings.length > WINDOW_SIZE) {
      recentReadings.shift();
    }

    if (recentReadings.length >= WINDOW_SIZE) {
      const variance = computeVariance(recentReadings);
      const activity = classifyActivity(variance);
      callback(activity);
    }
  });
}

export function stopActivityDetection(): void {
  if (subscription) {
    subscription.remove();
    subscription = null;
  }
  recentReadings = [];
}

function computeVariance(values: number[]): number {
  const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
  const squaredDiffs = values.map((v) => (v - mean) ** 2);
  return squaredDiffs.reduce((sum, v) => sum + v, 0) / values.length;
}

function classifyActivity(variance: number): ActivityType {
  if (variance < STILL_THRESHOLD) {
    return 'still';
  }
  if (variance < WALKING_THRESHOLD) {
    return 'walking';
  }
  if (variance < RUNNING_THRESHOLD) {
    return 'running';
  }
  return 'driving';
}

export function getActivityIcon(activity: ActivityType): string {
  switch (activity) {
    case 'still':
      return 'pause-circle';
    case 'walking':
      return 'walk';
    case 'running':
      return 'run';
    case 'driving':
      return 'car';
  }
}

export function getActivityLabel(activity: ActivityType): string {
  switch (activity) {
    case 'still':
      return 'Still';
    case 'walking':
      return 'Walking';
    case 'running':
      return 'Running';
    case 'driving':
      return 'Driving';
  }
}
