-- ============================================================================
-- SET ADMIN USER
-- ============================================================================
-- Run this AFTER running advertising_banners_schema.sql
-- Replace 'your-admin@email.com' with your actual admin email address
-- ============================================================================

-- Option 1: Set admin by email (recommended)
UPDATE public.users 
SET is_admin = true 
WHERE email = 'your-admin@email.com';

-- Option 2: Set admin by user ID (if you know the UUID)
-- UPDATE public.users 
-- SET is_admin = true 
-- WHERE id = 'your-user-uuid-here';

-- Verify the update
SELECT id, email, is_admin, full_name 
FROM public.users 
WHERE is_admin = true;

-- ============================================================================
-- Note: If you're using VITE_ADMIN_EMAIL in your .env file,
-- make sure the email matches what you set here, or update the .env file.
-- ============================================================================
