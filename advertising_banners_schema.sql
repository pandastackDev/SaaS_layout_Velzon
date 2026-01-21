-- ============================================================================
-- ADVERTISING BANNERS TABLE SETUP
-- ============================================================================
-- This script creates the advertising_banners table with proper structure,
-- security policies, and sample data.
-- Run this in Supabase SQL Editor.
-- ============================================================================

-- STEP 1: Ensure users table has is_admin column
-- ============================================================================
-- Add is_admin column to users table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'users' 
        AND column_name = 'is_admin'
    ) THEN
        ALTER TABLE public.users 
        ADD COLUMN is_admin BOOLEAN DEFAULT false;
        
        -- Create index for faster admin checks
        CREATE INDEX IF NOT EXISTS idx_users_is_admin 
        ON public.users(is_admin) 
        WHERE is_admin = true;
        
        RAISE NOTICE 'Added is_admin column to users table';
    ELSE
        RAISE NOTICE 'is_admin column already exists in users table';
    END IF;
END $$;

-- STEP 2: Create advertising_banners table
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.advertising_banners (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    image_url TEXT NOT NULL,
    link_url TEXT,
    position VARCHAR(50) NOT NULL DEFAULT 'top',
    is_active BOOLEAN DEFAULT true,
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    impressions INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- STEP 3: Create indexes for performance
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_advertising_banners_position 
ON public.advertising_banners(position);

CREATE INDEX IF NOT EXISTS idx_advertising_banners_is_active 
ON public.advertising_banners(is_active);

CREATE INDEX IF NOT EXISTS idx_advertising_banners_created_at 
ON public.advertising_banners(created_at DESC);

-- STEP 4: Enable Row Level Security (RLS)
-- ============================================================================
ALTER TABLE public.advertising_banners ENABLE ROW LEVEL SECURITY;

-- STEP 5: Drop existing policies if they exist (for re-running script)
-- ============================================================================
DROP POLICY IF EXISTS "Public can view active banners" ON public.advertising_banners;
DROP POLICY IF EXISTS "Authenticated users can view active banners" ON public.advertising_banners;
DROP POLICY IF EXISTS "Admins can view all banners" ON public.advertising_banners;
DROP POLICY IF EXISTS "Admins can insert banners" ON public.advertising_banners;
DROP POLICY IF EXISTS "Admins can update banners" ON public.advertising_banners;
DROP POLICY IF EXISTS "Admins can delete banners" ON public.advertising_banners;

-- STEP 6: Create RLS Policies
-- ============================================================================
-- Note: PostgreSQL RLS uses OR logic - if ANY policy allows access, the user can access.
-- Admins get full access through separate policies, while public users only see active banners.

-- Policy 1: Public/anonymous users can view active banners only
CREATE POLICY "Public can view active banners" 
ON public.advertising_banners
FOR SELECT
TO anon
USING (is_active = true);

-- Policy 2: Authenticated non-admin users can view active banners only
CREATE POLICY "Authenticated users can view active banners" 
ON public.advertising_banners
FOR SELECT
TO authenticated
USING (
    is_active = true 
    AND NOT EXISTS (
        SELECT 1 FROM public.users
        WHERE users.id = auth.uid()
        AND users.is_admin = true
    )
);

-- Policy 3: Admins can view ALL banners (active & inactive) - FULL ACCESS
CREATE POLICY "Admins can view all banners" 
ON public.advertising_banners
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE users.id = auth.uid()
        AND users.is_admin = true
    )
);

-- Policy 4: Admins can insert new banners - FULL ACCESS
CREATE POLICY "Admins can insert banners" 
ON public.advertising_banners
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE users.id = auth.uid()
        AND users.is_admin = true
    )
);

-- Policy 5: Admins can update banners - FULL ACCESS (no restrictions)
CREATE POLICY "Admins can update banners" 
ON public.advertising_banners
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE users.id = auth.uid()
        AND users.is_admin = true
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE users.id = auth.uid()
        AND users.is_admin = true
    )
);

-- Policy 6: Admins can delete banners - FULL ACCESS
CREATE POLICY "Admins can delete banners" 
ON public.advertising_banners
FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE users.id = auth.uid()
        AND users.is_admin = true
    )
);

-- STEP 7: Create trigger function for auto-updating updated_at
-- ============================================================================
CREATE OR REPLACE FUNCTION public.update_advertising_banners_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- STEP 8: Create trigger
-- ============================================================================
DROP TRIGGER IF EXISTS update_advertising_banners_updated_at 
ON public.advertising_banners;

CREATE TRIGGER update_advertising_banners_updated_at
    BEFORE UPDATE ON public.advertising_banners
    FOR EACH ROW
    EXECUTE FUNCTION public.update_advertising_banners_updated_at();

-- STEP 9: Grant necessary permissions
-- ============================================================================
GRANT ALL ON public.advertising_banners TO authenticated;
GRANT SELECT ON public.advertising_banners TO anon;

-- STEP 10: Insert realistic sample data (only if table is empty)
-- ============================================================================
DO $$
DECLARE
    banner_count INTEGER;
