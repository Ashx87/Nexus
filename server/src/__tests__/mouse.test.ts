import { WebSocket } from 'ws';
import { MouseMoveMessage, MouseClickMessage, MouseScrollMessage } from '@nexus/shared';

const mockGetPosition = jest.fn();
const mockSetPosition = jest.fn().mockResolvedValue(undefined);
const mockClick = jest.fn().mockResolvedValue(undefined);
const mockScrollDown = jest.fn().mockResolvedValue(undefined);
const mockScrollUp = jest.fn().mockResolvedValue(undefined);

jest.mock('@nut-tree-fork/nut-js', () => ({
  mouse: {
    getPosition: mockGetPosition,
    setPosition: mockSetPosition,
    click: mockClick,
    scrollDown: mockScrollDown,
    scrollUp: mockScrollUp,
    config: {},
  },
  Button: { LEFT: 0, MIDDLE: 1, RIGHT: 2 },
  Point: jest.fn((x: number, y: number) => ({ x, y })),
}));

import { handleMouseMove, handleMouseClick, handleMouseScroll } from '../modules/mouse';

function createMockWs(): WebSocket {
  return { send: jest.fn(), readyState: 1 } as unknown as WebSocket;
}

describe('mouse module', () => {
  let ws: WebSocket;

  beforeEach(() => {
    ws = createMockWs();
    jest.clearAllMocks();
    mockGetPosition.mockResolvedValue({ x: 100, y: 200 });
  });

  describe('handleMouseMove', () => {
    test('reads current position and sets new position with dx, dy applied', async () => {
      const msg: MouseMoveMessage = { module: 'mouse', action: 'move', payload: { dx: 10, dy: -5 } };
      await handleMouseMove(ws, msg);
      expect(mockGetPosition).toHaveBeenCalled();
      expect(mockSetPosition).toHaveBeenCalledWith(expect.objectContaining({ x: 110, y: 195 }));
    });

    test('sends error on nut.js failure', async () => {
      mockGetPosition.mockRejectedValueOnce(new Error('injection blocked'));
      const msg: MouseMoveMessage = { module: 'mouse', action: 'move', payload: { dx: 1, dy: 1 } };
      await handleMouseMove(ws, msg);
      expect(ws.send).toHaveBeenCalled();
      const sent = JSON.parse((ws.send as jest.Mock).mock.calls[0][0]);
      expect(sent.module).toBe('connection');
      expect(sent.action).toBe('error');
      expect(sent.payload.code).toBe('INJECTION_FAILED');
    });
  });

  describe('handleMouseClick', () => {
    test('calls mouse.click with LEFT button enum for "left"', async () => {
      const msg: MouseClickMessage = { module: 'mouse', action: 'click', payload: { button: 'left' } };
      await handleMouseClick(ws, msg);
      expect(mockClick).toHaveBeenCalledWith(0); // Button.LEFT
    });

    test('calls mouse.click with RIGHT button enum for "right"', async () => {
      const msg: MouseClickMessage = { module: 'mouse', action: 'click', payload: { button: 'right' } };
      await handleMouseClick(ws, msg);
      expect(mockClick).toHaveBeenCalledWith(2); // Button.RIGHT
    });

    test('calls mouse.click with MIDDLE button enum for "middle"', async () => {
      const msg: MouseClickMessage = { module: 'mouse', action: 'click', payload: { button: 'middle' } };
      await handleMouseClick(ws, msg);
      expect(mockClick).toHaveBeenCalledWith(1); // Button.MIDDLE
    });

    test('sends error on nut.js failure', async () => {
      mockClick.mockRejectedValueOnce(new Error('click failed'));
      const msg: MouseClickMessage = { module: 'mouse', action: 'click', payload: { button: 'left' } };
      await handleMouseClick(ws, msg);
      const sent = JSON.parse((ws.send as jest.Mock).mock.calls[0][0]);
      expect(sent.payload.code).toBe('INJECTION_FAILED');
    });
  });

  describe('handleMouseScroll', () => {
    test('calls scrollDown for positive dy', async () => {
      const msg: MouseScrollMessage = { module: 'mouse', action: 'scroll', payload: { dy: 3 } };
      await handleMouseScroll(ws, msg);
      expect(mockScrollDown).toHaveBeenCalledWith(3);
      expect(mockScrollUp).not.toHaveBeenCalled();
    });

    test('calls scrollUp for negative dy', async () => {
      const msg: MouseScrollMessage = { module: 'mouse', action: 'scroll', payload: { dy: -2 } };
      await handleMouseScroll(ws, msg);
      expect(mockScrollUp).toHaveBeenCalledWith(2);
      expect(mockScrollDown).not.toHaveBeenCalled();
    });

    test('does nothing for dy === 0', async () => {
      const msg: MouseScrollMessage = { module: 'mouse', action: 'scroll', payload: { dy: 0 } };
      await handleMouseScroll(ws, msg);
      expect(mockScrollDown).not.toHaveBeenCalled();
      expect(mockScrollUp).not.toHaveBeenCalled();
    });

    test('sends error on nut.js failure', async () => {
      mockScrollDown.mockRejectedValueOnce(new Error('scroll failed'));
      const msg: MouseScrollMessage = { module: 'mouse', action: 'scroll', payload: { dy: 1 } };
      await handleMouseScroll(ws, msg);
      const sent = JSON.parse((ws.send as jest.Mock).mock.calls[0][0]);
      expect(sent.payload.code).toBe('INJECTION_FAILED');
    });
  });
});
