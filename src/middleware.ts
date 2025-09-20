
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/utils/supabase/middleware";

export async function middleware(request: NextRequest) {
  const { supabase, response } = createClient(request);

  // Instead of Supabase session, we will check for a manual session cookie
  const sessionCookie = request.cookies.get("session");
  const hasSession = !!sessionCookie;

  const { pathname } = request.nextUrl;

  // Define protected routes that require authentication
  const protectedRoutes = ["/dashboard"];
  
  // Check if the current path is a protected route or a sub-path
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));

  // If trying to access a protected route without a session, redirect to login
  if (isProtectedRoute && !hasSession) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // If there is a session and the user tries to access the login page, redirect to dashboard
  if (hasSession && pathname.startsWith("/login")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Handle logout: sign out and redirect to login
  if (pathname === "/logout") {
    // We are not using Supabase auth, so we just remove our manual cookie
    const logoutResponse = NextResponse.redirect(new URL("/login", request.url));
    logoutResponse.cookies.set("session", "", { expires: new Date(0) });
    return logoutResponse;
  }

  // Allow the request to proceed
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
