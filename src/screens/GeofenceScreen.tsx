import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  Switch,
  Platform,
} from 'react-native';
import MapView, { Circle, Marker, PROVIDER_DEFAULT, MapPressEvent } from 'react-native-maps';
import { useFocusEffect } from '@react-navigation/native';
import { useGeofenceStore } from '../stores/useGeofenceStore';
import { GeofenceZone, GeofenceCenter } from '../models/GeofenceZone';

export function GeofenceScreen() {
  const zones = useGeofenceStore((s) => s.zones);
  const loadZones = useGeofenceStore((s) => s.loadZones);
  const addZone = useGeofenceStore((s) => s.addZone);
  const removeZone = useGeofenceStore((s) => s.removeZone);
  const toggleZone = useGeofenceStore((s) => s.toggleZone);

  const [modalVisible, setModalVisible] = useState(false);
  const [zoneName, setZoneName] = useState('');
  const [zoneRadius, setZoneRadius] = useState('200');
  const [selectedCenter, setSelectedCenter] = useState<GeofenceCenter | null>(null);

  useFocusEffect(
    useCallback(() => {
      loadZones();
    }, [loadZones]),
  );

  const handleMapPress = (e: MapPressEvent) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setSelectedCenter({ lat: latitude, lng: longitude });
  };

  const handleAddZone = async () => {
    if (!zoneName.trim()) {
      Alert.alert('Error', 'Please enter a zone name');
      return;
    }
    if (!selectedCenter) {
      Alert.alert('Error', 'Tap on the map to select a center point');
      return;
    }
    const radius = parseInt(zoneRadius, 10);
    if (isNaN(radius) || radius <= 0) {
      Alert.alert('Error', 'Please enter a valid radius');
      return;
    }

    await addZone(zoneName.trim(), selectedCenter, radius);
    setModalVisible(false);
    setZoneName('');
    setZoneRadius('200');
    setSelectedCenter(null);
  };

  const handleRemove = (zone: GeofenceZone) => {
    Alert.alert('Remove Zone', `Remove "${zone.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => removeZone(zone.id),
      },
    ]);
  };

  const renderZoneItem = ({ item }: { item: GeofenceZone }) => (
    <View style={styles.zoneCard}>
      <View style={styles.zoneHeader}>
        <View style={styles.zoneInfo}>
          <Text style={styles.zoneName}>{item.name}</Text>
          <Text style={styles.zoneDetail}>
            Radius: {item.radiusMeters}m | {item.center.lat.toFixed(4)},{' '}
            {item.center.lng.toFixed(4)}
          </Text>
        </View>
        <Switch
          value={item.isActive}
          onValueChange={() => toggleZone(item.id)}
          trackColor={{ false: '#ccc', true: '#81c784' }}
          thumbColor={item.isActive ? '#4caf50' : '#f4f3f4'}
        />
      </View>

      <MapView
        style={styles.miniMap}
        provider={PROVIDER_DEFAULT}
        scrollEnabled={false}
        zoomEnabled={false}
        pitchEnabled={false}
        rotateEnabled={false}
        region={{
          latitude: item.center.lat,
          longitude: item.center.lng,
          latitudeDelta: (item.radiusMeters / 111000) * 3,
          longitudeDelta: (item.radiusMeters / 111000) * 3,
        }}
      >
        <Marker
          coordinate={{
            latitude: item.center.lat,
            longitude: item.center.lng,
          }}
        />
        <Circle
          center={{
            latitude: item.center.lat,
            longitude: item.center.lng,
          }}
          radius={item.radiusMeters}
          fillColor={item.isActive ? '#2196F322' : '#9e9e9e22'}
          strokeColor={item.isActive ? '#2196F3' : '#9e9e9e'}
          strokeWidth={2}
        />
      </MapView>

      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => handleRemove(item)}
      >
        <Text style={styles.removeText}>Remove</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={zones}
        keyExtractor={(item) => item.id}
        renderItem={renderZoneItem}
        contentContainerStyle={
          zones.length === 0 ? styles.emptyContainer : styles.list
        }
        ListEmptyComponent={
          <View style={styles.emptyContent}>
            <Text style={styles.emptyIcon}>{'\uD83D\uDCCD'}</Text>
            <Text style={styles.emptyTitle}>No Geofences</Text>
            <Text style={styles.emptySubtitle}>
              Tap the + button to create a geofence zone
            </Text>
          </View>
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.8}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {/* Add Zone Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>New Geofence</Text>
            <TouchableOpacity onPress={handleAddZone}>
              <Text style={styles.saveText}>Save</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.formField}>
            <Text style={styles.fieldLabel}>Zone Name</Text>
            <TextInput
              style={styles.textInput}
              value={zoneName}
              onChangeText={setZoneName}
              placeholder="e.g. Home, Office, Gym"
              placeholderTextColor="#aaa"
            />
          </View>

          <View style={styles.formField}>
            <Text style={styles.fieldLabel}>Radius (meters)</Text>
            <TextInput
              style={styles.textInput}
              value={zoneRadius}
              onChangeText={setZoneRadius}
              keyboardType="numeric"
              placeholder="200"
              placeholderTextColor="#aaa"
            />
          </View>

          <View style={styles.formField}>
            <Text style={styles.fieldLabel}>
              Tap the map to select center point
            </Text>
          </View>

          <MapView
            style={styles.modalMap}
            provider={PROVIDER_DEFAULT}
            initialRegion={{
              latitude: 10.8231,
              longitude: 106.6297,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            }}
            onPress={handleMapPress}
          >
            {selectedCenter && (
              <>
                <Marker
                  coordinate={{
                    latitude: selectedCenter.lat,
                    longitude: selectedCenter.lng,
                  }}
                />
                <Circle
                  center={{
                    latitude: selectedCenter.lat,
                    longitude: selectedCenter.lng,
                  }}
                  radius={parseInt(zoneRadius, 10) || 200}
                  fillColor="#2196F322"
                  strokeColor="#2196F3"
                  strokeWidth={2}
                />
              </>
            )}
          </MapView>

          {selectedCenter && (
            <Text style={styles.coordsText}>
              Selected: {selectedCenter.lat.toFixed(5)},{' '}
              {selectedCenter.lng.toFixed(5)}
            </Text>
          )}
        </View>
      </Modal>
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
    paddingBottom: 80,
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
  zoneCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 6,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  zoneHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  zoneInfo: {
    flex: 1,
    marginRight: 12,
  },
  zoneName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a2e',
  },
  zoneDetail: {
    fontSize: 12,
    color: '#78909c',
    marginTop: 2,
  },
  miniMap: {
    height: 140,
    borderRadius: 10,
    overflow: 'hidden',
  },
  removeButton: {
    marginTop: 10,
    alignSelf: 'flex-end',
  },
  removeText: {
    fontSize: 13,
    color: '#ef5350',
    fontWeight: '500',
  },
  fab: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 100 : 80,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2196F3',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2196F3',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  fabText: {
    fontSize: 28,
    color: '#ffffff',
    fontWeight: '300',
    marginTop: -2,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingTop: Platform.OS === 'ios' ? 10 : 0,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1a1a2e',
  },
  cancelText: {
    fontSize: 16,
    color: '#78909c',
  },
  saveText: {
    fontSize: 16,
    color: '#2196F3',
    fontWeight: '600',
  },
  formField: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#546e7a',
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1a1a2e',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  modalMap: {
    flex: 1,
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  coordsText: {
    textAlign: 'center',
    fontSize: 13,
    color: '#78909c',
    paddingBottom: Platform.OS === 'ios' ? 30 : 16,
  },
});
