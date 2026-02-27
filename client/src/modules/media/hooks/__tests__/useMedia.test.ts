// client/src/modules/media/hooks/__tests__/useMedia.test.ts

jest.mock('../../../../services/WebSocketService', () => ({
  wsService: { send: jest.fn() },
}));

jest.mock('react', () => ({
  useCallback: (fn: unknown) => fn,
}));

import { wsService } from '../../../../services/WebSocketService';
import { useMedia } from '../useMedia';

const mockSend = wsService.send as jest.Mock;

beforeEach(() => { mockSend.mockClear(); });

describe('useMedia', () => {
  describe('sendMediaCmd', () => {
    it('sends play_pause command', () => {
      const { sendMediaCmd } = useMedia();
      sendMediaCmd('play_pause');
      expect(mockSend).toHaveBeenCalledWith({
        module: 'media', action: 'control', payload: { cmd: 'play_pause' },
      });
    });

    it('sends next command', () => {
      const { sendMediaCmd } = useMedia();
      sendMediaCmd('next');
      expect(mockSend).toHaveBeenCalledWith({
        module: 'media', action: 'control', payload: { cmd: 'next' },
      });
    });

    it('sends prev command', () => {
      const { sendMediaCmd } = useMedia();
      sendMediaCmd('prev');
      expect(mockSend).toHaveBeenCalledWith({
        module: 'media', action: 'control', payload: { cmd: 'prev' },
      });
    });

    it('sends volume_up command', () => {
      const { sendMediaCmd } = useMedia();
      sendMediaCmd('volume_up');
      expect(mockSend).toHaveBeenCalledWith({
        module: 'media', action: 'control', payload: { cmd: 'volume_up' },
      });
    });

    it('sends volume_down command', () => {
      const { sendMediaCmd } = useMedia();
      sendMediaCmd('volume_down');
      expect(mockSend).toHaveBeenCalledWith({
        module: 'media', action: 'control', payload: { cmd: 'volume_down' },
      });
    });

    it('sends mute command', () => {
      const { sendMediaCmd } = useMedia();
      sendMediaCmd('mute');
      expect(mockSend).toHaveBeenCalledWith({
        module: 'media', action: 'control', payload: { cmd: 'mute' },
      });
    });

    it('sends exactly one message per call', () => {
      const { sendMediaCmd } = useMedia();
      sendMediaCmd('play_pause');
      expect(mockSend).toHaveBeenCalledTimes(1);
    });
  });

  describe('return value', () => {
    it('exposes sendMediaCmd function', () => {
      const result = useMedia();
      expect(typeof result.sendMediaCmd).toBe('function');
    });
  });
});
