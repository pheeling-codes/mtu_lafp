-- Fix items table schema - Add all missing columns for report wizard

-- Add name column (required)
ALTER TABLE items ADD COLUMN IF NOT EXISTS name TEXT NOT NULL DEFAULT 'Unnamed Item';

-- Add category column
ALTER TABLE items ADD COLUMN IF NOT EXISTS category TEXT;

-- Add description column
ALTER TABLE items ADD COLUMN IF NOT EXISTS description TEXT;

-- Add location column
ALTER TABLE items ADD COLUMN IF NOT EXISTS location TEXT;

-- Add date_lost column
ALTER TABLE items ADD COLUMN IF NOT EXISTS date_lost DATE;

-- Verify all columns
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'items' 
ORDER BY ordinal_position;
