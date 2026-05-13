import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; path: string[] }> }
) {
  
  try {
    // Await params to resolve the Promise
    const resolvedParams = await params;
    
    // Get admin session and verify
    const cookieStore = await cookies();
    const roleCookie = cookieStore.get('user-role')?.value;

    if (!roleCookie || roleCookie.toUpperCase() !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Extract the full path from the URL parameters
    const fullPath = Array.isArray(resolvedParams.path) ? resolvedParams.path.join('/') : resolvedParams.path;

    // Determine bucket and path based on first path segment
    const pathSegments = fullPath.split('/');
    let bucket = pathSegments[0]; // 'claim-proofs' or 'item-images'
    let objectPath = pathSegments.slice(1).join('/'); // Rest of the path after bucket

    // Fix bucket name mapping
    if (bucket === 'claim-proofs') {
      bucket = 'claim-item';
    }


    // Prepare fallback image
    const fallbackImageData = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==', 'base64');

    // Try to fetch from Supabase first
    try {
      const supabaseUrl = 'https://vwkkrqmlyoddwlnwrgsx.supabase.co';
      const publicUrl = `${supabaseUrl}/storage/v1/object/public/${bucket}/${objectPath}`;

      const imageResponse = await fetch(publicUrl, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; ImageProxy/1.0)',
        },
        signal: AbortSignal.timeout(5000) // 5 second timeout
      });

      if (imageResponse.ok) {
        const imageBuffer = await imageResponse.arrayBuffer();
        const contentType = imageResponse.headers.get('content-type') || 'image/jpeg';


        return new NextResponse(imageBuffer, {
          status: 200,
          headers: {
            'Content-Type': contentType,
            'Cache-Control': 'public, max-age=3600',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET',
            'Access-Control-Allow-Headers': 'Content-Type',
          },
        });
      }
    } catch (fetchError) {
    }

    // Return fallback if Supabase fetch fails
    return new NextResponse(fallbackImageData, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=3600',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });

  } catch (error) {
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
