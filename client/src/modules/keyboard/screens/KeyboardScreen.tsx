import React from 'react';
import { SafeAreaView, StatusBar, View, Text, Pressable, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { ModifierBar } from '../components/ModifierBar';
import { FunctionKeyRow } from '../components/FunctionKeyRow';
import { ShortcutsPanel } from '../components/ShortcutsPanel';
import { TextInputArea } from '../components/TextInputArea';
import { useKeyboard } from '../hooks/useKeyboard';
import { useThemeColors } from '../../settings/hooks/useSettings';

interface KeyboardScreenProps {
  readonly onDisconnect: () => void;
}

export function KeyboardScreen({ onDisconnect }: KeyboardScreenProps): React.JSX.Element {
  const { sendType, sendKey, sendCombo, lockedModifiers, toggleModifier } = useKeyboard();
  const c = useThemeColors();
  const isDark = c.background === '#1c1c1e';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <View style={styles.header}>
        <Pressable onPress={onDisconnect} style={styles.headerButton}>
          <Text style={[styles.headerButtonText, { color: c.primary }]}>Disconnect</Text>
        </Pressable>
        <Text style={[styles.title, { color: c.text }]}>Keyboard</Text>
        <View style={styles.headerButton} />
      </View>
      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={100}
      >
        <ScrollView
          style={styles.scrollArea}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: c.textSecondary }]}>Modifier Keys</Text>
            <ModifierBar lockedModifiers={lockedModifiers} onToggle={toggleModifier} />
          </View>
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: c.textSecondary }]}>Function & Navigation Keys</Text>
            <FunctionKeyRow onKeyPress={sendKey} />
          </View>
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: c.textSecondary }]}>Shortcuts</Text>
            <ShortcutsPanel onCombo={sendCombo} />
          </View>
        </ScrollView>
        <View style={[styles.inputArea, { backgroundColor: c.background }]}>
          <TextInputArea onType={sendType} onKeyPress={sendKey} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 8 },
  headerButton: { paddingVertical: 6, paddingHorizontal: 12 },
  headerButtonText: { fontSize: 16 },
  title: { fontSize: 20, fontWeight: '600' },
  content: { flex: 1 },
  scrollArea: { flex: 1 },
  scrollContent: { padding: 16, gap: 16 },
  section: { gap: 8 },
  sectionLabel: { fontSize: 13, fontWeight: '500', textTransform: 'uppercase', letterSpacing: 0.5 },
  inputArea: { padding: 16 },
});
