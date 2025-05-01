import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { db } from "@/database/db"
import { eq, or } from "drizzle-orm"
import { projects, projectMembers } from "@/database/schema"
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

    // Get projects created by user
    const createdProjects = await db.query.projects.findMany({
        where: eq(projects.creatorId, session.user.id),
        orderBy: (projects, { desc }) => [desc(projects.createdAt)],
    })

    // Get projects user is a member of
    const memberProjects = await db
        .select({
            id: projects.id,
            name: projects.name,
            description: projects.description,
            createdAt: projects.createdAt,
            deadline: projects.deadline
        })
        .from(projectMembers)
        .innerJoin(projects, eq(projectMembers.projectId, projects.id))
        .where(eq(projectMembers.userId, session.user.id))

    // Remove duplicate projects
    const createdProjectIds = new Set(createdProjects.map(p => p.id))
    const uniqueMemberProjects = memberProjects.filter(p => !createdProjectIds.has(p.id))

    // Combine all projects with role information
    const allProjects = [
        ...createdProjects.map(p => ({
            ...p,
            role: "Creator"
        })),
        ...uniqueMemberProjects.map(p => ({
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