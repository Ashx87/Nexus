import React, { useRef, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { computeTextDiff } from '../utils/textDiff';

interface TextInputAreaProps {
  readonly onType: (text: string) => void;
  readonly onKeyPress: (key: string) => void;
}

export function TextInputArea({ onType, onKeyPress }: TextInputAreaProps) {
  const [value, setValue] = useState('');
  const prevValueRef = useRef('');

  const handleChangeText = (next: string) => {
    const diff = computeTextDiff(prevValueRef.current, next);
    if (diff.added.length > 0) {
      onType(diff.added);
    }
    if (diff.deletedCount > 0) {
      const clampedDeletes = Math.min(diff.deletedCount, 50);
      for (let i = 0; i < clampedDeletes; i++) {
        onKeyPress('backspace');
      }
    }
    prevValueRef.current = next;
    setValue(next);
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={handleChangeText}
        placeholder="Type here to send keystrokes..."
        placeholderTextColor="#8e8e93"
        maxLength={500}
        autoCapitalize="none"
        autoCorrect={false}
        spellCheck={false}
        autoComplete="off"
        keyboardType="default"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 4,
  },
  input: {
    fontSize: 16,
    color: '#1c1c1e',
    padding: 12,
    minHeight: 48,
  },
});
