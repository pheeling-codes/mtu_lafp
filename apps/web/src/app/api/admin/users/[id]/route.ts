import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/utils/supabaseServer';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createServerClient();
    const cookieStore = await cookies();
    
    // Get role from cookie for admin check
    const roleCookie = cookieStore.get('user-role')?.value;

    if (!roleCookie || roleCookie?.toUpperCase() !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Use service role client for cascade delete operations
    const serviceClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Delete all claims associated with user's items first
    const { data: userItems } = await serviceClient
      .from('items')
      .select('id')
      .eq('reporter_id', id);

    if (userItems && userItems.length > 0) {
      const itemIds = userItems.map(item => item.id);
      
      // Delete claims for these items
      await serviceClient
        .from('claims')
        .delete()
        .in('item_id', itemIds);

      // Delete matches involving these items
      await serviceClient
        .from('matches')
        .delete()
        .or(`lost_item_id.in.(${itemIds.join(',')}),found_item_id.in.(${itemIds.join(',')})`);
    }

    // Delete all claims by this user as seeker
    await serviceClient
      .from('claims')
      .delete()
      .eq('seeker_id', id);

    // Delete all items reported by this user
    await serviceClient
      .from('items')
      .delete()
      .eq('reporter_id', id);

    // Delete the user's profile
    const { error: profileError } = await serviceClient
      .from('profiles')
      .delete()
      .eq('id', id);

    if (profileError) {
      return NextResponse.json({ error: 'Failed to delete user profile' }, { status: 500 });
    }

    // Delete the user from auth
    const { error: authError } = await serviceClient.auth.admin.deleteUser(id);

    if (authError) {
      return NextResponse.json({ error: 'Failed to delete user auth' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
