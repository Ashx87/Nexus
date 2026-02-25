import Bonjour from 'bonjour-service';
import { config } from './config';
import { networkInterfaces } from 'os';

function getLocalIP(): string {
  const nets = networkInterfaces();
  for (const iface of Object.values(nets)) {
    if (!iface) continue;
    for (const net of iface) {
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return 'unknown';
}

export function startDiscovery(): void {
  const localIP = getLocalIP();
  console.log(
    `[nexus] server reachable at ws://${localIP}:${config.port} (open this port in Windows Firewall if needed)`,
  );

  try {
    const bonjour = new Bonjour();
    bonjour.publish({
      name: config.serviceName,
      type: config.serviceType,
      port: config.port,
      txt: { version: '0.1.0' },
    });
    console.log(
      `[discovery] mDNS service published: ${config.serviceName} (_${config.serviceType}._tcp) on port ${config.port}`,
    );

    process.on('SIGINT', () => {
      bonjour.unpublishAll(() => {
        bonjour.destroy();
        process.exit(0);
      });
    });
  } catch (err) {
    console.warn('[discovery] mDNS unavailable, falling back to manual IP:', err);
    console.warn(`[discovery] clients must connect manually to ws://${localIP}:${config.port}`);
  }
}
