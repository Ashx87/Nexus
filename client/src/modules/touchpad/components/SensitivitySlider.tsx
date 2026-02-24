import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';

interface SensitivitySliderProps {
  readonly value: number;
  readonly onValueChange: (value: number) => void;
}

export function SensitivitySlider({ value, onValueChange }: SensitivitySliderProps): React.JSX.Element {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Sensitivity</Text>
      <Slider
        style={styles.slider}
        minimumValue={0.3}
        maximumValue={3.0}
        step={0.1}
        value={value}
        onSlidingComplete={onValueChange}
        minimumTrackTintColor="#007aff"
        maximumTrackTintColor="#c7c7cc"
      />
      <Text style={styles.value}>{value.toFixed(1)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8, gap: 8 },
  label: { fontSize: 14, color: '#666', width: 80 },
  slider: { flex: 1, height: 40 },
  value: { fontSize: 14, color: '#333', width: 32, textAlign: 'right' },
});
