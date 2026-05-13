import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    // Test admin authentication
    const cookieStore = await cookies();
    const roleCookie = cookieStore.get('user-role')?.value;
    
    console.log('Auth test:', { roleCookie });

    if (!roleCookie || roleCookie.toUpperCase() !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Test direct Supabase fetch
    const testUrl = 'https://vwkkrqmlyoddwlnwrgsx.supabase.co/storage/v1/object/public/claim-item/12cd92cd-7325-415b-8454-af2ac1e958e3/9dc337ed-af20-4728-9c8e-6c44a37d684f/1778129166505-0.jpg';
    
    console.log('Testing direct fetch to:', testUrl);
    
    const response = await fetch(testUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; TestProxy/1.0)',
      },
    });

    console.log('Direct fetch response:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      headers: Object.fromEntries(response.headers.entries())
    });

    if (!response.ok) {
      return NextResponse.json({ 
        error: 'Direct fetch failed',
        status: response.status,
        statusText: response.statusText,
        url: testUrl
      }, { status: 500 });
    }

    const buffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'image/jpeg';

    return NextResponse.json({
      message: 'Direct fetch successful',
      size: buffer.byteLength,
      contentType,
      url: testUrl
    });

  } catch (error) {
    console.error('Test proxy error:', error);
    return NextResponse.json({ 
      error: 'Test proxy failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
