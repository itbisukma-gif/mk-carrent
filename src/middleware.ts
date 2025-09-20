import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/utils/supabase/middleware";

export async function middleware(request: NextRequest) {
  const { supabase, response } = createClient(request);

  // Refresh Supabase session
  const { data: { session } } = await supabase.auth.getSession();

  const { pathname } = request.nextUrl;

  const protectedRoutes = ["/dashboard"];
  const isProtectedRoute = protectedRoutes.some(route =>
    pathname.startsWith(route)
  );
  
  if (isProtectedRoute && !session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  
  if (session && pathname === "/login") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (pathname === "/logout") {
    const logoutResponse = NextResponse.redirect(new URL("/login", request.url));
    await supabase.auth.signOut();
    // Manually clear the custom session cookie if it exists from old logic
    if (request.cookies.has("session")) {
        logoutResponse.cookies.delete("session");
    }
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
