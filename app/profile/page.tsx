import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { ProfileForm } from "@/components/ProfileForm"
import { profiles } from "@/database/schema/profiles"
import { db } from "@/database/db"
import { eq } from "drizzle-orm"

export default async function ProfilePage() {

    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session) {
        return (
            <main className="py-8 px-4">
                <p>No Authentication ! Please Sign In !</p>
            </main>
        )
    }

    const profile = await db.query.profiles.findFirst({
        where: eq(profiles.userId, session.user.id)
    })

    return (
        <main className="flex grow flex-col items-center justify-center gap-3 p-4">
            <ProfileForm initialData={profile} />
        </main>
    )
}