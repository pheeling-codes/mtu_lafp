import { createServerClient } from '@/utils/supabaseServer';
import { redirect } from 'next/navigation';
import FoundItemsClient from './FoundItemsClient';

export default async function FoundItemsPage() {
  const supabase = await createServerClient();
  
  // Check authentication
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    redirect('/login');
  }

  // Fetch found items
  const { data: items, error } = await supabase
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
    .eq('type', 'found')
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  if (error) {
  }

  // Map database columns to client expected format
  const mappedItems = (items || [] as any[]).map(item => ({
    ...item,
    name: item.title,
    category: item.category_id,
    location: item.location_id,
  }));

  return <FoundItemsClient initialItems={mappedItems} userId={session.user.id} />;
}
