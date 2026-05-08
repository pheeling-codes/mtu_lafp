-- Fix claims table - add missing id column as primary key
DO $$
BEGIN
    -- Check if id column exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'claims' AND column_name = 'id'
    ) THEN
        -- Add id column as UUID with default generation
        ALTER TABLE claims ADD COLUMN id UUID DEFAULT gen_random_uuid() PRIMARY KEY;
        RAISE NOTICE 'Added id column as primary key to claims table';
    ELSE
        -- Check if id column is already a primary key
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints tc
            JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
            WHERE tc.table_name = 'claims' 
            AND tc.constraint_type = 'PRIMARY KEY'
            AND kcu.column_name = 'id'
        ) THEN
            -- Make id column the primary key
            ALTER TABLE claims ADD PRIMARY KEY (id);
            RAISE NOTICE 'Made id column primary key in claims table';
        ELSE
            RAISE NOTICE 'id column is already primary key in claims table';
        END IF;
    END IF;
END $$;

-- Check final table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'claims' 
ORDER BY ordinal_position;
