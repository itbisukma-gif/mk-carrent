
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
  
  // If a logged-in user tries to access the secret path's root, redirect them to the admin dashboard.
  if (pathname === adminPath && hasSession) {
     return NextResponse.redirect(new URL(`${adminPath}/dashboard`, request.url));
  }
  
  // If the current path starts with the secret admin path
  if (pathname.startsWith(adminPath)) {
    // Rewrite the URL to map it to the actual /app/admin folder structure.
    // e.g., /mk-portal/orders -> /admin/orders
    const newPath = pathname.replace(adminPath, '/admin');
    const url = new URL(newPath, request.url);

    if (hasSession) {
      // User is logged in, rewrite to the actual admin page.
      return NextResponse.rewrite(url);
    } else {
      // User is not logged in. Rewrite to show the login page, 
      // but keep the secret URL in the browser address bar.
      return NextResponse.rewrite(new URL('/login', request.url));
    }
  }

  // Explicitly block direct access to /admin/* if it's not the configured secret path
  if (pathname.startsWith('/admin') && adminPath !== '/admin') {
      return new NextResponse(null, { status: 404 });
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
