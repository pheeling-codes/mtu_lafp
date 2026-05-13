'use client';

import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/database';

// Track if we're currently refreshing to prevent race conditions
let isRefreshing = false;
let refreshPromise: Promise<void> | null = null;

// Custom fetch wrapper that handles auth errors
const customFetch = async (url: RequestInfo | URL, options?: RequestInit): Promise<Response> => {
  // First attempt
  let response = await fetch(url, options);
  
  // If we get a 401, try to refresh the session once
  if (response.status === 401 && !isRefreshing) {
    if (!refreshPromise) {
      isRefreshing = true;
      refreshPromise = supabaseClient.auth.refreshSession().then(() => {
        isRefreshing = false;
        refreshPromise = null;
      }).catch(() => {
        isRefreshing = false;
        refreshPromise = null;
        // Redirect to login on refresh failure
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      });
    }
    
    // Wait for refresh to complete
    await refreshPromise;
    
    // Retry the request
    response = await fetch(url, options);
  }
  
  return response;
};

export const supabaseClient = createBrowserClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
    global: {
      fetch: customFetch,
    },
  }
);

// Handle auth state changes
supabaseClient.auth.onAuthStateChange((event) => {
  if (event === 'SIGNED_OUT') {
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }
});

// Helper to get current session with retry
export async function getSessionWithRetry(maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    const { data, error } = await supabaseClient.auth.getSession();
    
    if (!error && data.session) {
      return data.session;
    }
    
    if (error && i < maxRetries - 1) {
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, 100 * (i + 1)));
      
      // Try to refresh the session
      const { error: refreshError } = await supabaseClient.auth.refreshSession();
      if (refreshError) {
        break;
      }
    }
  }
  
  return null;
}
