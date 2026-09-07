-- Migration 018: Email Verification Tokens
-- Token is cryptographically random, stored as hash only.
-- 30-minute expiry. Single-use.

CREATE TABLE IF NOT EXISTS email_verification_tokens (
  id          TEXT    PRIMARY KEY,
  user_id     TEXT    NOT NULL,
  email       TEXT    NOT NULL,          -- The email address being verified
  token_hash  TEXT    NOT NULL UNIQUE,  -- SHA-256 hash of 32-byte random token
  created_at  TEXT    NOT NULL,
  expires_at  TEXT    NOT NULL,          -- created_at + 30 minutes
  used_at     TEXT,                      -- NULL = not verified yet
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_evt_token_hash ON email_verification_tokens(token_hash);
CREATE INDEX IF NOT EXISTS idx_evt_user_id    ON email_verification_tokens(user_id);
