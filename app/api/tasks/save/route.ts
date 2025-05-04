import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { db } from "@/database/db"
import { tasks, taskMembers, taskSkills } from "@/database/schema/projects"
import { skills } from "@/database/schema/skills"
import { eq } from "drizzle-orm"

export async function POST(req: Request) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        })

        if (!session) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const body = await req.json()
        const { projectId, subtasks } = body

        if (!projectId || !subtasks || !Array.isArray(subtasks)) {
            return new NextResponse("Invalid request body", { status: 400 })
        }

        // Delete all tasks in this project
        await db.delete(tasks).where(eq(tasks.projectId, projectId));

        const existingSkills = await db.select().from(skills)
        const skillMap = new Map(existingSkills.map(skill => [skill.name.toLowerCase(), skill.id]))

        const result = await db.transaction(async (tx) => {
            const savedTasks = []

            for (const subtask of subtasks) {
                const [task] = await tx.insert(tasks).values({
                    title: subtask.title,
                    description: subtask.description,
                    projectId: projectId,
                    status: "todo",
                    note: subtask.reasoning || null,
                }).returning()

                const skillIds = []
                for (const skillName of subtask.requiredSkills) {
                    const lowerSkillName = skillName.toLowerCase()
                    let skillId = skillMap.get(lowerSkillName)

                    if (!skillId) {
                        const [newSkill] = await tx.insert(skills).values({
                            name: lowerSkillName,
                            description: "",
                        }).returning()
                        skillId = newSkill.id
                        skillMap.set(lowerSkillName, skillId)
                    }

                    skillIds.push(skillId)
                }

                if (skillIds.length > 0) {
                    await tx.insert(taskSkills).values(
                        skillIds.map(skillId => ({
                            taskId: task.id,
                            skillId: skillId,
                            requiredLevel: 1,
                        }))
                    )
                }

                if (subtask.assignedMembers.length > 0) {
                    await tx.insert(taskMembers).values(
                        subtask.assignedMembers.map((userId: string) => ({
                            taskId: task.id,
                            userId: userId,
                        }))
                    )
                }

                savedTasks.push(task)
            }

            return savedTasks
        })

        return NextResponse.json(result)
    } catch (error) {
        console.error("[TASKS_SAVE]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
