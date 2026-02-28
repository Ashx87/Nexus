import React from 'react';
import { View, Pressable, Text, StyleSheet } from 'react-native';

const ICONS = [
  'copy', 'scissors', 'clipboard', 'rotate-ccw', 'rotate-cw',
  'check-square', 'camera', 'lock', 'activity', 'monitor',
  'folder', 'layers', 'terminal', 'zap', 'play', 'star',
  'settings', 'globe', 'mail', 'search',
];

interface IconPickerProps {
  readonly selected: string;
  readonly onSelect: (icon: string) => void;
}

export function IconPicker({ selected, onSelect }: IconPickerProps): React.JSX.Element {
  return (
    <View style={styles.grid}>
      {ICONS.map((icon) => (
        <Pressable
          key={icon}
          style={[styles.item, selected === icon && styles.selected]}
          onPress={() => onSelect(icon)}
        >
          <Text style={[styles.label, selected === icon && styles.selectedLabel]}>{icon}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  item: {
    paddingHorizontal: 10, paddingVertical: 6,
    borderRadius: 8, backgroundColor: '#f2f2f7',
  },
  selected: { backgroundColor: '#007AFF' },
  label: { fontSize: 11, color: '#3c3c43' },
  selectedLabel: { color: '#ffffff' },
});
