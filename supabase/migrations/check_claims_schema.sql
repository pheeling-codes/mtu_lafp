-- Check claims table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'claims' 
ORDER BY ordinal_position;

-- Add hidden_details column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'claims' AND column_name = 'hidden_details'
    ) THEN
        ALTER TABLE claims ADD COLUMN hidden_details TEXT;
        RAISE NOTICE 'Added hidden_details column to claims table';
    ELSE
        RAISE NOTICE 'hidden_details column already exists';
    END IF;
END $$;

-- Check if seeker_id column exists (might be user_id)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'claims' AND column_name = 'seeker_id'
    ) THEN
        -- Check if user_id exists instead
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'claims' AND column_name = 'user_id'
        ) THEN
            -- Rename user_id to seeker_id
            ALTER TABLE claims RENAME COLUMN user_id TO seeker_id;
            RAISE NOTICE 'Renamed user_id to seeker_id';
        ELSE
            -- Add seeker_id column
            ALTER TABLE claims ADD COLUMN seeker_id UUID REFERENCES auth.users(id);
            RAISE NOTICE 'Added seeker_id column to claims table';
        END IF;
    ELSE
        RAISE NOTICE 'seeker_id column already exists';
    END IF;
END $$;

-- Final check of claims table
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'claims' 
ORDER BY ordinal_position;
