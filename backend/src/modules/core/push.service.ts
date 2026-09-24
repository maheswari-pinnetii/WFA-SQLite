import { query, execute } from '../../database/connection';

export class PushService {
  /**
   * Registers or updates an FCM token for a user
   */
  static async registerToken(userId: string, token: string, deviceType: string = 'web'): Promise<void> {
    await execute(`
      INSERT OR REPLACE INTO device_tokens (token, userId, deviceType, createdAt)
      VALUES (?, ?, ?, CURRENT_TIMESTAMP)
    `, [token, userId, deviceType]);
    console.log(`[PushService] Registered push token for user ${userId} on device ${deviceType}`);
  }

  /**
   * Sends a mock push notification via FCM
   */
  static async sendPushNotification(userId: string, title: string, body: string, data?: any): Promise<void> {
    // 1. Get all tokens for the user
    const tokens = await query(`SELECT token, deviceType FROM device_tokens WHERE userId = ?`, [userId]);
    
    if (!tokens || tokens.length === 0) {
      console.log(`[PushService] No push tokens found for user ${userId}. Notification aborted.`);
      return;
    }

    // 2. Mock sending via FCM
    console.log(`[PushService] Sending Push Notification to user ${userId} (${tokens.length} devices)`);
    console.log(`[PushService] Title: ${title} | Body: ${body}`);
    if (data) {
      console.log(`[PushService] Data Payload: ${JSON.stringify(data)}`);
    }

    // In a real environment, you would use firebase-admin:
    // const message = { notification: { title, body }, data, tokens: tokens.map(t => t.token) };
    // await admin.messaging().sendMulticast(message);
    
    console.log(`[PushService] Successfully simulated push notification dispatch.`);
  }
}
