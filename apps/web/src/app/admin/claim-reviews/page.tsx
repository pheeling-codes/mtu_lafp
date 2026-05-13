import { createServerClient } from '@/utils/supabaseServer';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import ClaimReviewQueueClient from './ClaimReviewQueueClient';

interface ClaimWithDetails {
  id: string;
  item_id: string;
  seeker_id: string;
  verification_text: string;
  proof_url: string | null;
  status: 'pending_review' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
  seeker: {
    full_name: string;
    email: string;
    avatar_url: string | null;
  };
  item: {
    id: string;
    title: string;
    category_id: string;
    location_id: string;
    image_url: string | null;
    created_at: string;
  };
}

export default async function ClaimReviewQueuePage() {
  const supabase = await createServerClient();
  const cookieStore = await cookies();
  
  // Get role from cookie for admin check
  const roleCookie = cookieStore.get('user-role')?.value;

  if (!roleCookie || roleCookie?.toUpperCase() !== 'ADMIN') {
    redirect('/dashboard');
  }

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    redirect('/login');
  }

  // Use service role client for comprehensive query
  const serviceClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Triple-join query: Claim ↔ Item ↔ Profile
  const { data: claims, error } = await serviceClient
    .from('claims')
    .select(`
      *,
      seeker:profiles!claims_seeker_id_fkey(
        full_name,
        email,
        avatar_url
      ),
      item:items(
        id,
        title,
        category_id,
        location_id,
        image_url,
        created_at
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    // Silent error handling
  }

  return (
    <ClaimReviewQueueClient 
      claims={claims as ClaimWithDetails[] || []}
    />
  );
}
