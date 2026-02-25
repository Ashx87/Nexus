import { WebSocketServer, WebSocket } from 'ws';
import { route } from '../router';
import { PongMessage, ErrorMessage } from '@nexus/shared';

function createTestServer(): Promise<{ wss: WebSocketServer; port: number }> {
  return new Promise((resolve) => {
    const wss = new WebSocketServer({ port: 0 });
    wss.on('listening', () => {
      const addr = wss.address() as { port: number };
      resolve({ wss, port: addr.port });
    });
  });
}

function connectClient(port: number): Promise<WebSocket> {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(`ws://localhost:${port}`);
    ws.on('open', () => resolve(ws));
    ws.on('error', reject);
  });
}

function waitForMessage(ws: WebSocket): Promise<string> {
  return new Promise((resolve) => {
    ws.once('message', (data) => resolve(data.toString()));
  });
}

describe('router', () => {
  let wss: WebSocketServer;
  let serverWs: WebSocket;
  let clientWs: WebSocket;
  let port: number;

  beforeEach(async () => {
    ({ wss, port } = await createTestServer());

    const serverConnected = new Promise<WebSocket>((resolve) => {
      wss.once('connection', (ws) => {
        serverWs = ws;
        resolve(ws);
      });
    });

    clientWs = await connectClient(port);
    await serverConnected;
  });

  afterEach(async () => {
    clientWs.close();
    await new Promise<void>((resolve) => wss.close(() => resolve()));
  });

  test('valid ping returns pong', async () => {
    const messagePromise = waitForMessage(clientWs);
    route(serverWs, JSON.stringify({ module: 'connection', action: 'ping', payload: {} }));

    const raw = await messagePromise;
    const msg = JSON.parse(raw) as PongMessage;
    expect(msg.module).toBe('connection');
    expect(msg.action).toBe('pong');
  });

  test('invalid JSON returns error and does not crash', async () => {
    const messagePromise = waitForMessage(clientWs);
    route(serverWs, 'not valid json {{{');

    const raw = await messagePromise;
    const msg = JSON.parse(raw) as ErrorMessage;
    expect(msg.module).toBe('connection');
    expect(msg.action).toBe('error');
    expect(msg.payload.code).toBe('INVALID_JSON');
  });

  test('unknown module returns error and does not crash', async () => {
    const messagePromise = waitForMessage(clientWs);
    route(serverWs, JSON.stringify({ module: 'unknown_mod', action: 'foo', payload: {} }));

    const raw = await messagePromise;
    const msg = JSON.parse(raw) as ErrorMessage;
    expect(msg.module).toBe('connection');
    expect(msg.action).toBe('error');
    expect(msg.payload.code).toBe('UNKNOWN_MODULE');
  });

  test('missing module field returns error', async () => {
    const messagePromise = waitForMessage(clientWs);
    route(serverWs, JSON.stringify({ action: 'ping', payload: {} }));

    const raw = await messagePromise;
    const msg = JSON.parse(raw) as ErrorMessage;
    expect(msg.payload.code).toBe('PAYLOAD_INVALID');
  });
});
