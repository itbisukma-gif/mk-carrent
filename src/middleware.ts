
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get the secret admin path from environment variables, default to /admin
  const adminPath = process.env.NEXT_PUBLIC_ADMIN_PATH || '/admin';
  
  // Get session from the manual cookie
  const sessionCookie = request.cookies.get("session");
  const hasSession = !!sessionCookie;

  // Handle logout: delete cookie and redirect to the secret admin path (which will show login)
  if (pathname === "/logout") {
    const response = NextResponse.redirect(new URL(adminPath, request.url));
    response.cookies.set("session", "", { expires: new Date(0), path: '/' });
    return response;
  }
  
  const isAccessingSecretPath = pathname.startsWith(adminPath);
  const isAccessingInternalAdminPath = pathname.startsWith('/admin');

  // If a logged-in user tries to access the secret path (which would show login if they were logged out), redirect them to the first page of the admin area.
  if (isAccessingSecretPath && hasSession && pathname === adminPath) {
     return NextResponse.redirect(new URL(`${adminPath}/dashboard`, request.url));
  }

  // If a user tries to access the internal /admin path directly, block it.
  if (isAccessingInternalAdminPath && !isAccessingSecretPath) {
      return new NextResponse('Not Found', { status: 404 });
  }

  // If the current path starts with the secret admin path
  if (isAccessingSecretPath) {
    // Rewrite the URL to map it to the actual /admin folder structure.
    const newPath = pathname.replace(adminPath, '/admin');
    const url = new URL(newPath, request.url);

    if (hasSession) {
      // User is logged in, rewrite to the actual admin page.
      return NextResponse.rewrite(url);
    } else {
      // User is not logged in. Show the login page, but keep the secret URL in the browser.
      return NextResponse.rewrite(new URL('/login', request.url));
    }
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
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
