import React, { useEffect } from 'react';
import {
  SafeAreaView, StatusBar, View, Text, Pressable,
  FlatList, ActivityIndicator, StyleSheet,
} from 'react-native';
import { useClipboard } from '../hooks/useClipboard';
import { useClipboardStore } from '../../../stores/clipboardStore';
import { useThemeColors } from '../../settings/hooks/useSettings';
import type { ThemeColors } from '../../../theme/colors';
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

function HistoryItem({ item, c }: { readonly item: ClipboardEntry; readonly c: ThemeColors }) {
  const directionLabel = item.direction === 'phone_to_pc' ? 'Phone → PC' : 'PC → Phone';

  return (
    <View style={[styles.historyItem, { backgroundColor: c.surface }]}>
      <View style={styles.historyHeader}>
        <Text style={[styles.historyDirection, { color: c.textSecondary }]}>{directionLabel}</Text>
        <Text style={[styles.historyTime, { color: c.textSecondary }]}>{formatTime(item.timestamp)}</Text>
      </View>
      <Text style={[styles.historyContent, { color: c.text }]} numberOfLines={2}>
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
  const c = useThemeColors();
  const isDark = c.background === '#1c1c1e';

  useEffect(() => {
    if (!loaded) {
      initHistory();
    }
  }, [loaded, initHistory]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <View style={styles.header}>
        <Pressable onPress={onDisconnect} style={styles.headerButton}>
          <Text style={[styles.headerButtonText, { color: c.primary }]}>Disconnect</Text>
        </Pressable>
        <Text style={[styles.title, { color: c.text }]}>Clipboard</Text>
        <Pressable onPress={clearHistory} style={styles.headerButton}>
          <Text style={[styles.headerButtonText, { color: c.primary }]}>Clear</Text>
        </Pressable>
      </View>

      <View style={styles.actions}>
        <Pressable
          style={({ pressed }) => [
            styles.actionButton,
            { backgroundColor: c.primary },
            pressed && styles.actionPressed,
          ]}
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
          style={({ pressed }) => [
            styles.actionButton,
            { backgroundColor: c.surface, borderWidth: 1, borderColor: c.primary },
            pressed && styles.actionPressed,
          ]}
          onPress={getFromPC}
          disabled={isSyncing}
        >
          {isSyncing ? (
            <ActivityIndicator color={c.primary} size="small" />
          ) : (
            <Text style={[styles.actionTextDark, { color: c.primary }]}>Get from PC</Text>
          )}
        </Pressable>
      </View>

      <View style={styles.historySection}>
        <Text style={[styles.sectionLabel, { color: c.textSecondary }]}>History</Text>
        {history.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyText, { color: c.textSecondary }]}>No clipboard history yet</Text>
          </View>
        ) : (
          <FlatList<ClipboardEntry>
            data={history}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <HistoryItem item={item} c={c} />}
            contentContainerStyle={styles.listContent}
          />
        )}
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
  actionPressed: { opacity: 0.7 },
  actionTextLight: { fontSize: 16, fontWeight: '600', color: '#ffffff' },
  actionTextDark: { fontSize: 16, fontWeight: '600' },
  historySection: { flex: 1, paddingHorizontal: 16, paddingTop: 8 },
  sectionLabel: {
    fontSize: 13, fontWeight: '500',
    textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8,
  },
  listContent: { gap: 8, paddingBottom: 16 },
  historyItem: {
    borderRadius: 12, padding: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 3,
  },
  historyHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 6,
  },
  historyDirection: { fontSize: 12, fontWeight: '500' },
  historyTime: { fontSize: 12 },
  historyContent: { fontSize: 14, lineHeight: 20 },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { fontSize: 15 },
});
