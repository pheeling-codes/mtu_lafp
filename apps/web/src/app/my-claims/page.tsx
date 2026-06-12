import { createServerClient } from '@/utils/supabaseServer';
import { redirect } from 'next/navigation';
import MyClaimsClient from './MyClaimsClient';

export default async function MyClaimsPage() {
  const supabase = await createServerClient();
  
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (!user || userError) {
    redirect('/login');
  }

  // Fetch user's claims
  const { data: claims, error } = await supabase
    .from('claims')
    .select(`
      *,
      item:items(*)
    `)
    .eq('seeker_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching claims:', error);
  }

  // Map database columns to client expected format
  const mappedClaims = (claims || []).map(claim => ({
    ...claim,
    item: claim.item ? {
      ...claim.item,
      name: claim.item.title,
      category: claim.item.category_id,
      location: claim.item.location_id,
    } : null
  }));

  return <MyClaimsClient initialClaims={mappedClaims} userId={user.id} />;
}
