import { useEffect, useCallback } from 'react';
import { useTouchpadStore } from '../../../stores/touchpadStore';
import { wsService } from '../../../services/WebSocketService';
import { MouseMoveMessage, MouseClickMessage, MouseScrollMessage } from '@nexus/shared';

export function useTouchpad() {
  const { sensitivity, settingsLoaded, initSettings, setSensitivity } = useTouchpadStore();

  useEffect(() => {
    if (!settingsLoaded) { initSettings(); }
  }, [settingsLoaded, initSettings]);

  const sendMove = useCallback((dx: number, dy: number) => {
    const msg: MouseMoveMessage = { module: 'mouse', action: 'move', payload: { dx, dy } };
    wsService.send(msg);
  }, []);

  const sendClick = useCallback((button: 'left' | 'right' | 'middle' = 'left') => {
    const msg: MouseClickMessage = { module: 'mouse', action: 'click', payload: { button } };
    wsService.send(msg);
  }, []);

  const sendDoubleClick = useCallback(() => {
    const msg: MouseClickMessage = { module: 'mouse', action: 'click', payload: { button: 'left' } };
    wsService.send(msg);
    // OS double-click requires a small inter-click gap (~50ms) to register as double-click
    setTimeout(() => { wsService.send(msg); }, 50);
  }, []);

  const sendScroll = useCallback((dy: number) => {
    const msg: MouseScrollMessage = { module: 'mouse', action: 'scroll', payload: { dy } };
    wsService.send(msg);
  }, []);

  return { sensitivity, setSensitivity, sendMove, sendClick, sendDoubleClick, sendScroll } as const;
}
