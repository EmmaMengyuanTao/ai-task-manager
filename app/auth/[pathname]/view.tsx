"use client"

import { AuthCard } from "@daveyplate/better-auth-ui"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

import { cn } from "@/lib/utils"

export function AuthView({ pathname }: { pathname: string }) {
    const router = useRouter()

    useEffect(() => {
        fetch('/api/auth/session').then((res) => res.json()).then(console.log);
        router.refresh()
    }, [router])

    return (
        <main className="flex grow flex-col items-center justify-center gap-3 p-4">
            <AuthCard
                pathname={pathname}
                redirectTo="/profile"
            />

            <p
                className={cn(
                    ["callback", "settings", "sign-out"].includes(pathname) && "hidden",
                    "text-muted-foreground text-xs"
                )}
            >
                Powered by{" "}
                <Link
                    className="text-warning underline"
                    href="https://better-auth.com"
                    target="_blank"
                >
                    better-auth.
                </Link>
            </p>
        </main>
    )
}
