import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_DEFAULT } from 'react-native-maps';
import { useTrackingStore } from '../stores/useTrackingStore';
import { SpeedDisplay } from '../components/SpeedDisplay';
import { ActivityIndicatorBadge } from '../components/ActivityIndicatorBadge';
import * as gpsService from '../services/gpsService';

export function TrackingScreen() {
  const mapRef = useRef<MapView>(null);

  const isTracking = useTrackingStore((s) => s.isTracking);
  const currentTrip = useTrackingStore((s) => s.currentTrip);
  const currentLocation = useTrackingStore((s) => s.currentLocation);
  const currentActivity = useTrackingStore((s) => s.currentActivity);
  const startTracking = useTrackingStore((s) => s.startTracking);
  const stopTracking = useTrackingStore((s) => s.stopTracking);

  useEffect(() => {
    // Fetch initial location on mount
    (async () => {
      const hasPermission = await gpsService.requestPermissions();
      if (hasPermission) {
        const loc = await gpsService.getCurrentLocation();
        if (loc) {
          useTrackingStore.getState().setCurrentLocation(loc);
        }
      }
    })();
  }, []);

  useEffect(() => {
    if (currentLocation && mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: currentLocation.lat,
          longitude: currentLocation.lng,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        },
        500,
      );
    }
  }, [currentLocation]);

  const handleToggleTracking = async () => {
    if (isTracking) {
      const trip = await stopTracking();
      if (trip) {
        Alert.alert(
          'Trip Saved',
          `Distance: ${trip.distanceKm.toFixed(2)} km\nPoints: ${trip.points.length}`,
        );
      }
    } else {
      await startTracking();
    }
  };

  const polylineCoords =
    currentTrip?.points.map((p) => ({
      latitude: p.lat,
      longitude: p.lng,
    })) ?? [];

  const elapsedMs = currentTrip
    ? Date.now() - currentTrip.startTime
    : 0;
  const elapsedMinutes = Math.floor(elapsedMs / 60000);
  const elapsedSeconds = Math.floor((elapsedMs % 60000) / 1000);

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_DEFAULT}
        showsUserLocation={!isTracking}
        showsMyLocationButton
        initialRegion={{
          latitude: currentLocation?.lat ?? 10.8231,
          longitude: currentLocation?.lng ?? 106.6297,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        {currentLocation && isTracking && (
          <Marker
            coordinate={{
              latitude: currentLocation.lat,
              longitude: currentLocation.lng,
            }}
            title="Current Position"
          >
            <View style={styles.markerDot} />
          </Marker>
        )}

        {polylineCoords.length >= 2 && (
          <Polyline
            coordinates={polylineCoords}
            strokeColor="#2196F3"
            strokeWidth={4}
          />
        )}
      </MapView>

      {/* Overlay panel */}
      <View style={styles.overlay}>
        <View style={styles.statsContainer}>
          <SpeedDisplay speedMs={currentLocation?.speed ?? 0} />

          <View style={styles.rightStats}>
            <ActivityIndicatorBadge activity={currentActivity} />

            {isTracking && currentTrip && (
              <View style={styles.tripStats}>
                <Text style={styles.tripStatValue}>
                  {currentTrip.distanceKm.toFixed(2)} km
                </Text>
                <Text style={styles.tripStatLabel}>Distance</Text>
                <Text style={styles.tripStatValue}>
                  {elapsedMinutes}:{elapsedSeconds.toString().padStart(2, '0')}
                </Text>
                <Text style={styles.tripStatLabel}>Duration</Text>
              </View>
            )}
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.trackButton,
            { backgroundColor: isTracking ? '#ef5350' : '#4caf50' },
          ]}
          onPress={handleToggleTracking}
          activeOpacity={0.8}
        >
          <Text style={styles.trackButtonText}>
            {isTracking ? 'Stop Tracking' : 'Start Tracking'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Altitude / heading info bar */}
      {currentLocation && (
        <View style={styles.infoBar}>
          <Text style={styles.infoText}>
            Alt: {currentLocation.altitude.toFixed(0)}m
          </Text>
          <Text style={styles.infoText}>
            Heading: {currentLocation.heading.toFixed(0)}{'\u00B0'}
          </Text>
          <Text style={styles.infoText}>
            {currentLocation.lat.toFixed(5)}, {currentLocation.lng.toFixed(5)}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  markerDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#2196F3',
    borderWidth: 3,
    borderColor: '#ffffff',
    shadowColor: '#2196F3',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 4,
  },
  overlay: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 100 : 80,
    left: 16,
    right: 16,
    backgroundColor: '#ffffffee',
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 12,
  },
  rightStats: {
    flex: 1,
    gap: 8,
  },
  tripStats: {
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 8,
  },
  tripStatValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a2e',
  },
  tripStatLabel: {
    fontSize: 11,
    color: '#90a4ae',
    marginBottom: 4,
  },
  trackButton: {
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  trackButtonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '700',
  },
  infoBar: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#1a1a2ecc',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  infoText: {
    color: '#e0e0e0',
    fontSize: 12,
    fontWeight: '500',
  },
});
