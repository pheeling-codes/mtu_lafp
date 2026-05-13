import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const env = {
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'exists' : 'missing',
      supabaseUrlExists: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      serviceRoleKeyExists: !!process.env.SUPABASE_SERVICE_ROLE_KEY
    };


    return NextResponse.json({ 
      message: 'Environment check',
      env
    });
  } catch (error) {
    return NextResponse.json({ 
      error: 'Environment check failed',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
