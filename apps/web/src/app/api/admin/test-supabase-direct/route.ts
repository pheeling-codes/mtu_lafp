import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  // Test if any claim-proofs bucket images are accessible
  const testUrls = [
    // Test bucket root access
    'https://vwkkrqmlyoddwlnwrgsx.supabase.co/storage/v1/object/public/claim-proofs/',
    // Test exact failing URLs
    'https://vwkkrqmlyoddwlnwrgsx.supabase.co/storage/v1/object/public/claim-proofs/12cd92cd-7325-415b-8454-af2ac1e958e3/9dc337ed-af20-4728-9c8e-6c44a37d684f/1778129166505-0.jpg',
    'https://vwkkrqmlyoddwlnwrgsx.supabase.co/storage/v1/object/public/claim-proofs/12cd92cd-7325-415b-8454-af2ac1e958e3/9dc337ed-af20-4728-9c8e-6c44a37d684f/1778129166507-1.jpeg',
    'https://vwkkrqmlyoddwlnwrgsx.supabase.co/storage/v1/object/public/claim-proofs/12cd92cd-7325-415b-8454-af2ac1e958e3/9dc337ed-af20-4728-9c8e-6c44a37d684f/1778129166508-2.jpeg',
    'https://vwkkrqmlyoddwlnwrgsx.supabase.co/storage/v1/object/public/claim-proofs/12cd92cd-7325-415b-8454-af2ac1e958e3/9dc337ed-af20-4728-9c8e-6c44a37d684f/1778129166509-3.jpeg'
  ];

  const results = [];

  for (const url of testUrls) {
    try {
      const response = await fetch(url, {
        method: 'HEAD', // Just check if exists
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; TestSupabase/1.0)',
        },
      });

      results.push({
        url,
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        contentType: response.headers.get('content-type')
      });
    } catch (error) {
      results.push({
        url,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  return NextResponse.json({
    message: 'Direct Supabase URL test results',
    results
  });
}
