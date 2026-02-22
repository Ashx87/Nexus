import { readFileSync } from 'fs';
import { join } from 'path';
import { HEARTBEAT_INTERVAL_MS, HEARTBEAT_TIMEOUT_MS } from '@nexus/shared';

const pkg = JSON.parse(
  readFileSync(join(__dirname, '..', 'package.json'), 'utf-8'),
);

export const config = {
  port: Number(process.env.PORT) || 9001,
  host: '0.0.0.0',
  heartbeatInterval: HEARTBEAT_INTERVAL_MS,
  heartbeatTimeout: HEARTBEAT_TIMEOUT_MS,
  serviceName: process.env.SERVICE_NAME || 'Nexus',
  serviceType: 'nexus',
  serverVersion: pkg.version as string,
} as const;
