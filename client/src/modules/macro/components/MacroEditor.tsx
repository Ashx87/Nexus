import React, { useState } from 'react';
import {
  Modal, SafeAreaView, View, Text, TextInput, Pressable, ScrollView, StyleSheet,
} from 'react-native';
import { MacroDefinition, MacroStep } from '@nexus/shared';
import { ColorPicker } from './ColorPicker';
import { IconPicker } from './IconPicker';
import { StepEditor } from './StepEditor';

interface MacroEditorProps {
  readonly visible: boolean;
  readonly initialMacro?: MacroDefinition;
  readonly onSave: (macro: MacroDefinition) => void;
  readonly onCancel: () => void;
  readonly nextOrder: number;
}

function generateId(): string {
  return `macro-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function MacroEditor({
  visible, initialMacro, onSave, onCancel, nextOrder,
}: MacroEditorProps): React.JSX.Element {
  const [name, setName] = useState(initialMacro?.name ?? '');
  const [icon, setIcon] = useState(initialMacro?.icon ?? 'zap');
  const [color, setColor] = useState(initialMacro?.color ?? '#007AFF');
  const [steps, setSteps] = useState<readonly MacroStep[]>(initialMacro?.steps ?? []);

  const handleSave = () => {
    if (name.trim() === '' || steps.length === 0) return;
    onSave({
      macroId: initialMacro?.macroId ?? generateId(),
      name: name.trim(),
      icon,
      color,
      steps,
      isPreset: false,
      order: initialMacro?.order ?? nextOrder,
    });
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={onCancel}>
            <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>
          <Text style={styles.title}>{initialMacro ? 'Edit Macro' : 'New Macro'}</Text>
          <Pressable onPress={handleSave}>
            <Text style={[styles.saveText, (name.trim() === '' || steps.length === 0) && styles.disabled]}>
              Save
            </Text>
          </Pressable>
        </View>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Name</Text>
            <TextInput style={styles.nameInput} value={name} onChangeText={setName} placeholder="Macro name" />
          </View>
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Icon</Text>
            <IconPicker selected={icon} onSelect={setIcon} />
          </View>
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Color</Text>
            <ColorPicker selected={color} onSelect={setColor} />
          </View>
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Steps</Text>
            <StepEditor steps={steps} onStepsChange={setSteps} />
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f2f2f7' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#c8c8ce',
  },
  title: { fontSize: 17, fontWeight: '600' },
  cancelText: { fontSize: 16, color: '#007AFF' },
  saveText: { fontSize: 16, color: '#007AFF', fontWeight: '600' },
  disabled: { opacity: 0.3 },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, gap: 24 },
  section: { gap: 8 },
  sectionLabel: {
    fontSize: 13, color: '#8e8e93', fontWeight: '500',
    textTransform: 'uppercase', letterSpacing: 0.5,
  },
  nameInput: {
    backgroundColor: '#fff', borderRadius: 10, padding: 12,
    fontSize: 16, color: '#000',
  },
});
