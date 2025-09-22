
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const adminPath = process.env.NEXT_PUBLIC_ADMIN_PATH || '/admin';
  const sessionCookie = request.cookies.get("session");
  const hasSession = !!sessionCookie;

  if (pathname === "/logout") {
    const response = NextResponse.redirect(new URL(adminPath, request.url));
    response.cookies.set("session", "", { expires: new Date(0), path: '/' });
    return response;
  }
  
  if (pathname.startsWith(adminPath)) {
    if (!hasSession) {
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|logo-icon.png|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
