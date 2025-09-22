import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  const adminPath = process.env.NEXT_PUBLIC_ADMIN_PATH || 'admin';
  const sessionCookie = request.cookies.get("session");
  const hasSession = !!sessionCookie;

  // Handle logout
  if (pathname === "/logout") {
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.set("session", "", { expires: new Date(0), path: '/' });
    return response;
  }

  // If user tries to access public admin path, rewrite to internal path
  if (pathname.startsWith(`/${adminPath}`)) {
    if (!hasSession) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    const internalPath = pathname.replace(`/${adminPath}`, '/admin');
    return NextResponse.rewrite(new URL(internalPath, request.url));
  }

  // Block direct access to internal admin folder
  if (pathname.startsWith('/admin')) {
    // If no session, go to login. If has session, redirect to masked path.
    const destination = hasSession ? `/${adminPath}/dashboard` : '/login';
    return NextResponse.redirect(new URL(destination, request.url));
  }

  // Redirect logged-in users from login page to dashboard
  if (pathname === '/login' && hasSession) {
    return NextResponse.redirect(new URL(`/${adminPath}/dashboard`, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all paths except for static files, images, and API routes.
    "/((?!api|_next/static|_next/image|favicon.ico|logo-icon.png|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
