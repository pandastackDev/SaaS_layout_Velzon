-- =====================================================
-- AUCTIONS & BIDS SETUP WITH SAMPLE DATA & RLS POLICIES
-- =====================================================

-- First, ensure the auctions table has all required columns
-- Add missing columns if they don't exist
DO $$ 
BEGIN
  -- Add start_date if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'auctions' 
    AND column_name = 'start_date'
  ) THEN
    ALTER TABLE public.auctions ADD COLUMN start_date timestamp with time zone NOT NULL DEFAULT now();
  END IF;

  -- Add end_date if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'auctions' 
    AND column_name = 'end_date'
  ) THEN
    ALTER TABLE public.auctions ADD COLUMN end_date timestamp with time zone NOT NULL DEFAULT (now() + INTERVAL '7 days');
  END IF;

  -- Add starting_bid if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'auctions' 
    AND column_name = 'starting_bid'
  ) THEN
    ALTER TABLE public.auctions ADD COLUMN starting_bid numeric(10, 2) NOT NULL DEFAULT 1000.00;
  END IF;

  -- Add current_bid if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'auctions' 
    AND column_name = 'current_bid'
  ) THEN
    ALTER TABLE public.auctions ADD COLUMN current_bid numeric(10, 2) NOT NULL DEFAULT 1000.00;
  END IF;

  -- Add bid_increment if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'auctions' 
    AND column_name = 'bid_increment'
  ) THEN
    ALTER TABLE public.auctions ADD COLUMN bid_increment numeric(10, 2) NOT NULL DEFAULT 100.00;
  END IF;

  -- Add currency if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'auctions' 
    AND column_name = 'currency'
  ) THEN
    ALTER TABLE public.auctions ADD COLUMN currency text NOT NULL DEFAULT 'USD';
  END IF;

  -- Add status check constraint if it doesn't exist
  -- First, drop any existing status check constraint
  BEGIN
    ALTER TABLE public.auctions DROP CONSTRAINT IF EXISTS auctions_status_check;
  EXCEPTION
    WHEN undefined_object THEN NULL;
  END;
  
  -- Now add the constraint with our values
  ALTER TABLE public.auctions ADD CONSTRAINT auctions_status_check 
    CHECK (status = ANY (ARRAY['pending'::text, 'active'::text, 'completed'::text, 'cancelled'::text]));
END $$;

-- Ensure the bids table has status column (for accept/reject functionality)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'bids' 
    AND column_name = 'status'
  ) THEN
    ALTER TABLE public.bids ADD COLUMN status text NOT NULL DEFAULT 'pending';
  END IF;
  
  -- Drop and recreate bids status constraint
  BEGIN
    ALTER TABLE public.bids DROP CONSTRAINT IF EXISTS bids_status_check;
  EXCEPTION
    WHEN undefined_object THEN NULL;
  END;
  
  ALTER TABLE public.bids ADD CONSTRAINT bids_status_check 
    CHECK (status = ANY (ARRAY['pending'::text, 'accepted'::text, 'rejected'::text]));
END $$;

-- Create indexes for better performance (if they don't exist)
CREATE INDEX IF NOT EXISTS idx_auctions_project_id ON public.auctions USING btree (project_id);
CREATE INDEX IF NOT EXISTS idx_auctions_status ON public.auctions USING btree (status);
CREATE INDEX IF NOT EXISTS idx_auctions_start_date ON public.auctions USING btree (start_date);
CREATE INDEX IF NOT EXISTS idx_auctions_end_date ON public.auctions USING btree (end_date);
CREATE INDEX IF NOT EXISTS idx_bids_status ON public.bids USING btree (status);

-- =====================================================
-- RLS POLICIES FOR AUCTIONS
-- =====================================================

-- Enable RLS
ALTER TABLE public.auctions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bids ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Anyone can view auctions" ON public.auctions;
DROP POLICY IF EXISTS "Admins can insert auctions" ON public.auctions;
DROP POLICY IF EXISTS "Admins can update auctions" ON public.auctions;
DROP POLICY IF EXISTS "Admins can delete auctions" ON public.auctions;

DROP POLICY IF EXISTS "Anyone can view bids" ON public.bids;
DROP POLICY IF EXISTS "Users can insert their own bids" ON public.bids;
DROP POLICY IF EXISTS "Users can view their own bids" ON public.bids;
DROP POLICY IF EXISTS "Admins can manage all bids" ON public.bids;

-- Auctions policies
CREATE POLICY "Anyone can view auctions"
  ON public.auctions FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert auctions"
  ON public.auctions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.is_admin = true
    )
  );

