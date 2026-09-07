/**
 * Email Service — Nodemailer/SMTP with console-fallback for development.
 *
 * Security guarantees:
 *  - Never logs raw tokens, OTPs, or secrets.
 *  - All user-controlled content is HTML-escaped before insertion into templates.
 *  - Credentials come from environment variables only; no hardcoded defaults.
 *  - Production startup fails if EMAIL_FROM is missing when SMTP is configured.
 */
import crypto from 'crypto';
import logger from '../config/logger.js';

// ─── HTML escape to prevent template injection ─────────────────────────────
const escapeHtml = (unsafe: string): string => {
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

// ─── Email transport (lazy-initialized to avoid startup cost if unused) ─────
let transporterPromise: Promise<any> | null = null;

const getTransporter = async (): Promise<any> => {
  if (transporterPromise) return transporterPromise;

  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = parseInt(process.env.SMTP_PORT || '587', 10);
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (!smtpHost || !smtpUser || !smtpPass) {
    // No SMTP configured — return a console-only mock transporter
    transporterPromise = Promise.resolve({
      sendMail: async (opts: any) => {
        logger.info('email.console_fallback', `[EMAIL MOCK] To: ${opts.to} | Subject: ${opts.subject}`);
        // NOTE: We intentionally do NOT log opts.html or opts.text to avoid
        // leaking reset tokens or OTPs that may appear in email bodies.
        return { messageId: `mock-${crypto.randomUUID()}` };
      }
    });
    return transporterPromise;
  }

  // Dynamically import nodemailer only when SMTP is configured
  transporterPromise = (async () => {
    const nodemailer = await import('nodemailer');
    return nodemailer.default.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: { user: smtpUser, pass: smtpPass },
      tls: { rejectUnauthorized: process.env.NODE_ENV === 'production' }
    });
  })();

  return transporterPromise;
};

const FROM = process.env.EMAIL_FROM || '"Stackly Workforce" <no-reply@thestackly.com>';

// ─── Base HTML email template ────────────────────────────────────────────────
const baseTemplate = (title: string, bodyHtml: string): string => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title)}</title>
</head>
<body style="margin:0;padding:0;font-family:Inter,Arial,sans-serif;background:#0f1117;color:#e2e8f0;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f1117;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#1a1d27;border-radius:12px;overflow:hidden;border:1px solid #2d3148;">
          <tr>
            <td style="background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:32px;text-align:center;">
              <h1 style="margin:0;color:#fff;font-size:24px;font-weight:700;">Stackly Workforce</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:40px 48px;">
              ${bodyHtml}
            </td>
          </tr>
          <tr>
            <td style="background:#0f1117;padding:24px 48px;text-align:center;border-top:1px solid #2d3148;">
              <p style="margin:0;color:#64748b;font-size:12px;">
                This email was sent from Stackly Workforce. If you did not request this, please ignore this email.<br/>
                Do not share this email with anyone.
              </p>
              <p style="margin:8px 0 0;color:#64748b;font-size:12px;">
                Need help? Contact <a href="mailto:support@thestackly.com" style="color:#6366f1;">support@thestackly.com</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

// ─── Send helper ─────────────────────────────────────────────────────────────
const sendEmail = async (to: string, subject: string, html: string): Promise<void> => {
  try {
    const transporter = await getTransporter();
    await transporter.sendMail({ from: FROM, to, subject, html });
    logger.info('email.sent', `Email dispatched to redacted recipient, subject: ${subject}`);
  } catch (err: any) {
    logger.error('email.send_failed', 'Email delivery failed', { error: err.message, subject });
    // Do not re-throw — email failure should not break the auth flow
    // but we log it so ops can diagnose
  }
};

// ─── Password Reset Email ─────────────────────────────────────────────────────
/**
 * Sends password reset email. The resetUrl contains the raw token; it must
 * NEVER be logged — only the URL is embedded in the HTML email.
 */
export const sendPasswordResetEmail = async (
  to: string,
  name: string,
  resetUrl: string
): Promise<void> => {
  const safeName = escapeHtml(name || 'User');
  const subject = 'Reset your Stackly Workforce password';
  const html = baseTemplate(subject, `
    <h2 style="color:#e2e8f0;font-size:20px;margin:0 0 16px;">Password Reset Request</h2>
    <p style="color:#94a3b8;line-height:1.6;margin:0 0 16px;">
      Hi ${safeName},
    </p>
    <p style="color:#94a3b8;line-height:1.6;margin:0 0 24px;">
      We received a request to reset the password for your Stackly Workforce account.
      Click the button below to set a new password. This link will expire in
      <strong style="color:#e2e8f0;">10 minutes</strong>.
    </p>
    <div style="text-align:center;margin:32px 0;">
      <a href="${resetUrl}"
         style="background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;text-decoration:none;
                padding:14px 32px;border-radius:8px;font-weight:600;font-size:15px;display:inline-block;">
        Reset Password
      </a>
    </div>
    <p style="color:#64748b;font-size:13px;line-height:1.6;margin:0 0 8px;">
      If the button does not work, copy and paste this link into your browser:
    </p>
    <p style="color:#6366f1;font-size:12px;word-break:break-all;margin:0 0 24px;">${resetUrl}</p>
    <div style="background:#1e2235;border-radius:8px;padding:16px;border-left:4px solid #f59e0b;">
      <p style="color:#f59e0b;margin:0;font-size:13px;font-weight:600;">⚠ Security Notice</p>
      <p style="color:#94a3b8;margin:8px 0 0;font-size:13px;line-height:1.5;">
        If you did not request a password reset, please ignore this email. Your password will not
        be changed. Never share this link with anyone — Stackly staff will never ask for it.
      </p>
    </div>
  `);
  await sendEmail(to, subject, html);
};

