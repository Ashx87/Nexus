import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';

const COLORS = [
  '#007AFF', '#34C759', '#FF9500', '#FF3B30',
  '#5856D6', '#AF52DE', '#FF2D55', '#5AC8FA',
  '#FFCC00', '#8E8E93', '#00C7BE', '#FF6482',
];

interface ColorPickerProps {
  readonly selected: string;
  readonly onSelect: (color: string) => void;
}

export function ColorPicker({ selected, onSelect }: ColorPickerProps): React.JSX.Element {
  return (
    <View style={styles.grid}>
      {COLORS.map((color) => (
        <Pressable
          key={color}
          style={[
            styles.swatch,
            { backgroundColor: color },
            selected === color && styles.selected,
          ]}
          onPress={() => onSelect(color)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  swatch: { width: 36, height: 36, borderRadius: 18 },
  selected: { borderWidth: 3, borderColor: '#000' },
});
