import { NextResponse, type NextRequest } from "next/server"
import { createClient } from "@/utils/supabase/middleware"

export async function middleware(request: NextRequest) {
  const { supabase, response } = createClient(request)

  // Refresh Supabase session
  await supabase.auth.getSession()

  const { pathname } = request.nextUrl
  const sessionCookie = request.cookies.get("session")?.value

  const protectedRoutes = ["/dashboard"]
  const isProtectedRoute = protectedRoutes.some(route =>
    pathname.startsWith(route)
  )

  if (isProtectedRoute && !sessionCookie) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  if (sessionCookie && pathname === "/login") {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  if (pathname === "/logout") {
    const logoutResponse = NextResponse.redirect(
      new URL("/login", request.url)
    )
    logoutResponse.cookies.delete("session")
    await supabase.auth.signOut()
    return logoutResponse
  }

  return response
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
