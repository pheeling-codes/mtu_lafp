-- Add missing columns to items table for report wizard

-- Add category column
ALTER TABLE items ADD COLUMN IF NOT EXISTS category TEXT;

-- Add description column
ALTER TABLE items ADD COLUMN IF NOT EXISTS description TEXT;

-- Add location column
ALTER TABLE items ADD COLUMN IF NOT EXISTS location TEXT;

-- Add date_lost column
ALTER TABLE items ADD COLUMN IF NOT EXISTS date_lost DATE;

-- Verify columns were added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'items' 
ORDER BY ordinal_position;
