import { createServerClient as createSSRClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/types/database';

export async function createServerClient() {
  const cookieStore = await cookies();
  
  return createSSRClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: { path?: string; maxAge?: number; domain?: string; secure?: boolean; sameSite?: 'strict' | 'lax' | 'none'; httpOnly?: boolean }) {
          try {
            cookieStore.set({ 
              name, 
              value, 
              path: options?.path ?? '/',
              maxAge: options?.maxAge ?? 60 * 60 * 24 * 7, // 7 days default
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax',
            });
          } catch (e) {
            // Handle cases where set is not available
          }
        },
        remove(name: string, options: { path?: string }) {
          try {
            cookieStore.set({ 
              name, 
              value: '', 
              path: options?.path ?? '/',
              maxAge: 0,
            });
          } catch (e) {
            // Handle cases where set is not available
          }
        },
      },
    }
  );
}

export async function createRouteClient() {
  const cookieStore = await cookies();
  
  return createSSRClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: { path?: string; maxAge?: number; domain?: string; secure?: boolean; sameSite?: 'strict' | 'lax' | 'none'; httpOnly?: boolean }) {
          try {
            cookieStore.set({ 
              name, 
              value, 
              path: options?.path ?? '/',
              maxAge: options?.maxAge ?? 60 * 60 * 24 * 7, // 7 days default
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax',
            });
          } catch (e) {
            // Handle cases where set is not available
          }
        },
        remove(name: string, options: { path?: string }) {
          try {
            cookieStore.set({ 
              name, 
              value: '', 
              path: options?.path ?? '/',
              maxAge: 0,
            });
          } catch (e) {
            // Handle cases where set is not available
          }
        },
      },
    }
  );
}