CREATE POLICY "Admins can update auctions"
  ON public.auctions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.is_admin = true
    )
  );

CREATE POLICY "Admins can delete auctions"
  ON public.auctions FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.is_admin = true
    )
  );

-- Bids policies
CREATE POLICY "Anyone can view bids"
  ON public.bids FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert bids"
  ON public.bids FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bids"
  ON public.bids FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all bids"
  ON public.bids FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.is_admin = true
    )
  );

-- =====================================================
-- INSERT SAMPLE AUCTION DATA
-- =====================================================

-- First, let's get some existing project IDs and user IDs to use
-- We'll create auctions for existing projects

DO $$
DECLARE
  project_ids uuid[];
  user_ids uuid[];
  auction_id uuid;
  i int;
BEGIN
  -- Get first 5 project IDs
  SELECT ARRAY_AGG(id) INTO project_ids
  FROM (
    SELECT id FROM public.projects
    ORDER BY created_at DESC
    LIMIT 5
  ) AS subquery;

  -- Get first 5 user IDs (for bids)
  SELECT ARRAY_AGG(id) INTO user_ids
  FROM (
    SELECT id FROM public.users
    ORDER BY created_at DESC
    LIMIT 5
  ) AS subquery;

  -- Only proceed if we have projects
  IF array_length(project_ids, 1) > 0 THEN
    
    -- Auction 1: Active auction (ends in 7 days)
    IF project_ids[1] IS NOT NULL THEN
      INSERT INTO public.auctions (
        project_id,
        title,
        start_date,
        end_date,
        starting_bid,
        current_bid,
        bid_increment,
        currency,
        status
      ) VALUES (
        project_ids[1],
        'Premium Investment Opportunity',
        now() - INTERVAL '2 days',
        now() + INTERVAL '7 days',
        5000.00,
        15000.00,
        500.00,
        'USD',
        'active'
      ) RETURNING id INTO auction_id;

      -- Add some bids for this auction
      IF array_length(user_ids, 1) > 0 THEN
        FOR i IN 1..LEAST(3, array_length(user_ids, 1)) LOOP
          INSERT INTO public.bids (
            auction_id,
            auction_id_new,
            user_id,
            bid_amount,
            status
          ) VALUES (
            auction_id::text,
            auction_id,
            user_ids[i],
            5000.00 + (i * 500.00),
            CASE WHEN i = 3 THEN 'pending' ELSE 'rejected' END
          );
        END LOOP;
      END IF;
    END IF;

    -- Auction 2: Another active auction
    IF project_ids[2] IS NOT NULL THEN
      INSERT INTO public.auctions (
        project_id,
        title,
        start_date,
        end_date,
        starting_bid,
        current_bid,
        bid_increment,
        currency,
        status
      ) VALUES (
        project_ids[2],
        'High-Value Tech Startup Auction',
        now() - INTERVAL '1 day',
        now() + INTERVAL '14 days',
        10000.00,
        25000.00,
        1000.00,
        'USD',
        'active'
      ) RETURNING id INTO auction_id;

      -- Add bids
      IF array_length(user_ids, 1) > 1 THEN
        FOR i IN 1..LEAST(4, array_length(user_ids, 1)) LOOP
          INSERT INTO public.bids (
            auction_id,
            auction_id_new,
            user_id,
            bid_amount,
            status
          ) VALUES (
            auction_id::text,
            auction_id,
            user_ids[i],
            10000.00 + (i * 1000.00),
            CASE WHEN i = 4 THEN 'pending' ELSE 'rejected' END
          );
        END LOOP;
      END IF;
    END IF;

    -- Auction 3: Pending auction (starts tomorrow)
    IF project_ids[3] IS NOT NULL THEN
      INSERT INTO public.auctions (
        project_id,
        title,
        start_date,
        end_date,
        starting_bid,
        current_bid,
        bid_increment,
        currency,
        status
      ) VALUES (
        project_ids[3],
        'Upcoming Green Energy Project',
        now() + INTERVAL '1 day',
        now() + INTERVAL '8 days',
        3000.00,
        3000.00,
        200.00,
        'USD',
        'pending'
      );
    END IF;

    -- Auction 4: Completed auction
    IF project_ids[4] IS NOT NULL THEN
      INSERT INTO public.auctions (
        project_id,
        title,
        start_date,
        end_date,
        starting_bid,
        current_bid,
        bid_increment,
        currency,
        status
      ) VALUES (
        project_ids[4],
        'Successful Real Estate Development',
        now() - INTERVAL '15 days',
        now() - INTERVAL '1 day',
        8000.00,
        20000.00,
        500.00,
        'USD',
        'completed'
      ) RETURNING id INTO auction_id;

      -- Add bids
      IF array_length(user_ids, 1) > 0 THEN
        FOR i IN 1..LEAST(5, array_length(user_ids, 1)) LOOP
          INSERT INTO public.bids (
            auction_id,
            auction_id_new,
            user_id,
            bid_amount,
            status
          ) VALUES (
            auction_id::text,
            auction_id,
            user_ids[i],
            8000.00 + (i * 500.00),
            CASE WHEN i = 5 THEN 'accepted' ELSE 'rejected' END
          );
        END LOOP;
      END IF;
    END IF;

    -- Auction 5: Active auction with high bids
    IF array_length(project_ids, 1) >= 5 AND project_ids[5] IS NOT NULL THEN
      INSERT INTO public.auctions (
        project_id,
        title,
        start_date,
        end_date,
        starting_bid,
        current_bid,
        bid_increment,
        currency,
        status
      ) VALUES (
        project_ids[5],
        'Exclusive Innovation Hub Auction',
        now() - INTERVAL '3 days',
        now() + INTERVAL '10 days',
        15000.00,
        35000.00,
        1000.00,
        'USD',
        'active'
      ) RETURNING id INTO auction_id;

      -- Add bids
      IF array_length(user_ids, 1) > 1 THEN
        FOR i IN 1..LEAST(6, array_length(user_ids, 1)) LOOP
          INSERT INTO public.bids (
            auction_id,
            auction_id_new,
            user_id,
            bid_amount,
            status
          ) VALUES (
            auction_id::text,
            auction_id,
            user_ids[i],
            15000.00 + (i * 1000.00),
            CASE WHEN i = 6 THEN 'pending' ELSE 'rejected' END
          );
        END LOOP;
      END IF;
    END IF;

    RAISE NOTICE 'Sample auctions and bids created successfully!';
  ELSE
    RAISE NOTICE 'No projects found. Please create projects first before running this script.';
  END IF;
END $$;

-- =====================================================
-- CREATE TRIGGER TO UPDATE updated_at
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_auctions_updated_at ON public.auctions;
CREATE TRIGGER update_auctions_updated_at
    BEFORE UPDATE ON public.auctions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_bids_updated_at ON public.bids;
CREATE TRIGGER update_bids_updated_at
    BEFORE UPDATE ON public.bids
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check auctions count
SELECT 
  status,
  COUNT(*) as count
FROM public.auctions
GROUP BY status
ORDER BY status;

-- Check bids count
SELECT 
  status,
  COUNT(*) as count
FROM public.bids
GROUP BY status
ORDER BY status;

-- Show auctions with project info
SELECT 
  a.id,
  a.title as auction_title,
  p.title as project_title,
  a.starting_bid,
  a.current_bid,
  a.status,
  a.start_date,
  a.end_date,
  (SELECT COUNT(*) FROM public.bids WHERE auction_id_new = a.id) as bids_count
FROM public.auctions a
LEFT JOIN public.projects p ON p.id = a.project_id
ORDER BY a.created_at DESC;
