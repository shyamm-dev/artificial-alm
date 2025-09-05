import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "./lib/get-server-session";

export async function middleware(request: NextRequest) {
    const session = await getServerSession();
    const pathname = request.nextUrl.pathname;

    if (!session && pathname !== "/login") {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    if (session && ["/", "/login"].includes(pathname)) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return NextResponse.next();
}

// TODO: Need to consider switching to edge runtime if Firebase app hosting supports it

export const config = {
    runtime: "nodejs",
    matcher: [
        "/", "/login", "/dashboard/:path*"
    ],
};