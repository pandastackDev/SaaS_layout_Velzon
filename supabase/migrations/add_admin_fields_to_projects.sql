-- Add admin fields to projects table
-- This migration adds fields for admin management of projects

-- Add admin_notes column (internal notes only visible to admins)
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS admin_notes TEXT;

-- Add rejection_reason column (reason for rejecting a project, visible to owner)
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Add approved_at column (timestamp when project was approved)
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;

-- Add approved_by column (admin user ID who approved the project)
ALTER TABLE projects
ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES auth.users(id);

-- Add comments to columns
COMMENT ON COLUMN projects.admin_notes IS 'Internal notes added by administrators (not visible to users)';
COMMENT ON COLUMN projects.rejection_reason IS 'Reason for rejection (visible to project owner)';
COMMENT ON COLUMN projects.approved_at IS 'Timestamp when the project was approved';
COMMENT ON COLUMN projects.approved_by IS 'ID of the admin user who approved the project';

-- Note: idx_projects_status and idx_projects_approved_at will be created automatically if they don't exist
-- The status index already exists in your schema
-- Create index on approved_at for sorting (only if it doesn't exist)
CREATE INDEX IF NOT EXISTS idx_projects_approved_at ON projects(approved_at DESC NULLS LAST);
