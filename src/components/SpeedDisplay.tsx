import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface SpeedDisplayProps {
  speedMs: number; // speed in m/s
}

export function SpeedDisplay({ speedMs }: SpeedDisplayProps) {
  const speedKmh = (speedMs * 3.6).toFixed(1);

  return (
    <View style={styles.container}>
      <Text style={styles.value}>{speedKmh}</Text>
      <Text style={styles.unit}>km/h</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    minWidth: 120,
  },
  value: {
    fontSize: 48,
    fontWeight: '700',
    color: '#00e676',
    fontVariant: ['tabular-nums'],
  },
  unit: {
    fontSize: 14,
    fontWeight: '500',
    color: '#90a4ae',
    marginTop: 2,
  },
});
