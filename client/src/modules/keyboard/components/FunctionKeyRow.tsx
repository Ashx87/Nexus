import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { FUNCTION_KEYS, NAVIGATION_KEYS } from '../constants/keys';
import { useThemeColors } from '../../settings/hooks/useSettings';

interface FunctionKeyRowProps {
  readonly onKeyPress: (key: string) => void;
}

const ALL_KEYS = [...FUNCTION_KEYS, ...NAVIGATION_KEYS];

export function FunctionKeyRow({ onKeyPress }: FunctionKeyRowProps) {
  const c = useThemeColors();

  return (
    <View style={[styles.container, { backgroundColor: c.surface }]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {ALL_KEYS.map(({ key, label }) => (
          <Pressable
            key={key}
            style={[styles.keyButton, { backgroundColor: c.surface, borderColor: c.border }]}
            onPress={() => onKeyPress(key)}
          >
            <Text style={[styles.keyLabel, { color: c.text }]}>{label}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 8,
  },
  scrollContent: {
    alignItems: 'center',
  },
  keyButton: {
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    marginRight: 6,
  },
  keyLabel: {
    fontSize: 13,
  },
});
