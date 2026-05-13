import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  // Simple test to check if claim-proofs bucket is accessible
  try {
    const response = await fetch('https://vwkkrqmlyoddwlnwrgsx.supabase.co/storage/v1/object/public/claim-proofs/', {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; TestSupabase/1.0)',
      },
    });

    const text = await response.text();
    
    return NextResponse.json({
      message: 'Simple bucket access test',
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      contentType: response.headers.get('content-type'),
      responseText: text.substring(0, 200) // First 200 chars
    });
  } catch (error) {
    return NextResponse.json({
      message: 'Error accessing bucket',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
