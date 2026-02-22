import { WebSocketServer, WebSocket } from 'ws';
import { ServerInfoMessage } from '@nexus/shared';
import { config } from './config';
import { route } from './router';

let clientCount = 0;

interface ServerOptions {
  readonly port?: number;
}

export function createServer(options?: ServerOptions): WebSocketServer {
  const port = options?.port ?? config.port;
  const wss = new WebSocketServer({ host: config.host, port });

  wss.on('listening', () => {
    const addr = wss.address() as { port: number };
    console.log(`[server] WebSocket listening on ws://${config.host}:${addr.port}`);
  });

  wss.on('connection', (ws: WebSocket, req) => {
    const clientIp = req.socket.remoteAddress ?? 'unknown';
    clientCount += 1;
    console.log(`[server] client connected: ${clientIp} (${clientCount} total)`);

    // Send server info immediately on connect
    const serverInfo: ServerInfoMessage = {
      module: 'connection',
      action: 'server_info',
      payload: { name: config.serviceName, version: config.serverVersion },
    };
    ws.send(JSON.stringify(serverInfo));

    // WS protocol-level heartbeat: detects broken TCP connections
    let isAlive = true;
    ws.on('pong', () => {
      isAlive = true;
    });

    const pingTimer = setInterval(() => {
      if (!isAlive) {
        console.warn(`[server] client ${clientIp} not responding to WS ping, terminating`);
        clearInterval(pingTimer);
        ws.terminate();
        return;
      }
      isAlive = false;
      ws.ping();
    }, config.heartbeatTimeout);

    ws.on('message', (data) => {
      route(ws, data.toString());
    });

    ws.on('close', () => {
      clearInterval(pingTimer);
      clientCount -= 1;
      console.log(`[server] client disconnected: ${clientIp} (${clientCount} remaining)`);
    });

    ws.on('error', (err) => {
      clearInterval(pingTimer);
      console.error(`[server] error from ${clientIp}:`, err.message);
    });
  });

  return wss;
}
