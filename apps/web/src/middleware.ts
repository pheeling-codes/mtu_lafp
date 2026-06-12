import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Service role client for server-side profile lookups
let supabaseAdmin: ReturnType<typeof createClient> | null = null;

if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
  supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

// Simple in-memory cache for profile lookups (prevents redundant DB calls if metadata fails)
const profileCache = new Map<string, { role: string; timestamp: number }>();
const CACHE_TTL = 60000; // 1 minute

async function getUserRole(userId: string): Promise<string | null> {
  if (!supabaseAdmin) return null;

  const cached = profileCache.get(userId);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.role;
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    if (error || !data) return null;

    profileCache.set(userId, { role: data.role, timestamp: Date.now() });
    return data.role;
  } catch (err) {
    return null;
  }
}

// Track last auth check to throttle requests
const authCache = new Map<string, { isAuth: boolean; role: string | null; timestamp: number }>();
const AUTH_CACHE_TTL = 5000; // 5 seconds - reduce Supabase calls

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Fast path: Skip auth check for static assets
  if (pathname.startsWith('/_next') || pathname.startsWith('/static') || pathname.includes('.')) {
    return response;
  }

  // Check for cached auth result
  const sessionCookie = request.cookies.get('sb-session')?.value;
  const cacheKey = sessionCookie || request.headers.get('cookie') || 'anon';
  const cached = authCache.get(cacheKey);
  
  let user: any | null = null;
  let userRole: string | null = null;
  let isAuthenticated = false;

  // Use cache if valid
  if (cached && Date.now() - cached.timestamp < AUTH_CACHE_TTL) {
    isAuthenticated = cached.isAuth;
    userRole = cached.role;
  } else {
    // Check role cookie first (fastest path - no Supabase call)
    const roleCookie = request.cookies.get('user-role')?.value;
    
    if (roleCookie) {
      userRole = roleCookie;
      isAuthenticated = true;
      // Cache the result
      authCache.set(cacheKey, { isAuth: true, role: roleCookie, timestamp: Date.now() });
    } else {
      // Only call Supabase if no role cookie
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            get(name: string) {
              return request.cookies.get(name)?.value;
            },
            set(name: string, value: string, options: CookieOptions) {
              request.cookies.set({ name, value, ...options });
              response = NextResponse.next({
                request: { headers: request.headers },
              });
              response.cookies.set({ name, value, ...options });
            },
            remove(name: string, options: CookieOptions) {
              request.cookies.set({ name, value: '', ...options });
              response = NextResponse.next({
                request: { headers: request.headers },
              });
              response.cookies.set({ name, value: '', ...options });
            },
          },
        }
      );

      try {
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
        
        if (authUser && !authError) {
          user = authUser;
          userRole = authUser.user_metadata?.role;
          
          // Get role from DB if not in metadata
          if (!userRole) {
            userRole = await getUserRole(user.id);
          }
          
          isAuthenticated = !!userRole;
          // Cache the result
          authCache.set(cacheKey, { isAuth: isAuthenticated, role: userRole, timestamp: Date.now() });
        }
      } catch (error) {
        console.log('Middleware Supabase auth error:', error);
        // On error, don't cache - allow retry
      }
    }
  }

  // === STRICT RBAC: Protect /admin routes ===
  if (pathname.startsWith('/admin')) {
    if (!isAuthenticated) {
      const redirectUrl = new URL('/login', request.url);
      redirectUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(redirectUrl);
    }

    if (userRole?.toUpperCase() !== 'ADMIN') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // === STRICT RBAC: Protect /dashboard routes (student area) ===
  if (pathname.startsWith('/dashboard')) {
    if (!isAuthenticated) {
      const redirectUrl = new URL('/login', request.url);
      redirectUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(redirectUrl);
    }

    if (userRole?.toUpperCase() === 'ADMIN') {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }
  }

  // === STRICT RBAC: Protect /lost-items routes ===
  if (pathname.startsWith('/lost-items')) {
    if (!isAuthenticated) {
      const redirectUrl = new URL('/login', request.url);
      redirectUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(redirectUrl);
    }

    if (userRole?.toUpperCase() === 'ADMIN') {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }
  }

  // === STRICT RBAC: Protect /report routes ===
  if (pathname.startsWith('/report')) {
    if (!isAuthenticated) {
      const redirectUrl = new URL('/login', request.url);
      redirectUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(redirectUrl);
    }

    if (userRole?.toUpperCase() === 'ADMIN') {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }
  }

  // === Redirect authenticated users away from auth pages ===
  if (
    isAuthenticated &&
    (pathname === '/login' || pathname === '/signup' || pathname === '/forgot-password')
  ) {
    if (userRole?.toUpperCase() === 'ADMIN') {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return response;
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/lost-items/:path*',
    '/report/:path*',
    '/login',
    '/signup',
    '/forgot-password',
    '/reset-password',
  ],
};
