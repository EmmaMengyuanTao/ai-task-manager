import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { db } from "@/database/db"
import { generatedSubtasks } from "@/database/schema/projects"
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

        const generatedSubtasks_Id = parseInt(params.id)
        if (isNaN(generatedSubtasks_Id)) {
            return new NextResponse("Invalid generatedSubtasks_Id ID", { status: 400 })
        }

        const body = await req.json()
        const { subtasks } = body

        if (!subtasks) {
            return new NextResponse("Missing subtasks", { status: 400 })
        }

        await db.update(generatedSubtasks)
            .set({ subtasks })
            .where(eq(generatedSubtasks.id, generatedSubtasks_Id))

        return new NextResponse("Generated Subtasks updated successfully")
    } catch (error) {
        console.error("[GENERATED_SUBTASK_UPDATE]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
} 