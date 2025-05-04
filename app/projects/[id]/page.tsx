import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { db } from "@/database/db"
import { eq, and} from "drizzle-orm"
import { projects, projectMembers, users, generatedSubtasks, profiles } from "@/database/schema"
import { notFound } from "next/navigation"
import { ProjectPageClient } from "./ProjectPageClient"
import { Subtask } from "@/app/types"

interface ProjectPageProps {
    params: {
        id: string
    }
}

export default async function ProjectPage({ params }: ProjectPageProps) {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session) {
        return (
            <main className="py-8 px-10">
                <p>Please sign in to view this project</p>
            </main>
        )
    }

    const projectId = parseInt(params.id)
    if (isNaN(projectId)) {
        notFound()
    }

    // Get project information
    const project = await db.query.projects.findFirst({
        where: eq(projects.id, projectId),
        with: {
            creator: {
                columns: {
                    id: true,
                    name: true,
                    email: true,
                    image: true
                }
            }
        }
    })

    if (!project) {
        notFound()
    }

    // Check if current user is a project member
    const isMember = await db.query.projectMembers.findFirst({
        where: and(
            eq(projectMembers.projectId, projectId),
            eq(projectMembers.userId, session.user.id)
        )
    })

    if (!isMember && project.creatorId !== session.user.id) {
        return (
            <main className="py-8 px-10 container mx-auto">
                <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
                <p>You are not a member of this project and cannot view its details.</p>
            </main>
        )
    }

    // Get project members
    const members = await db
        .select({
            userId: users.id,
            userName: users.name,
            userEmail: users.email,
            userImage: users.image,
            role: projectMembers.role,
            joinedAt: projectMembers.joinedAt,
            profile: {
                name: profiles.name,
                avatarId: profiles.avatarId
            }
        })
        .from(projectMembers)
        .innerJoin(users, eq(projectMembers.userId, users.id))
        .leftJoin(profiles, eq(users.id, profiles.userId))
        .where(eq(projectMembers.projectId, projectId))

    // Get latest generated subtasks
    const latestSubtasks = await db.query.generatedSubtasks.findMany({
        where: eq(generatedSubtasks.projectId, projectId),
        orderBy: (generatedSubtasks, { desc }) => [desc(generatedSubtasks.createdAt)],
        limit: 1
    })

    const generatedSubtasksId = latestSubtasks.length > 0 ? latestSubtasks[0].id : null
    const initialSubtasks = latestSubtasks.length > 0 ? (latestSubtasks[0].subtasks as Subtask[]) : []

    // Check if current user has permission to invite
    const isCreator = project.creatorId === session.user.id
    const isAdmin = members.some(m =>
        m.userId === session.user.id && (m.role === "admin" || m.role === "creator")
    )
    const canInvite = isCreator || isAdmin

    return (
        <ProjectPageClient
            project={project}
            members={members}
            canInvite={canInvite}
            userId={session.user.id}
            initialSubtasks={initialSubtasks}
            generatedSubtasksId={generatedSubtasksId}
        />
    )
} 