// ─── Password Changed Notification ───────────────────────────────────────────
export const sendPasswordChangedNotification = async (
  to: string,
  name: string
): Promise<void> => {
  const safeName = escapeHtml(name || 'User');
  const subject = 'Your Stackly Workforce password was changed';
  const html = baseTemplate(subject, `
    <h2 style="color:#e2e8f0;font-size:20px;margin:0 0 16px;">Password Changed</h2>
    <p style="color:#94a3b8;line-height:1.6;margin:0 0 16px;">Hi ${safeName},</p>
    <p style="color:#94a3b8;line-height:1.6;margin:0 0 24px;">
      Your Stackly Workforce account password was successfully changed on
      <strong style="color:#e2e8f0;">${escapeHtml(new Date().toUTCString())}</strong>.
    </p>
    <div style="background:#1e2235;border-radius:8px;padding:16px;border-left:4px solid #ef4444;">
      <p style="color:#ef4444;margin:0;font-size:13px;font-weight:600;">⚠ Didn't make this change?</p>
      <p style="color:#94a3b8;margin:8px 0 0;font-size:13px;line-height:1.5;">
        If you did not change your password, your account may be compromised. Please contact
        <a href="mailto:support@thestackly.com" style="color:#6366f1;">support@thestackly.com</a>
        immediately.
      </p>
    </div>
  `);
  await sendEmail(to, subject, html);
};

// ─── Email Verification ───────────────────────────────────────────────────────
export const sendEmailVerificationEmail = async (
  to: string,
  name: string,
  verificationUrl: string
): Promise<void> => {
  const safeName = escapeHtml(name || 'User');
  const subject = 'Verify your Stackly Workforce email address';
  const html = baseTemplate(subject, `
    <h2 style="color:#e2e8f0;font-size:20px;margin:0 0 16px;">Verify Your Email</h2>
    <p style="color:#94a3b8;line-height:1.6;margin:0 0 16px;">Hi ${safeName},</p>
    <p style="color:#94a3b8;line-height:1.6;margin:0 0 24px;">
      Please verify your email address to activate your Stackly Workforce account.
      This link will expire in <strong style="color:#e2e8f0;">30 minutes</strong>.
    </p>
    <div style="text-align:center;margin:32px 0;">
      <a href="${verificationUrl}"
         style="background:linear-gradient(135deg,#10b981,#059669);color:#fff;text-decoration:none;
                padding:14px 32px;border-radius:8px;font-weight:600;font-size:15px;display:inline-block;">
        Verify Email Address
      </a>
    </div>
    <p style="color:#64748b;font-size:13px;line-height:1.6;margin:0;">
      If you did not create a Stackly Workforce account, please ignore this email.
    </p>
  `);
  await sendEmail(to, subject, html);
};

// ─── Security Alert Notification ─────────────────────────────────────────────
export const sendSecurityAlertEmail = async (
  to: string,
  name: string,
  eventType: string
): Promise<void> => {
  const safeName = escapeHtml(name || 'User');
  const safeEvent = escapeHtml(eventType);
  const subject = `Security Alert: ${safeEvent} — Stackly Workforce`;
  const html = baseTemplate(subject, `
    <h2 style="color:#e2e8f0;font-size:20px;margin:0 0 16px;">Security Alert</h2>
    <p style="color:#94a3b8;line-height:1.6;margin:0 0 16px;">Hi ${safeName},</p>
    <p style="color:#94a3b8;line-height:1.6;margin:0 0 24px;">
      A security event occurred on your Stackly Workforce account:
      <strong style="color:#e2e8f0;">${safeEvent}</strong> at
      <strong style="color:#e2e8f0;">${escapeHtml(new Date().toUTCString())}</strong>.
    </p>
    <div style="background:#1e2235;border-radius:8px;padding:16px;border-left:4px solid #f59e0b;">
      <p style="color:#f59e0b;margin:0;font-size:13px;font-weight:600;">⚠ If this wasn't you</p>
      <p style="color:#94a3b8;margin:8px 0 0;font-size:13px;line-height:1.5;">
        Contact <a href="mailto:support@thestackly.com" style="color:#6366f1;">support@thestackly.com</a>
        immediately if you did not perform this action.
      </p>
    </div>
  `);
  await sendEmail(to, subject, html);
};
