import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import MapView, { Polyline, Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import { useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { useTripHistoryStore } from '../stores/useTripHistoryStore';
import { LocationPoint } from '../models/LocationPoint';
import { format } from 'date-fns';
import type { HistoryStackParamList } from '../navigation/AppNavigator';

function computeStats(points: LocationPoint[]) {
  let maxSpeed = 0;
  let totalSpeed = 0;

  for (const p of points) {
    totalSpeed += p.speed;
    if (p.speed > maxSpeed) {
      maxSpeed = p.speed;
    }
  }

  const avgSpeed = points.length > 0 ? totalSpeed / points.length : 0;

  return {
    maxSpeedKmh: maxSpeed * 3.6,
    avgSpeedKmh: avgSpeed * 3.6,
    maxAltitude: points.length > 0 ? Math.max(...points.map((p) => p.altitude)) : 0,
    minAltitude: points.length > 0 ? Math.min(...points.map((p) => p.altitude)) : 0,
  };
}

function getRegionForCoordinates(points: LocationPoint[]) {
  if (points.length === 0) {
    return {
      latitude: 10.8231,
      longitude: 106.6297,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };
  }

  let minLat = points[0].lat;
  let maxLat = points[0].lat;
  let minLng = points[0].lng;
  let maxLng = points[0].lng;

  for (const p of points) {
    minLat = Math.min(minLat, p.lat);
    maxLat = Math.max(maxLat, p.lat);
    minLng = Math.min(minLng, p.lng);
    maxLng = Math.max(maxLng, p.lng);
  }

  const midLat = (minLat + maxLat) / 2;
  const midLng = (minLng + maxLng) / 2;
  const deltaLat = (maxLat - minLat) * 1.3 || 0.01;
  const deltaLng = (maxLng - minLng) * 1.3 || 0.01;

  return {
    latitude: midLat,
    longitude: midLng,
    latitudeDelta: deltaLat,
    longitudeDelta: deltaLng,
  };
}

export function TripDetailScreen() {
  const route = useRoute<RouteProp<HistoryStackParamList, 'TripDetail'>>();
  const { tripId } = route.params;
  const trip = useTripHistoryStore((s) => s.getTripById(tripId));

  const stats = useMemo(
    () => computeStats(trip?.points ?? []),
    [trip?.points],
  );

  const region = useMemo(
    () => getRegionForCoordinates(trip?.points ?? []),
    [trip?.points],
  );

  const polylineCoords = useMemo(
    () =>
      (trip?.points ?? []).map((p) => ({
        latitude: p.lat,
        longitude: p.lng,
      })),
    [trip?.points],
  );

  if (!trip) {
    return (
      <View style={styles.centered}>
        <Text style={styles.notFoundText}>Trip not found</Text>
      </View>
    );
  }

  const durationMs = (trip.endTime ?? Date.now()) - trip.startTime;
  const durationMinutes = Math.floor(durationMs / 60000);
  const durationSeconds = Math.floor((durationMs % 60000) / 1000);

  return (
    <ScrollView style={styles.container} bounces={false}>
      <MapView
        style={styles.map}
        provider={PROVIDER_DEFAULT}
        region={region}
        scrollEnabled={false}
        zoomEnabled={false}
      >
        {polylineCoords.length >= 2 && (
          <Polyline
            coordinates={polylineCoords}
            strokeColor="#2196F3"
            strokeWidth={4}
          />
        )}

        {trip.points.length > 0 && (
          <>
            <Marker
              coordinate={{
                latitude: trip.points[0].lat,
                longitude: trip.points[0].lng,
              }}
              title="Start"
              pinColor="#4caf50"
            />
            <Marker
              coordinate={{
                latitude: trip.points[trip.points.length - 1].lat,
                longitude: trip.points[trip.points.length - 1].lng,
              }}
              title="End"
              pinColor="#ef5350"
            />
          </>
        )}
      </MapView>

      <View style={styles.content}>
        <Text style={styles.tripName}>{trip.name}</Text>
        <Text style={styles.tripDate}>
          {format(new Date(trip.startTime), 'EEEE, MMM dd, yyyy')}
        </Text>
        <Text style={styles.tripTime}>
          {format(new Date(trip.startTime), 'HH:mm')}
          {trip.endTime ? ` - ${format(new Date(trip.endTime), 'HH:mm')}` : ''}
        </Text>

        <View style={styles.statsGrid}>
          <StatBox
            label="Distance"
            value={`${trip.distanceKm.toFixed(2)} km`}
            color="#2196F3"
          />
          <StatBox
            label="Duration"
            value={`${durationMinutes}m ${durationSeconds}s`}
            color="#9c27b0"
          />
          <StatBox
            label="Avg Speed"
            value={`${stats.avgSpeedKmh.toFixed(1)} km/h`}
            color="#4caf50"
          />
          <StatBox
            label="Max Speed"
            value={`${stats.maxSpeedKmh.toFixed(1)} km/h`}
            color="#ff9800"
          />
          <StatBox
            label="Max Altitude"
            value={`${stats.maxAltitude.toFixed(0)} m`}
            color="#00bcd4"
          />
          <StatBox
            label="Min Altitude"
            value={`${stats.minAltitude.toFixed(0)} m`}
            color="#607d8b"
          />
        </View>

        <View style={styles.pointsInfo}>
          <Text style={styles.pointsLabel}>
            {trip.points.length} GPS points recorded
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

function StatBox({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <View style={[statStyles.box, { borderLeftColor: color }]}>
      <Text style={statStyles.value}>{value}</Text>
      <Text style={statStyles.label}>{label}</Text>
    </View>
  );
}

const statStyles = StyleSheet.create({
  box: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    borderLeftWidth: 4,
    padding: 12,
    width: '48%',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  value: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a2e',
  },
  label: {
    fontSize: 12,
    color: '#90a4ae',
    marginTop: 2,
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notFoundText: {
    fontSize: 16,
    color: '#78909c',
  },
  map: {
    height: 280,
  },
  content: {
    padding: 16,
  },
  tripName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1a1a2e',
    marginBottom: 4,
  },
  tripDate: {
    fontSize: 14,
    color: '#546e7a',
  },
  tripTime: {
    fontSize: 14,
    color: '#78909c',
    marginBottom: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  pointsInfo: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  pointsLabel: {
    fontSize: 13,
    color: '#90a4ae',
  },
});
