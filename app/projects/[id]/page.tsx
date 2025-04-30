import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { db } from "@/database/db"
import { eq, and } from "drizzle-orm"
import { projects, projectMembers, users } from "@/database/schema"
import { InviteUserForm } from "@/components/InviteUserForm"
import { DeleteProjectButton } from "@/components/DeleteProjectButton"
import { notFound } from "next/navigation"

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
            joinedAt: projectMembers.joinedAt
        })
        .from(projectMembers)
        .innerJoin(users, eq(projectMembers.userId, users.id))
        .where(eq(projectMembers.projectId, projectId))

    // Check if current user has permission to invite
    const isCreator = project.creatorId === session.user.id
    const isAdmin = members.some(m => 
        m.userId === session.user.id && (m.role === "admin" || m.role === "creator")
    )
    const canInvite = isCreator || isAdmin

    return (
        <main className="py-8 px-10 container max-w-6xl mx-auto">
            <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-bold">{project.name}</h1>
                    <div className="flex items-center gap-2">
                        <DeleteProjectButton 
                            projectId={projectId} 
                            creatorId={project.creatorId}
                            userId={session.user.id}
                        />
                        {canInvite && (
                            <InviteUserForm projectId={projectId} />
                        )}
                    </div>
                </div>
                {project.description && (
                    <p className="text-muted-foreground mb-4">{project.description}</p>
                )}
            </div>

            <div className="rounded-lg border bg-card">
                <div className="p-6">
                    <h2 className="text-xl font-semibold mb-4">Project Members</h2>
                    <div className="grid gap-4">
                        {members.map(member => (
                            <div 
                                key={member.userId}
                                className="flex items-center justify-between p-3 rounded-md border"
                            >
                                <div className="flex items-center gap-3">
                                    {member.userImage ? (
                                        <img 
                                            src={member.userImage} 
                                            alt={member.userName || ""} 
                                            className="w-10 h-10 rounded-full"
                                        />
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                            {member.userName?.[0] || member.userEmail[0]}
                                        </div>
                                    )}
                                    <div>
                                        <p className="font-medium">{member.userName}</p>
                                        <p className="text-sm text-muted-foreground">{member.userEmail}</p>
                                    </div>
                                </div>
                                <div>
                                    <span className="px-2 py-1 text-xs rounded-full bg-primary/10">
                                        {member.role}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </main>
    )
} 