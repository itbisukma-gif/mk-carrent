
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get('session');
  const { pathname } = request.nextUrl;

  const isDashboardPath = pathname.startsWith('/dashboard');
  const isLoginPath = pathname === '/login';

  
  // Jika mencoba mengakses dashboard tanpa sesi, redirect ke login
  /*
  if (isDashboardPath && !sessionCookie) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  */

  // Jika sudah login dan mencoba mengakses halaman login, redirect ke dashboard
  /*
  if (isLoginPath && sessionCookie) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  */
  
  // Jika mencoba logout, hapus cookie dan redirect ke login
  if (pathname === '/logout') {
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.set('session', '', { maxAge: -1 }); // Hapus cookie
    return response;
  }
  


  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ['/dashboard/:path*', '/login', '/logout'],
}
