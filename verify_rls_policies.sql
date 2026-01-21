-- =====================================================
-- Verification Script for Subscriptions RLS Policies
-- =====================================================
-- Run this AFTER applying supabase_rls_policies.sql
-- This will help you verify everything is set up correctly
-- =====================================================

-- 1. Check if RLS is enabled on subscriptions table
SELECT 
    schemaname,
    tablename,
    rowsecurity as "RLS Enabled"
FROM pg_tables 
WHERE tablename = 'subscriptions';

-- Expected result: rowsecurity should be 'true'

-- 2. Check existing policies on subscriptions table
SELECT 
    policyname as "Policy Name",
    permissive,                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             
    roles,
    cmd as "Command",
    qual as "Using Expression",
    with_check as "With Check Expression"
FROM pg_policies 
WHERE tablename = 'subscriptions'
ORDER BY policyname;

-- Expected result: Should show 2 policies:
-- - "Allow authenticated users to select subscriptions" (SELECT)
-- - "Allow authenticated users to update subscriptions" (UPDATE)

-- 3. Check if table exists and has data
SELECT 
    COUNT(*) as "Total Subscriptions"
FROM subscriptions;

-- Expected result: A number (0 if table is empty, or the count of subscriptions)

-- 4. Test query (should work if RLS is correct)
-- This simulates what your app does
SELECT 
    id,
    user_id,
    status,
    monthly_price,
    created_at
FROM subscriptions
LIMIT 5;

-- Expected result: 
-- - If RLS is correct: Returns rows (or empty array if no data)
-- - If RLS is wrong: Error about permissions
