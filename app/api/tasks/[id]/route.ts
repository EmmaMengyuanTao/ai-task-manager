import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { db } from "@/database/db"
import { tasks } from "@/database/schema/projects"
import { eq } from "drizzle-orm"

export async function PATCH(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        })

        if (!session) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const taskId = parseInt(params.id)
        if (isNaN(taskId)) {
            return new NextResponse("Invalid task ID", { status: 400 })
        }

        const body = await req.json()
        const { status } = body

        if (!status) {
            return new NextResponse("Missing status", { status: 400 })
        }

        await db.update(tasks)
            .set({ status })
            .where(eq(tasks.id, taskId))

        return new NextResponse("Task updated successfully")
    } catch (error) {
        console.error("[TASK_UPDATE]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
} 