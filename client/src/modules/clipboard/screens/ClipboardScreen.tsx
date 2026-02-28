import React, { useEffect } from 'react';
import {
  SafeAreaView, StatusBar, View, Text, Pressable,
  FlatList, ActivityIndicator, StyleSheet,
} from 'react-native';
import { useClipboard } from '../hooks/useClipboard';
import { useClipboardStore } from '../../../stores/clipboardStore';
import type { ClipboardEntry } from '../services/clipboardStorage';

interface ClipboardScreenProps {
  readonly onDisconnect: () => void;
}

function formatTime(timestamp: number): string {
  const d = new Date(timestamp);
  const h = d.getHours().toString().padStart(2, '0');
  const m = d.getMinutes().toString().padStart(2, '0');
  return `${h}:${m}`;
}

function HistoryItem({ item }: { readonly item: ClipboardEntry }) {
  const directionLabel = item.direction === 'phone_to_pc' ? 'Phone → PC' : 'PC → Phone';

  return (
    <View style={styles.historyItem}>
      <View style={styles.historyHeader}>
        <Text style={styles.historyDirection}>{directionLabel}</Text>
        <Text style={styles.historyTime}>{formatTime(item.timestamp)}</Text>
      </View>
      <Text style={styles.historyContent} numberOfLines={2}>
        {item.preview || item.content}
      </Text>
    </View>
  );
}

export function ClipboardScreen({ onDisconnect }: ClipboardScreenProps): React.JSX.Element {
  const { sendToPC, getFromPC } = useClipboard();
  const history = useClipboardStore((s) => s.history);
  const isSyncing = useClipboardStore((s) => s.isSyncing);
  const loaded = useClipboardStore((s) => s.loaded);
  const initHistory = useClipboardStore((s) => s.initHistory);
  const clearHistory = useClipboardStore((s) => s.clearHistory);

  useEffect(() => {
    if (!loaded) {
      initHistory();
    }
  }, [loaded, initHistory]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <Pressable onPress={onDisconnect} style={styles.headerButton}>
          <Text style={styles.headerButtonText}>Disconnect</Text>
        </Pressable>
        <Text style={styles.title}>Clipboard</Text>
        <Pressable onPress={clearHistory} style={styles.headerButton}>
          <Text style={styles.headerButtonText}>Clear</Text>
        </Pressable>
      </View>

      <View style={styles.actions}>
        <Pressable
          style={({ pressed }) => [styles.actionButton, styles.sendButton, pressed && styles.actionPressed]}
          onPress={sendToPC}
          disabled={isSyncing}
        >
          {isSyncing ? (
            <ActivityIndicator color="#ffffff" size="small" />
          ) : (
            <Text style={styles.actionTextLight}>Send to PC</Text>
          )}
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.actionButton, styles.getButton, pressed && styles.actionPressed]}
          onPress={getFromPC}
          disabled={isSyncing}
        >
          {isSyncing ? (
            <ActivityIndicator color="#007aff" size="small" />
          ) : (
            <Text style={styles.actionTextDark}>Get from PC</Text>
          )}
        </Pressable>
      </View>

      <View style={styles.historySection}>
        <Text style={styles.sectionLabel}>History</Text>
        {history.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No clipboard history yet</Text>
          </View>
        ) : (
          <FlatList<ClipboardEntry>
            data={history}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <HistoryItem item={item} />}
            contentContainerStyle={styles.listContent}
          />
        )}
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
  actions: {
    flexDirection: 'row', gap: 12,
    paddingHorizontal: 16, paddingVertical: 12,
  },
  actionButton: {
    flex: 1, borderRadius: 14, paddingVertical: 16,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08, shadowRadius: 4,
  },
  sendButton: { backgroundColor: '#007aff' },
  getButton: { backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#007aff' },
  actionPressed: { opacity: 0.7 },
  actionTextLight: { fontSize: 16, fontWeight: '600', color: '#ffffff' },
  actionTextDark: { fontSize: 16, fontWeight: '600', color: '#007aff' },
  historySection: { flex: 1, paddingHorizontal: 16, paddingTop: 8 },
  sectionLabel: {
    fontSize: 13, color: '#8e8e93', fontWeight: '500',
    textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8,
  },
  listContent: { gap: 8, paddingBottom: 16 },
  historyItem: {
    backgroundColor: '#ffffff', borderRadius: 12, padding: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 3,
  },
  historyHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 6,
  },
  historyDirection: { fontSize: 12, color: '#8e8e93', fontWeight: '500' },
  historyTime: { fontSize: 12, color: '#8e8e93' },
  historyContent: { fontSize: 14, color: '#1c1c1e', lineHeight: 20 },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { fontSize: 15, color: '#8e8e93' },
});
