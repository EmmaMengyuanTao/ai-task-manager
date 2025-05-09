import { type NextRequest, NextResponse } from "next/server"
import { getSessionCookie } from "better-auth/cookies";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function middleware(request: NextRequest) {
    /* Implement a redirecting middleware */
    const sessionCookie = getSessionCookie(request);
    const session = await auth.api.getSession({
        headers: await headers()
    })
    const { pathname } = request.nextUrl;

	if (!sessionCookie) {
		return NextResponse.redirect(new URL("/auth/sign-in", request.url));
	}

    if (session?.user.banned) {
		return NextResponse.redirect(new URL("/auth/sign-in", request.url));
	}

    if (pathname.startsWith("/admin")) {
        if(session?.user.role != "admin") {
            return NextResponse.redirect(new URL("/", request.url));
        }
    }

    return NextResponse.next()
}

export const config = {
    runtime: "nodejs",
    matcher: ["/", "/profile", "/projects", "/my-task", "/admin/:path*"],
}
