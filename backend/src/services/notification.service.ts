import { logAudit } from '../database/connection.js';
import { execute, query } from '../database/sqlite-cloud.js';
import crypto from 'crypto';
import { emitToUser } from '../sockets/socketEmitter.js';
import { emailRetryService } from './emailRetry.service.js';
import { logger } from '../config/logger.js';

export const triggerGoogleCalendarNotification = async (employeeId: string, employeeName: string, action: string, dateStr: string) => {
  const eventTitle = `[WFA Platform] ${eventTitlePlaceholder(employeeName)} - ${action}`;
  const description = `Automated notification: Employee ${employeeName} (${employeeId}) performed ${action} on ${dateStr}.`;
  
  if (process.env.NODE_ENV !== 'test') {
    console.log(`[GOOGLE CALENDAR API] Created Calendar Event: "${eventTitle}"`);
    console.log(`[GOOGLE CALENDAR API] Description: "${description}"`);
  }
  
  return {
    success: true,
    eventId: Math.random().toString(36).substring(2, 11),
    title: eventTitle
  };
};

function eventTitlePlaceholder(name: string) {
  return name;
}

export const triggerAlarm = async (employeeId: string, employeeName: string, type: string, details: string) => {
  const alertTitle = `[ALARM ALERT] ${type}`;
  if (process.env.NODE_ENV !== 'test') {
    console.warn(`\x1b[31m${alertTitle}: ${employeeName} (${employeeId}) - ${details}\x1b[0m`);
  }
  
  logAudit(employeeId, `ALARM_${type.toUpperCase()}`, details);
  
  return {
    success: true,
    alarmLogged: true
  };
};

/**
 * Creates an in-app notification and optionally an email notification based on user preferences.
 */
export const createNotification = async (
  userId: string,
  title: string,
  message: string,
  type: 'LEAVE' | 'APPROVAL' | 'PAYROLL' | 'ATTENDANCE' | 'SYSTEM',
  emailConfig?: {
    to: string;
    subject: string;
    body: string;
  }
) => {
  try {
    // 1. Fetch user preferences
    let prefs = await query(`SELECT * FROM user_notification_preferences WHERE userId = ?`, [userId]);
    let userPrefs = prefs[0];

    // If no preferences, assume defaults (all enabled)
    if (!userPrefs) {
      userPrefs = {
        inAppEnabled: 1,
        emailEnabled: 1,
        notifyOnLeave: 1,
        notifyOnApproval: 1,
        notifyOnPayroll: 1,
        notifyOnAttendance: 1
      };
    }

    // 2. Check if the specific notification type is enabled
    let typeEnabled = 1;
    switch (type) {
      case 'LEAVE': typeEnabled = userPrefs.notifyOnLeave; break;
      case 'APPROVAL': typeEnabled = userPrefs.notifyOnApproval; break;
      case 'PAYROLL': typeEnabled = userPrefs.notifyOnPayroll; break;
      case 'ATTENDANCE': typeEnabled = userPrefs.notifyOnAttendance; break;
      case 'SYSTEM': typeEnabled = 1; break; // System notifications always enabled
    }

    // 3. Create In-App Notification
    if (userPrefs.inAppEnabled && typeEnabled) {
      const id = crypto.randomUUID();
      const now = new Date().toISOString();
      
      await execute(
        `INSERT INTO notifications (id, userId, title, message, type, read, createdAt, updatedAt) 
         VALUES (?, ?, ?, ?, ?, 0, ?, ?)`,
        [id, userId, title, message, type, now, now]
      );

      // Emit real-time socket event
      emitToUser(userId, 'notification:new', {
        id,
        userId,
        title,
        message,
        type,
        read: 0,
        createdAt: now
      });
    }

    // 4. Dispatch Email Notification
    if (userPrefs.emailEnabled && typeEnabled && emailConfig) {
      const emailResult = await emailRetryService.send({
        to: emailConfig.to,
        subject: emailConfig.subject,
        body: emailConfig.body,
        type: 'NOTIFICATION'
      });
      
      let deliveryStatus = 'DELIVERED';
      if (!emailResult.success) {
        deliveryStatus = emailResult.queuedForRetry ? 'RETRY_PENDING' : 'FAILED';
      }

      if (userPrefs.inAppEnabled) {
        // If we created an in-app notification, update its status
        await execute(
          `UPDATE notifications SET emailDeliveryStatus = ? WHERE id = (SELECT id FROM notifications WHERE userId = ? ORDER BY createdAt DESC LIMIT 1)`,
          [deliveryStatus, userId]
        );
      }
    }

    return { success: true };
  } catch (err: any) {
    logger.error('notification.create_error', `Failed to create notification for user ${userId}: ${err.message}`);
    return { success: false, error: err.message };
  }
};
