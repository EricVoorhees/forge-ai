-- Add clerk_id column to users table for Clerk integration
ALTER TABLE users ADD COLUMN IF NOT EXISTS clerk_id VARCHAR(255) UNIQUE;
CREATE INDEX IF NOT EXISTS idx_users_clerk_id ON users(clerk_id);

-- Make password_hash nullable for Clerk users
ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;
