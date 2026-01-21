-- =====================================================
-- RLS Policies for Subscriptions Table
-- =====================================================
-- Run this SQL in your Supabase SQL Editor to enable admin access
-- 
-- INSTRUCTIONS:
-- 1. Open your Supabase Dashboard
-- 2. Go to SQL Editor (left sidebar)
-- 3. Click "New Query"
-- 4. Copy and paste this entire file
-- 5. Click "Run" (or press Ctrl+Enter)
-- 6. Refresh your admin panel page
-- =====================================================

-- Enable RLS on subscriptions table (if not already enabled)
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Allow authenticated users to select subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Allow authenticated users to update subscriptions" ON subscriptions;

-- Policy: Allow authenticated users to SELECT (read) all subscriptions
-- This allows admins and other authenticated users to view all subscriptions
-- Note: Admin status is determined by email in the frontend (VITE_ADMIN_EMAIL)
CREATE POLICY "Allow authenticated users to select subscriptions"
ON subscriptions
FOR SELECT
TO authenticated
USING (true);

-- Policy: Allow authenticated users to UPDATE subscriptions (for admin actions)
CREATE POLICY "Allow authenticated users to update subscriptions"
ON subscriptions
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Verify the policies were created
-- You can run this query to check:
-- SELECT * FROM pg_policies WHERE tablename = 'subscriptions';
