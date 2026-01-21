-- ============================================================================
-- QUICK FIX: Enable Admin Access for Advertising Banners
-- ============================================================================
-- Run this AFTER running advertising_banners_schema.sql
-- Replace 'your-email@example.com' with your actual admin email
-- ============================================================================

-- Step 1: Set your user as admin
UPDATE public.users 
SET is_admin = true 
WHERE email = 'your-email@example.com'; -- ⚠️ CHANGE THIS TO YOUR EMAIL

-- Step 2: Verify it worked
SELECT 
    id,
    email,
    is_admin,
    CASE 
        WHEN is_admin = true THEN '✅ Admin access granted'
        ELSE '❌ Still not admin - check email address'
    END AS status
FROM public.users 
WHERE email = 'your-email@example.com'; -- ⚠️ CHANGE THIS TO YOUR EMAIL

-- Step 3: Verify RLS policies exist
SELECT 
    policyname,
    cmd,
    '✅ Policy exists' AS status
FROM pg_policies 
WHERE tablename = 'advertising_banners'
ORDER BY cmd;

-- Step 4: Test UPDATE access (this should work if you're admin)
-- Uncomment the line below and run to test:
-- UPDATE public.advertising_banners 
-- SET updated_at = updated_at 
-- WHERE id = (SELECT id FROM public.advertising_banners LIMIT 1)
-- RETURNING id, title;

-- ============================================================================
-- ALTERNATIVE: If you know your user ID instead of email
-- ============================================================================
-- UPDATE public.users 
-- SET is_admin = true 
-- WHERE id = 'your-user-uuid-here';

-- ============================================================================
-- TROUBLESHOOTING: If still not working
-- ============================================================================
-- 1. Make sure you're logged in to Supabase with the same email
-- 2. Check browser console for errors
-- 3. Verify your user exists in the users table:
--    SELECT * FROM public.users WHERE email = 'your-email@example.com';
-- 4. If user doesn't exist, you may need to create it first or link it to auth.users
