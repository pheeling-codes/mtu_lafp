-- Setup RLS policies for item-images storage bucket

-- Enable public read access for item-images bucket
CREATE POLICY "Allow public read access to item-images"
ON storage.objects FOR SELECT
USING (bucket_id = 'item-images');

-- Allow authenticated users to upload to item-images
CREATE POLICY "Allow authenticated uploads to item-images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'item-images');

-- Allow users to update/delete their own uploads
CREATE POLICY "Allow users to manage their own item-images"
ON storage.objects FOR ALL
TO authenticated
USING (bucket_id = 'item-images' AND auth.uid()::text = (storage.foldername(name))[1])
WITH CHECK (bucket_id = 'item-images');
