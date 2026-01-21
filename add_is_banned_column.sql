-- Add is_banned column to users table
-- This column tracks whether a user has been banned from the platform by an admin

-- Add the column if it doesn't exist
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT FALSE;

-- Add index for faster queries on is_banned
CREATE INDEX IF NOT EXISTS idx_users_is_banned 
ON users(is_banned);

-- Add comment to document the column
COMMENT ON COLUMN users.is_banned IS 'Whether the user has been banned from accessing the platform. Set by admins via the User Management page.';

-- Set existing users to not banned by default (if any exist without this field)
UPDATE users 
SET is_banned = FALSE 
WHERE is_banned IS NULL;
