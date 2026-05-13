-- Fix items table id column to auto-generate UUIDs

-- First check if the id column exists and its current default
SELECT column_name, column_default, data_type 
FROM information_schema.columns 
WHERE table_name = 'items' AND column_name = 'id';

-- If id column exists but has no default, set it to generate UUID
ALTER TABLE items 
ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- If the id column doesn't exist, create it
ALTER TABLE items 
ADD COLUMN IF NOT EXISTS id UUID PRIMARY KEY DEFAULT gen_random_uuid();

-- Alternative: if using the uuid-ossp extension
-- ALTER TABLE items ALTER COLUMN id SET DEFAULT uuid_generate_v4();
