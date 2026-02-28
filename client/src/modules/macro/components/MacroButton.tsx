import React from 'react';
import { Pressable, Text, View, ActivityIndicator, StyleSheet } from 'react-native';
import { MacroDefinition } from '@nexus/shared';

interface MacroButtonProps {
  readonly macro: MacroDefinition;
  readonly isExecuting: boolean;
  readonly onPress: (macro: MacroDefinition) => void;
  readonly onLongPress: (macro: MacroDefinition) => void;
  readonly drag?: () => void;
}

export function MacroButton({
  macro, isExecuting, onPress, onLongPress, drag,
}: MacroButtonProps): React.JSX.Element {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        { borderLeftColor: macro.color, borderLeftWidth: 4 },
        pressed && styles.pressed,
      ]}
      onPress={() => onPress(macro)}
      onLongPress={() => {
        if (drag) drag();
        onLongPress(macro);
      }}
      disabled={isExecuting}
    >
      {isExecuting ? (
        <ActivityIndicator size="small" color={macro.color} />
      ) : (
        <View style={styles.content}>
          <Text style={styles.icon}>{macro.icon}</Text>
          <Text style={styles.label} numberOfLines={1}>{macro.name}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    width: '48%',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  pressed: { backgroundColor: '#e5e5ea' },
  content: { alignItems: 'center', gap: 4 },
  icon: { fontSize: 24 },
  label: { fontSize: 12, color: '#3c3c43', fontWeight: '500', textAlign: 'center' },
});
