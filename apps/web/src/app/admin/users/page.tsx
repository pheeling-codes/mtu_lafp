import { createServerClient } from '@/utils/supabaseServer';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import UserManagementClient from './UserManagementClient';

export default async function UserManagementPage() {
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

  // Fetch all users using service role to bypass RLS
  const serviceClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: users, error } = await serviceClient
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    // Silent error handling
  }

  return (
    <UserManagementClient 
      users={users || []}
    />
  );
}
