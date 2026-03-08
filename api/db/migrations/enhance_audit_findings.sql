-- Enhance audit_findings table with Semgrep-inspired fields
-- Run this migration to add fingerprinting, triage, and tracking capabilities

-- Add fingerprinting columns for deduplication
ALTER TABLE audit_findings ADD COLUMN IF NOT EXISTS match_based_id VARCHAR(64);
ALTER TABLE audit_findings ADD COLUMN IF NOT EXISTS syntactic_id VARCHAR(64);
ALTER TABLE audit_findings ADD COLUMN IF NOT EXISTS rule_id VARCHAR(128);

-- Add triage status columns (replacing simple finding_status)
ALTER TABLE audit_findings ADD COLUMN IF NOT EXISTS triage_status VARCHAR(32) DEFAULT 'open';
ALTER TABLE audit_findings ADD COLUMN IF NOT EXISTS triage_reason VARCHAR(64);
ALTER TABLE audit_findings ADD COLUMN IF NOT EXISTS triage_comment TEXT;
ALTER TABLE audit_findings ADD COLUMN IF NOT EXISTS triaged_by UUID;
ALTER TABLE audit_findings ADD COLUMN IF NOT EXISTS triaged_at TIMESTAMP WITH TIME ZONE;

-- Add autofix columns
ALTER TABLE audit_findings ADD COLUMN IF NOT EXISTS autofix_available BOOLEAN DEFAULT FALSE;
ALTER TABLE audit_findings ADD COLUMN IF NOT EXISTS autofix_code TEXT;
ALTER TABLE audit_findings ADD COLUMN IF NOT EXISTS autofix_applied BOOLEAN DEFAULT FALSE;
ALTER TABLE audit_findings ADD COLUMN IF NOT EXISTS autofix_applied_at TIMESTAMP WITH TIME ZONE;

-- Add component tagging
ALTER TABLE audit_findings ADD COLUMN IF NOT EXISTS component_tags TEXT; -- JSON array: ["auth", "payments", "infrastructure"]

-- Add first/last seen tracking
ALTER TABLE audit_findings ADD COLUMN IF NOT EXISTS first_seen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE audit_findings ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE audit_findings ADD COLUMN IF NOT EXISTS occurrence_count INTEGER DEFAULT 1;

-- Add dataflow trace for taint analysis
ALTER TABLE audit_findings ADD COLUMN IF NOT EXISTS dataflow_trace TEXT; -- JSON: [{source, sink, propagators}]

-- Add matched text for context
ALTER TABLE audit_findings ADD COLUMN IF NOT EXISTS matched_text TEXT;

-- Create index on fingerprints for fast deduplication
CREATE INDEX IF NOT EXISTS idx_findings_match_based_id ON audit_findings(match_based_id);
CREATE INDEX IF NOT EXISTS idx_findings_syntactic_id ON audit_findings(syntactic_id);
CREATE INDEX IF NOT EXISTS idx_findings_rule_id ON audit_findings(rule_id);
CREATE INDEX IF NOT EXISTS idx_findings_triage_status ON audit_findings(triage_status);

-- Create a table for tracking finding history across scans
CREATE TABLE IF NOT EXISTS finding_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    finding_id UUID NOT NULL REFERENCES audit_findings(id) ON DELETE CASCADE,
    scan_id UUID NOT NULL REFERENCES audit_scans(id) ON DELETE CASCADE,
    
    -- State at this scan
    status VARCHAR(32) NOT NULL, -- new, unchanged, fixed, reintroduced
    line_number INTEGER,
    code_snippet TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_finding_history_finding_id ON finding_history(finding_id);
CREATE INDEX IF NOT EXISTS idx_finding_history_scan_id ON finding_history(scan_id);

-- Create a table for finding notes/comments
CREATE TABLE IF NOT EXISTS finding_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    finding_id UUID NOT NULL REFERENCES audit_findings(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    content TEXT NOT NULL,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_finding_notes_finding_id ON finding_notes(finding_id);

-- Add project-level finding tracking (for cross-scan deduplication)
ALTER TABLE audit_scans ADD COLUMN IF NOT EXISTS project_id UUID;
ALTER TABLE audit_scans ADD COLUMN IF NOT EXISTS new_findings_count INTEGER DEFAULT 0;
ALTER TABLE audit_scans ADD COLUMN IF NOT EXISTS fixed_findings_count INTEGER DEFAULT 0;
ALTER TABLE audit_scans ADD COLUMN IF NOT EXISTS unchanged_findings_count INTEGER DEFAULT 0;

-- Create projects table for organizing scans
CREATE TABLE IF NOT EXISTS audit_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    name VARCHAR(255) NOT NULL,
    description TEXT,
    repo_url VARCHAR(512),
    default_branch VARCHAR(64) DEFAULT 'main',
    
    -- Stats
    total_findings INTEGER DEFAULT 0,
    open_findings INTEGER DEFAULT 0,
    fixed_findings INTEGER DEFAULT 0,
    ignored_findings INTEGER DEFAULT 0,
    
    -- Settings
    auto_scan BOOLEAN DEFAULT FALSE,
    notification_settings TEXT, -- JSON
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_projects_user_id ON audit_projects(user_id);

-- Add foreign key from scans to projects
ALTER TABLE audit_scans ADD CONSTRAINT fk_audit_scans_project 
    FOREIGN KEY (project_id) REFERENCES audit_projects(id) ON DELETE SET NULL;
