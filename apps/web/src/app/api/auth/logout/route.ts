import { NextResponse } from 'next/server';

export async function POST() {
  // Clear the user-role cookie by setting it to expire
  const response = NextResponse.json({ success: true });
  
  response.cookies.set('user-role', '', {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0, // Expire immediately
    path: '/',
  });
  
  return response;
}
