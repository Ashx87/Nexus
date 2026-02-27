import React from 'react';
import {
  SafeAreaView, StatusBar, View, Text, Pressable, StyleSheet,
} from 'react-native';
import { useMedia } from '../hooks/useMedia';
import type { MediaCmd } from '@nexus/shared';

interface MediaScreenProps {
  readonly onDisconnect: () => void;
}

interface MediaButton {
  readonly cmd: MediaCmd;
  readonly label: string;
}

const PLAYBACK_BUTTONS: readonly MediaButton[] = [
  { cmd: 'prev',       label: '⏮' },
  { cmd: 'play_pause', label: '▶/⏸' },
  { cmd: 'next',       label: '⏭' },
];

const VOLUME_BUTTONS: readonly MediaButton[] = [
  { cmd: 'volume_down', label: '🔉' },
  { cmd: 'mute',        label: '🔇' },
  { cmd: 'volume_up',   label: '🔊' },
];

export function MediaScreen({ onDisconnect }: MediaScreenProps): React.JSX.Element {
  const { sendMediaCmd } = useMedia();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <Pressable onPress={onDisconnect} style={styles.headerButton}>
          <Text style={styles.headerButtonText}>Disconnect</Text>
        </Pressable>
        <Text style={styles.title}>Media</Text>
        <View style={styles.headerButton} />
      </View>

      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Playback</Text>
          <View style={styles.buttonRow}>
            {PLAYBACK_BUTTONS.map((btn) => (
              <Pressable
                key={btn.cmd}
                style={({ pressed }) => [styles.mediaButton, pressed && styles.mediaButtonPressed]}
                onPress={() => sendMediaCmd(btn.cmd)}
              >
                <Text style={styles.mediaButtonText}>{btn.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Volume</Text>
          <View style={styles.buttonRow}>
            {VOLUME_BUTTONS.map((btn) => (
              <Pressable
                key={btn.cmd}
                style={({ pressed }) => [styles.mediaButton, pressed && styles.mediaButtonPressed]}
                onPress={() => sendMediaCmd(btn.cmd)}
              >
                <Text style={styles.mediaButtonText}>{btn.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f2f2f7' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 8,
  },
  headerButton: { paddingVertical: 6, paddingHorizontal: 12 },
  headerButtonText: { fontSize: 16, color: '#007aff' },
  title: { fontSize: 20, fontWeight: '600' },
  content: { flex: 1, justifyContent: 'center', padding: 24, gap: 32 },
  section: { gap: 12 },
  sectionLabel: {
    fontSize: 13, color: '#8e8e93', fontWeight: '500',
    textTransform: 'uppercase', letterSpacing: 0.5,
  },
  buttonRow: { flexDirection: 'row', gap: 12 },
  mediaButton: {
    flex: 1, backgroundColor: '#ffffff', borderRadius: 14,
    paddingVertical: 24, alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08, shadowRadius: 4,
  },
  mediaButtonPressed: { backgroundColor: '#e5e5ea' },
  mediaButtonText: { fontSize: 28 },
});
