
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/utils/supabase/middleware";

export async function middleware(request: NextRequest) {
  const { supabase, response } = createClient(request);

  // Refresh Supabase session and get the session data
  const { data: { session } } = await supabase.auth.getSession();

  const { pathname } = request.nextUrl;

  // Define protected routes that require authentication
  const protectedRoutes = ["/dashboard"];
  // Check for an exact match on the main protected routes
  const isProtectedRoute = protectedRoutes.includes(pathname);
  
  // If trying to access a protected route without a session, redirect to login
  if (isProtectedRoute && !session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  
  // If there is a session and the user tries to access the login page, redirect to dashboard
  if (session && pathname.startsWith("/login")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Handle logout: sign out and redirect to login
  if (pathname === "/logout") {
    // The signOut action should be handled by Supabase client library,
    // but we ensure the user is redirected correctly.
    const logoutResponse = NextResponse.redirect(new URL("/login", request.url));
    await supabase.auth.signOut();
    // Invalidate the cookie by setting it to an empty value with an expired date
    logoutResponse.cookies.set('sb-access-token', '', { expires: new Date(0) });
    logoutResponse.cookies.set('sb-refresh-token', '', { expires: new Date(0) });
    return logoutResponse;
  }

  return response;
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
