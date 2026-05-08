-- First, let's see what policies exist (run this manually to check)
-- SELECT policyname FROM pg_policies WHERE tablename = 'claims';

-- Drop ALL policies on claims table (more aggressive approach)
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'claims'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON claims', pol.policyname);
    END LOOP;
END $$;

-- Now create the correct policies
-- Policy: Users can view their own claims
CREATE POLICY "Users can view own claims"
  ON claims FOR SELECT
  TO authenticated
  USING (seeker_id::text = auth.uid()::text);

-- Policy: Users can create their own claims
CREATE POLICY "Users can create own claims"
  ON claims FOR INSERT
  TO authenticated
  WITH CHECK (seeker_id::text = auth.uid()::text);

-- Policy: Admins can update any claim
CREATE POLICY "Admins can update any claim"
  ON claims FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id::text = auth.uid()::text AND role = 'admin'
    )
  );

-- Policy: Admins can view all claims
CREATE POLICY "Admins can view all claims"
  ON claims FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id::text = auth.uid()::text AND role = 'admin'
    )
  );
