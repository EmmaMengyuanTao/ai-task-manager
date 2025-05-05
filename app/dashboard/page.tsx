import { auth } from "@/lib/auth"
import { db } from "@/database/db"
import * as schema from "@/database/schema"
import { eq, and, desc, count, sql } from "drizzle-orm"
import { InferSelectModel } from "drizzle-orm"
import { redirect } from "next/navigation"
import { differenceInDays, formatDistanceToNow } from "date-fns"
import { ProjectProgressCard } from "@/components/dashboard/ProjectProgressCard"
import { RecentTasksList } from "@/components/dashboard/RecentTasksList"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"
import { headers } from "next/headers"

// Define a type for the enriched project data needed by the card
export interface ProjectWithProgress extends InferSelectModel<typeof schema.projects> {
    totalTasks: number
    completedTasks: number
    daysLeft?: number | null // null if no deadline, negative if overdue
    members?: {
        userId: string
        userName: string | null
        userEmail: string
        userImage: string | null
    }[]
}

// Define a type for the enriched task data needed by the list
export interface RecentTask extends InferSelectModel<typeof schema.tasks> {
    projectName: string | null
    assignedAgo: string | null
    assignee?: {
        id: string
        name: string | null
        email: string | null
        image: string | null
    } | null
    dueDate: Date | null
}

export default async function DashboardPage() {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session?.user) {
        redirect("/auth/sign-in")
    }

    const userId = session.user.id

    // --- Fetch Most Recent Project & Calculate Progress ---
    let recentProjectData: ProjectWithProgress | null = null
    try {
        const projectMembership = await db.query.projectMembers.findFirst({
            where: eq(schema.projectMembers.userId, userId),
            orderBy: [desc(schema.projectMembers.joinedAt)], // Order by when user joined the project
            with: {
                project: {
                    with: {
                        tasks: {
                            columns: {
                                status: true,
                            },
                        },
                        members: {
                            with: {
                                user: {
                                    columns: {
                                        id: true,
                                        name: true,
                                        email: true,
                                        image: true
                                    }
                                }
                            }
                        }
                    },
                },
            },
        })

        if (projectMembership?.project) {
            const project = projectMembership.project
            const totalTasks = project.tasks.length
            const completedTasks = project.tasks.filter(task => task.status === 'done').length
            
            let daysLeft: number | null = null;
            if (project.deadline) {
                const now = new Date();
                // Set time to start of day for consistent "days left" calculation
                now.setHours(0, 0, 0, 0); 
                const deadlineDate = new Date(project.deadline);
                deadlineDate.setHours(0, 0, 0, 0);
                daysLeft = differenceInDays(deadlineDate, now);
            }

            const members = project.members?.map(member => ({
                userId: member.user.id,
                userName: member.user.name,
                userEmail: member.user.email ?? '',
                userImage: member.user.image
            })) || [];

            recentProjectData = {
                ...project,
                totalTasks,
                completedTasks,
                daysLeft,
                members
            }
        }
    } catch (error) {
        console.error("Error fetching recent project:", error)
    }

    // --- Fetch Recent Tasks Assigned to User ---
    let recentTasksData: RecentTask[] = []
    try {
        const assignedTasks = await db.query.taskMembers.findMany({
            where: eq(schema.taskMembers.userId, userId),
            orderBy: [desc(schema.taskMembers.assignedAt)], // Order by assignment date
            limit: 5,
            with: {
                task: {
                    with: {
                        project: { // Need project name
                            columns: { name: true },
                        },
                    },
                },
                user: {
                    columns: {
                        id: true,
                        name: true,
                        email: true,
                        image: true
                    }
                }
            },
        })

        const now = new Date();
        recentTasksData = assignedTasks.map(({ task, user }) => ({
            ...task,
            projectName: task.project?.name ?? 'Unknown Project',
            assignedAgo: task.createdAt ? formatDistanceToNow(new Date(task.createdAt), { addSuffix: true }) : null,
            assignee: {
                id: user.id,
                name: user.name,
                email: user.email,
                image: user.image
            },
            dueDate: task.dueDate ? new Date(task.dueDate) : null
        }))

    } catch (error) {
        console.error("Error fetching recent tasks:", error)
    }

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
                {/* Add any dashboard-level actions here if needed later */}
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                 {/* Recent Project Card */}
                 <div className="lg:col-span-4"> {/* Make this card wider */}
                    {recentProjectData ? (
                         <ProjectProgressCard project={recentProjectData} />
                    ) : (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <AlertCircle className="h-5 w-5 text-muted-foreground" />
                                    Recent Project
                                </CardTitle>
                                <CardDescription>No recent projects found.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">
                                    You are not part of any projects yet, or there was an error fetching project data.
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </div>

                 {/* Recent Tasks Card */}
                <div className="lg:col-span-3"> {/* Make this card narrower */}
                    <RecentTasksList tasks={recentTasksData} />
                </div>
            </div>

        </div>
    )
}