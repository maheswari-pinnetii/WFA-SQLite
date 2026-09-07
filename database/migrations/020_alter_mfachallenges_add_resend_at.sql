-- Migration 020: Add last_resend_at to mfachallenges for resend cooldown enforcement
-- This column tracks when the last OTP resend was issued to prevent flooding.

ALTER TABLE mfachallenges ADD COLUMN last_resend_at TEXT;
