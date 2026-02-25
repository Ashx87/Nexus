import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { COMMON_SHORTCUTS } from '../constants/keys';

interface ShortcutsPanelProps {
  readonly onCombo: (keys: string[]) => void;
}

export function ShortcutsPanel({ onCombo }: ShortcutsPanelProps) {
  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        {COMMON_SHORTCUTS.map((shortcut) => (
          <Pressable
            key={shortcut.label}
            style={styles.shortcutButton}
            onPress={() => onCombo(shortcut.keys as string[])}
          >
            <Text style={styles.shortcutLabel}>{shortcut.label}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f2f2f7',
    padding: 4,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  shortcutButton: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#c8c8ce',
  },
  shortcutLabel: {
    fontSize: 14,
    color: '#1c1c1e',
    fontWeight: '500',
  },
});
