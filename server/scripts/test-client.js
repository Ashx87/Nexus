// E2E connectivity test script
// Usage: node scripts/test-client.js [host] [port]
// Example: node scripts/test-client.js localhost 9001

const WebSocket = require('ws');

const host = process.argv[2] || '127.0.0.1'; // avoid IPv6 ::1 on systems where localhost resolves to IPv6
const port = process.argv[3] || 9001;
const url = `ws://${host}:${port}`;

console.log(`[test-client] connecting to ${url}...`);

const ws = new WebSocket(url);

ws.on('open', () => {
  console.log('[test-client] connected');
  ws.send(JSON.stringify({ module: 'connection', action: 'ping', payload: {} }));
  console.log('[test-client] sent ping');
});

ws.on('message', (data) => {
  const msg = JSON.parse(data.toString());
  console.log('[test-client] received:', JSON.stringify(msg));

  if (msg.module === 'connection' && msg.action === 'pong') {
    console.log('[test-client] ✅ PASS: ping/pong verified');
    ws.close();
    process.exit(0);
  }
});

ws.on('error', (err) => {
  console.error('[test-client] ❌ FAIL:', err.message);
  process.exit(1);
});

ws.on('close', () => {
  console.log('[test-client] connection closed');
});

setTimeout(() => {
  console.error('[test-client] ❌ FAIL: timeout waiting for pong (5s)');
  process.exit(1);
}, 5000);
