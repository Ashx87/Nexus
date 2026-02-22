import { useEffect, useState, useCallback } from 'react';
import { useConnectionStore } from '../../../stores/connectionStore';
import { wsService } from '../../../services/WebSocketService';

export function useConnection() {
  const store = useConnectionStore();
  const [host, setHost] = useState('');
  const [port, setPort] = useState('9001');

  // Load last server on mount and pre-fill form
  useEffect(() => {
    store.initLastServer().then(() => {
      const state = useConnectionStore.getState();
      if (state.lastServer) {
        setHost(state.lastServer.host);
        setPort(String(state.lastServer.port));
      }
    });
  }, []);

  // Listen for server_info messages
  useEffect(() => {
    return wsService.addMessageHandler((msg) => {
      if (msg.module === 'connection' && msg.action === 'server_info') {
        const payload = msg.payload as { name: string; version: string };
        useConnectionStore.getState().setServerInfo(payload.name, payload.version);
      }
    });
  }, []);

  const handleConnect = useCallback(() => {
    const trimmedHost = host.trim();
    const parsedPort = parseInt(port, 10) || 9001;
    if (!trimmedHost) return;
    store.connect(trimmedHost, parsedPort);
  }, [host, port, store]);

  const handleDisconnect = useCallback(() => {
    store.disconnect();
  }, [store]);

  return {
    host,
    port,
    setHost,
    setPort,
    status: store.status,
    serverName: store.serverName,
    serverVersion: store.serverVersion,
    reconnectAttempt: store.reconnectAttempt,
    reconnectMaxAttempts: store.reconnectMaxAttempts,
    handleConnect,
    handleDisconnect,
  } as const;
}
