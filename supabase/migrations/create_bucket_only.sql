-- Create claim-proofs bucket only (no RLS policies)
-- Run this if you get permission errors with the full script

-- Check if bucket exists and create it if not
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM storage.buckets 
        WHERE id = 'claim-proofs'
    ) THEN
        INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
        VALUES (
          'claim-proofs',
          'claim-proofs',
          false,  -- Private bucket (claims are sensitive)
          5242880,  -- 5MB file size limit
          ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf', 'image/heic']::text[]
        );
        RAISE NOTICE 'Created claim-proofs bucket';
    ELSE
        RAISE NOTICE 'claim-proofs bucket already exists';
    END IF;
END $$;

-- Check bucket status
SELECT 
    id,
    name,
    public,
    file_size_limit,
    allowed_mime_types
FROM storage.buckets 
WHERE id = 'claim-proofs';
