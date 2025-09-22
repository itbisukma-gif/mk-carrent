import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get the secret admin path from environment variables, default to /admin
  const adminPath = process.env.NEXT_PUBLIC_ADMIN_PATH || '/admin';
  
  // Get session from the manual cookie
  const sessionCookie = request.cookies.get("session");
  const hasSession = !!sessionCookie;

  // Handle logout: delete cookie and redirect to the login page (which is at the secret admin path)
  if (pathname === "/logout") {
    const response = NextResponse.redirect(new URL(adminPath, request.url));
    response.cookies.set("session", "", { expires: new Date(0), path: '/' });
    return response;
  }
  
  // A flag to check if the user is trying to access any route under the secret admin path
  const isAccessingAdminArea = pathname.startsWith(adminPath);
  
  if (isAccessingAdminArea) {
    if (!hasSession) {
      // Not logged in. Show the login page, but keep the secret admin URL.
      const loginUrl = new URL('/login', request.url);
      return NextResponse.rewrite(loginUrl);
    }
    
    // User is logged in. Rewrite the URL to the actual /admin folder structure.
    const newPath = pathname.replace(adminPath, '/admin');
    const url = new URL(newPath, request.url);
    return NextResponse.rewrite(url);
  }
  
  // If a non-admin path is requested, just proceed.
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - and assets in the public folder
     * This ensures the middleware runs on all pages and API routes.
     */
    "/((?!_next/static|_next/image|favicon.ico|logo-icon.png|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
