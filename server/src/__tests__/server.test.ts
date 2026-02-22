import { WebSocket, WebSocketServer } from 'ws';
import { ServerInfoMessage } from '@nexus/shared';
import { createServer } from '../server';

function connectClient(port: number): Promise<WebSocket> {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(`ws://127.0.0.1:${port}`);
    ws.on('open', () => resolve(ws));
    ws.on('error', reject);
  });
}

function waitForMessage(ws: WebSocket): Promise<string> {
  return new Promise((resolve) => {
    ws.once('message', (data) => resolve(data.toString()));
  });
}

describe('server', () => {
  let wss: WebSocketServer;
  let clientWs: WebSocket;

  afterEach(async () => {
    clientWs?.close();
    if (wss) {
      await new Promise<void>((resolve) => wss.close(() => resolve()));
    }
  });

  test('sends server_info immediately on client connect', async () => {
    wss = createServer({ port: 0 });
    await new Promise<void>((resolve) => wss.once('listening', resolve));
    const addr = wss.address() as { port: number };

    // Set up message listener before connecting so we don't miss the first message
    clientWs = new WebSocket(`ws://127.0.0.1:${addr.port}`);
    const messagePromise = waitForMessage(clientWs);
    await new Promise<void>((resolve) => clientWs.once('open', resolve));

    const raw = await messagePromise;
    const msg = JSON.parse(raw) as ServerInfoMessage;
    expect(msg.module).toBe('connection');
    expect(msg.action).toBe('server_info');
    expect(msg.payload.name).toBe('Nexus');
    expect(typeof msg.payload.version).toBe('string');
  });
});
