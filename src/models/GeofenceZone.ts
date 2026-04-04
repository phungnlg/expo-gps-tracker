export interface GeofenceCenter {
  lat: number;
  lng: number;
}

export interface GeofenceZone {
  id: string;
  name: string;
  center: GeofenceCenter;
  radiusMeters: number;
  isActive: boolean;
}

/** Events generated when entering or exiting a geofence. */
export type GeofenceEvent = 'enter' | 'exit' | 'dwell';

/** A geofence transition record. */
export interface GeofenceTransition {
  zoneId: string;
  zoneName: string;
  event: GeofenceEvent;
  timestamp: number;
  lat: number;
  lng: number;
}

/**
 * Check if a coordinate is inside a geofence zone using the Haversine formula.
 */
export function isInsideZone(
  zone: GeofenceZone,
  lat: number,
  lng: number,
): boolean {
  const distance = haversineDistance(zone.center.lat, zone.center.lng, lat, lng);
  return distance <= zone.radiusMeters;
}

function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const sinLat = Math.sin(dLat / 2);
  const sinLng = Math.sin(dLng / 2);
  const a =
    sinLat * sinLat +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      sinLng * sinLng;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
