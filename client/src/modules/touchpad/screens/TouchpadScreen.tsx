import React, { useState, useCallback } from 'react';
import { SafeAreaView, StatusBar, View, Text, Pressable, StyleSheet } from 'react-native';
import { GestureArea } from '../components/GestureArea';
import { SensitivitySlider } from '../components/SensitivitySlider';
import { useTouchpad } from '../hooks/useTouchpad';
import { useThemeColors } from '../../settings/hooks/useSettings';

interface TouchpadScreenProps {
  readonly onDisconnect: () => void;
}

export function TouchpadScreen({ onDisconnect }: TouchpadScreenProps): React.JSX.Element {
  const { sensitivity, setSensitivity, sendMove, sendClick, sendDoubleClick, sendScroll } = useTouchpad();
  const [showSettings, setShowSettings] = useState(false);
  const c = useThemeColors();
  const isDark = c.background === '#1c1c1e';

  const handleTap = useCallback(() => sendClick('left'), [sendClick]);
  const handleDoubleTap = useCallback(() => sendDoubleClick(), [sendDoubleClick]);
  const handleTwoFingerTap = useCallback(() => sendClick('right'), [sendClick]);
  const toggleSettings = useCallback(() => setShowSettings((prev) => !prev), []);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <View style={styles.header}>
        <Pressable onPress={onDisconnect} style={styles.headerButton}>
          <Text style={[styles.headerButtonText, { color: c.primary }]}>Disconnect</Text>
        </Pressable>
        <Text style={[styles.title, { color: c.text }]}>Touchpad</Text>
        <Pressable onPress={toggleSettings} style={styles.headerButton}>
          <Text style={[styles.headerButtonText, { color: c.primary }]}>{showSettings ? 'Done' : 'Settings'}</Text>
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
  container: { flex: 1, padding: 16, gap: 8 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerButton: { paddingVertical: 6, paddingHorizontal: 12 },
  headerButtonText: { fontSize: 16 },
  title: { fontSize: 20, fontWeight: '600' },
});
