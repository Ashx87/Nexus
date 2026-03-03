jest.mock('systray2', () => ({
  default: jest.fn().mockImplementation(() => ({
    onClick: jest.fn().mockResolvedValue(undefined),
    kill: jest.fn().mockResolvedValue(undefined),
  })),
  separator: { title: '<SEPARATOR>', tooltip: '', checked: false, enabled: false },
}));

jest.mock('child_process', () => ({
  execSync: jest.fn(),
}));

import { execSync } from 'child_process';
import { TrayManager } from '../modules/tray';

describe('TrayManager', () => {
  beforeEach(() => jest.clearAllMocks());

  it('constructs without throwing', () => {
    expect(() => new TrayManager()).not.toThrow();
  });

  it('isAutoStartEnabled returns false when registry query throws', () => {
    (execSync as jest.Mock).mockImplementation(() => { throw new Error('not found'); });
    const tray = new TrayManager();
    expect(tray.isAutoStartEnabled()).toBe(false);
  });

  it('isAutoStartEnabled returns true when registry entry present', () => {
    (execSync as jest.Mock).mockReturnValue(Buffer.from('Nexus    REG_SZ    C:\\nexus.exe'));
    const tray = new TrayManager();
    expect(tray.isAutoStartEnabled()).toBe(true);
  });

  it('enableAutoStart calls reg add command', () => {
    const tray = new TrayManager();
    tray.enableAutoStart('C:\\nexus.exe');
    expect(execSync).toHaveBeenCalledWith(
      expect.stringContaining('reg add'),
      expect.objectContaining({ stdio: 'pipe' }),
    );
  });

  it('disableAutoStart calls reg delete command', () => {
    const tray = new TrayManager();
    tray.disableAutoStart();
    expect(execSync).toHaveBeenCalledWith(
      expect.stringContaining('reg delete'),
      expect.objectContaining({ stdio: 'pipe' }),
    );
  });
});
