import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface ReconnectBannerProps {
  readonly attempt: number;
  readonly maxAttempts: number;
  readonly onCancel: () => void;
}

export function ReconnectBanner({
  attempt,
  maxAttempts,
  onCancel,
}: ReconnectBannerProps): React.JSX.Element {
  return (
    <View style={styles.banner}>
      <Text style={styles.text}>
        Reconnecting{'\u2026'} attempt {attempt}/{maxAttempts}
      </Text>
      <TouchableOpacity onPress={onCancel} style={styles.cancelButton}>
        <Text style={styles.cancelText}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    width: '100%',
    backgroundColor: '#fff3cd',
    borderRadius: 10,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  text: {
    fontSize: 14,
    color: '#856404',
    fontWeight: '500',
    flex: 1,
  },
  cancelButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#ffc107',
  },
  cancelText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#856404',
  },
});
