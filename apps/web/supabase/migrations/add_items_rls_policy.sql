-- Add RLS policy to allow authenticated users to insert items

-- Enable RLS on items table (if not already enabled)
ALTER TABLE items ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow authenticated users to insert items" ON items;
DROP POLICY IF EXISTS "Allow users to view all items" ON items;
DROP POLICY IF EXISTS "Allow users to update their own items" ON items;

-- Create policy to allow authenticated users to insert
CREATE POLICY "Allow authenticated users to insert items" 
ON items FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- Allow users to view all items (needed for lost/found items pages)
CREATE POLICY "Allow users to view all items" 
ON items FOR SELECT 
TO authenticated 
USING (true);

-- Allow users to update their own items (cast uuid to text for comparison)
CREATE POLICY "Allow users to update their own items" 
ON items FOR UPDATE 
TO authenticated 
USING (reporter_id = auth.uid()::text);
