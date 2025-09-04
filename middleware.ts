import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export async function middleware(request: NextRequest) {
    const session = await auth.api.getSession({ headers: await headers() })

    if (!session) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    if (["/", "/login"].includes(request.nextUrl.pathname)) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return NextResponse.next();
}

// TODO : consoder changing to edge runtime for better performance if firebase app hosting supports it

export const config = {
    runtime: "nodejs",
    matcher: ["/", "/login", "/dashboard/:path*"],
};