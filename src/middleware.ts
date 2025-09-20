
import { NextResponse, type NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Ambil cookie sesi dari request
  const sessionCookie = request.cookies.get('session');

  // Definisikan rute yang dilindungi
  const protectedRoutes = ['/dashboard'];
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  // 1. Logika untuk rute yang dilindungi
  if (isProtectedRoute) {
    // Jika tidak ada cookie sesi dan pengguna mencoba mengakses rute yang dilindungi,
    // alihkan ke halaman login.
    if (!sessionCookie) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // 2. Logika untuk halaman login
  // Jika pengguna sudah memiliki sesi dan mencoba mengakses halaman login,
  // alihkan mereka ke dashboard.
  if (sessionCookie && pathname === '/login') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  // 3. Logika untuk logout
  if (pathname === '/logout') {
      // Buat respons untuk mengalihkan ke halaman login
      const response = NextResponse.redirect(new URL('/login', request.url));
      // Hapus cookie sesi untuk logout
      response.cookies.delete('session');
      return response;
  }

  // Jika tidak ada kondisi di atas yang terpenuhi, lanjutkan request seperti biasa.
  return NextResponse.next();
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
