import Link from "next/link"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { Button } from "./ui/button"
import { AdminNavEntry } from "./AdminNavEntry"
import { db } from "@/database/db"
import { eq } from "drizzle-orm"
import { users } from "@/database/schema"
import { getAvatarUrl } from "@/lib/avatars"
import { UserButton as AuthUserButton } from "@daveyplate/better-auth-ui"
import { UserAccountNav } from "./user-account-nav"

export async function Header() {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    let avatarUrl = null
    let userName = null
    let userEmail = null

    if (session?.user?.id) {
        const userWithProfile = await db.query.users.findFirst({
            where: eq(users.id, session.user.id),
            with: {
                profile: true
            }
        })

        const avatarId = userWithProfile?.profile?.avatarId || userWithProfile?.image
        if (avatarId) {
            avatarUrl = getAvatarUrl(avatarId)
        }
        
        userName = userWithProfile?.profile?.name || userWithProfile?.name || session.user.email?.split('@')[0]
        userEmail = session.user.email
    }

    return (
        <header className="sticky top-0 z-50 px-4 py-3 border-b bg-background/60 backdrop-blur">
            <div className="container mx-auto flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/" className="flex items-center gap-2">
                        AI Project Manager
                    </Link>
                    <nav className="flex items-center gap-2">
                        <Link href="/profile">
                            <Button variant="ghost">Profile</Button>
                        </Link>
                        <Link href="/projects">
                            <Button variant="ghost">Projects</Button>
                        </Link>
                        <AdminNavEntry />
                    </nav>
                </div>

                {session ? (
                    <UserAccountNav 
                        user={{
                            name: userName,
                            email: userEmail,
                            avatarUrl: avatarUrl
                        }}
                    />
                ) : (
                    <AuthUserButton />
                )}
            </div>
        </header>
    )
}
