import React, { useRef, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { computeTextDiff } from '../utils/textDiff';
import { useThemeColors } from '../../settings/hooks/useSettings';

interface TextInputAreaProps {
  readonly onType: (text: string) => void;
  readonly onKeyPress: (key: string) => void;
}

export function TextInputArea({ onType, onKeyPress }: TextInputAreaProps) {
  const [value, setValue] = useState('');
  const prevValueRef = useRef('');
  const c = useThemeColors();

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
    <View style={[styles.container, { backgroundColor: c.surface }]}>
      <TextInput
        style={[styles.input, { color: c.text }]}
        value={value}
        onChangeText={handleChangeText}
        placeholder="Type here to send keystrokes..."
        placeholderTextColor={c.textSecondary}
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
    borderRadius: 12,
    padding: 4,
  },
  input: {
    fontSize: 16,
    padding: 12,
    minHeight: 48,
  },
});
