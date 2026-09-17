import { Request, Response } from 'express';
import { query, execute } from '../database/sqlite-cloud.js';
import crypto from 'crypto';

export const getNotifications = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;
    
    // Using string interpolation for limit/offset because they are safe integers and sqlite-cloud sometimes has issues with them as bound params
    const notifications = await query(
      `SELECT * FROM notifications 
       WHERE userId = ? 
       ORDER BY createdAt DESC 
       LIMIT ${limit} OFFSET ${offset}`,
      [userId]
    );

    const unreadCountRow = await query(
      `SELECT COUNT(*) as count FROM notifications WHERE userId = ? AND read = 0`,
      [userId]
    );
    const unreadCount = unreadCountRow[0]?.count || 0;

    res.json({
      success: true,
      data: notifications,
      meta: {
        unreadCount,
        limit,
        offset
      }
    });
  } catch (error: any) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch notifications' });
  }
};

export const markAsRead = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { id } = req.params;
    
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    await execute(
      `UPDATE notifications SET read = 1, updatedAt = ? WHERE id = ? AND userId = ?`,
      [new Date().toISOString(), id, userId]
    );

    res.json({ success: true, message: 'Notification marked as read' });
  } catch (error: any) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ success: false, message: 'Failed to update notification' });
  }
};

export const markAllAsRead = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    await execute(
      `UPDATE notifications SET read = 1, updatedAt = ? WHERE userId = ? AND read = 0`,
      [new Date().toISOString(), userId]
    );

    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error: any) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ success: false, message: 'Failed to update notifications' });
  }
};

export const getPreferences = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    let prefs = await query(
      `SELECT * FROM user_notification_preferences WHERE userId = ?`,
      [userId]
    );

    if (!prefs.length) {
      // Default preferences if not exist
      const newId = crypto.randomUUID();
      const now = new Date().toISOString();
      await execute(
        `INSERT INTO user_notification_preferences 
         (id, userId, inAppEnabled, emailEnabled, notifyOnLeave, notifyOnApproval, notifyOnPayroll, notifyOnAttendance, createdAt, updatedAt) 
         VALUES (?, ?, 1, 1, 1, 1, 1, 1, ?, ?)`,
        [newId, userId, now, now]
      );
      
      prefs = await query(
        `SELECT * FROM user_notification_preferences WHERE userId = ?`,
        [userId]
      );
    }

    // Convert integer booleans to actual booleans for the frontend
    const p = prefs[0];
    res.json({
      success: true,
      data: {
        id: p.id,
        userId: p.userId,
        inAppEnabled: !!p.inAppEnabled,
        emailEnabled: !!p.emailEnabled,
        notifyOnLeave: !!p.notifyOnLeave,
        notifyOnApproval: !!p.notifyOnApproval,
        notifyOnPayroll: !!p.notifyOnPayroll,
        notifyOnAttendance: !!p.notifyOnAttendance
      }
    });
  } catch (error: any) {
    console.error('Error fetching notification preferences:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch notification preferences' });
  }
};

export const updatePreferences = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const {
      inAppEnabled,
      emailEnabled,
      notifyOnLeave,
      notifyOnApproval,
      notifyOnPayroll,
      notifyOnAttendance
    } = req.body;

    await execute(
      `UPDATE user_notification_preferences SET 
       inAppEnabled = ?, 
       emailEnabled = ?, 
       notifyOnLeave = ?, 
       notifyOnApproval = ?, 
       notifyOnPayroll = ?, 
       notifyOnAttendance = ?, 
       updatedAt = ? 
       WHERE userId = ?`,
      [
        inAppEnabled ? 1 : 0,
        emailEnabled ? 1 : 0,
        notifyOnLeave ? 1 : 0,
        notifyOnApproval ? 1 : 0,
        notifyOnPayroll ? 1 : 0,
        notifyOnAttendance ? 1 : 0,
        new Date().toISOString(),
        userId
      ]
    );

    res.json({ success: true, message: 'Notification preferences updated' });
  } catch (error: any) {
    console.error('Error updating notification preferences:', error);
    res.status(500).json({ success: false, message: 'Failed to update notification preferences' });
  }
};
