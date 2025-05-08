import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Check if Supabase environment variables are set when in production
  if (process.env.NODE_ENV === 'production') {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return NextResponse.redirect(new URL('/setup-error', request.url));
    }
  }
  return NextResponse.next();
}

// Only run middleware on the specified routes
export const config = {
  matcher: ['/practice/:path*', '/history/:path*'],
}; 