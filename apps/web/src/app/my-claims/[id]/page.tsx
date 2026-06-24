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
    ...(claim as any),
    item: (claim as any)?.item ? {
      ...((claim as any).item),
      name: (claim as any).item.title,
      category: (claim as any).item.category_id,
      location: (claim as any).item.location_id,
    } : null
  };

  return <ClaimDetailClient claim={mappedClaim} />;
}
