import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ConnectionScreen } from './src/modules/connection/screens/ConnectionScreen';
import { TouchpadScreen } from './src/modules/touchpad';
import { useConnectionStore } from './src/stores/connectionStore';

export default function App(): React.JSX.Element {
  const status = useConnectionStore((s) => s.status);
  const disconnect = useConnectionStore((s) => s.disconnect);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {status === 'connected'
        ? <TouchpadScreen onDisconnect={disconnect} />
        : <ConnectionScreen />}
    </GestureHandlerRootView>
  );
}
