import { CLIPBOARD_TRANSFER_TIMEOUT_MS } from '@nexus/shared';

interface InFlightTransfer {
  readonly totalChunks: number;
  readonly expectedSize: number;
  readonly chunks: readonly (Buffer | null)[];
  receivedCount: number;
  lastChunkTime: number;
}

export class ImageTransferManager {
  private transfers = new Map<string, InFlightTransfer>();

  startTransfer(transferId: string, totalChunks: number, expectedSize: number): void {
    this.transfers.set(transferId, {
      totalChunks,
      expectedSize,
      chunks: new Array<Buffer | null>(totalChunks).fill(null),
      receivedCount: 0,
      lastChunkTime: Date.now(),
    });
  }

  addChunk(transferId: string, chunkIndex: number, data: Buffer): Buffer | null {
    const transfer = this.transfers.get(transferId);
    if (transfer === undefined) {
      return null;
    }

    if (chunkIndex < 0 || chunkIndex >= transfer.totalChunks) {
      return null;
    }

    // Ignore duplicate chunks — only accept if slot is still empty
    if (transfer.chunks[chunkIndex] === null) {
      // Create new chunks array with the updated slot (immutable pattern)
      const updatedChunks = transfer.chunks.map((chunk, i) =>
        i === chunkIndex ? data : chunk,
      );
      // Update the transfer entry with new state
      const updatedTransfer: InFlightTransfer = {
        ...transfer,
        chunks: updatedChunks,
        receivedCount: transfer.receivedCount + 1,
        lastChunkTime: Date.now(),
      };
      this.transfers.set(transferId, updatedTransfer);

      if (updatedTransfer.receivedCount === updatedTransfer.totalChunks) {
        const assembled = Buffer.concat(updatedTransfer.chunks as Buffer[]);
        this.transfers.delete(transferId);
        return assembled;
      }
    }

    return null;
  }

  abortTransfer(transferId: string): void {
    this.transfers.delete(transferId);
  }

  sweepStale(): void {
    const now = Date.now();
    const staleIds: string[] = [];
    for (const [id, transfer] of this.transfers) {
      if (now - transfer.lastChunkTime > CLIPBOARD_TRANSFER_TIMEOUT_MS) {
        console.warn(`[image-transfer] stale transfer ${id} timed out, removing`);
        staleIds.push(id);
      }
    }
    for (const id of staleIds) {
      this.transfers.delete(id);
    }
  }

  cleanup(): void {
    this.transfers.clear();
  }
}
