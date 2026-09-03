import axios from 'axios';
import crypto from 'crypto';
import logger from '../config/logger.js';

export interface WebhookPayload {
  event: string;
  timestamp: string;
  data: any;
}

export interface WebhookConfig {
  id: string;
  url: string;
  secret: string;
  events: string[]; // e.g., ['attendance.check-in', 'leave.approved']
}

// In-memory mock webhook configurations.
// In a real enterprise app, this would be fetched from the database per organization.
const WEBHOOK_CONFIGS: WebhookConfig[] = [
  // {
  //   id: 'wh-123',
  //   url: 'https://example.com/webhooks/wfa',
  //   secret: 'whsec_enterprise_secret_key',
  //   events: ['attendance.check-in']
  // }
];

export class WebhookDispatcher {
  /**
   * Dispatches an event to all registered and subscribed webhooks.
   */
  public static async dispatch(event: string, data: any): Promise<void> {
    const payload: WebhookPayload = {
      event,
      timestamp: new Date().toISOString(),
      data,
    };

    const payloadString = JSON.stringify(payload);

    // Find all webhooks subscribed to this event
    const subscribers = WEBHOOK_CONFIGS.filter(config => 
      config.events.includes(event) || config.events.includes('*')
    );

    if (subscribers.length === 0) return;

    logger.info('webhook.dispatching', `Dispatching ${event} to ${subscribers.length} endpoints`);

    // Fire webhooks asynchronously in parallel
    Promise.allSettled(
      subscribers.map(config => this.sendWebhook(config, payloadString))
    ).catch(err => {
      logger.error('webhook.dispatch.failed', 'Error during webhook batch dispatch', err);
    });
  }

  private static async sendWebhook(config: WebhookConfig, payloadString: string): Promise<void> {
    try {
      const signature = this.generateSignature(payloadString, config.secret);

      await axios.post(config.url, payloadString, {
        headers: {
          'Content-Type': 'application/json',
          'X-WFA-Signature': signature,
          'X-WFA-Event': JSON.parse(payloadString).event,
          'X-WFA-Timestamp': JSON.parse(payloadString).timestamp,
        },
        timeout: 5000, // Strict timeout for webhooks
      });

      logger.info('webhook.delivered', `Successfully delivered webhook to ${config.url}`);
    } catch (error: any) {
      logger.error('webhook.delivery.failed', `Failed to deliver webhook to ${config.url}`, {
        error: error.message,
        status: error.response?.status
      });
      // A robust system would enqueue this failure to a dead-letter queue or retry mechanism (like RabbitMQ/BullMQ)
    }
  }

  private static generateSignature(payload: string, secret: string): string {
    return 'sha256=' + crypto.createHmac('sha256', secret).update(payload).digest('hex');
  }
}
