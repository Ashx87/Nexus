import { useCallback } from 'react';
import { wsService } from '../../../services/WebSocketService';
import type { MediaControlMessage, MediaCmd } from '@nexus/shared';

export function useMedia() {
  const sendMediaCmd = useCallback((cmd: MediaCmd) => {
    const msg: MediaControlMessage = {
      module: 'media',
      action: 'control',
      payload: { cmd },
    };
    wsService.send(msg);
  }, []);

  return { sendMediaCmd } as const;
}
