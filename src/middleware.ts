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
  
  // If the user tries to access the real /admin path
  if (pathname.startsWith('/admin')) {
      // If it's the secret path, let's process it
      if (pathname.startsWith(adminPath)) {
          if (hasSession) {
              // Valid session, rewrite to internal admin route group
              return NextResponse.next();
          }
          // No session, rewrite to the login page but keep the URL
          return NextResponse.rewrite(new URL('/login', request.url));
      }
      // If it's just /admin but not the secret path, it's a 404
      return NextResponse.rewrite(new URL('/404', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all paths except for static files, images, and API routes.
    "/((?!api|_next/static|_next/image|favicon.ico|logo-icon.png|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    "/admin/:path*",
  ],
};
