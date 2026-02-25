import 'dotenv/config';
import { createServer } from './server';
import { startDiscovery } from './discovery';
import { config } from './config';

console.log('[nexus] starting Nexus server...');
console.log('[nexus] ⚠️  Make sure port', config.port, 'is open in Windows Firewall');

createServer();
startDiscovery();
