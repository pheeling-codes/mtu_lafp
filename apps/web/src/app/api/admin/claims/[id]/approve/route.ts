import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/utils/supabaseServer';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

export async function POST(
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

    // Use service role client for transaction operations
    const serviceClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // First, get the claim to get the item_id
    const { data: claim, error: claimError } = await serviceClient
      .from('claims')
      .select('item_id')
      .eq('id', id)
      .single();

    if (claimError || !claim) {
      return NextResponse.json({ error: 'Claim not found' }, { status: 404 });
    }

    // Update claim status to approved and set reviewed_at
    const { error: updateClaimError } = await serviceClient
      .from('claims')
      .update({
        status: 'approved',
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (updateClaimError) {
      console.error('Approve route - claim update error:', updateClaimError);
      return NextResponse.json({ 
        error: 'Failed to approve claim', 
        details: updateClaimError.message,
        code: updateClaimError.code 
      }, { status: 500 });
    }

    // Update linked item status to 'claimed'
    const { error: updateItemError } = await serviceClient
      .from('items')
      .update({
        status: 'claimed'
      })
      .eq('id', claim.item_id);

    if (updateItemError) {
      console.error('Approve route - item update error:', updateItemError);
      return NextResponse.json({ 
        error: 'Failed to update item status', 
        details: updateItemError.message,
        code: updateItemError.code 
      }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
