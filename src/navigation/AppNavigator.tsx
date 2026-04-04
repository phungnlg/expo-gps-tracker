import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text, Platform } from 'react-native';
import { TrackingScreen } from '../screens/TrackingScreen';
import { TripHistoryScreen } from '../screens/TripHistoryScreen';
import { TripDetailScreen } from '../screens/TripDetailScreen';
import { GeofenceScreen } from '../screens/GeofenceScreen';

// --- Type definitions ---

export type HistoryStackParamList = {
  TripList: undefined;
  TripDetail: { tripId: string };
};

export type RootTabParamList = {
  Tracking: undefined;
  History: undefined;
  Geofences: undefined;
};

// --- Stack Navigator for History ---

const HistoryStack = createNativeStackNavigator<HistoryStackParamList>();

function HistoryStackNavigator() {
  return (
    <HistoryStack.Navigator>
      <HistoryStack.Screen
        name="TripList"
        component={TripHistoryScreen}
        options={{ title: 'Trip History' }}
      />
      <HistoryStack.Screen
        name="TripDetail"
        component={TripDetailScreen}
        options={{ title: 'Trip Details' }}
      />
    </HistoryStack.Navigator>
  );
}

// --- Tab Navigator ---

const Tab = createBottomTabNavigator<RootTabParamList>();

function TabIcon({ label, focused }: { label: string; focused: boolean }) {
  const icons: Record<string, string> = {
    Tracking: '\uD83D\uDCCD',   // pin
    History: '\uD83D\uDCCB',    // clipboard
    Geofences: '\uD83D\uDEE1\uFE0F', // shield
  };

  return (
    <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.5 }}>
      {icons[label] ?? '?'}
    </Text>
  );
}

export function AppNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused }) => (
          <TabIcon label={route.name} focused={focused} />
        ),
        tabBarActiveTintColor: '#2196F3',
        tabBarInactiveTintColor: '#90a4ae',
        tabBarStyle: {
          paddingBottom: Platform.OS === 'ios' ? 24 : 8,
          height: Platform.OS === 'ios' ? 88 : 64,
          borderTopWidth: 0,
          elevation: 12,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        headerShown: false,
      })}
    >
      <Tab.Screen
        name="Tracking"
        component={TrackingScreen}
        options={{ title: 'Tracking' }}
      />
      <Tab.Screen
        name="History"
        component={HistoryStackNavigator}
        options={{ title: 'History' }}
      />
      <Tab.Screen
        name="Geofences"
        component={GeofenceScreen}
        options={{ title: 'Geofences', headerShown: true }}
      />
    </Tab.Navigator>
  );
}
