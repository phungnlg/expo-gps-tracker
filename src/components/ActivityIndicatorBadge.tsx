import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ActivityType, getActivityLabel } from '../services/activityService';

interface ActivityIndicatorBadgeProps {
  activity: ActivityType;
}

const ACTIVITY_ICONS: Record<ActivityType, string> = {
  still: '\u23F8',     // pause symbol
  walking: '\uD83D\uDEB6', // walking person
  running: '\uD83C\uDFC3', // running person
  driving: '\uD83D\uDE97', // car
};

const ACTIVITY_COLORS: Record<ActivityType, string> = {
  still: '#78909c',
  walking: '#4caf50',
  running: '#ff9800',
  driving: '#2196f3',
};

export function ActivityIndicatorBadge({ activity }: ActivityIndicatorBadgeProps) {
  return (
    <View style={[styles.container, { backgroundColor: ACTIVITY_COLORS[activity] + '22' }]}>
      <Text style={styles.icon}>{ACTIVITY_ICONS[activity]}</Text>
      <Text style={[styles.label, { color: ACTIVITY_COLORS[activity] }]}>
        {getActivityLabel(activity)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 6,
  },
  icon: {
    fontSize: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
});
