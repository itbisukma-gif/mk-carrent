
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const { pathname } = request.nextUrl;
  const hostname = request.headers.get('host') || 'localhost';

  // Define domains. For local development, we might use localhost.
  const mainDomain = process.env.NEXT_PUBLIC_APP_URL || 'mudakaryacarrent.com';
  const adminDomain = `admin.${mainDomain}`;
  const isLocalhost = hostname.includes('localhost');

  // Get session cookie
  const sessionCookie = request.cookies.get('session');

  // --- Admin Subdomain/Path Logic ---
  // This logic applies if we are on the admin subdomain OR on localhost and the path starts with /dashboard
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
      return response;
    }
    
    // If on localhost and accessing root, decide where to go
    if (isLocalhost && pathname === '/') {
        url.pathname = sessionCookie ? '/dashboard' : '/login';
        return NextResponse.rewrite(url);
    }
    
    return NextResponse.next();
  }

  // --- Main Domain Logic ---
  // If we are on the main domain, prevent access to dashboard/login pages.
  if ((!isLocalhost && hostname === mainDomain) && (pathname.startsWith('/dashboard') || pathname.startsWith('/login'))) {
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  return NextResponse.next();
}

// Config matcher to run on every request
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - logo-icon.png (logo file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|logo-icon.png).*)',
  ],
}
