-- Add DELETE policy for users to delete their own claims
-- This was missing from the original policies

-- Policy: Users can delete their own claims
CREATE POLICY "Users can delete own claims"
  ON claims FOR DELETE
  TO authenticated
  USING (seeker_id::text = auth.uid()::text);
