import { createServerClient } from '@/utils/supabaseServer';
import { redirect } from 'next/navigation';
import MatchesClient from './MatchesClient';

export default async function MatchesPage() {
  const supabase = await createServerClient();
  
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    redirect('/login');
  }

  // Fetch potential matches for the current user
  // Matches are where a lost item (reported by user) matches a found item
  const { data: matches, error } = await supabase
    .from('matches')
    .select(`
      *,
      lost_item:items!matches_lost_item_id_fkey(*),
      found_item:items!matches_found_item_id_fkey(*)
    `)
    .eq('lost_item.reporter_id', session.user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching matches:', error);
  }

  return <MatchesClient initialMatches={matches || []} userId={session.user.id} />;
}
