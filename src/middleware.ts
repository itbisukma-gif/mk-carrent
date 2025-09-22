import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  const adminPath = process.env.NEXT_PUBLIC_ADMIN_PATH || '/admin';
  const sessionCookie = request.cookies.get("session");
  const hasSession = !!sessionCookie;

  // Handle logout: clear cookie and redirect to the secret admin login page
  if (pathname === "/logout") {
    const response = NextResponse.redirect(new URL(adminPath, request.url));
    response.cookies.set("session", "", { expires: new Date(0), path: '/' });
    return response;
  }
  
  // Check if the user is trying to access the secret admin area
  const isAccessingAdminArea = pathname.startsWith(adminPath);
  
  if (isAccessingAdminArea) {
    if (hasSession) {
      // Rewrite to the internal /admin path if the user has a session
      const newPath = pathname.replace(adminPath, '/(admin)');
      return NextResponse.rewrite(new URL(newPath, request.url));
    } else {
      // If no session, show the login page, but keep the secret URL in the browser
      return NextResponse.rewrite(new URL('/login', request.url));
    }
  }

  // Prevent direct access to internal admin/auth folders
  if (pathname.startsWith('/(admin)') || pathname.startsWith('/(auth)')) {
      return NextResponse.rewrite(new URL('/404', request.url));
  }
  
  // All other public routes are handled by the (web) group by default
  if (pathname === '/' || pathname.startsWith('/mobil') || pathname.startsWith('/testimoni') || pathname.startsWith('/kontak') || pathname.startsWith('/syarat-ketentuan') || pathname.startsWith('/pembayaran') || pathname.startsWith('/konfirmasi') || pathname.startsWith('/invoice')) {
     return NextResponse.rewrite(new URL(`/(web)${pathname}`, request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all paths except for static files, images, and API routes.
    "/((?!api|_next/static|_next/image|favicon.ico|logo-icon.png|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
