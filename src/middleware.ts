import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/utils/supabase/middleware";

export async function middleware(request: NextRequest) {
  const { supabase, response } = createClient(request);

  // Refresh Supabase session
  await supabase.auth.getSession();

  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get("session")?.value;

  const protectedRoutes = ["/dashboard"];
  const isProtectedRoute = protectedRoutes.some(route =>
    pathname.startsWith(route)
  );

  // This is a custom auth implementation, separate from Supabase's own session management.
  // It relies on a simple cookie set during manual login.
  if (isProtectedRoute && !sessionCookie) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (sessionCookie && pathname === "/login") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (pathname === "/logout") {
    const logoutResponse = NextResponse.redirect(
      new URL("/login", request.url)
    );
    // Manually clear the cookie used by our custom login logic
    logoutResponse.cookies.delete("session");
    // Also sign out from Supabase to be safe
    await supabase.auth.signOut();
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
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
