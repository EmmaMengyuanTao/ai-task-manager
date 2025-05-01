import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { db } from "@/database/db"
import { eq, or } from "drizzle-orm"
import { projects, projectMembers, users, profiles } from "@/database/schema"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CreateProjectForm } from "@/components/CreateProjectForm"
import { ProjectCard } from "@/components/ProjectCard"

export default async function ProjectsPage() {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session) {
        return (
            <main className="py-8 px-4">
                <p>Please sign in to view projects</p>
            </main>
        )
    }

    // Get projects created by user with members info
    const createdProjects = await Promise.all(
        (await db.query.projects.findMany({
            where: eq(projects.creatorId, session.user.id),
            orderBy: (projects, { desc }) => [desc(projects.createdAt)],
        })).map(async (project) => {
            // Get members info for each project
            const members = await db
                .select({
                    userId: users.id,
                    userName: users.name,
                    userEmail: users.email,
                    userImage: users.image,
                    profile: {
                        name: profiles.name,
                        avatarId: profiles.avatarId
                    }
                })
                .from(projectMembers)
                .innerJoin(users, eq(projectMembers.userId, users.id))
                .leftJoin(profiles, eq(users.id, profiles.userId))
                .where(eq(projectMembers.projectId, project.id))
                .limit(4) // Limit display member count
            
            return {
                ...project,
                members
            }
        })
    )

    // Get projects user is a member of
    const memberProjectIds = await db
        .select({ projectId: projectMembers.projectId })
        .from(projectMembers)
        .where(eq(projectMembers.userId, session.user.id))
    
    const memberProjectsData = await Promise.all(
        memberProjectIds.map(async ({ projectId }) => {
            const project = await db.query.projects.findFirst({
                where: eq(projects.id, projectId),
            })
            
            if (!project) return null

            // 获取每个项目的成员信息
            const members = await db
                .select({
                    userId: users.id,
                    userName: users.name,
                    userEmail: users.email,
                    userImage: users.image,
                    profile: {
                        name: profiles.name,
                        avatarId: profiles.avatarId
                    }
                })
                .from(projectMembers)
                .innerJoin(users, eq(projectMembers.userId, users.id))
                .leftJoin(profiles, eq(users.id, profiles.userId))
                .where(eq(projectMembers.projectId, projectId))
                .limit(5)
            
            return project ? {
                ...project,
                members
            } : null
        })
    )

    // Filter out null values and remove duplicate projects
    const memberProjects = memberProjectsData.filter(p => p !== null && p.creatorId !== session.user.id) as typeof createdProjects

    // Combine all projects with role information
    const allProjects = [
        ...createdProjects.map(p => ({
            ...p,
            role: "Creator"
        })),
        ...memberProjects.map(p => ({
            ...p,
            role: "Member"
        }))
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    return (
        <main className="py-8 px-10 container max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold">My Projects</h1>
                <CreateProjectForm userId={session.user.id} />
            </div>

            {allProjects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {allProjects.map(project => (
                        <ProjectCard
                            key={project.id}
                            id={project.id}
                            name={project.name}
                            description={project.description || "No description"}
                            role={project.role}
                            userId={session.user.id}
                            members={project.members}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-12">
                    <p className="text-muted-foreground mb-4">You don't have any projects yet</p>
                </div>
            )}
        </main>
    )
} 