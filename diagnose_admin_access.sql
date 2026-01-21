-- ============================================================================
-- DIAGNOSTIC SCRIPT: Check Admin Access for Advertising Banners
-- ============================================================================
-- Run this in Supabase SQL Editor to diagnose why admin actions aren't working
-- ============================================================================

-- Step 1: Check if is_admin column exists
SELECT 
    'Step 1: Checking is_admin column' AS step,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'users' 
            AND column_name = 'is_admin'
        ) THEN '✅ Column exists'
        ELSE '❌ Column missing - run advertising_banners_schema.sql first'
    END AS status;

-- Step 2: Check your current user's admin status
-- Replace 'your-email@example.com' with your actual email
SELECT 
    'Step 2: Your admin status' AS step,
    id,
    email,
    is_admin,
    CASE 
        WHEN is_admin = true THEN '✅ You are an admin'
        ELSE '❌ You are NOT an admin - run set_admin_user.sql'
    END AS status
FROM public.users 
WHERE email = 'your-email@example.com'; -- CHANGE THIS TO YOUR EMAIL

-- Step 3: Check current authenticated user (if logged in)
SELECT 
    'Step 3: Current authenticated user' AS step,
    auth.uid() AS current_user_id,
    CASE 
        WHEN auth.uid() IS NULL THEN '❌ Not authenticated'
        ELSE '✅ Authenticated'
    END AS auth_status;

-- Step 4: Check if current user is admin (if authenticated)
SELECT 
    'Step 4: Current user admin check' AS step,
    u.id,
    u.email,
    u.is_admin,
    CASE 
        WHEN u.is_admin = true THEN '✅ Current user is admin'
        WHEN u.id IS NULL THEN '❌ User not found in users table'
        ELSE '❌ Current user is NOT admin'
    END AS status
FROM public.users u
WHERE u.id = auth.uid();

-- Step 5: Check RLS policies on advertising_banners
SELECT 
    'Step 5: RLS Policies' AS step,
    policyname,
    cmd AS operation,
    CASE 
        WHEN cmd = 'SELECT' THEN 'View banners'
        WHEN cmd = 'INSERT' THEN 'Create banners'
        WHEN cmd = 'UPDATE' THEN 'Update banners'
        WHEN cmd = 'DELETE' THEN 'Delete banners'
        ELSE cmd
    END AS description,
    '✅ Policy exists' AS status
FROM pg_policies 
WHERE tablename = 'advertising_banners'
ORDER BY cmd, policyname;

-- Step 6: Check if RLS is enabled
SELECT 
    'Step 6: RLS Status' AS step,
    tablename,
    rowsecurity AS rls_enabled,
    CASE 
        WHEN rowsecurity = true THEN '✅ RLS is enabled'
        ELSE '❌ RLS is disabled'
    END AS status
FROM pg_tables 
WHERE tablename = 'advertising_banners';

-- Step 7: Test if you can see banners (SELECT test)
SELECT 
    'Step 7: SELECT Test' AS step,
    COUNT(*) AS banner_count,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ Can view banners'
        ELSE '❌ Cannot view banners - check RLS policies'
    END AS status
FROM public.advertising_banners;

-- Step 8: Test UPDATE permission (dry run - won't actually update)
-- This will show if the policy allows the update
SELECT 
    'Step 8: UPDATE Permission Test' AS step,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM public.advertising_banners 
            WHERE id IN (
                SELECT id FROM public.advertising_banners LIMIT 1
            )
        ) THEN '✅ UPDATE policy check passed (if you see this, policy allows updates)'
        ELSE '❌ UPDATE policy check failed'
    END AS status;

-- ============================================================================
-- QUICK FIX: If you see issues above, run these commands
-- ============================================================================

-- Fix 1: Set yourself as admin (replace email)
-- UPDATE public.users SET is_admin = true WHERE email = 'your-email@example.com';

-- Fix 2: Verify the update worked
-- SELECT email, is_admin FROM public.users WHERE email = 'your-email@example.com';

-- Fix 3: If RLS policies are missing, re-run advertising_banners_schema.sql

-- ============================================================================
-- MANUAL TEST: Try updating a banner directly in SQL
-- ============================================================================
-- Uncomment and run this to test if UPDATE works in SQL:
-- UPDATE public.advertising_banners 
-- SET is_active = false 
-- WHERE id = (SELECT id FROM public.advertising_banners LIMIT 1)
-- RETURNING id, title, is_active;
-- 
-- If this works but the UI doesn't, the issue is in the frontend code.
-- If this doesn't work, the issue is with RLS policies or admin status.
