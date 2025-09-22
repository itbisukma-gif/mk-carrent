
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Use environment variable for the secret admin path, with a default fallback.
  // This makes the admin path configurable without changing code.
  const adminPath = process.env.NEXT_PUBLIC_ADMIN_PATH || '/admin';
  const sessionCookie = request.cookies.get("session");
  const hasSession = !!sessionCookie;

  // Handle logout: clear the session cookie and redirect to the admin login page.
  if (pathname === "/logout") {
    const response = NextResponse.redirect(new URL(adminPath, request.url));
    response.cookies.set("session", "", { expires: new Date(0), path: '/' });
    return response;
  }
  
  // Check if the request is for the secret admin path.
  const isAccessingAdminPath = pathname.startsWith(adminPath);
  
  if (isAccessingAdminPath) {
    // If user has a session, rewrite the URL to the internal /admin path.
    // e.g., /mk-portal/orders -> /admin/orders
    if (hasSession) {
      const newPath = pathname.replace(adminPath, '/admin');
      const url = new URL(newPath, request.url);
      return NextResponse.rewrite(url);
    } 
    // If user does not have a session, show the login page
    // but keep the secret URL in the browser address bar.
    else {
      const loginUrl = new URL('/login', request.url);
      return NextResponse.rewrite(loginUrl);
    }
  }

  // Prevent direct access to the internal /admin URL structure.
  // If someone tries to go to /admin/dashboard directly, show a 404.
  if (pathname.startsWith('/admin')) {
      const notFoundUrl = new URL('/404', request.url);
      return NextResponse.rewrite(notFoundUrl);
  }
  
  // For all other public paths, just continue.
  return NextResponse.next();
}

export const config = {
  // This matcher ensures the middleware runs on all paths except for static files
  // and specific meta-files, which is crucial for performance.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|logo-icon.png|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
