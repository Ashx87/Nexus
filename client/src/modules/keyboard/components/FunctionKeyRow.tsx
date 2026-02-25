import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { FUNCTION_KEYS, NAVIGATION_KEYS } from '../constants/keys';

interface FunctionKeyRowProps {
  readonly onKeyPress: (key: string) => void;
}

const ALL_KEYS = [...FUNCTION_KEYS, ...NAVIGATION_KEYS];

export function FunctionKeyRow({ onKeyPress }: FunctionKeyRowProps) {
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {ALL_KEYS.map(({ key, label }) => (
          <Pressable
            key={key}
            style={styles.keyButton}
            onPress={() => onKeyPress(key)}
          >
            <Text style={styles.keyLabel}>{label}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 8,
  },
  scrollContent: {
    alignItems: 'center',
  },
  keyButton: {
    backgroundColor: '#ffffff',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#c8c8ce',
    marginRight: 6,
  },
  keyLabel: {
    fontSize: 13,
    color: '#1c1c1e',
  },
});
