import client from 'prom-client';
import responseTime from 'response-time';
import { Express } from 'express';

// Collect default system metrics (CPU, RAM, Node Event Loop)
client.collectDefaultMetrics();

// Define custom HTTP metrics
export const httpRequestDurationMicroseconds = new client.Histogram({
  name: 'http_request_duration_ms',
  help: 'Duration of HTTP requests in ms',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [10, 50, 100, 250, 500, 1000, 2500, 5000],
});

export const setupMetrics = (app: Express): void => {
  // Middleware to track response time and record metrics
  app.use(responseTime((req: any, res: any, time: number) => {
    if (req?.route?.path) {
      httpRequestDurationMicroseconds
        .labels(req.method, req.route.path, res.statusCode.toString())
        .observe(time);
    }
  }));

  // Expose metrics endpoint
  app.get('/metrics', async (req, res) => {
    res.set('Content-Type', client.register.contentType);
    res.end(await client.register.metrics());
  });
};
