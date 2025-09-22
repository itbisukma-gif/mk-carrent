
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get the secret admin path from environment variables, with a fallback
  const adminPath = process.env.NEXT_PUBLIC_ADMIN_PATH || '/dashboard';
  const loginPath = '/login'; // This is now relative to the (unauthenticated) group

  // 1. Get session from the manual cookie
  const sessionCookie = request.cookies.get("session");
  const hasSession = !!sessionCookie;

  // 2. Check if the current path is a protected admin route
  // The protected routes are now inside the (admin) group, which is mapped to the secret path.
  const isProtectedRoute = pathname.startsWith(adminPath);

  // 3. Redirect to login if trying to access protected route without session
  if (isProtectedRoute && !hasSession) {
    const url = request.nextUrl.clone();
    url.pathname = loginPath;
    url.search = `redirect=${pathname}`; // Optional: redirect back after login
    return NextResponse.redirect(url);
  }

  // 4. Redirect to dashboard if logged in and trying to access login page
  if (hasSession && pathname === loginPath) {
    const url = request.nextUrl.clone();
    url.pathname = adminPath;
    url.search = '';
    return NextResponse.redirect(url);
  }

  // 5. Handle logout: delete cookie and redirect to login
  if (pathname === "/logout") {
    const response = NextResponse.redirect(new URL(loginPath, request.url));
    response.cookies.set("session", "", { expires: new Date(0), path: '/' });
    return response;
  }
  
  // 6. Redirect any access to the old /dashboard path to the new secret admin path
  if (pathname.startsWith('/dashboard') && adminPath !== '/dashboard') {
    const newPath = pathname.replace('/dashboard', adminPath);
    return NextResponse.redirect(new URL(newPath, request.url));
  }


  // 7. If none of the above, allow the request to proceed
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
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
