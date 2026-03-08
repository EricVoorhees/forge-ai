-- Add credit_balance column to subscriptions table
-- This column tracks the user's remaining credit balance in USD

ALTER TABLE subscriptions 
ADD COLUMN IF NOT EXISTS credit_balance NUMERIC(10, 4) NOT NULL DEFAULT 0;

-- Add comment for documentation
COMMENT ON COLUMN subscriptions.credit_balance IS 'USD balance remaining for usage-based billing';
