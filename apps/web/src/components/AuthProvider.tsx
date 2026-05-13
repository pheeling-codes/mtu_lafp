'use client';

import { createContext, useContext, useEffect, useState, useMemo, ReactNode } from 'react';
import { supabaseClient } from '@/utils/supabaseClient';
import { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  role: string | null;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: false, // Default to false since we use server session
  role: null,
  logout: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export default function AuthProvider({ 
  children, 
  initialSession, 
  initialRole 
}: { 
  children: ReactNode;
  initialSession: Session | null;
  initialRole: string | null;
}) {
  const [user, setUser] = useState<User | null>(initialSession?.user ?? null);
  const [role, setRole] = useState<string | null>(initialRole);
  
  // isLoading is now only true if we have a mismatch between client and server, 
  // but generally it's false as we rely on SSR initial state
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Listen for auth state changes to keep UI in sync
    // NOTE: We intentionally do NOT call router.refresh() here
    // to avoid server re-render loops. We only update local state.
    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange(
      (event, session) => {
        // Skip auth state changes on admin pages to prevent refresh loops
        if (window.location.pathname.startsWith('/admin')) {
          return;
        }

        if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
          setUser(session?.user ?? null);
          const metadataRole = session?.user?.user_metadata?.role;
          if (metadataRole) {
            setRole(metadataRole);
          }
        }

        if (event === 'SIGNED_OUT') {
          setUser(null);
          setRole(null);
          // Full page redirect on sign out to clear server state
          window.location.href = '/login';
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const logout = async () => {
    try {
      // Clear Supabase session
      await supabaseClient.auth.signOut({ scope: 'global' });
    } catch (error) {
      console.error('SignOut error:', error);
    }
    
    // Clear all auth cookies
    const cookiesToClear = [
      'sb-access-token',
      'sb-refresh-token', 
      'sb-provider-token',
      'user-name',
      'user-email',
      'user-avatar',
      'user-role'
    ];
    
    cookiesToClear.forEach(name => {
      document.cookie = `${name}=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:01 GMT`;
    });
    
    // Hard redirect to login
    window.location.replace('/login');
  };

  const contextValue = useMemo(() => ({ user, isLoading, role, logout }), [user, isLoading, role]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}
