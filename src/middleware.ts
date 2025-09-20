
import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

export async function middleware(request: NextRequest) {
  // First, run the session updater. This will refresh session cookies.
  const sessionResponse = await updateSession(request)

  const url = request.nextUrl.clone();
  const { pathname } = request.nextUrl;
  const hostname = request.headers.get('host') || 'localhost';

  // Define domains. For local development, we might use localhost.
  const mainDomain = process.env.NEXT_PUBLIC_APP_URL || 'mudakaryacarrent.com';
  const adminDomain = `admin.${mainDomain}`;
  const isLocalhost = hostname.includes('localhost');

  // Get session cookie from the potentially updated response
  const sessionCookie = sessionResponse.cookies.get('session');

  // --- Admin Subdomain/Path Logic ---
  const isAdminPath = (!isLocalhost && hostname === adminDomain) || (isLocalhost && (pathname.startsWith('/dashboard') || pathname.startsWith('/login')));

  if (isAdminPath) {
    // If logged in and trying to access login, redirect to dashboard
    if (sessionCookie && pathname === '/login') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    
    // If not logged in and trying to access anything other than login, redirect to login
    if (!sessionCookie && pathname !== '/login') {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Handle logout: clear cookie and redirect to login
    if (pathname === '/logout') {
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.set('session', '', { maxAge: -1, path: '/' });
      // Also clear Supabase auth cookies
      response.cookies.delete(`sb-${process.env.NEXT_PUBLIC_SUPABASE_URL!.split('.')[0].substring(8)}-auth-token`, { path: '/' });
      return response;
    }
    
    // If on localhost and accessing root, decide where to go
    if (isLocalhost && pathname === '/') {
        url.pathname = sessionCookie ? '/dashboard' : '/login';
        return NextResponse.rewrite(url);
    }
    
    // For all other valid admin paths, return the response from updateSession
    return sessionResponse;
  }

  // --- Main Domain Logic ---
  // If we are on the main domain, prevent access to dashboard/login pages.
  if ((!isLocalhost && hostname === mainDomain) && (pathname.startsWith('/dashboard') || pathname.startsWith('/login'))) {
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  // For all public paths, return the response from updateSession
  return sessionResponse;
}

// Config matcher to run on every request
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - logo-icon.png (logo file)
     */
    '/((?!_next/static|_next/image|favicon.ico|logo-icon.png).*)',
  ],
}