BEGIN
    -- Check if table already has data
    SELECT COUNT(*) INTO banner_count FROM public.advertising_banners;
    
    -- Only insert if table is empty
    IF banner_count = 0 THEN
        INSERT INTO public.advertising_banners (
            title, 
            image_url, 
            link_url, 
            position, 
            is_active, 
            start_date, 
            end_date, 
            impressions, 
            clicks
        ) VALUES
        (
            'Welcome to PITCH INVEST - Featured Startups',
            'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200&h=300&fit=crop',
            'https://pitchinvest.com/featured',
            'top',
            true,
            NOW() - INTERVAL '7 days',
            NOW() + INTERVAL '23 days',
            15420,
            876
        ),
        (
            'Investment Opportunities - Tech Sector',
            'https://images.unsplash.com/photo-1551434678-e076c223a692?w=1200&h=300&fit=crop',
            'https://pitchinvest.com/tech-investments',
            'homepage-hero',
            true,
            NOW() - INTERVAL '5 days',
            NOW() + INTERVAL '25 days',
            12305,
            645
        ),
        (
            'Join Our Premium Membership - Get Exclusive Access',
            'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=1200&h=300&fit=crop',
            'https://pitchinvest.com/premium',
            'sidebar',
            true,
            NOW() - INTERVAL '3 days',
            NOW() + INTERVAL '27 days',
            8920,
            423
        ),
        (
            'Green Energy Startups - Invest in the Future',
            'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=1200&h=300&fit=crop',
            'https://pitchinvest.com/green-energy',
            'middle',
            true,
            NOW() - INTERVAL '2 days',
            NOW() + INTERVAL '28 days',
            6780,
            312
        ),
        (
            'AI & Machine Learning Innovations',
            'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&h=300&fit=crop',
            'https://pitchinvest.com/ai-startups',
            'bottom',
            true,
            NOW() - INTERVAL '1 day',
            NOW() + INTERVAL '29 days',
            4560,
            189
        ),
        (
            'Healthcare Revolution - Medical Tech Startups',
            'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200&h=300&fit=crop',
            'https://pitchinvest.com/healthtech',
            'top',
            false,
            NOW() - INTERVAL '30 days',
            NOW() - INTERVAL '1 day',
            22340,
            1234
        ),
        (
            'Fintech Solutions - Modern Banking',
            'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=1200&h=300&fit=crop',
            'https://pitchinvest.com/fintech',
            'footer',
            true,
            NOW(),
            NOW() + INTERVAL '30 days',
            230,
            12
        ),
        (
            'E-commerce Startups - Next Generation Retail',
            'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&h=300&fit=crop',
            'https://pitchinvest.com/ecommerce',
            'middle',
            false,
            NOW() - INTERVAL '45 days',
            NOW() - INTERVAL '15 days',
            18920,
            892
        );
        
        RAISE NOTICE 'Inserted 8 sample banners into advertising_banners table';
    ELSE
        RAISE NOTICE 'advertising_banners table already contains data. Skipping sample data insertion.';
    END IF;
END $$;

-- ============================================================================
-- SETUP COMPLETE
-- ============================================================================
-- Next steps:
-- 1. Set is_admin = true for your admin user:
--    UPDATE public.users SET is_admin = true WHERE email = 'your-admin@email.com';
-- 2. Test the admin page at: http://localhost:3000/admin/advertising
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '✅ advertising_banners table setup completed successfully!';
    RAISE NOTICE '📝 Remember to set is_admin = true for your admin user account.';
    RAISE NOTICE '';
    RAISE NOTICE '🔍 VERIFICATION QUERIES:';
    RAISE NOTICE '   -- Check if is_admin column exists:';
    RAISE NOTICE '   SELECT column_name FROM information_schema.columns WHERE table_name = ''users'' AND column_name = ''is_admin'';';
    RAISE NOTICE '';
    RAISE NOTICE '   -- Check your admin status:';
    RAISE NOTICE '   SELECT id, email, is_admin FROM public.users WHERE email = ''your-email@example.com'';';
    RAISE NOTICE '';
    RAISE NOTICE '   -- Check RLS policies:';
    RAISE NOTICE '   SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual FROM pg_policies WHERE tablename = ''advertising_banners'';';
    RAISE NOTICE '';
    RAISE NOTICE '   -- Test admin access (should return all banners):';
    RAISE NOTICE '   SELECT COUNT(*) FROM advertising_banners;';
END $$;

-- ============================================================================
-- TROUBLESHOOTING: If admin actions don't work
-- ============================================================================
-- 1. Verify is_admin is set:
--    SELECT email, is_admin FROM public.users WHERE id = auth.uid();
--
-- 2. Check RLS is enabled:
--    SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'advertising_banners';
--
-- 3. Test admin policy directly:
--    SET ROLE authenticated;
--    SELECT * FROM advertising_banners; -- Should work if you're admin
--
-- 4. If still not working, temporarily disable RLS for testing (NOT for production):
--    ALTER TABLE public.advertising_banners DISABLE ROW LEVEL SECURITY;
--    -- Remember to re-enable after testing:
--    ALTER TABLE public.advertising_banners ENABLE ROW LEVEL SECURITY;
-- ============================================================================
