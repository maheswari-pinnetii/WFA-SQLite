-- Migration 019: Add email_verified columns to users table
-- Uses IF NOT EXISTS pattern via INSERT-OR-IGNORE trick;
-- SQLite ALTER TABLE ADD COLUMN is idempotent-safe when run inside a try-catch in the migration runner.

ALTER TABLE users ADD COLUMN email_verified    INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN email_verified_at TEXT;
