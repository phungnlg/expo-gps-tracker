import { LocationPoint } from './LocationPoint';

export type TripStatus = 'recording' | 'paused' | 'completed';

export interface Trip {
  id: string;
  name: string;
  startTime: number;
  endTime: number | null;
  points: LocationPoint[];
  distanceKm: number;
  status: TripStatus;
}
