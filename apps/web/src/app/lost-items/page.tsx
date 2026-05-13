import { createServerClient } from '@/utils/supabaseServer';
import { redirect } from 'next/navigation';
import LostItemsClient from './LostItemsClient';

export default async function LostItemsPage() {
  const supabase = await createServerClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login');
  }

  const { data: lostItems } = await supabase
    .from('items')
    .select(`
      id,
      title,
      description,
      category_id,
      location_id,
      date_lost,
      image_url,
      status,
      type,
      reporter_id,
      created_at
    `)
    .eq('type', 'lost')
    .eq('reporter_id', user.id)
    .order('created_at', { ascending: false });

  // Map database columns to client expected format
  const mappedItems = (lostItems || []).map(item => ({
    ...item,
    name: item.title,
    category: item.category_id,
    location: item.location_id,
  }));

  return <LostItemsClient initialItems={mappedItems} userId={user.id} />;
}
