import { execFile as execFileCb } from 'child_process';

const READ_IMAGE_PS = `
Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing
$img = [System.Windows.Forms.Clipboard]::GetImage()
if ($img) {
  $ms = New-Object System.IO.MemoryStream
  $img.Save($ms, [System.Drawing.Imaging.ImageFormat]::Png)
  [Convert]::ToBase64String($ms.ToArray())
  $ms.Dispose()
  $img.Dispose()
}
`.trim();

function buildWriteImagePs(base64: string): string {
  return `
Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing
$bytes = [Convert]::FromBase64String('${base64}')
$ms = New-Object System.IO.MemoryStream(,$bytes)
$img = [System.Drawing.Image]::FromStream($ms)
[System.Windows.Forms.Clipboard]::SetImage($img)
$img.Dispose()
$ms.Dispose()
`.trim();
}

export function readClipboardImage(): Promise<Buffer | null> {
  return new Promise((resolve) => {
    execFileCb(
      'powershell',
      ['-NoProfile', '-Command', READ_IMAGE_PS],
      { maxBuffer: 100 * 1024 * 1024 },
      (err, stdout) => {
        if (err) {
          console.error('[clipboard-image] read failed:', err.message);
          resolve(null);
          return;
        }
        const trimmed = (stdout as string).trim();
        if (trimmed === '') {
          resolve(null);
          return;
        }
        resolve(Buffer.from(trimmed, 'base64'));
      },
    );
  });
}

export function writeClipboardImage(buffer: Buffer): Promise<void> {
  const base64 = buffer.toString('base64');
  return new Promise((resolve, reject) => {
    execFileCb(
      'powershell',
      ['-NoProfile', '-Command', buildWriteImagePs(base64)],
      { maxBuffer: 100 * 1024 * 1024 },
      (err) => {
        if (err) {
          reject(err);
          return;
        }
        resolve();
      },
    );
  });
}
