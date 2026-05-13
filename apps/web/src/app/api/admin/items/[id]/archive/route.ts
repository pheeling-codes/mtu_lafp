import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/utils/supabaseServer';
import { cookies } from 'next/headers';

export async function PATCH(
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

    // Archive the item by updating status to 'archived'
    const { error } = await supabase
      .from('items')
      // @ts-ignore - Supabase type inference issue
      .update({ status: 'archived' })
      .eq('id', id)
      .select();

    if (error) {
      return NextResponse.json({ error: 'Failed to archive item' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
