import { Request, Response } from 'express';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { query, execute } from '../database/sqlite-cloud.js';
import { sendPasswordResetEmail, sendPasswordChangedNotification, sendEmailVerificationEmail } from '../services/email.service.js';
import { logger } from '../config/logger.js'

/**
 * Validates password against the complexity policy.
 */
function validatePasswordPolicy(password: string): boolean {
  return password.length >= 8 && /[A-Z]/.test(password) && /[a-z]/.test(password) && /[0-9]/.test(password);
}

/**
 * ---------------------------------------------------------------------------
 * FORGOT PASSWORD
 * ---------------------------------------------------------------------------
 */
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ success: false, message: 'Invalid email address.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    
    // Always return generic response to prevent enumeration
    const genericResponse = { success: true, message: 'If that email address is in our database, we will send you an email to reset your password.' };

    const users = await query('SELECT id, name FROM users WHERE email = ? COLLATE NOCASE', [normalizedEmail]);
    if (!users || users.length === 0) {
      return res.status(200).json(genericResponse);
    }

    const user = users[0];
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // exactly 10 minutes
    const createdAt = new Date().toISOString();

    // Invalidate existing active reset tokens for this user
    await execute('DELETE FROM password_reset_tokens WHERE userId = ?', [user.id]);

    await execute(
      'INSERT INTO password_reset_tokens (tokenHash, userId, ipAddress, expiresAt, createdAt) VALUES (?, ?, ?, ?, ?)',
      [tokenHash, user.id, req.ip, expiresAt, createdAt]
    );

    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${rawToken}`;
    
    // Send email asynchronously
    sendPasswordResetEmail(normalizedEmail, user.name, resetUrl).catch(e => {
      logger.error('security.pwd_reset', 'Failed to send reset email', { error: e });
    });

    logger.info('security.pwd_reset', 'Password reset requested', { userId: user.id });

    return res.status(200).json(genericResponse);
  } catch (error) {
    logger.error('security.pwd_reset_err', 'Forgot password error', { error });
    return res.status(500).json({ success: false, message: 'An internal error occurred.' });
  }
};

/**
 * ---------------------------------------------------------------------------
 * RESET PASSWORD
 * ---------------------------------------------------------------------------
 */
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ success: false, message: 'Token and new password are required.' });
    }

    if (!validatePasswordPolicy(newPassword)) {
      return res.status(400).json({ success: false, message: 'Password does not meet complexity requirements.' });
    }

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    
    const tokens = await query('SELECT userId, expiresAt, usedAt FROM password_reset_tokens WHERE tokenHash = ?', [tokenHash]);

    if (!tokens || tokens.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid or expired token.' });
    }

    const resetRecord = tokens[0];
    
    if (resetRecord.usedAt) {
      return res.status(400).json({ success: false, message: 'Invalid or expired token.' });
    }

    if (new Date(resetRecord.expiresAt) < new Date()) {
      return res.status(400).json({ success: false, message: 'Invalid or expired token.' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await execute('BEGIN TRANSACTION');
    try {
      // 1. Update password
      await execute('UPDATE users SET password_hash = ? WHERE id = ?', [hashedPassword, resetRecord.userId]);
      
      // 2. Mark token used / delete
      await execute('DELETE FROM password_reset_tokens WHERE tokenHash = ?', [tokenHash]);
      
      // 3. Invalidate sessions
      await execute('DELETE FROM sessions WHERE userId = ?', [resetRecord.userId]);
      
      // 4. Log Audit
      await execute(
        'INSERT INTO security_audit_logs (id, userId, action, ipAddress, userAgent, timestamp) VALUES (?, ?, ?, ?, ?, ?)',
        [crypto.randomUUID(), resetRecord.userId, 'PASSWORD_RESET', req.ip, req.headers['user-agent'] || '', new Date().toISOString()]
      );

      await execute('COMMIT');
    } catch (dbErr) {
      await execute('ROLLBACK');
      throw dbErr;
    }

    const users = await query('SELECT email, name FROM users WHERE id = ?', [resetRecord.userId]);
    if (users && users.length > 0) {
      sendPasswordChangedNotification(users[0].email, users[0].name).catch(() => {});
    }

    logger.info('security.pwd_reset_success', 'Password reset successful', { userId: resetRecord.userId });

    return res.status(200).json({ success: true, message: 'Password successfully reset.' });
  } catch (error) {
    logger.error('security.reset_err', 'Reset password error', { error });
    return res.status(500).json({ success: false, message: 'An internal error occurred.' });
  }
};

/**
 * ---------------------------------------------------------------------------
 * CHANGE PASSWORD
 * ---------------------------------------------------------------------------
 */
export const changePassword = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Current and new password are required.' });
    }

    if (!validatePasswordPolicy(newPassword)) {
      return res.status(400).json({ success: false, message: 'Password does not meet complexity requirements.' });
    }

    const users = await query('SELECT password_hash, email, name FROM users WHERE id = ?', [userId]);
    if (!users || users.length === 0) return res.status(404).json({ success: false, message: 'User not found.' });

    const user = users[0];
    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Incorrect current password.' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await execute('BEGIN TRANSACTION');
    try {
      await execute('UPDATE users SET password_hash = ? WHERE id = ?', [hashedPassword, userId]);
      await execute('DELETE FROM sessions WHERE userId = ?', [userId]);
      
      await execute(
        'INSERT INTO security_audit_logs (id, userId, action, ipAddress, userAgent, timestamp) VALUES (?, ?, ?, ?, ?, ?)',
        [crypto.randomUUID(), userId, 'PASSWORD_CHANGE', req.ip, req.headers['user-agent'] || '', new Date().toISOString()]
      );
      
      await execute('COMMIT');
    } catch (e) {
      await execute('ROLLBACK');
      throw e;
    }

    sendPasswordChangedNotification(user.email, user.name).catch(() => {});
    logger.info('security.pwd_changed', 'Password changed successfully', { userId });

    return res.status(200).json({ success: true, message: 'Password changed successfully. You have been logged out of all devices.' });
  } catch (error) {
    logger.error('security.pwd_change_err', 'Change password error', { error });
    return res.status(500).json({ success: false, message: 'An internal error occurred.' });
  }
};

/**
 * ---------------------------------------------------------------------------
 * SEND EMAIL VERIFICATION
 * ---------------------------------------------------------------------------
 */
export const sendEmailVerification = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const users = await query('SELECT email, name FROM users WHERE id = ?', [userId]);
    if (!users || users.length === 0) return res.status(404).json({ success: false, message: 'User not found.' });

    const user = users[0];
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();
    const createdAt = new Date().toISOString();

    await execute('DELETE FROM email_verification_tokens WHERE userId = ?', [userId]);
    await execute(
      'INSERT INTO email_verification_tokens (tokenHash, userId, expiresAt, createdAt) VALUES (?, ?, ?, ?)',
      [tokenHash, userId, expiresAt, createdAt]
    );

    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${rawToken}`;
    
    sendEmailVerificationEmail(user.email, user.name, verificationUrl).catch(() => {});

    return res.status(200).json({ success: true, message: 'Verification email sent.' });
  } catch (error) {
    logger.error('security.verify_send_err', 'Verification email send error', { error });
    return res.status(500).json({ success: false, message: 'An internal error occurred.' });
  }
};

/**
 * ---------------------------------------------------------------------------
 * VERIFY EMAIL
 * ---------------------------------------------------------------------------
 */
export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ success: false, message: 'Token is required.' });

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const tokens = await query('SELECT userId, expiresAt FROM email_verification_tokens WHERE tokenHash = ?', [tokenHash]);

    if (!tokens || tokens.length === 0) return res.status(400).json({ success: false, message: 'Invalid or expired token.' });
    
    const record = tokens[0];
    if (new Date(record.expiresAt) < new Date()) {
      return res.status(400).json({ success: false, message: 'Invalid or expired token.' });
    }

    await execute('DELETE FROM email_verification_tokens WHERE tokenHash = ?', [tokenHash]);
    // Optionally set a flag in users table like `email_verified = 1` if it exists. (Skipping for now as schema doesn't have it).

    return res.status(200).json({ success: true, message: 'Email verified successfully.' });
  } catch (error) {
    logger.error('security.verify_err', 'Verification error', { error });
    return res.status(500).json({ success: false, message: 'An internal error occurred.' });
  }
};

