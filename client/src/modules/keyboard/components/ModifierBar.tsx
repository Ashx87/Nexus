import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MODIFIER_KEYS } from '../constants/keys';
import { useThemeColors } from '../../settings/hooks/useSettings';

interface ModifierBarProps {
  readonly lockedModifiers: ReadonlySet<string>;
  readonly onToggle: (key: string) => void;
}

export function ModifierBar({ lockedModifiers, onToggle }: ModifierBarProps) {
  const c = useThemeColors();

  return (
    <View style={styles.row}>
      {MODIFIER_KEYS.map(({ key, label }) => {
        const locked = lockedModifiers.has(key);
        return (
          <Pressable
            key={key}
            style={[
              styles.button,
              locked
                ? { backgroundColor: c.primary }
                : { backgroundColor: c.surface, borderWidth: 1, borderColor: c.primary },
            ]}
            onPress={() => onToggle(key)}
          >
            <Text style={[styles.label, { color: locked ? '#ffffff' : c.primary }]}>
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 64,
    alignItems: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
  },
});
