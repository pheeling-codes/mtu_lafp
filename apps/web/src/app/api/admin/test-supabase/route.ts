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

    // Test URLs that are failing
    const testUrls = [
      'https://vwkkrqmlyoddwlnwrgsx.supabase.co/storage/v1/object/public/claim-item/12cd92cd-7325-415b-8454-af2ac1e958e3/9dc337ed-af20-4728-9c8e-6c44a37d684f/1778129166505-0.jpg',
      'https://vwkkrqmlyoddwlnwrgsx.supabase.co/storage/v1/object/public/claim-item/12cd92cd-7325-415b-8454-af2ac1e958e3/9dc337ed-af20-4728-9c8e-6c44a37d684f/1778129166508-2.jpeg',
      'https://vwkkrqmlyoddwlnwrgsx.supabase.co/storage/v1/object/public/item-images/12cd92cd-7325-415b-8454-af2ac1e958e3-1777887062699.png'
    ];

    const results = [];

    for (const url of testUrls) {
      try {
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; TestSupabase/1.0)',
          },
          signal: AbortSignal.timeout(5000)
        });

        results.push({
          url,
          status: response.status,
          statusText: response.statusText,
          ok: response.ok,
          contentType: response.headers.get('content-type'),
          size: response.ok ? (await response.arrayBuffer()).byteLength : null
        });
      } catch (error) {
        results.push({
          url,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return NextResponse.json({
      message: 'Supabase URL test results',
      results
    });

  } catch (error) {
    console.error('Test Supabase error:', error);
    return NextResponse.json({ 
      error: 'Test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
