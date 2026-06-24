import { createServerClient } from '@/utils/supabaseServer';
import { redirect, notFound } from 'next/navigation';
import ItemDetailClient from './ItemDetailClient';

interface ItemDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ItemDetailPage({ params }: ItemDetailPageProps) {
  const { id } = await params;
  const supabase = await createServerClient();
  
  // Check authentication
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
    ...(item as any),
    name: (item as any)?.title,
    category: (item as any)?.category_id,
    location: (item as any)?.location_id,
  };

  return <ItemDetailClient item={mappedItem} userId={session.user.id} />;
}
