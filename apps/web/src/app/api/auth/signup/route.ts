import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Debug env vars

// Service role client for admin operations (bypasses RLS)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  throw new Error('Missing required environment variables: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
}

const serviceClient = createClient(
  supabaseUrl,
  serviceKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export async function POST(request: NextRequest) {
  try {
    const { email, password, fullName, matricNumber, role } = await request.json();

    // Validate required fields
    if (!email || !password || !fullName || !role) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (role === 'STUDENT' && !matricNumber) {
      return NextResponse.json(
        { error: 'Matric number is required for students' },
        { status: 400 }
      );
    }

    // Check if email is already registered
    const { data: existingEmail } = await serviceClient
      .from('profiles')
      .select('email')
      .eq('email', email.toLowerCase())
      .maybeSingle();

    if (existingEmail) {
      return NextResponse.json(
        { error: 'This email is already registered. Please sign in instead.' },
        { status: 409 }
      );
    }

    // Check if matric number is already in use (for students)
    if (role === 'STUDENT' && matricNumber) {
      const { data: existingProfile } = await serviceClient
        .from('profiles')
        .select('matric_number')
        .eq('matric_number', matricNumber.trim())
        .maybeSingle();

      if (existingProfile) {
        return NextResponse.json(
          { error: 'This matric number is already registered' },
          { status: 409 }
        );
      }
    }

    // Step 1: Create auth user with service role
    const { data: authData, error: authError } = await serviceClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        matric_number: role === 'STUDENT' ? matricNumber : null,
        role: role,
      },
    });

    if (authError) {
      return NextResponse.json(
        { error: authError.message || 'Failed to create user' },
        { status: 400 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'User creation failed - no user returned' },
        { status: 500 }
      );
    }

    // Step 2: Create profile using service role (bypasses RLS)
    
    const now = new Date().toISOString();
    const profileData: any = {
      id: authData.user.id,
      full_name: fullName,
      email: email,
      role: role,
      created_at: now,
      updated_at: now,
    };

    if (role === 'STUDENT' && matricNumber) {
      profileData.matric_number = matricNumber.trim();
    }

    const { data: profileResult, error: profileError } = await serviceClient
      .from('profiles')
      .insert(profileData)
      .select()
      .single();

    if (profileError) {
      
      // Attempt to clean up the auth user since profile creation failed
      try {
        await serviceClient.auth.admin.deleteUser(authData.user.id);
      } catch (cleanupError) {
      }

      return NextResponse.json(
        { error: `Profile creation failed: ${profileError.message}` },
        { status: 500 }
      );
    }

    if (!profileResult) {
      return NextResponse.json(
        { error: 'Profile creation failed - no data returned' },
        { status: 500 }
      );
    }

    // Verify profile was actually created using direct REST API
    await new Promise(resolve => setTimeout(resolve, 500));
    
    try {
      const verifyResponse = await fetch(
        `${supabaseUrl}/rest/v1/profiles?id=eq.${authData.user.id}&select=id,role,email`,
        {
          headers: {
            'apikey': serviceKey!,
            'Authorization': `Bearer ${serviceKey}`,
          } as Record<string, string>,
        }
      );
      
      if (!verifyResponse.ok) {
        throw new Error(`REST API error: ${verifyResponse.status}`);
      }
      
      const verifyData = await verifyResponse.json();
      
      if (!verifyData || verifyData.length === 0) {
        
        return NextResponse.json(
          { error: 'Profile creation failed - verification failed' },
          { status: 500 }
        );
      }
      
    } catch (verifyErr) {
      return NextResponse.json(
        { error: 'Profile creation failed - verification error' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: authData.user.id,
        email: authData.user.email,
        role: role,
      },
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
