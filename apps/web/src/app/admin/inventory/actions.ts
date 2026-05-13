'use server';

import { createServerClient } from '@/utils/supabaseServer';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

export async function archiveItem(itemId: string, currentStatus: string) {
  const supabase = await createServerClient();
  const cookieStore = await cookies();
  
  // Get role from cookie for admin check
  const roleCookie = cookieStore.get('user-role')?.value;

  if (!roleCookie || roleCookie?.toUpperCase() !== 'ADMIN') {
    return { success: false, error: 'Forbidden' };
  }

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return { success: false, error: 'Unauthorized' };
  }

  // Toggle archive status
  const newStatus = currentStatus === 'archived' ? 'active' : 'archived';
  
  const { error } = await supabase
    .from('items')
    // @ts-ignore - Supabase type inference issue
    .update({ status: newStatus })
    .eq('id', itemId);

  if (error) {
    return { success: false, error: 'Failed to update item status' };
  }

  revalidatePath('/admin/inventory');
  return { success: true };
}

export async function deleteItem(itemId: string) {
  const supabase = await createServerClient();
  const cookieStore = await cookies();
  
  // Get role from cookie for admin check
  const roleCookie = cookieStore.get('user-role')?.value;

  if (!roleCookie || roleCookie?.toUpperCase() !== 'ADMIN') {
    return { success: false, error: 'Forbidden' };
  }

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return { success: false, error: 'Unauthorized' };
  }

  // Hard delete the item
  const { error } = await supabase
    .from('items')
    .delete()
    .eq('id', itemId);

  if (error) {
    return { success: false, error: 'Failed to delete item' };
  }

  revalidatePath('/admin/inventory');
  return { success: true };
}
