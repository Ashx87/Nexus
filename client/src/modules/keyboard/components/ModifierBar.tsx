import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MODIFIER_KEYS } from '../constants/keys';

interface ModifierBarProps {
  readonly lockedModifiers: ReadonlySet<string>;
  readonly onToggle: (key: string) => void;
}

export function ModifierBar({ lockedModifiers, onToggle }: ModifierBarProps) {
  return (
    <View style={styles.row}>
      {MODIFIER_KEYS.map(({ key, label }) => {
        const locked = lockedModifiers.has(key);
        return (
          <Pressable
            key={key}
            style={[styles.button, locked ? styles.buttonLocked : styles.buttonUnlocked]}
            onPress={() => onToggle(key)}
          >
            <Text style={[styles.label, locked ? styles.labelLocked : styles.labelUnlocked]}>
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
  buttonLocked: {
    backgroundColor: '#007aff',
  },
  buttonUnlocked: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#007aff',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
  },
  labelLocked: {
    color: '#ffffff',
  },
  labelUnlocked: {
    color: '#007aff',
  },
});
