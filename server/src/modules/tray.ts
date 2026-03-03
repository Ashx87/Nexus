import { execSync } from 'child_process';
import { join } from 'path';
import SysTray from 'systray2';
import type { ClickEvent } from 'systray2';

const REG_KEY = 'HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run';
const REG_NAME = 'Nexus';

export class TrayManager {
  private tray: SysTray | null = null;
  private _autoStartEnabled: boolean;

  constructor() {
    this._autoStartEnabled = this.isAutoStartEnabled();
  }

  isAutoStartEnabled(): boolean {
    try {
      const out = execSync(`reg query "${REG_KEY}" /v "${REG_NAME}"`, { stdio: 'pipe' });
      return out.toString().includes(REG_NAME);
    } catch {
      return false;
    }
  }

  enableAutoStart(exePath: string): void {
    try {
      execSync(
        `reg add "${REG_KEY}" /v "${REG_NAME}" /t REG_SZ /d "${exePath}" /f`,
        { stdio: 'pipe' },
      );
      this._autoStartEnabled = true;
    } catch (err) {
      console.warn('[tray] auto-start failed (may need admin):', (err as Error).message);
    }
  }

  disableAutoStart(): void {
    try {
      execSync(`reg delete "${REG_KEY}" /v "${REG_NAME}" /f`, { stdio: 'pipe' });
      this._autoStartEnabled = false;
    } catch (err) {
      console.warn('[tray] disable auto-start failed:', (err as Error).message);
    }
  }

  start(onQuit: () => void): void {
    const iconPath = join(__dirname, '..', '..', 'assets', 'icon.ico');
    try {
      this.tray = new SysTray({
        menu: {
          icon: iconPath,
          title: 'Nexus',
          tooltip: 'Nexus — Windows Remote Control',
          items: [
            { title: 'Nexus Server', tooltip: 'Waiting for clients', checked: false, enabled: false },
            SysTray.separator,
            {
              title: `Start on Boot: ${this._autoStartEnabled ? 'ON' : 'OFF'}`,
              tooltip: 'Toggle launch at Windows startup',
              checked: this._autoStartEnabled,
              enabled: true,
            },
            SysTray.separator,
            { title: 'Quit', tooltip: 'Stop the server', checked: false, enabled: true },
          ],
        },
        debug: false,
        copyDir: true,
      });

      void this.tray.onClick((action: ClickEvent) => {
        if (action.seq_id === 2) {
          if (this._autoStartEnabled) {
            this.disableAutoStart();
          } else {
            this.enableAutoStart(process.execPath);
          }
        } else if (action.seq_id === 4) {
          this.stop();
          onQuit();
        }
      });
    } catch (err) {
      console.warn('[tray] unavailable (non-Windows or missing icon):', (err as Error).message);
    }
  }

  updateClientCount(count: number): void {
    console.log(`[tray] clients connected: ${count}`);
  }

  stop(): void {
    if (this.tray) {
      void this.tray.kill(false);
      this.tray = null;
    }
  }
}
