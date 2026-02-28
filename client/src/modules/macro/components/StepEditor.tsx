import React from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { MacroStep } from '@nexus/shared';

interface StepEditorProps {
  readonly steps: readonly MacroStep[];
  readonly onStepsChange: (steps: readonly MacroStep[]) => void;
}

const STEP_TYPES = ['key_combo', 'key', 'type_text', 'wait'] as const;

function createDefaultStep(type: MacroStep['type']): MacroStep {
  switch (type) {
    case 'key_combo': return { type: 'key_combo', keys: [], delay: 0 };
    case 'key': return { type: 'key', key: '', delay: 0 };
    case 'type_text': return { type: 'type_text', text: '', delay: 0 };
    case 'wait': return { type: 'wait', ms: 500 };
  }
}

export function StepEditor({ steps, onStepsChange }: StepEditorProps): React.JSX.Element {
  const addStep = (type: MacroStep['type']) => {
    onStepsChange([...steps, createDefaultStep(type)]);
  };

  const removeStep = (index: number) => {
    onStepsChange(steps.filter((_, i) => i !== index));
  };

  const updateStep = (index: number, updated: MacroStep) => {
    onStepsChange(steps.map((s, i) => (i === index ? updated : s)));
  };

  return (
    <View style={styles.container}>
      {steps.map((step, i) => (
        <View key={i} style={styles.stepRow}>
          <View style={styles.stepContent}>
            <Text style={styles.stepType}>{step.type}</Text>
            {step.type === 'key_combo' && (
              <TextInput
                style={styles.input}
                value={step.keys.join(', ')}
                onChangeText={(text) =>
                  updateStep(i, { ...step, keys: text.split(',').map((k) => k.trim()).filter(Boolean) })
                }
                placeholder="ctrl, c"
              />
            )}
            {step.type === 'key' && (
              <TextInput
                style={styles.input}
                value={step.key}
                onChangeText={(text) => updateStep(i, { ...step, key: text.trim() })}
                placeholder="enter"
              />
            )}
            {step.type === 'type_text' && (
              <TextInput
                style={styles.input}
                value={step.text}
                onChangeText={(text) => updateStep(i, { ...step, text })}
                placeholder="text to type"
              />
            )}
            {step.type === 'wait' && (
              <TextInput
                style={styles.input}
                value={String(step.ms)}
                onChangeText={(text) => updateStep(i, { ...step, ms: parseInt(text, 10) || 0 })}
                keyboardType="numeric"
                placeholder="500"
              />
            )}
          </View>
          <Pressable onPress={() => removeStep(i)} style={styles.removeBtn}>
            <Text style={styles.removeBtnText}>X</Text>
          </Pressable>
        </View>
      ))}
      <View style={styles.addRow}>
        {STEP_TYPES.map((type) => (
          <Pressable key={type} style={styles.addBtn} onPress={() => addStep(type)}>
            <Text style={styles.addBtnText}>+ {type}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 8 },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  stepContent: { flex: 1, backgroundColor: '#f2f2f7', borderRadius: 8, padding: 8, gap: 4 },
  stepType: { fontSize: 11, color: '#8e8e93', fontWeight: '600', textTransform: 'uppercase' },
  input: { fontSize: 14, color: '#000', padding: 4, borderBottomWidth: 1, borderBottomColor: '#c8c8ce' },
  removeBtn: { padding: 8 },
  removeBtnText: { color: '#FF3B30', fontWeight: '700', fontSize: 16 },
  addRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  addBtn: { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#e5e5ea', borderRadius: 8 },
  addBtnText: { fontSize: 12, color: '#007AFF', fontWeight: '500' },
});
