import React from 'react';
import {
  SafeAreaView, StatusBar, View, Text, Pressable, StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useMedia } from '../hooks/useMedia';
import { useThemeColors } from '../../settings/hooks/useSettings';
import type { MediaCmd } from '@nexus/shared';

interface MediaScreenProps {
  readonly onDisconnect: () => void;
}

interface MediaButton {
  readonly cmd: MediaCmd;
  readonly icon: keyof typeof Ionicons.glyphMap;
  readonly size?: number;
}

const PLAYBACK_BUTTONS: readonly MediaButton[] = [
  { cmd: 'prev',       icon: 'play-back-outline' },
  { cmd: 'play_pause', icon: 'play-outline', size: 32 },
  { cmd: 'next',       icon: 'play-forward-outline' },
];

const VOLUME_BUTTONS: readonly MediaButton[] = [
  { cmd: 'volume_down', icon: 'volume-low-outline' },
  { cmd: 'mute',        icon: 'volume-mute-outline' },
  { cmd: 'volume_up',   icon: 'volume-high-outline' },
];

export function MediaScreen({ onDisconnect }: MediaScreenProps): React.JSX.Element {
  const { sendMediaCmd } = useMedia();
  const c = useThemeColors();
  const isDark = c.background === '#1c1c1e';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <View style={styles.header}>
        <Pressable onPress={onDisconnect} style={styles.headerButton}>
          <Text style={[styles.headerButtonText, { color: c.primary }]}>Disconnect</Text>
        </Pressable>
        <Text style={[styles.title, { color: c.text }]}>Media</Text>
        <View style={styles.headerButton} />
      </View>

      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: c.textSecondary }]}>Playback</Text>
          <View style={styles.buttonRow}>
            {PLAYBACK_BUTTONS.map((btn) => (
              <Pressable
                key={btn.cmd}
                style={({ pressed }) => [
                  styles.mediaButton,
                  { backgroundColor: c.surface },
                  pressed && { backgroundColor: c.border },
                ]}
                onPress={() => sendMediaCmd(btn.cmd)}
              >
                <Ionicons name={btn.icon} size={btn.size ?? 28} color={c.text} />
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: c.textSecondary }]}>Volume</Text>
          <View style={styles.buttonRow}>
            {VOLUME_BUTTONS.map((btn) => (
              <Pressable
                key={btn.cmd}
                style={({ pressed }) => [
                  styles.mediaButton,
                  { backgroundColor: c.surface },
                  pressed && { backgroundColor: c.border },
                ]}
                onPress={() => sendMediaCmd(btn.cmd)}
              >
                <Ionicons name={btn.icon} size={28} color={c.text} />
              </Pressable>
            ))}
          </View>
        </View>
      </View>
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
  content: { flex: 1, justifyContent: 'center', padding: 24, gap: 32 },
  section: { gap: 12 },
  sectionLabel: {
    fontSize: 13, fontWeight: '500',
    textTransform: 'uppercase', letterSpacing: 0.5,
  },
  buttonRow: { flexDirection: 'row', gap: 12 },
  mediaButton: {
    flex: 1, borderRadius: 14,
    paddingVertical: 24, alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08, shadowRadius: 4,
  },
});
