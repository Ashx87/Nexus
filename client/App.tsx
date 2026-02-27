import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ConnectionScreen } from './src/modules/connection/screens/ConnectionScreen';
import { TouchpadScreen } from './src/modules/touchpad';
import { KeyboardScreen } from './src/modules/keyboard';
import { MediaScreen } from './src/modules/media';
import { useConnectionStore } from './src/stores/connectionStore';

type ActiveTab = 'touchpad' | 'keyboard' | 'media';

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
        </View>
        <View style={styles.tabBar}>
          <Pressable
            style={[styles.tab, activeTab === 'touchpad' && styles.tabActive]}
            onPress={() => setActiveTab('touchpad')}
          >
            <Text style={[styles.tabText, activeTab === 'touchpad' && styles.tabTextActive]}>
              Touchpad
            </Text>
          </Pressable>
          <Pressable
            style={[styles.tab, activeTab === 'keyboard' && styles.tabActive]}
            onPress={() => setActiveTab('keyboard')}
          >
            <Text style={[styles.tabText, activeTab === 'keyboard' && styles.tabTextActive]}>
              Keyboard
            </Text>
          </Pressable>
          <Pressable
            style={[styles.tab, activeTab === 'media' && styles.tabActive]}
            onPress={() => setActiveTab('media')}
          >
            <Text style={[styles.tabText, activeTab === 'media' && styles.tabTextActive]}>
              Media
            </Text>
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
    height: 50,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabActive: {
    borderTopWidth: 2,
    borderTopColor: '#007aff',
  },
  tabText: { fontSize: 14, color: '#8e8e93', fontWeight: '500' },
  tabTextActive: { color: '#007aff', fontWeight: '600' },
});
