import { ImageTransferManager } from '../modules/image-transfer';
import { CLIPBOARD_TRANSFER_TIMEOUT_MS } from '@nexus/shared';

describe('ImageTransferManager', () => {
  let manager: ImageTransferManager;

  beforeEach(() => {
    manager = new ImageTransferManager();
    jest.useFakeTimers();
  });

  afterEach(() => {
    manager.cleanup();
    jest.useRealTimers();
  });

  test('assembles chunks into complete buffer when all received', () => {
    const transferId = 'test-transfer-1';
    const chunkData = [
      Buffer.from('chunk0'),
      Buffer.from('chunk1'),
      Buffer.from('chunk2'),
    ];

    manager.startTransfer(transferId, 3, chunkData[0].length * 3);

    expect(manager.addChunk(transferId, 0, chunkData[0])).toBeNull();
    expect(manager.addChunk(transferId, 1, chunkData[1])).toBeNull();

    const result = manager.addChunk(transferId, 2, chunkData[2]);
    expect(result).not.toBeNull();
    expect(result!.toString()).toBe('chunk0chunk1chunk2');
  });

  test('returns null for unknown transferId', () => {
    const result = manager.addChunk('unknown', 0, Buffer.from('data'));
    expect(result).toBeNull();
  });

  test('handles out-of-order chunks', () => {
    manager.startTransfer('ooo', 3, 300);

    expect(manager.addChunk('ooo', 2, Buffer.from('CC'))).toBeNull();
    expect(manager.addChunk('ooo', 0, Buffer.from('AA'))).toBeNull();

    const result = manager.addChunk('ooo', 1, Buffer.from('BB'));
    expect(result).not.toBeNull();
    expect(result!.toString()).toBe('AABBCC');
  });

  test('ignores duplicate chunks', () => {
    manager.startTransfer('dup', 2, 200);

    expect(manager.addChunk('dup', 0, Buffer.from('first'))).toBeNull();
    expect(manager.addChunk('dup', 0, Buffer.from('duplicate'))).toBeNull(); // should be ignored

    const result = manager.addChunk('dup', 1, Buffer.from('second'));
    expect(result).not.toBeNull();
    expect(result!.toString()).toBe('firstsecond'); // 'first' not 'duplicate'
  });

  test('sweepStale removes timed-out transfers', () => {
    manager.startTransfer('stale', 2, 100);
    manager.addChunk('stale', 0, Buffer.from('partial'));

    jest.advanceTimersByTime(CLIPBOARD_TRANSFER_TIMEOUT_MS + 100);
    manager.sweepStale();

    // After sweep, transfer is gone
    const result = manager.addChunk('stale', 1, Buffer.from('late'));
    expect(result).toBeNull();
  });

  test('abortTransfer removes the in-flight transfer', () => {
    manager.startTransfer('abort-me', 3, 300);
    manager.addChunk('abort-me', 0, Buffer.from('data'));

    manager.abortTransfer('abort-me');

    const result = manager.addChunk('abort-me', 1, Buffer.from('data'));
    expect(result).toBeNull();
  });

  test('cleanup removes all transfers', () => {
    manager.startTransfer('a', 2, 100);
    manager.startTransfer('b', 2, 100);

    manager.cleanup();

    expect(manager.addChunk('a', 0, Buffer.from('x'))).toBeNull();
    expect(manager.addChunk('b', 0, Buffer.from('x'))).toBeNull();
  });
});
