import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/utils/supabase/middleware'

export async function middleware(request: NextRequest) {
  const { supabase, response } = createClient(request);

  // Refresh session if expired - important for Server Components
  await supabase.auth.getSession();

  const { pathname } = request.nextUrl;

  // Get session cookie from our custom login logic
  const sessionCookie = request.cookies.get('session')?.value;

  // Define protected routes
  const protectedRoutes = ['/dashboard'];
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  // 1. Handle protected routes
  if (isProtectedRoute && !sessionCookie) {
    // User is not logged in, redirect to login page
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 2. If already logged in, prevent access to /login
  if (sessionCookie && pathname === '/login') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // 3. Handle logout
  if (pathname === '/logout') {
    const logoutResponse = NextResponse.redirect(new URL('/login', request.url));
    // Manually clear the cookie used by our custom login logic
    logoutResponse.cookies.delete('session');
    // Also clear Supabase's auth tokens
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out from Supabase:', error);
    }
    return logoutResponse;
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
