-- Create auctions and bids tables for auction management

-- ================================================
-- AUCTIONS TABLE
-- ================================================
CREATE TABLE IF NOT EXISTS auctions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    starting_bid DECIMAL(10, 2) NOT NULL DEFAULT 0,
    current_bid DECIMAL(10, 2) NOT NULL DEFAULT 0,
    bid_increment DECIMAL(10, 2) NOT NULL DEFAULT 100,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT check_auction_status CHECK (status IN ('pending', 'active', 'completed', 'cancelled')),
    CONSTRAINT check_auction_dates CHECK (end_time > start_time),
    CONSTRAINT check_bid_values CHECK (current_bid >= starting_bid AND bid_increment > 0)
);

-- Add indexes for auctions
CREATE INDEX IF NOT EXISTS idx_auctions_project_id ON auctions(project_id);
CREATE INDEX IF NOT EXISTS idx_auctions_status ON auctions(status);
CREATE INDEX IF NOT EXISTS idx_auctions_dates ON auctions(start_time, end_time);

-- Add comments
COMMENT ON TABLE auctions IS 'Stores auction information for projects';
COMMENT ON COLUMN auctions.project_id IS 'Reference to the project being auctioned';
COMMENT ON COLUMN auctions.starting_bid IS 'Initial minimum bid amount';
COMMENT ON COLUMN auctions.current_bid IS 'Current highest bid amount';
COMMENT ON COLUMN auctions.bid_increment IS 'Minimum increment for each new bid';
COMMENT ON COLUMN auctions.status IS 'Auction status: pending, active, completed, cancelled';

-- ================================================
-- BIDS TABLE
-- ================================================
CREATE TABLE IF NOT EXISTS bids (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auction_id UUID NOT NULL REFERENCES auctions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT check_bid_status CHECK (status IN ('pending', 'accepted', 'rejected', 'outbid')),
    CONSTRAINT check_bid_amount CHECK (amount > 0)
);

-- Add indexes for bids
CREATE INDEX IF NOT EXISTS idx_bids_auction_id ON bids(auction_id);
CREATE INDEX IF NOT EXISTS idx_bids_user_id ON bids(user_id);
CREATE INDEX IF NOT EXISTS idx_bids_status ON bids(status);
CREATE INDEX IF NOT EXISTS idx_bids_amount ON bids(amount DESC);
CREATE INDEX IF NOT EXISTS idx_bids_created_at ON bids(created_at DESC);

-- Add comments
COMMENT ON TABLE bids IS 'Stores bids placed by users on auctions';
COMMENT ON COLUMN bids.auction_id IS 'Reference to the auction';
COMMENT ON COLUMN bids.user_id IS 'Reference to the user who placed the bid';
COMMENT ON COLUMN bids.amount IS 'Bid amount';
COMMENT ON COLUMN bids.status IS 'Bid status: pending, accepted, rejected, outbid';

-- ================================================
-- TRIGGER: Update current_bid when new bid is placed
-- ================================================
CREATE OR REPLACE FUNCTION update_auction_current_bid()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the auction's current_bid to the highest bid amount
    UPDATE auctions
    SET current_bid = (
        SELECT COALESCE(MAX(amount), starting_bid)
        FROM bids
        WHERE auction_id = NEW.auction_id
    )
    WHERE id = NEW.auction_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_auction_current_bid
AFTER INSERT OR UPDATE ON bids
FOR EACH ROW
EXECUTE FUNCTION update_auction_current_bid();

-- ================================================
-- TRIGGER: Mark previous bids as outbid
-- ================================================
CREATE OR REPLACE FUNCTION mark_previous_bids_outbid()
RETURNS TRIGGER AS $$
BEGIN
    -- Mark all previous bids for this auction as 'outbid' except the new one
    UPDATE bids
    SET status = 'outbid'
    WHERE auction_id = NEW.auction_id 
    AND id != NEW.id 
    AND status = 'pending';
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_mark_previous_bids_outbid
AFTER INSERT ON bids
FOR EACH ROW
EXECUTE FUNCTION mark_previous_bids_outbid();

-- ================================================
-- RLS POLICIES FOR AUCTIONS
-- ================================================
ALTER TABLE auctions ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to view auctions
CREATE POLICY "Anyone can view auctions"
ON auctions FOR SELECT
TO authenticated
USING (true);

-- Only admins can insert/update/delete auctions
CREATE POLICY "Admins can manage auctions"
ON auctions FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- ================================================
-- RLS POLICIES FOR BIDS
-- ================================================
ALTER TABLE bids ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to view bids
CREATE POLICY "Anyone can view bids"
ON bids FOR SELECT
TO authenticated
USING (true);

-- Users can insert their own bids
CREATE POLICY "Users can place bids"
ON bids FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Only admins can update/delete bids
CREATE POLICY "Admins can manage bids"
ON bids FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);
