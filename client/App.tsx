import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Modal } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { ConnectionScreen } from './src/modules/connection/screens/ConnectionScreen';
import { TouchpadScreen } from './src/modules/touchpad';
import { KeyboardScreen } from './src/modules/keyboard';
import { MediaScreen } from './src/modules/media';
import { MacroScreen } from './src/modules/macro';
import { ClipboardScreen } from './src/modules/clipboard';
import { SettingsScreen } from './src/modules/settings';
import { useConnectionStore } from './src/stores/connectionStore';
import { useThemeColors } from './src/modules/settings/hooks/useSettings';

type ActiveTab = 'touchpad' | 'keyboard' | 'media' | 'macro' | 'clipboard';

const TAB_CONFIG: {
  id: ActiveTab;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  { id: 'touchpad',  label: 'Touchpad',  icon: 'hand-right-outline' },
  { id: 'keyboard',  label: 'Keyboard',  icon: 'keypad-outline' },
  { id: 'media',     label: 'Media',     icon: 'musical-notes-outline' },
  { id: 'macro',     label: 'Macros',    icon: 'flash-outline' },
  { id: 'clipboard', label: 'Clipboard', icon: 'clipboard-outline' },
];

export default function App(): React.JSX.Element {
  const status = useConnectionStore((s) => s.status);
  const disconnect = useConnectionStore((s) => s.disconnect);
  const [activeTab, setActiveTab] = useState<ActiveTab>('touchpad');
  const [showSettings, setShowSettings] = useState(false);
  const c = useThemeColors();

  if (status !== 'connected') {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ConnectionScreen />
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={[styles.appContainer, { backgroundColor: c.background }]}>
        <View style={styles.screenContainer}>
          {activeTab === 'touchpad'  && <TouchpadScreen onDisconnect={disconnect} />}
          {activeTab === 'keyboard'  && <KeyboardScreen onDisconnect={disconnect} />}
          {activeTab === 'media'     && <MediaScreen onDisconnect={disconnect} />}
          {activeTab === 'macro'     && <MacroScreen onDisconnect={disconnect} />}
          {activeTab === 'clipboard' && <ClipboardScreen onDisconnect={disconnect} />}
        </View>

        <View style={[styles.tabBar, { backgroundColor: c.tabBarBg, borderTopColor: c.tabBarBorder }]}>
          {TAB_CONFIG.map(({ id, label, icon }) => (
            <Pressable
              key={id}
              style={[styles.tab, activeTab === id && { borderTopWidth: 2, borderTopColor: c.primary }]}
              onPress={() => setActiveTab(id)}
            >
              <Ionicons
                name={icon}
                size={22}
                color={activeTab === id ? c.primary : c.textSecondary}
              />
              <Text style={[styles.tabText, { color: activeTab === id ? c.primary : c.textSecondary }]}>
                {label}
              </Text>
            </Pressable>
          ))}
          <Pressable style={styles.tab} onPress={() => setShowSettings(true)}>
            <Ionicons name="settings-outline" size={22} color={c.textSecondary} />
            <Text style={[styles.tabText, { color: c.textSecondary }]}>Settings</Text>
          </Pressable>
        </View>
      </View>

      <Modal visible={showSettings} animationType="slide" presentationStyle="fullScreen">
        <SettingsScreen onClose={() => setShowSettings(false)} />
      </Modal>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  appContainer: { flex: 1 },
  screenContainer: { flex: 1 },
  tabBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    height: 60,
    paddingBottom: 4,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  tabText: { fontSize: 9, fontWeight: '500' },
});
