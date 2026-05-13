import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    // Get admin session and verify
    const cookieStore = await cookies();
    const roleCookie = cookieStore.get('user-role')?.value;
    
    if (!roleCookie || roleCookie.toUpperCase() !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Test the exact URL that's failing
    const testUrl = '/api/admin/claims/94b5c5c4-10ee-43ef-b1c4-6ce28349b0cd/proof/claim-proofs/12cd92cd-7325-415b-8454-af2ac1e958e3/23a152a7-7dd2-4718-ac60-2a84fd292f8c/1778092903809-0.jpg';
    
    return NextResponse.json({
      message: 'Test proxy URL',
      testUrl,
      note: 'Try accessing this URL directly to see if proxy works'
    });

  } catch (error) {
    console.error('Test proxy URL error:', error);
    return NextResponse.json({ 
      error: 'Test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
