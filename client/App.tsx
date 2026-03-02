import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { ConnectionScreen } from './src/modules/connection/screens/ConnectionScreen';
import { TouchpadScreen } from './src/modules/touchpad';
import { KeyboardScreen } from './src/modules/keyboard';
import { MediaScreen } from './src/modules/media';
import { MacroScreen } from './src/modules/macro';
import { ClipboardScreen } from './src/modules/clipboard';
import { useConnectionStore } from './src/stores/connectionStore';

type ActiveTab = 'touchpad' | 'keyboard' | 'media' | 'macro' | 'clipboard';

const TAB_ICONS: Record<ActiveTab, keyof typeof Ionicons.glyphMap> = {
  touchpad:  'hand-right-outline',
  keyboard:  'keypad-outline',
  media:     'musical-notes-outline',
  macro:     'flash-outline',
  clipboard: 'clipboard-outline',
};

export default function App(): React.JSX.Element {
  const status = useConnectionStore((s) => s.status);
  const disconnect = useConnectionStore((s) => s.disconnect);
  const [activeTab, setActiveTab] = useState<ActiveTab>('touchpad');

  if (status !== 'connected') {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ConnectionScreen />
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.appContainer}>
        <View style={styles.screenContainer}>
          {activeTab === 'touchpad' && <TouchpadScreen onDisconnect={disconnect} />}
          {activeTab === 'keyboard' && <KeyboardScreen onDisconnect={disconnect} />}
          {activeTab === 'media'    && <MediaScreen onDisconnect={disconnect} />}
          {activeTab === 'macro'    && <MacroScreen onDisconnect={disconnect} />}
          {activeTab === 'clipboard' && <ClipboardScreen onDisconnect={disconnect} />}
        </View>
        <View style={styles.tabBar}>
          <Pressable
            style={[styles.tab, activeTab === 'touchpad' && styles.tabActive]}
            onPress={() => setActiveTab('touchpad')}
          >
            <Ionicons name={TAB_ICONS.touchpad} size={22} color={activeTab === 'touchpad' ? '#007aff' : '#8e8e93'} />
            <Text style={[styles.tabText, activeTab === 'touchpad' && styles.tabTextActive]}>Touchpad</Text>
          </Pressable>
          <Pressable
            style={[styles.tab, activeTab === 'keyboard' && styles.tabActive]}
            onPress={() => setActiveTab('keyboard')}
          >
            <Ionicons name={TAB_ICONS.keyboard} size={22} color={activeTab === 'keyboard' ? '#007aff' : '#8e8e93'} />
            <Text style={[styles.tabText, activeTab === 'keyboard' && styles.tabTextActive]}>Keyboard</Text>
          </Pressable>
          <Pressable
            style={[styles.tab, activeTab === 'media' && styles.tabActive]}
            onPress={() => setActiveTab('media')}
          >
            <Ionicons name={TAB_ICONS.media} size={22} color={activeTab === 'media' ? '#007aff' : '#8e8e93'} />
            <Text style={[styles.tabText, activeTab === 'media' && styles.tabTextActive]}>Media</Text>
          </Pressable>
          <Pressable
            style={[styles.tab, activeTab === 'macro' && styles.tabActive]}
            onPress={() => setActiveTab('macro')}
          >
            <Ionicons name={TAB_ICONS.macro} size={22} color={activeTab === 'macro' ? '#007aff' : '#8e8e93'} />
            <Text style={[styles.tabText, activeTab === 'macro' && styles.tabTextActive]}>Macros</Text>
          </Pressable>
          <Pressable
            style={[styles.tab, activeTab === 'clipboard' && styles.tabActive]}
            onPress={() => setActiveTab('clipboard')}
          >
            <Ionicons name={TAB_ICONS.clipboard} size={22} color={activeTab === 'clipboard' ? '#007aff' : '#8e8e93'} />
            <Text style={[styles.tabText, activeTab === 'clipboard' && styles.tabTextActive]}>Clipboard</Text>
          </Pressable>
        </View>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  appContainer: { flex: 1, backgroundColor: '#f2f2f7' },
  screenContainer: { flex: 1 },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#c8c8ce',
    height: 60,
    paddingBottom: 4,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  tabActive: {
    borderTopWidth: 2,
    borderTopColor: '#007aff',
  },
  tabText: { fontSize: 10, color: '#8e8e93', fontWeight: '500' },
  tabTextActive: { color: '#007aff', fontWeight: '600' },
});
