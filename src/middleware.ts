
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const adminPath = process.env.NEXT_PUBLIC_ADMIN_PATH || '/admin';
  const sessionCookie = request.cookies.get("session");
  const hasSession = !!sessionCookie;

  // Handle logout
  if (pathname === "/logout") {
    const response = NextResponse.redirect(new URL(adminPath, request.url));
    response.cookies.set("session", "", { expires: new Date(0), path: '/' });
    return response;
  }

  // Handle requests to the secret admin path
  if (pathname.startsWith(adminPath)) {
    const newPath = pathname.replace(adminPath, '/admin');
    const url = new URL(newPath, request.url);

    if (hasSession) {
      // If user is logged in and trying to access the root of the secret path, redirect to dashboard
      if (pathname === adminPath) {
        return NextResponse.redirect(new URL(`${adminPath}/dashboard`, request.url));
      }
      // Otherwise, rewrite to the actual admin page
      return NextResponse.rewrite(url);
    } else {
      // User is not logged in, rewrite to show the login page
      return NextResponse.rewrite(new URL('/login', request.url));
    }
  }

  // Prevent direct access to /admin/* if it's not the configured secret path
  if (pathname.startsWith('/admin') && adminPath !== '/admin') {
      const url = request.nextUrl.clone()
      url.pathname = '/404'
      return NextResponse.rewrite(url);
  }
  
  // If a non-admin path is requested, just proceed.
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
