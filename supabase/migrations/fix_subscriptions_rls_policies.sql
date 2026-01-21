-- Fix RLS policies for subscriptions table
-- This allows admins to view all subscriptions and users to view their own

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view their own subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Admins can view all subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can view own subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Admins can manage all subscriptions" ON public.subscriptions;

-- Enable RLS on subscriptions table
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own subscriptions
CREATE POLICY "Users can view own subscriptions" ON public.subscriptions
    FOR SELECT
    USING (auth.uid() = user_id);

-- Allow admins to view ALL subscriptions
CREATE POLICY "Admins can view all subscriptions" ON public.subscriptions
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid()
            AND users.user_type = 'Admin'
        )
    );

-- Allow admins to insert/update/delete subscriptions
CREATE POLICY "Admins can manage subscriptions" ON public.subscriptions
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid()
            AND users.user_type = 'Admin'
        )
    );

-- System can insert subscriptions (for Stripe webhooks, etc.)
CREATE POLICY "System can create subscriptions" ON public.subscriptions
    FOR INSERT
    WITH CHECK (true);

-- System can update subscriptions (for Stripe webhooks, etc.)
CREATE POLICY "System can update subscriptions" ON public.subscriptions
    FOR UPDATE
    USING (true);

-- ============================================
-- Fix RLS policies for pricing_plans table
-- ============================================

-- Enable RLS on pricing_plans table if not already enabled
ALTER TABLE public.pricing_plans ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Pricing plans are viewable by everyone" ON public.pricing_plans;
DROP POLICY IF EXISTS "Everyone can view pricing plans" ON public.pricing_plans;
DROP POLICY IF EXISTS "Public can view pricing plans" ON public.pricing_plans;

-- Allow everyone (including authenticated and anonymous users) to view pricing plans
CREATE POLICY "Public can view pricing plans" ON public.pricing_plans
    FOR SELECT
    USING (true);

-- Only admins can manage pricing plans
CREATE POLICY "Admins can manage pricing plans" ON public.pricing_plans
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid()
            AND users.user_type = 'Admin'
        )
    );

-- ============================================
-- Grant necessary permissions
-- ============================================

-- Grant usage on schema to authenticated and anonymous users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;

-- Grant SELECT on pricing_plans to authenticated and anonymous users
GRANT SELECT ON public.pricing_plans TO authenticated;
GRANT SELECT ON public.pricing_plans TO anon;

-- Grant SELECT on subscriptions to authenticated users
GRANT SELECT ON public.subscriptions TO authenticated;

-- Grant all privileges on subscriptions to service role (for system operations)
GRANT ALL ON public.subscriptions TO service_role;
