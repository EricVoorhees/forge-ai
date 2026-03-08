-- Add GitHub connections table for OAuth integration
-- Run this migration on your Neon database

CREATE TABLE IF NOT EXISTS github_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    
    -- GitHub user info
    github_user_id INTEGER NOT NULL,
    github_username VARCHAR(255) NOT NULL,
    github_email VARCHAR(255),
    github_avatar_url TEXT,
    
    -- OAuth tokens
    access_token TEXT NOT NULL,
    token_type VARCHAR(32) DEFAULT 'bearer',
    scope TEXT,
    
    -- Metadata
    connected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_used_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Indexes
    CONSTRAINT github_connections_user_id_key UNIQUE (user_id)
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_github_connections_user_id ON github_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_github_connections_github_user_id ON github_connections(github_user_id);

-- Comment
COMMENT ON TABLE github_connections IS 'GitHub OAuth connections for FORGE Audit repository scanning';
