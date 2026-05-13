import { createServerClient } from '@/utils/supabaseServer';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import InventoryManagementClient from './InventoryManagementClient';

interface DbItem {
  id: string;
  type: string;
  title: string;
  description: string;
  description_public: string;
  description_private: string | null;
  status: string;
  image_url: string | null;
  date_lost_or_found: string | null;
  created_at: string;
  updated_at: string;
  reporter_id: string;
  category_id: string;
  location_id: string;
}

interface DbProfile {
  id: string;
  email: string;
}

export default async function InventoryManagementPage() {
  const supabase = await createServerClient();
  const cookieStore = await cookies();
  
  // Get role from cookie for admin check (more reliable than DB query)
  const roleCookie = cookieStore.get('user-role')?.value;

  if (!roleCookie || roleCookie?.toUpperCase() !== 'ADMIN') {
    redirect('/dashboard');
  }

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    redirect('/login');
  }

  // Fetch all items
  const { data: rawItems } = await supabase
    .from('items')
    .select('*')
    .order('created_at', { ascending: false });

  const items = (rawItems || []) as DbItem[];

  // Fetch all profiles for reporter email lookup using service role to bypass RLS
  const serviceClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  
  const { data: rawProfiles, error: profilesError } = await serviceClient
    .from('profiles')
    .select('id, email');

  if (profilesError) {
    console.log('DEBUG profiles error:', profilesError.message);
  }

  const profiles = (rawProfiles || []) as DbProfile[];

  // Create a map of reporter_id -> email for quick lookup
  const reporterEmailMap = new Map<string, string>();
  profiles.forEach((profile) => {
    reporterEmailMap.set(profile.id, profile.email);
  });

  // Map items to include reporter_email, category, and location
  const mappedItems = items.map((item) => ({
    ...item,
    reporter_email: reporterEmailMap.get(item.reporter_id) || null,
    category: item.category_id,
    location: item.location_id,
  }));

  // Debug: log first item's reporter lookup
  if (items.length > 0) {
    const firstItem = items[0];
    console.log('DEBUG reporter_id:', firstItem.reporter_id);
    console.log('DEBUG profiles count:', profiles.length);
    console.log('DEBUG email found:', reporterEmailMap.get(firstItem.reporter_id));
    console.log('DEBUG mapped reporter_email:', mappedItems[0].reporter_email);
  }

  // Fetch categories for filter
  const { data: rawCategories } = await supabase
    .from('categories')
    .select('id, name')
    .order('name');

  const categories = (rawCategories || []) as { id: string; name: string }[];

  return (
    <InventoryManagementClient 
      items={mappedItems}
      categories={categories || []}
    />
  );
}
