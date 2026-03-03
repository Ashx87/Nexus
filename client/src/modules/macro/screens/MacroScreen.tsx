import React, { useEffect, useState, useCallback } from 'react';
import {
  SafeAreaView, StatusBar, View, Text, Pressable, Alert, StyleSheet,
} from 'react-native';
import DraggableFlatList, { RenderItemParams } from 'react-native-draggable-flatlist';
import { MacroDefinition } from '@nexus/shared';
import { useMacroStore } from '../../../stores/macroStore';
import { useMacro } from '../hooks/useMacro';
import { MacroButton } from '../components/MacroButton';
import { MacroEditor } from '../components/MacroEditor';
import { useThemeColors } from '../../settings/hooks/useSettings';

interface MacroScreenProps {
  readonly onDisconnect: () => void;
}

export function MacroScreen({ onDisconnect }: MacroScreenProps): React.JSX.Element {
  const macros = useMacroStore((s) => s.macros);
  const isExecuting = useMacroStore((s) => s.isExecuting);
  const loaded = useMacroStore((s) => s.loaded);
  const initMacros = useMacroStore((s) => s.initMacros);
  const reorderMacros = useMacroStore((s) => s.reorderMacros);
  const { executeMacro, createMacro, updateMacro, deleteMacro } = useMacro();

  const [editorVisible, setEditorVisible] = useState(false);
  const [editingMacro, setEditingMacro] = useState<MacroDefinition | undefined>(undefined);

  useEffect(() => {
    if (!loaded) {
      initMacros();
    }
  }, [loaded, initMacros]);

  const handlePress = useCallback((macro: MacroDefinition) => {
    executeMacro(macro);
  }, [executeMacro]);

  const handleLongPress = useCallback((macro: MacroDefinition) => {
    if (macro.isPreset) return;
    Alert.alert(macro.name, 'Choose an action', [
      { text: 'Edit', onPress: () => { setEditingMacro(macro); setEditorVisible(true); } },
      { text: 'Delete', style: 'destructive', onPress: () => deleteMacro(macro.macroId) },
      { text: 'Cancel', style: 'cancel' },
    ]);
  }, [deleteMacro]);

  const handleSave = useCallback(async (macro: MacroDefinition) => {
    if (editingMacro) {
      await updateMacro(macro);
    } else {
      await createMacro(macro);
    }
    setEditorVisible(false);
    setEditingMacro(undefined);
  }, [editingMacro, updateMacro, createMacro]);

  const handleCancel = useCallback(() => {
    setEditorVisible(false);
    setEditingMacro(undefined);
  }, []);

  const c = useThemeColors();
  const isDark = c.background === '#1c1c1e';

  const presets = macros.filter((m) => m.isPreset);
  const custom = macros.filter((m) => !m.isPreset);

  const renderItem = useCallback(({ item, drag }: RenderItemParams<MacroDefinition>) => (
    <MacroButton
      macro={item}
      isExecuting={isExecuting[item.macroId] ?? false}
      onPress={handlePress}
      onLongPress={handleLongPress}
      drag={drag}
    />
  ), [isExecuting, handlePress, handleLongPress]);

  const keyExtractor = useCallback((item: MacroDefinition) => item.macroId, []);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <View style={styles.header}>
        <Pressable onPress={onDisconnect} style={styles.headerButton}>
          <Text style={[styles.headerButtonText, { color: c.primary }]}>Disconnect</Text>
        </Pressable>
        <Text style={[styles.title, { color: c.text }]}>Macros</Text>
        <Pressable
          onPress={() => { setEditingMacro(undefined); setEditorVisible(true); }}
          style={styles.headerButton}
        >
          <Text style={[styles.headerButtonText, { color: c.primary }]}>+</Text>
        </Pressable>
      </View>
      <View style={styles.content}>
        {presets.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: c.textSecondary }]}>Shortcuts</Text>
            <DraggableFlatList
              data={[...presets] as MacroDefinition[]}
              renderItem={renderItem}
              keyExtractor={keyExtractor}
              onDragEnd={({ data }) => reorderMacros([...data, ...custom])}
              numColumns={2}
              columnWrapperStyle={styles.gridRow}
            />
          </View>
        )}
        {custom.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: c.textSecondary }]}>My Macros</Text>
            <DraggableFlatList
              data={[...custom] as MacroDefinition[]}
              renderItem={renderItem}
              keyExtractor={keyExtractor}
              onDragEnd={({ data }) => reorderMacros([...presets, ...data])}
              numColumns={2}
              columnWrapperStyle={styles.gridRow}
            />
          </View>
        )}
      </View>
      <MacroEditor
        visible={editorVisible}
        initialMacro={editingMacro}
        onSave={handleSave}
        onCancel={handleCancel}
        nextOrder={macros.length}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 8,
  },
  headerButton: { paddingVertical: 6, paddingHorizontal: 12 },
  headerButtonText: { fontSize: 16 },
  title: { fontSize: 20, fontWeight: '600' },
  content: { flex: 1, padding: 16, gap: 24 },
  section: { gap: 12 },
  sectionLabel: {
    fontSize: 13, fontWeight: '500',
    textTransform: 'uppercase', letterSpacing: 0.5,
  },
  gridRow: { justifyContent: 'space-between' },
});
