import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { COMMON_SHORTCUTS } from '../constants/keys';
import { useThemeColors } from '../../settings/hooks/useSettings';

interface ShortcutsPanelProps {
  readonly onCombo: (keys: string[]) => void;
}

export function ShortcutsPanel({ onCombo }: ShortcutsPanelProps) {
  const c = useThemeColors();

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <View style={styles.grid}>
        {COMMON_SHORTCUTS.map((shortcut) => (
          <Pressable
            key={shortcut.label}
            style={[styles.shortcutButton, { backgroundColor: c.surface, borderColor: c.border }]}
            onPress={() => onCombo(shortcut.keys as string[])}
          >
            <Text style={[styles.shortcutLabel, { color: c.text }]}>{shortcut.label}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 4,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  shortcutButton: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
  },
  shortcutLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
});
