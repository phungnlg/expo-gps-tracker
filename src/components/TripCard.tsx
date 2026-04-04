import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Trip } from '../models/Trip';
import { format } from 'date-fns';

interface TripCardProps {
  trip: Trip;
  onPress: (trip: Trip) => void;
  onDelete?: (trip: Trip) => void;
}

function formatDuration(startTime: number, endTime: number | null): string {
  const end = endTime ?? Date.now();
  const diffMs = end - startTime;
  const totalSeconds = Math.floor(diffMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m ${seconds}s`;
}

export function TripCard({ trip, onPress, onDelete }: TripCardProps) {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress(trip)}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <Text style={styles.name} numberOfLines={1}>
          {trip.name}
        </Text>
        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor:
                trip.status === 'completed' ? '#4caf5022' : '#ff980022',
            },
          ]}
        >
          <Text
            style={[
              styles.statusText,
              {
                color:
                  trip.status === 'completed' ? '#4caf50' : '#ff9800',
              },
            ]}
          >
            {trip.status}
          </Text>
        </View>
      </View>

      <Text style={styles.date}>
        {format(new Date(trip.startTime), 'MMM dd, yyyy - HH:mm')}
      </Text>

      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>
            {trip.distanceKm.toFixed(2)} km
          </Text>
          <Text style={styles.statLabel}>Distance</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>
            {formatDuration(trip.startTime, trip.endTime)}
          </Text>
          <Text style={styles.statLabel}>Duration</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{trip.points.length}</Text>
          <Text style={styles.statLabel}>Points</Text>
        </View>
      </View>

      {onDelete && (
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => onDelete(trip)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.deleteText}>Delete</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1a1a2e',
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  date: {
    fontSize: 13,
    color: '#78909c',
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stat: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a2e',
  },
  statLabel: {
    fontSize: 11,
    color: '#90a4ae',
    marginTop: 2,
  },
  deleteButton: {
    marginTop: 12,
    alignSelf: 'flex-end',
  },
  deleteText: {
    fontSize: 13,
    color: '#ef5350',
    fontWeight: '500',
  },
});
