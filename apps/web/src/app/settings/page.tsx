import { createServerClient } from '@/utils/supabaseServer';
import { redirect } from 'next/navigation';
import SettingsClient from './SettingsClient';

export default async function SettingsPage() {
  const supabase = await createServerClient();
  
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    redirect('/login');
  }

  // Get user metadata
  const { data: { user } } = await supabase.auth.getUser();
  
  const userData = {
    id: user?.id || '',
    email: user?.email || '',
    fullName: user?.user_metadata?.full_name || user?.user_metadata?.name || 'User',
    avatar: user?.user_metadata?.avatar_url || '',
    matricNumber: user?.user_metadata?.matric_number || user?.user_metadata?.student_id || '',
    role: user?.user_metadata?.role || 'Student',
    lastLogin: user?.last_sign_in_at || new Date().toISOString(),
  };

  return <SettingsClient userData={userData} />;
}
