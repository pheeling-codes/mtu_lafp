import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const env = {
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'exists' : 'missing',
      supabaseUrlExists: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      serviceRoleKeyExists: !!process.env.SUPABASE_SERVICE_ROLE_KEY
    };

    console.log('Environment check:', env);

    return NextResponse.json({ 
      message: 'Environment check',
      env
    });
  } catch (error) {
    console.error('Environment check error:', error);
    return NextResponse.json({ 
      error: 'Environment check failed',
      details: error?.message
    }, { status: 500 });
  }
}
