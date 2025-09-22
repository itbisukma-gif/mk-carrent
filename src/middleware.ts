import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  const adminAlias = process.env.NEXT_PUBLIC_ADMIN_PATH || '/mk-portal';
  const sessionCookie = request.cookies.get("session");
  const hasSession = !!sessionCookie;

  // Handle logout: clear cookie and redirect to the secret admin login page
  if (pathname === "/logout") {
    const response = NextResponse.redirect(new URL(adminAlias, request.url));
    response.cookies.set("session", "", { expires: new Date(0), path: '/' });
    return response;
  }
  
  // Check if the user is trying to access the secret admin area
  const isAccessingAdminArea = pathname.startsWith(adminAlias);
  
  if (isAccessingAdminArea) {
    if (hasSession) {
      const newPath = pathname.replace(adminAlias, '/admin');
      return NextResponse.rewrite(new URL(newPath, request.url));
    } else {
      // Rewrite to login page, keeping the secret admin URL in browser
      return NextResponse.rewrite(new URL('/login', request.url));
    }
  }

  // Prevent direct access to internal /admin, /login, /invoice/share if they are not under their route groups
  if (pathname.startsWith('/admin') || pathname.startsWith('/login') || pathname.startsWith('/invoice/share')) {
      // Check if the path is NOT rewritten from the alias. This is a bit tricky.
      // A simple heuristic: if it's not the alias, it's probably a direct access attempt.
      // A more robust way would involve headers, but this is a good start.
      if (!request.headers.has('x-rewritten-path')) {
         return NextResponse.rewrite(new URL('/404', request.url));
      }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all paths except for static files, images, and API routes.
    "/((?!api|_next/static|_next/image|favicon.ico|logo-icon.png|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};