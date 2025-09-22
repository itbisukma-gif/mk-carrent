import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  const adminPath = process.env.NEXT_PUBLIC_ADMIN_PATH || 'admin';
  const sessionCookie = request.cookies.get("session");
  const hasSession = !!sessionCookie;

  // 1. Handle logout: clear cookie and redirect to the public home page
  if (pathname === "/logout") {
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.set("session", "", { expires: new Date(0), path: '/' });
    return response;
  }
  
  // 2. Protect the internal `/admin` routes
  if (pathname.startsWith('/admin')) {
      if (!hasSession) {
          // If no session, redirect to the main login page.
          return NextResponse.redirect(new URL('/login', request.url));
      }
      // If a logged-in user tries to access /admin directly, rewrite to the internal route.
      // This is a safe fallback.
      return NextResponse.next();
  }

  // 3. Handle the public-facing secret admin path
  if (pathname.startsWith(`/${adminPath}`)) {
      if (hasSession) {
          // Valid session, rewrite to the internal /admin route but keep the URL masked.
          const internalPath = pathname.replace(`/${adminPath}`, '/admin');
          return NextResponse.rewrite(new URL(internalPath, request.url));
      }
       // No session, redirect to the main login page.
      return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // 4. Handle login page
  if (pathname === '/login') {
    if (hasSession) {
        // If user is already logged in, redirect them to the admin dashboard
        return NextResponse.redirect(new URL(`/${adminPath}/dashboard`, request.url));
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
