import React, { useState, useCallback } from 'react';
import { SafeAreaView, StatusBar, View, Text, Pressable, StyleSheet } from 'react-native';
import { GestureArea } from '../components/GestureArea';
import { SensitivitySlider } from '../components/SensitivitySlider';
import { useTouchpad } from '../hooks/useTouchpad';

interface TouchpadScreenProps {
  readonly onDisconnect: () => void;
}

export function TouchpadScreen({ onDisconnect }: TouchpadScreenProps): React.JSX.Element {
  const { sensitivity, setSensitivity, sendMove, sendClick, sendDoubleClick, sendScroll } = useTouchpad();
  const [showSettings, setShowSettings] = useState(false);

  const handleTap = useCallback(() => sendClick('left'), [sendClick]);
  const handleDoubleTap = useCallback(() => sendDoubleClick(), [sendDoubleClick]);
  const handleTwoFingerTap = useCallback(() => sendClick('right'), [sendClick]);
  const toggleSettings = useCallback(() => setShowSettings((prev) => !prev), []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <Pressable onPress={onDisconnect} style={styles.headerButton}>
          <Text style={styles.headerButtonText}>Disconnect</Text>
        </Pressable>
        <Text style={styles.title}>Touchpad</Text>
        <Pressable onPress={toggleSettings} style={styles.headerButton}>
          <Text style={styles.headerButtonText}>{showSettings ? 'Done' : 'Settings'}</Text>
        </Pressable>
      </View>
      {showSettings ? <SensitivitySlider value={sensitivity} onValueChange={setSensitivity} /> : null}
      <GestureArea
        sensitivity={sensitivity}
        onMove={sendMove}
        onTap={handleTap}
        onDoubleTap={handleDoubleTap}
        onTwoFingerTap={handleTwoFingerTap}
        onScroll={sendScroll}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f2f2f7', padding: 16, gap: 8 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerButton: { paddingVertical: 6, paddingHorizontal: 12 },
  headerButtonText: { fontSize: 16, color: '#007aff' },
  title: { fontSize: 20, fontWeight: '600' },
});
