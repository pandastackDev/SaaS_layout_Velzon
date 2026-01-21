-- ============================================================================
-- SIMPLE VERSION: Set Multiple Admin Users (Run in smaller chunks)
-- ============================================================================
-- If you're getting "Failed to fetch" errors, run these one at a time
-- ============================================================================

-- PART 1: Set first admin (Run this first)
UPDATE public.users 
SET is_admin = true 
WHERE email = 'pechymdomingos@gmail.com';

-- PART 2: Set second admin (Run this second)
UPDATE public.users 
SET is_admin = true 
WHERE email = 'jetton9564@gmail.com';

-- PART 3: Verify (Run this last to check results)
SELECT email, is_admin 
FROM public.users 
WHERE email IN ('pechymdomingos@gmail.com', 'jetton9564@gmail.com');
