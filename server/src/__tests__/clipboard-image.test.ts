import { execFile } from 'child_process';

jest.mock('child_process', () => ({
  execFile: jest.fn(),
}));

const mockExecFile = execFile as unknown as jest.Mock;

import { readClipboardImage, writeClipboardImage } from '../modules/clipboard-image';

describe('clipboard-image', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('readClipboardImage', () => {
    test('returns Buffer when clipboard has an image', async () => {
      const fakeBase64 = Buffer.from('fake-png-data').toString('base64');
      mockExecFile.mockImplementation(
        (_cmd: string, _args: string[], _opts: unknown, cb: (err: Error | null, stdout: string, stderr: string) => void) => {
          cb(null, fakeBase64, '');
        },
      );

      const result = await readClipboardImage();
      expect(result).not.toBeNull();
      expect(result!.toString()).toBe('fake-png-data');
    });

    test('returns null when clipboard has no image', async () => {
      mockExecFile.mockImplementation(
        (_cmd: string, _args: string[], _opts: unknown, cb: (err: Error | null, stdout: string, stderr: string) => void) => {
          cb(null, '', '');
        },
      );

      const result = await readClipboardImage();
      expect(result).toBeNull();
    });

    test('returns null when PowerShell fails', async () => {
      mockExecFile.mockImplementation(
        (_cmd: string, _args: string[], _opts: unknown, cb: (err: Error | null) => void) => {
          cb(new Error('powershell error'));
        },
      );

      const result = await readClipboardImage();
      expect(result).toBeNull();
    });
  });

  describe('writeClipboardImage', () => {
    test('calls PowerShell to write image to clipboard', async () => {
      mockExecFile.mockImplementation(
        (_cmd: string, _args: string[], _opts: unknown, cb: (err: Error | null, stdout: string, stderr: string) => void) => {
          cb(null, '', '');
        },
      );

      const buffer = Buffer.from('fake-image-data');
      await expect(writeClipboardImage(buffer)).resolves.toBeUndefined();
      expect(mockExecFile).toHaveBeenCalled();
    });

    test('throws when PowerShell write fails', async () => {
      mockExecFile.mockImplementation(
        (_cmd: string, _args: string[], _opts: unknown, cb: (err: Error | null) => void) => {
          cb(new Error('write failed'));
        },
      );

      const buffer = Buffer.from('fake-image-data');
      await expect(writeClipboardImage(buffer)).rejects.toThrow('write failed');
    });
  });
});
