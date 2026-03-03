import 'dotenv/config';
import { createServer } from './server';
import { startDiscovery } from './discovery';
import { config } from './config';
import { TrayManager } from './modules/tray';

console.log('[nexus] starting Nexus server...');
console.log('[nexus] Port', config.port, '— make sure Windows Firewall allows it');

const wss = createServer();
startDiscovery();

const tray = new TrayManager();
tray.start(() => {
  console.log('[nexus] quit from tray');
  wss.close(() => process.exit(0));
});

let clientCount = 0;
wss.on('connection', () => {
  clientCount += 1;
  tray.updateClientCount(clientCount);
});
