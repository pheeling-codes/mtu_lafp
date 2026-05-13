import { createServerClient } from '@/utils/supabaseServer';
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Service role client for profile lookups (bypasses RLS)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export async function POST(request: NextRequest) {
  try {
    const { email, password, selected_role } = await request.json();

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    if (!selected_role || !['STUDENT', 'ADMIN'].includes(selected_role)) {
      return NextResponse.json(
        { error: 'Please select a valid role (Student or Admin)' },
        { status: 400 }
      );
    }

    // Initialize Supabase Server Client (this handles setting the chunked cookies)
    const supabase = await createServerClient();

    // Step 1: Sign in with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !authData.user) {
      console.log('LOGIN API: Auth error:', authError?.message);
      return NextResponse.json(
        { error: authError?.message || 'Authentication failed' },
        { status: 401 }
      );
    }

    console.log('LOGIN API: Sign in successful, user:', authData.user.id);

    // Step 2: Fetch profile using service role client (bypasses RLS)
    const { data, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id, role, full_name, email, matric_number')
      .eq('id', authData.user.id)
      .single();
      
    const profile = data as any;

    if (profileError || !profile) {
      console.error('No profile found for user ID:', authData.user.id, 'Error:', profileError?.message);
      await supabase.auth.signOut();
      return NextResponse.json(
        { error: 'Profile not found. Please complete registration or contact support.' },
        { status: 404 }
      );
    }

    console.log('Profile found:', profile);

    // === STRICT ROLE MATCHING (Credential Gate) ===
    if (profile.role !== selected_role) {
      console.warn(`Role mismatch: selected ${selected_role} but database has ${profile.role}`);
      
      // Sign out the user immediately to revoke the session cookies
      await supabase.auth.signOut();
      
      return NextResponse.json(
        { 
          error: 'Invalid credentials for this role.',
          details: `You selected "${selected_role}" but your account is registered as "${profile.role}".`
        },
        { status: 403 }
      );
    }

    // Update user metadata with role for easier access later
    await supabase.auth.updateUser({
      data: {
        role: profile.role,
        full_name: profile.full_name,
        matric_number: profile.matric_number,
      }
    });

    // Get the session to transfer cookies to response
    const { data: { session } } = await supabase.auth.getSession();

    // Create JSON response
    const response = NextResponse.json({
      success: true,
      user: {
        id: authData.user.id,
        email: authData.user.email,
        role: profile.role,
        fullName: profile.full_name,
        matricNumber: profile.matric_number,
      },
    });

    // Transfer Supabase session cookies to the response
    if (session?.access_token) {
      response.cookies.set('sb-access-token', session.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: session.expires_in ? session.expires_in : 3600,
      });
    }
    if (session?.refresh_token) {
      response.cookies.set('sb-refresh-token', session.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });
    }
    
    // Set user data cookies for client-side access (prevent empty state flicker)
    response.cookies.set('user-name', profile.full_name || authData.user.email?.split('@')[0] || 'User', {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });
    response.cookies.set('user-email', authData.user.email || '', {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });
    response.cookies.set('user-avatar', profile.avatar_url || '', {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });
    response.cookies.set('user-role', profile.role, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });
    
    return response;

  } catch (error) {
    console.error('Login API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
