import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "./lib/get-server-session";

export async function middleware(request: NextRequest) {
  const session = await getServerSession();
  const pathname = request.nextUrl.pathname;

  if (!session && pathname !== "/login") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (session && pathname === "/login") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

// TODO: Need to consider switching to edge runtime if Firebase app hosting supports it.

export const config = {
  runtime: "nodejs",
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|privacy-policy|terms-of-service).*)',
  ],
};
