-- Update claims table schema for full claim verification system

-- Add recovery_instructions column for approved claims
ALTER TABLE claims ADD COLUMN IF NOT EXISTS recovery_instructions TEXT;

-- Add admin_notes column for staff internal notes
ALTER TABLE claims ADD COLUMN IF NOT EXISTS admin_notes TEXT;

-- Add reviewed_at timestamp for when admin reviews the claim
ALTER TABLE claims ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP WITH TIME ZONE;

-- Add reviewed_by to track which admin reviewed the claim
ALTER TABLE claims ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES auth.users(id);

-- Update status check constraint to match our new statuses
-- First drop existing constraint if exists
ALTER TABLE claims DROP CONSTRAINT IF EXISTS claims_status_check;

-- Add new constraint with correct statuses
ALTER TABLE claims ADD CONSTRAINT claims_status_check 
  CHECK (status IN ('pending_review', 'approved', 'rejected'));

-- Create index for faster lookups by user
CREATE INDEX IF NOT EXISTS idx_claims_seeker_id ON claims(seeker_id);

-- Create index for status-based filtering
CREATE INDEX IF NOT EXISTS idx_claims_status ON claims(status);

-- Update existing 'pending' statuses to 'pending_review'
UPDATE claims SET status = 'pending_review' WHERE status = 'pending';

-- Enable RLS on claims table (if not already enabled)
ALTER TABLE claims ENABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies on claims table
DROP POLICY IF EXISTS "Users can view own claims" ON claims;
DROP POLICY IF EXISTS "Users can create own claims" ON claims;
DROP POLICY IF EXISTS "Admins can update any claim" ON claims;
DROP POLICY IF EXISTS "Admins can view all claims" ON claims;
DROP POLICY IF EXISTS "claims_select_own" ON claims;
DROP POLICY IF EXISTS "claims_insert_own" ON claims;

-- Policy: Users can view their own claims
CREATE POLICY "Users can view own claims"
  ON claims FOR SELECT
  TO authenticated
  USING (seeker_id = auth.uid()::text);

-- Policy: Users can create their own claims
CREATE POLICY "Users can create own claims"
  ON claims FOR INSERT
  TO authenticated
  WITH CHECK (seeker_id = auth.uid()::text);

-- Policy: Admins can update any claim
CREATE POLICY "Admins can update any claim"
  ON claims FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid()::uuid AND role = 'admin'
    )
  );

-- Policy: Admins can view all claims
CREATE POLICY "Admins can view all claims"
  ON claims FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid()::uuid AND role = 'admin'
    )
  );
