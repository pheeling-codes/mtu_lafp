-- Create the claim-proofs storage bucket for claim evidence uploads
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'claim-proofs',
  'claim-proofs',
  false,  -- Private bucket (claims are sensitive)
  5242880,  -- 5MB file size limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf', 'image/heic']::text[]
)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy: Users can upload files to their own claim folder
DROP POLICY IF EXISTS "Users can upload to claim-proofs" ON storage.objects;
CREATE POLICY "Users can upload to claim-proofs"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'claim-proofs' AND
    (storage.foldername(name))[1]::text = auth.uid()::text
  );

-- Policy: Users can read their own claim files
DROP POLICY IF EXISTS "Users can read own claim files" ON storage.objects;
CREATE POLICY "Users can read own claim files"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'claim-proofs' AND
    (storage.foldername(name))[1]::text = auth.uid()::text
  );

-- Policy: Admins can read all claim files
DROP POLICY IF EXISTS "Admins can read all claim files" ON storage.objects;
CREATE POLICY "Admins can read all claim files"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'claim-proofs' AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()::uuid AND role = 'admin'
    )
  );
