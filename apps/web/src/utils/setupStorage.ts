import { supabaseClient } from './supabaseClient';

/**
 * Sets up the avatars storage bucket
 * NOTE: This requires proper RLS policies. Run the SQL below in Supabase Dashboard:
 * 
 * -- 1. Create the bucket (run in Supabase SQL Editor)
 * insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
 * values ('avatars', 'avatars', true, 2097152, array['image/png', 'image/jpeg', 'image/jpg', 'image/webp']);
 * 
 * -- 2. Allow authenticated users to upload
 * create policy "Allow authenticated uploads" on storage.objects
 * for insert to authenticated with check (bucket_id = 'avatars');
 * 
 * -- 3. Allow public access to read avatars
 * create policy "Allow public reads" on storage.objects
 * for select to anon using (bucket_id = 'avatars');
 * 
 * -- 4. Allow users to update their own avatars
 * create policy "Allow users to update own avatars" on storage.objects
 * for update to authenticated using (bucket_id = 'avatars' and owner = auth.uid());
 */
export async function setupAvatarsBucket() {
  try {
    // Check if bucket exists
    const { data: buckets, error: listError } = await supabaseClient.storage.listBuckets();

    if (listError) {
      return { success: false, error: listError, needsManualSetup: true };
    }

    const avatarsBucket = buckets?.find(b => b.name === 'avatars');

    if (!avatarsBucket) {
      // Try to create the bucket (will fail without proper RLS permissions)
      const { data, error } = await supabaseClient.storage.createBucket('avatars', {
        public: true,
        fileSizeLimit: 2 * 1024 * 1024,
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
      });

      if (error) {
        // Silently return - user needs to run SQL manually
        return { success: false, error, needsManualSetup: true };
      }

      return { success: true, data };
    }

    return { success: true, data: avatarsBucket };
  } catch {
    return { success: false, needsManualSetup: true };
  }
}
