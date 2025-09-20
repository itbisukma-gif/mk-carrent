
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const { pathname } = request.nextUrl;
  const hostname = request.headers.get('host');

  // Asumsikan nama domain utama dan domain admin
  const mainDomain = 'mudakaryacarrent.com'; // Ganti dengan domain utama Anda
  const adminDomain = `admin.${mainDomain}`;

  // Dapatkan session cookie
  const sessionCookie = request.cookies.get('session');

  // Logika untuk Subdomain Admin
  if (hostname === adminDomain) {
    
    // Jika sudah login dan mengakses halaman login, redirect ke dashboard
    if (sessionCookie && pathname === '/login') {
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }
    
    // Jika belum login dan mencoba mengakses selain halaman login, redirect ke login
    if (!sessionCookie && pathname !== '/login') {
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }

    // Jika mencoba logout dari domain admin, hapus cookie dan redirect ke login
    if (pathname === '/logout') {
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.set('session', '', { maxAge: -1 }); // Hapus cookie
      return response;
    }

    // Izinkan akses ke file-file publik di _next
    if (pathname.startsWith('/_next')) {
      return NextResponse.next();
    }

    // Jika mengakses root ('/'), rewrite ke halaman login atau dashboard
    if (pathname === '/') {
        const targetPath = sessionCookie ? '/dashboard' : '/login';
        url.pathname = targetPath;
        return NextResponse.rewrite(url);
    }
    
    return NextResponse.next();
  }

  // Logika untuk Domain Utama (Website Publik)
  // Pastikan halaman dashboard dan login tidak bisa diakses dari domain utama
  if (hostname === mainDomain && (pathname.startsWith('/dashboard') || pathname.startsWith('/login'))) {
    url.pathname = '/';
    return NextResponse.redirect(url);
  }
  
  return NextResponse.next();
}

// Konfigurasi matcher yang lebih luas untuk menangkap semua request
export const config = {
  matcher: [
    /*
     * Cocokkan semua path request kecuali untuk:
     * - path yang dimulai dengan `api/` (rute API)
     * - path yang dimulai dengan `_next/static` (file statis)
     * - path yang dimulai dengan `_next/image` (optimasi gambar)
     * - path yang berisi `favicon.ico` (file favicon)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|logo-icon.png).*)',
  ],
}
