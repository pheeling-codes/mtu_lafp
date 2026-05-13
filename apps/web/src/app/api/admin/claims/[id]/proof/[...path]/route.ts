import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; path: string[] }> }
) {
  console.log('=== PROXY REQUEST START ===');
  console.log('Request URL:', request.url);
  console.log('Request method:', request.method);
  
  try {
    // Await params to resolve the Promise
    const resolvedParams = await params;
    console.log('Resolved params:', resolvedParams);
    
    // Get admin session and verify
    const cookieStore = await cookies();
    const roleCookie = cookieStore.get('user-role')?.value;
    console.log('Auth check - roleCookie:', roleCookie);

    if (!roleCookie || roleCookie.toUpperCase() !== 'ADMIN') {
      console.log('Auth failed - returning 401');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Extract the full path from the URL parameters
    const fullPath = Array.isArray(resolvedParams.path) ? resolvedParams.path.join('/') : resolvedParams.path;
    console.log('Proxy request for claim:', resolvedParams.id, 'path:', fullPath);

    // Determine bucket and path based on first path segment
    const pathSegments = fullPath.split('/');
    let bucket = pathSegments[0]; // 'claim-proofs' or 'item-images'
    let objectPath = pathSegments.slice(1).join('/'); // Rest of the path after bucket

    // Fix bucket name mapping
    if (bucket === 'claim-proofs') {
      bucket = 'claim-item';
    }

    console.log('Parsed path details:', { fullPath, pathSegments, bucket, objectPath });
    console.log('Proxy request received successfully, attempting Supabase fetch');

    // Prepare fallback image
    const fallbackImageData = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==', 'base64');

    // Try to fetch from Supabase first
    try {
      const supabaseUrl = 'https://vwkkrqmlyoddwlnwrgsx.supabase.co';
      const publicUrl = `${supabaseUrl}/storage/v1/object/public/${bucket}/${objectPath}`;
      console.log('Attempting to fetch from:', publicUrl);
      console.log('Full URL breakdown:', { supabaseUrl, bucket, objectPath, publicUrl });

      const imageResponse = await fetch(publicUrl, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; ImageProxy/1.0)',
        },
        signal: AbortSignal.timeout(5000) // 5 second timeout
      });

      console.log('Supabase fetch response:', {
        status: imageResponse.status,
        statusText: imageResponse.statusText,
        ok: imageResponse.ok
      });

      if (imageResponse.ok) {
        const imageBuffer = await imageResponse.arrayBuffer();
        const contentType = imageResponse.headers.get('content-type') || 'image/jpeg';

        console.log('Successfully fetched image:', {
          size: imageBuffer.byteLength,
          contentType
        });

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
      console.error('Supabase fetch failed:', fetchError instanceof Error ? fetchError.message : 'Unknown error');
    }

    // Return fallback if Supabase fetch fails
    console.log('Returning fallback image');
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
    console.error('Proxy error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error?.message || 'Unknown error'
    }, { status: 500 });
  }
}
