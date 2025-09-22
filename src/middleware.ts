
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const adminPath = process.env.NEXT_PUBLIC_ADMIN_PATH || '/dashboard';
  
  // 1. Get session from the manual cookie
  const sessionCookie = request.cookies.get("session");
  const hasSession = !!sessionCookie;

  // 2. Check if the current path is the secret admin path or a sub-path
  const isProtectedRoute = pathname.startsWith(adminPath);
  
  // 3. Handle logout: delete cookie and redirect to the secret admin path (which will show login)
  if (pathname === "/logout") {
    const response = NextResponse.redirect(new URL(adminPath, request.url));
    response.cookies.set("session", "", { expires: new Date(0), path: '/' });
    return response;
  }

  // 4. Handle access to protected routes
  if (isProtectedRoute) {
    if (hasSession) {
      // User is logged in and accessing a protected route, allow it.
      return NextResponse.next();
    } else {
      // User is not logged in, rewrite the URL to show the login page
      // without changing the URL in the browser's address bar.
      return NextResponse.rewrite(new URL('/login', request.url));
    }
  }

  // If a logged-in user tries to access /login directly, redirect them to the dashboard.
  // This case is unlikely given the rewrite logic but serves as a safeguard.
  if (pathname === '/login' && hasSession) {
     return NextResponse.redirect(new URL(adminPath, request.url));
  }

  // 5. Redirect any access to the old /dashboard path to the new secret admin path
  if (pathname.startsWith('/dashboard') && adminPath !== '/dashboard') {
    const newPath = pathname.replace('/dashboard', adminPath);
    return NextResponse.redirect(new URL(newPath, request.url));
  }


  // 6. If none of the above, allow the request to proceed
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
