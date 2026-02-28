import { useCallback, useEffect } from 'react';
import * as ExpoClipboard from 'expo-clipboard';
import type { OutboundMessage } from '@nexus/shared';
import { wsService } from '../../../services/WebSocketService';
import { useClipboardStore } from '../../../stores/clipboardStore';
import type { ClipboardEntry } from '../services/clipboardStorage';

export function useClipboard() {
  const addEntry = useClipboardStore((s) => s.addEntry);
  const setSyncing = useClipboardStore((s) => s.setSyncing);

  const sendToPC = useCallback(async () => {
    const text = await ExpoClipboard.getStringAsync();
    if (!text) return;

    setSyncing(true);
    wsService.send({
      module: 'clipboard',
      action: 'sync',
      payload: { content: text, direction: 'phone_to_pc' as const },
    });

    const entry: ClipboardEntry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      type: 'text',
      content: text,
      preview: text.slice(0, 100),
      direction: 'phone_to_pc',
      timestamp: Date.now(),
    };
    await addEntry(entry);
    setSyncing(false);
  }, [addEntry, setSyncing]);

  const getFromPC = useCallback(() => {
    setSyncing(true);
    wsService.send({
      module: 'clipboard',
      action: 'request',
      payload: { direction: 'pc_to_phone' as const },
    });
  }, [setSyncing]);

  useEffect(() => {
    const unsubscribe = wsService.addMessageHandler(
      (msg: OutboundMessage) => {
        if (msg.module !== 'clipboard' || msg.action !== 'sync') return;

        const payload = msg.payload as {
          content: string;
          direction: string;
        };
        if (payload.direction !== 'pc_to_phone') return;

        ExpoClipboard.setStringAsync(payload.content);
        addEntry({
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          type: 'text',
          content: payload.content,
          preview: payload.content.slice(0, 100),
          direction: 'pc_to_phone',
          timestamp: Date.now(),
        });
        setSyncing(false);
      },
    );

    return unsubscribe;
  }, [addEntry, setSyncing]);

  return { sendToPC, getFromPC };
}
