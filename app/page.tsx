import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import Image from "next/image"

export default async function Home() {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    // If user is authenticated, redirect to dashboard
    if (session?.user) {
        redirect("/dashboard")
    } else {
        // Otherwise redirect to sign-in
        redirect("/auth/sign-in")
    }
}
