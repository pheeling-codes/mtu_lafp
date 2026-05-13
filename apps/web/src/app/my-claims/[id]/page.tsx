import { createServerClient } from '@/utils/supabaseServer';
import { notFound } from 'next/navigation';
import ClaimDetailClient from './ClaimDetailClient';

interface ClaimDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ClaimDetailPage({ params }: ClaimDetailPageProps) {
  const { id } = await params;
  const supabase = await createServerClient();
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    notFound();
  }
  
  // Fetch claim with item details
  const { data: claim, error } = await supabase
    .from('claims')
    .select(`
      *,
      item:items(*)
    `)
    .eq('id', id)
    .eq('seeker_id', user.id)
    .single();
  
  if (error || !claim) {
    notFound();
  }
  
  // Map database columns to client expected format
  const mappedClaim = {
    ...claim,
    item: claim.item ? {
      ...claim.item,
      name: claim.item.title,
      category: claim.item.category_id,
      location: claim.item.location_id,
    } : null
  };

  return <ClaimDetailClient claim={mappedClaim} />;
}
