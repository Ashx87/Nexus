import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ConnectionStatus } from '@nexus/shared';

interface StatusBadgeProps {
  readonly status: ConnectionStatus;
}

const STATUS_COLORS: Record<ConnectionStatus, string> = {
  disconnected: '#999',
  connecting: '#f5a623',
  connected: '#4cd964',
  reconnecting: '#f5a623',
  error: '#ff3b30',
};

const STATUS_LABELS: Record<ConnectionStatus, string> = {
  disconnected: 'DISCONNECTED',
  connecting: 'CONNECTING',
  connected: 'CONNECTED',
  reconnecting: 'RECONNECTING',
  error: 'ERROR',
};

export function StatusBadge({ status }: StatusBadgeProps): React.JSX.Element {
  return (
    <View style={[styles.badge, { backgroundColor: STATUS_COLORS[status] }]}>
      <Text style={styles.text}>{STATUS_LABELS[status]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  text: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
  },
});
