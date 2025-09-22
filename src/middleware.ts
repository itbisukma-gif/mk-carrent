import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  const adminPath = process.env.NEXT_PUBLIC_ADMIN_PATH || 'admin';
  const sessionCookie = request.cookies.get("session");
  const hasSession = !!sessionCookie;

  // Handle logout: clear cookie and redirect to the public home page
  if (pathname === "/logout") {
    const response = NextResponse.redirect(new URL("/", request.url));
    response.cookies.set("session", "", { expires: new Date(0), path: '/' });
    return response;
  }
  
  // If user tries to access a path under the secret admin path
  if (pathname.startsWith(`/${adminPath}`)) {
      if (hasSession) {
          // Valid session, rewrite to internal /admin route but keep URL
          const internalPath = pathname.replace(`/${adminPath}`, '/admin');
          return NextResponse.rewrite(new URL(internalPath, request.url));
      }
       // No session, redirect to the main login page
      return NextResponse.redirect(new URL('/login', request.url));
  }

  // If user somehow tries to access the internal /admin path directly
  if (pathname.startsWith('/admin')) {
      // Redirect them away to avoid showing a 404 or the raw internal page
      return NextResponse.redirect(new URL('/login', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all paths except for static files, images, and API routes.
    "/((?!api|_next/static|_next/image|favicon.ico|logo-icon.png|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
