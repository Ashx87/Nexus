import { create } from 'zustand';
import { ConnectionStatus } from '@nexus/shared';
import { wsService, StatusMeta } from '../services/WebSocketService';
import {
  loadLastServer,
  saveLastServer,
} from '../modules/connection/services/serverStorage';

interface ConnectionState {
  readonly status: ConnectionStatus;
  readonly serverHost: string;
  readonly serverPort: number;
  readonly reconnectAttempt: number;
  readonly reconnectMaxAttempts: number;
  readonly serverName: string | null;
  readonly serverVersion: string | null;
  readonly lastServer: { readonly host: string; readonly port: number } | null;
  readonly lastServerLoaded: boolean;

  connect: (host: string, port: number) => void;
  disconnect: () => void;
  setServerInfo: (name: string, version: string) => void;
  initLastServer: () => Promise<void>;
}

export const useConnectionStore = create<ConnectionState>((set, get) => {
  // Subscribe to WebSocket status changes
  wsService.addStatusHandler((status: ConnectionStatus, meta?: StatusMeta) => {
    if (status === 'reconnecting') {
      set({
        status,
        reconnectAttempt: meta?.attempt ?? 0,
        reconnectMaxAttempts: meta?.maxAttempts ?? 10,
      });
    } else if (status === 'connected') {
      const { serverHost, serverPort } = get();
      saveLastServer(serverHost, serverPort);
      set({
        status,
        reconnectAttempt: 0,
      });
    } else {
      set({ status });
    }
  });

  return {
    status: 'disconnected',
    serverHost: '',
    serverPort: 9001,
    reconnectAttempt: 0,
    reconnectMaxAttempts: 10,
    serverName: null,
    serverVersion: null,
    lastServer: null,
    lastServerLoaded: false,

    connect: (host, port) => {
      set({ serverHost: host, serverPort: port });
      wsService.connect(host, port);
    },

    disconnect: () => {
      wsService.disconnect();
      set({
        serverName: null,
        serverVersion: null,
        reconnectAttempt: 0,
      });
    },

    setServerInfo: (name, version) => {
      set({ serverName: name, serverVersion: version });
    },

    initLastServer: async () => {
      const saved = await loadLastServer();
      set({
        lastServer: saved,
        lastServerLoaded: true,
        serverHost: saved?.host ?? '',
        serverPort: saved?.port ?? 9001,
      });
    },
  };
});
