import { type NextRequest, NextResponse } from "next/server"
import { getSessionCookie } from "better-auth/cookies";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function middleware(request: NextRequest) {
    /* Implement a redirecting middleware YOUR CODE HERE */
    const sessionCookie = getSessionCookie(request);
    const { pathname } = request.nextUrl;

	if (!sessionCookie) {
		return NextResponse.redirect(new URL("/auth/sign-in", request.url));
	}

    if (pathname.startsWith("/admin")) {
        const session = await auth.api.getSession({
            headers: await headers()
        })

        if(session?.user.role != "admin") {
            return NextResponse.redirect(new URL("/", request.url));
        }
    }

    return NextResponse.next()
}

export const config = {
    runtime: "nodejs",
    matcher: ["/", "/profile", "/projects", "/admin/:path*"],
}
