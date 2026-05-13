import { createServerClient } from '@/utils/supabaseServer';
import { createClient } from '@supabase/supabase-js';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { 
  Package, 
  CheckCircle, 
  TrendingUp, 
  Clock,
  User,
  ArrowUp,
  Minus,
  PackageSearch
} from 'lucide-react';
import AdminDashboardClient from './AdminDashboardClient';

export default async function AdminDashboardPage() {
  try {
    const supabase = await createServerClient();
    const cookieStore = await cookies();
    
    // Get role from cookie for admin check (more reliable than DB query)
    const roleCookie = cookieStore.get('user-role')?.value;
    console.log('Admin dashboard - role from cookie:', roleCookie);

    if (!roleCookie || roleCookie?.toUpperCase() !== 'ADMIN') {
      console.log('Admin dashboard - redirecting to /dashboard, role not admin');
      redirect('/dashboard');
    }

    // Check session using getUser instead of getSession for better reliability
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.log('No user session found in server component');
      // Don't redirect - let the middleware handle it or show a loading state
      return (
        <div className="p-8">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p>Loading...</p>
        </div>
      );
    }

    // Fetch dashboard stats with error handling
    let totalItems = 0;
    let activeCases = 0;
    let successfulRecoveries = 0;
    let pendingClaims: any[] = [];

    try {
      // Use service role client to bypass RLS (like claim review queue)
      const serviceClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );
      
      const [
        itemsResult,
        claimedResult,
        pendingClaimsResult,
        claimsResult
      ] = await Promise.all([
        supabase.from('items').select('*', { count: 'exact', head: true }),
        supabase.from('items').select('*', { count: 'exact', head: true }).eq('status', 'claimed'),
        serviceClient.from('claims').select('*', { count: 'exact', head: true }).in('status', ['pending_review', 'pending']),
        serviceClient
          .from('claims')
          .select(`
            *,
            seeker:profiles(full_name, avatar_url),
            item:items(title)
          `)
          .in('status', ['pending_review', 'pending'])
          .order('created_at', { ascending: false })
          .limit(5)
      ]);

      
      totalItems = itemsResult.count || 0;
      activeCases = pendingClaimsResult.count || 0;
      successfulRecoveries = claimedResult.count || 0;
      pendingClaims = (claimsResult.data || []) as any[];
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      // Continue with default values
    }

    // Calculate recovery rate
    const recoveryRate = totalItems && totalItems > 0 
      ? Math.round((successfulRecoveries || 0) / totalItems * 100) 
      : 0;

    const stats = {
      totalItems: totalItems || 0,
      activeCases: activeCases || 0,
      successfulRecoveries: successfulRecoveries || 0,
      recoveryRate,
    };

    return (
      <AdminDashboardClient 
        stats={stats}
        pendingClaims={pendingClaims || []}
      />
    );
  } catch (error) {
    console.error('Admin dashboard error:', error);
    // Return loading state instead of redirecting to prevent loop
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p>Loading...</p>
      </div>
    );
  }
}
