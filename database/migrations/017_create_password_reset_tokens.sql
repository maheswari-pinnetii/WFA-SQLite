-- Migration 017: Password Reset Tokens
-- Stores only a cryptographic hash of the reset token (never the raw token).
-- One active token per user: new token request invalidates old ones.
-- Token validity: 10 minutes (enforced at application layer AND stored in expires_at).

CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id          TEXT    PRIMARY KEY,
  user_id     TEXT    NOT NULL,
  token_hash  TEXT    NOT NULL UNIQUE,  -- SHA-256 hash of 32-byte random token
  created_at  TEXT    NOT NULL,
  expires_at  TEXT    NOT NULL,          -- created_at + 10 minutes
  used_at     TEXT,                      -- NULL = not yet used; set on successful reset
  ip_address  TEXT,
  user_agent  TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Fast lookup by token hash during reset verification
CREATE INDEX IF NOT EXISTS idx_prt_token_hash ON password_reset_tokens(token_hash);

-- Fast cleanup and invalidation by user
CREATE INDEX IF NOT EXISTS idx_prt_user_id ON password_reset_tokens(user_id);
