import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Get the secret admin path from environment variables. Default to /admin if not set.
  const adminPath = process.env.NEXT_PUBLIC_ADMIN_PATH || '/admin';
  const sessionCookie = request.cookies.get("session");
  const hasSession = !!sessionCookie;

  // Handle logout: clear cookie and redirect to the secret admin path (which will show the login page)
  if (pathname === "/logout") {
    const response = NextResponse.redirect(new URL(adminPath, request.url));
    response.cookies.set("session", "", { expires: new Date(0), path: '/' });
    return response;
  }
  
  // Check if the user is trying to access the secret admin area
  const isAccessingAdminArea = pathname.startsWith(adminPath);
  
  if (isAccessingAdminArea) {
    if (hasSession) {
      // User has a session, rewrite the URL from the secret path to the actual /admin path
      // e.g., /mk-portal/orders -> /admin/orders
      const newPath = pathname.replace(adminPath, '/admin');
      return NextResponse.rewrite(new URL(newPath, request.url));
    } else {
      // User does not have a session, rewrite to the login page
      // but keep the secret admin URL in the browser address bar.
      return NextResponse.rewrite(new URL('/login', request.url));
    }
  }

  // Prevent direct access to the internal /admin URL structure
  if (pathname.startsWith('/admin')) {
      return NextResponse.rewrite(new URL('/404', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all paths except for static files, images, and API routes.
    "/((?!api|_next/static|_next/image|favicon.ico|logo-icon.png|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
