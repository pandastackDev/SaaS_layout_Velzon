-- Add timing fields to auctions table for Proposta activation
-- Based on requirements: proposals start when user activates, not automatically
-- Duration options: 3/7/10 days (configurable by admin)
-- Time display logic: threshold at 24h or 48h (configurable)

-- Add timing fields to auctions table
ALTER TABLE public.auctions
ADD COLUMN IF NOT EXISTS proposal_status text NOT NULL DEFAULT 'inactive',
ADD COLUMN IF NOT EXISTS activated_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS duration_days integer,
ADD COLUMN IF NOT EXISTS ends_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS ended_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS cancelled_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS cancel_reason text;

-- Add check constraint for proposal_status
ALTER TABLE public.auctions
DROP CONSTRAINT IF EXISTS auctions_proposal_status_check;

ALTER TABLE public.auctions
ADD CONSTRAINT auctions_proposal_status_check
CHECK (proposal_status IN ('inactive', 'active', 'ended', 'cancelled'));

-- Create index for proposal status queries
CREATE INDEX IF NOT EXISTS idx_auctions_proposal_status
ON public.auctions(proposal_status);

-- Create index for active proposals with time remaining
CREATE INDEX IF NOT EXISTS idx_auctions_active_proposals
ON public.auctions(proposal_status, ends_at)
WHERE proposal_status = 'active';

-- Create index for ended proposals
CREATE INDEX IF NOT EXISTS idx_auctions_ended_proposals
ON public.auctions(proposal_status, ended_at)
WHERE proposal_status = 'ended';

-- Add comments explaining the fields
COMMENT ON COLUMN public.auctions.proposal_status IS 'Proposal activation status: inactive (not started), active (running), ended (completed), cancelled (stopped by admin/user)';
COMMENT ON COLUMN public.auctions.activated_at IS 'UTC timestamp when user clicked Activate Proposal (start time = server-side timestamp)';
COMMENT ON COLUMN public.auctions.duration_days IS 'Number of days the proposal runs (typically 3, 7, or 10 days - configurable by admin)';
COMMENT ON COLUMN public.auctions.ends_at IS 'Computed: activated_at + duration_days (end time = start time + duration, no manual input needed)';
COMMENT ON COLUMN public.auctions.ended_at IS 'UTC timestamp when proposal ended (naturally by reaching ends_at or manually by admin/user)';
COMMENT ON COLUMN public.auctions.cancelled_at IS 'UTC timestamp when proposal was cancelled';
COMMENT ON COLUMN public.auctions.cancel_reason IS 'Admin/user provided reason for cancellation';

-- Function to automatically mark proposals as ended when they expire
CREATE OR REPLACE FUNCTION check_expired_proposals()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.auctions
  SET 
    proposal_status = 'ended',
    ended_at = NOW(),
    status = 'completed'
  WHERE 
    proposal_status = 'active'
    AND ends_at < NOW()
    AND ended_at IS NULL;
END;
$$;

-- You can call this function periodically via a cron job or scheduled function
-- Example: SELECT check_expired_proposals();

-- Note: For real-time expiry checking, you can:
-- 1. Use Supabase Edge Functions with cron triggers
-- 2. Use pg_cron extension if available
-- 3. Check client-side and update via API when user views auctions
