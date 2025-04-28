import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { ProfileForm } from "@/components/ProfileForm"
import { db } from "@/database/db"
import { eq } from "drizzle-orm"
import { users } from "@/database/schema"

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

    const userWithProfileAndSkills = await db.query.users.findFirst({
        where: eq(users.id, session.user.id),
        with: {
            profile: true,
            userSkills: {
                with: {
                    skill: true
                }
            }
        }
    })

    if (!userWithProfileAndSkills) {
        return (
            <main className="py-8 px-4">
                <p>User not found in database.</p>
            </main>
        );
    }

    const initialData = {
        profileId: userWithProfileAndSkills.profile?.id ?? null,
        name: userWithProfileAndSkills.profile?.name ?? null,
        skills: userWithProfileAndSkills.userSkills?.map(us => us.skill.name) ?? []
    };

    return (
        <main className="flex grow flex-col items-center justify-center gap-3 p-4">
            <ProfileForm initialData={initialData} userId={session.user.id} />
        </main>
    )
}