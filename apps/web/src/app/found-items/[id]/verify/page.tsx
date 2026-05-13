import { createServerClient } from '@/utils/supabaseServer';
import { redirect, notFound } from 'next/navigation';
import VerifyClaimClient from './VerifyClaimClient';

interface VerifyClaimPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function VerifyClaimPage({ params }: VerifyClaimPageProps) {
  const { id } = await params;
  const supabase = await createServerClient();
  
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    redirect('/login');
  }

  // Fetch item details
  const { data: item, error } = await supabase
    .from('items')
    .select('*')
    .eq('id', id)
    .eq('type', 'found')
    .single();

  if (error || !item) {
    notFound();
  }

  // Map database columns to client expected format
  const mappedItem = {
    ...item,
    name: item.title,
    category: item.category_id,
    location: item.location_id,
  };

  return <VerifyClaimClient item={mappedItem} userId={session.user.id} />;
}
