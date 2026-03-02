import React, { useState } from 'react';
import {
  SafeAreaView,
  StatusBar,
  View,
  Text,
  Pressable,
  TextInput,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SensitivitySlider } from '../../touchpad/components/SensitivitySlider';
import { useSettings, useThemeColors } from '../hooks/useSettings';
import type { AppTheme } from '../services/settingsStorage';

interface SettingsScreenProps {
  readonly onClose: () => void;
}

const THEMES: { value: AppTheme; label: string }[] = [
  { value: 'light',  label: 'Light' },
  { value: 'dark',   label: 'Dark' },
  { value: 'system', label: 'System' },
];

export function SettingsScreen({ onClose }: SettingsScreenProps): React.JSX.Element {
  const c = useThemeColors();
  const { theme, serverPort, sensitivity, setTheme, setServerPort, setSensitivity } = useSettings();
  const [portInput, setPortInput] = useState(String(serverPort));
  const [portError, setPortError] = useState<string | null>(null);

  function handlePortBlur() {
    const n = parseInt(portInput, 10);
    if (isNaN(n) || n < 1024 || n > 65535) {
      setPortError('Port must be between 1024 and 65535');
      setPortInput(String(serverPort));
    } else {
      setPortError(null);
      setServerPort(n);
    }
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.background }]}>
      <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} />

      <View style={[styles.header, { backgroundColor: c.surface, borderBottomColor: c.border }]}>
        <Text style={[styles.title, { color: c.text }]}>Settings</Text>
        <Pressable onPress={onClose} style={styles.doneButton}>
          <Text style={[styles.doneText, { color: c.primary }]}>Done</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Touchpad */}
        <Text style={[styles.sectionHeader, { color: c.textSecondary }]}>TOUCHPAD</Text>
        <View style={[styles.card, { backgroundColor: c.surface }]}>
          <SensitivitySlider value={sensitivity} onValueChange={setSensitivity} />
        </View>

        {/* Appearance */}
        <Text style={[styles.sectionHeader, { color: c.textSecondary }]}>APPEARANCE</Text>
        <View style={[styles.card, { backgroundColor: c.surface }]}>
          {THEMES.map(({ value, label }, idx) => (
            <Pressable
              key={value}
              style={[
                styles.row,
                idx < THEMES.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: c.border },
              ]}
              onPress={() => setTheme(value)}
            >
              <Text style={[styles.label, { color: c.text }]}>{label}</Text>
              {theme === value && (
                <Text style={[styles.checkmark, { color: c.primary }]}>✓</Text>
              )}
            </Pressable>
          ))}
        </View>

        {/* Connection */}
        <Text style={[styles.sectionHeader, { color: c.textSecondary }]}>CONNECTION</Text>
        <View style={[styles.card, { backgroundColor: c.surface }]}>
          <View style={styles.row}>
            <Text style={[styles.label, { color: c.text }]}>Default Server Port</Text>
            <TextInput
              value={portInput}
              onChangeText={setPortInput}
              onBlur={handlePortBlur}
              keyboardType="number-pad"
              style={[styles.portInput, { color: c.text, borderColor: c.border }]}
              maxLength={5}
            />
          </View>
          {portError !== null && (
            <Text style={[styles.portError, { color: c.destructive }]}>{portError}</Text>
          )}
        </View>

        {/* About */}
        <Text style={[styles.sectionHeader, { color: c.textSecondary }]}>ABOUT</Text>
        <View style={[styles.card, { backgroundColor: c.surface }]}>
          <View style={styles.row}>
            <Text style={[styles.label, { color: c.text }]}>Nexus</Text>
            <Text style={[styles.valueText, { color: c.textSecondary }]}>iOS Remote Control</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  title: { fontSize: 20, fontWeight: '700' },
  doneButton: { paddingVertical: 4, paddingHorizontal: 8 },
  doneText: { fontSize: 16, fontWeight: '600' },
  content: { padding: 16, gap: 8, paddingBottom: 40 },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginTop: 12,
    marginBottom: 4,
    marginLeft: 4,
  },
  card: { borderRadius: 12, overflow: 'hidden' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  label: { fontSize: 16 },
  valueText: { fontSize: 16 },
  checkmark: { fontSize: 18 },
  portInput: {
    fontSize: 16,
    textAlign: 'right',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    minWidth: 70,
  },
  portError: { fontSize: 12, paddingHorizontal: 16, paddingBottom: 10 },
});
