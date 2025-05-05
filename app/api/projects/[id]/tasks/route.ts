import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { db } from "@/database/db"
import { tasks, taskMembers, taskSkills } from "@/database/schema/projects"
import { skills } from "@/database/schema/skills"
import { users } from "@/database/schema/auth"
import { eq, inArray } from "drizzle-orm"

export async function GET(req: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        })

        if (!session) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const projectId = parseInt(params.id)
        if (isNaN(projectId)) {
            return new NextResponse("Invalid project ID", { status: 400 })
        }

        // Get all tasks under the project
        const allTasks = await db.select().from(tasks).where(eq(tasks.projectId, projectId))
        const taskIds = allTasks.map(task => task.id)

        if (taskIds.length === 0) {
            return NextResponse.json([])
        }

        // Get all members and skills related to these tasks
        const allTaskMembers = await db.select().from(taskMembers).where(inArray(taskMembers.taskId, taskIds))
        const allTaskSkills = await db.select().from(taskSkills).where(inArray(taskSkills.taskId, taskIds))

        const allSkills = await db.select().from(skills)
        const allUsers = await db.select().from(users)

        // Compose full task details
        const tasksWithDetails = allTasks.map(task => {
            const taskMemberIds = allTaskMembers
                .filter(tm => tm.taskId === task.id)
                .map(tm => tm.userId)

            const assignedMembers = allUsers.filter(user => 
                taskMemberIds.includes(user.id)
            )

            const taskSkillIds = allTaskSkills
                .filter(ts => ts.taskId === task.id)
                .map(ts => ts.skillId)

            const requiredSkills = allSkills.filter(skill => 
                taskSkillIds.includes(skill.id)
            )

            return {
                id: task.id,
                title: task.title,
                description: task.description,
                status: task.status,
                note: task.note,
                requiredSkills,
                assignedMembers,
                projectId: task.projectId,
                dueDate: task.dueDate,
                createdAt: task.createdAt,
                updatedAt: task.updatedAt,
            }
        })

        return NextResponse.json(tasksWithDetails)
    } catch (error) {
        console.error("[PROJECT_TASKS]", error)
        return new NextResponse("Internal Server Error", { status: 500 })
    }
}
