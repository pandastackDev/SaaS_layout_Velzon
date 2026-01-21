-- ============================================================================
-- SET MULTIPLE ADMIN USERS
-- ============================================================================
-- This script sets the following email addresses as admin users:
-- 1. pechymdomingos@gmail.com
-- 2. jetton9564@gmail.com
-- ============================================================================

-- Step 1: Set first admin user
UPDATE public.users 
SET is_admin = true 
WHERE email = 'pechymdomingos@gmail.com';

-- Step 2: Set second admin user
UPDATE public.users 
SET is_admin = true 
WHERE email = 'jetton9564@gmail.com';

-- Step 3: Verify both users are now admins
SELECT 
    id,
    email,
    is_admin,
    CASE 
        WHEN is_admin = true THEN '✅ Admin access granted'
        ELSE '❌ Not an admin'
    END AS status,
    created_at
FROM public.users 
WHERE email IN ('pechymdomingos@gmail.com', 'jetton9564@gmail.com')
ORDER BY email;

-- Step 4: Show summary
SELECT 
    COUNT(*) AS total_users_updated,
    SUM(CASE WHEN is_admin = true THEN 1 ELSE 0 END) AS admin_count,
    '✅ Setup complete' AS status
FROM public.users 
WHERE email IN ('pechymdomingos@gmail.com', 'jetton9564@gmail.com');

-- ============================================================================
-- NOTES:
-- ============================================================================
-- 1. If you see "0 rows affected", the users might not exist in the users table yet.
--    In that case, you may need to:
--    a) Register/login with these emails first, OR
--    b) Create the user records manually
--
-- 2. After running this script, users need to:
--    - Log out and log back in to refresh their session
--    - Clear browser cache if needed
--
-- 3. To check all admin users:
--    SELECT email, is_admin, created_at FROM public.users WHERE is_admin = true;
-- ============================================================================
