import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/utils/supabase/middleware'

export async function middleware(request: NextRequest) {
  // Ambil supabase client + response dari middleware util
  const { supabase, response } = createClient(request)

  // Refresh Supabase session (penting supaya token auto diperbarui)
  const { data: { session } } = await supabase.auth.getSession()

  const { pathname } = request.nextUrl

  // Get session cookie dari Supabase
  const sessionCookie = session ? true : false

  // Define protected routes
  const protectedRoutes = ['/dashboard']
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))

  // 1. Handle protected routes
  if (isProtectedRoute && !sessionCookie) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // 2. If already logged in, prevent access to /login
  if (sessionCookie && pathname === '/login') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // 3. Handle logout
  if (pathname === '/logout') {
    const logoutResponse = NextResponse.redirect(new URL('/login', request.url))
    // Clear Supabase auth tokens
    const { error } = await supabase.auth.signOut()
    if (error) console.error('Error signing out from Supabase:', error)
    return logoutResponse
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
