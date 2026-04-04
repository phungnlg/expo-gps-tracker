import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { AppNavigator } from './src/navigation/AppNavigator';
import * as gpsService from './src/services/gpsService';
import { useTrackingStore } from './src/stores/useTrackingStore';

// Define background location task at module level (required by expo-task-manager)
gpsService.defineBackgroundTask((point) => {
  const state = useTrackingStore.getState();
  if (state.isTracking) {
    state.addPoint(point);
    state.setCurrentLocation(point);
  }
});

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
      <StatusBar style="auto" />
    </SafeAreaProvider>
  );
}
