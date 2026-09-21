import { app } from '../../backend/src/app.js';
import http from 'http';
import { initializeSockets } from '../../backend/src/sockets/index.js';

let testServer: http.Server | null = null;

export function getTestApp() {
  return app;
}

export function createTestServerWithSockets(port: number = 0): Promise<{ server: http.Server, io: any, port: number }> {
  return new Promise((resolve) => {
    testServer = http.createServer(app);
    const io = initializeSockets(testServer);
    
    testServer.listen(port, () => {
      const address = testServer?.address();
      const actualPort = typeof address === 'object' && address ? address.port : port;
      resolve({ server: testServer!, io, port: actualPort });
    });
  });
}

export async function closeTestServer() {
  if (testServer) {
    await new Promise<void>((resolve) => {
      testServer!.close(() => resolve());
    });
    testServer = null;
  }
}
