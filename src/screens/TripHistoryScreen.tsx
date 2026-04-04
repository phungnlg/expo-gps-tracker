import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTripHistoryStore } from '../stores/useTripHistoryStore';
import { Trip } from '../models/Trip';
import { TripCard } from '../components/TripCard';
import type { HistoryStackParamList } from '../navigation/AppNavigator';

export function TripHistoryScreen() {
  const trips = useTripHistoryStore((s) => s.trips);
  const isLoading = useTripHistoryStore((s) => s.isLoading);
  const loadTrips = useTripHistoryStore((s) => s.loadTrips);
  const deleteTrip = useTripHistoryStore((s) => s.deleteTrip);
  const navigation = useNavigation<NativeStackNavigationProp<HistoryStackParamList, 'TripList'>>();

  useFocusEffect(
    useCallback(() => {
      loadTrips();
    }, [loadTrips]),
  );

  const handlePress = (trip: Trip) => {
    navigation.navigate('TripDetail', { tripId: trip.id });
  };

  const handleDelete = (trip: Trip) => {
    Alert.alert('Delete Trip', `Delete "${trip.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => deleteTrip(trip.id),
      },
    ]);
  };

  const renderItem = ({ item }: { item: Trip }) => (
    <TripCard trip={item} onPress={handlePress} onDelete={handleDelete} />
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={trips}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={
          trips.length === 0 ? styles.emptyContainer : styles.list
        }
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={loadTrips} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContent}>
            <Text style={styles.emptyIcon}>{'\uD83D\uDDFA\uFE0F'}</Text>
            <Text style={styles.emptyTitle}>No Trips Yet</Text>
            <Text style={styles.emptySubtitle}>
              Start tracking a trip from the Tracking tab
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  list: {
    paddingVertical: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContent: {
    alignItems: 'center',
    padding: 32,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a2e',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#78909c',
    textAlign: 'center',
  },
});
