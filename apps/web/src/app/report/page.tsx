import { createServerClient } from '@/utils/supabaseServer';
import { redirect } from 'next/navigation';
import ReportWizardClient from './ReportWizardClient';

export default async function ReportPage() {
  const supabase = await createServerClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login');
  }

  return <ReportWizardClient userId={user.id} />;
}
