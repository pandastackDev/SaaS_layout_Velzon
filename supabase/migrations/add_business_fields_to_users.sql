-- Add business and project related fields to users table
-- These fields are optional and can be used to store additional business information
-- Currently, this data is stored in user metadata, but this migration allows for database storage

-- Add company/business fields
ALTER TABLE users ADD COLUMN IF NOT EXISTS company_name TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS company_nif TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS company_telephone TEXT;

-- Add project fields
ALTER TABLE users ADD COLUMN IF NOT EXISTS project_name TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS project_category TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS description TEXT;

-- Add financial fields
ALTER TABLE users ADD COLUMN IF NOT EXISTS capital_percentage TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS capital_total_value TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS license_fee TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS licensing_royalties_percentage TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS franchisee_investment TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS monthly_royalties TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS total_sale_of_project TEXT;

-- Add inventor specific fields
ALTER TABLE users ADD COLUMN IF NOT EXISTS inventor_name TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS license_number TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS release_date TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS initial_license_value TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS exploitation_license_royalty TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS patent_sale TEXT;

-- Add investor specific fields
ALTER TABLE users ADD COLUMN IF NOT EXISTS investors_count TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS smart_money TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS investment_preferences TEXT;

-- Add media fields
ALTER TABLE users ADD COLUMN IF NOT EXISTS pitch_video_url TEXT;

-- Add profile status if not exists
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_status TEXT DEFAULT 'pending';
ALTER TABLE users ADD COLUMN IF NOT EXISTS telephone TEXT;

-- Add comments for documentation
COMMENT ON COLUMN users.capital_percentage IS 'Percentage of capital being offered';
COMMENT ON COLUMN users.capital_total_value IS 'Total value of the capital';
COMMENT ON COLUMN users.license_fee IS 'License fee amount';
COMMENT ON COLUMN users.total_sale_of_project IS 'Total sale amount for the project';
COMMENT ON COLUMN users.investment_preferences IS 'Investor preferences and interests';
COMMENT ON COLUMN users.profile_status IS 'User profile approval status: pending, approved, rejected';
