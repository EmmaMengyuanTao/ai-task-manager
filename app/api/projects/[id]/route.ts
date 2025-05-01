import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { db } from "@/database/db"
import { eq } from "drizzle-orm"
import { projects } from "@/database/schema"
import { NextResponse } from "next/server"

export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
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

        const body = await request.json()
        const { name, description } = body

        if (!name) {
            return new NextResponse("Name is required", { status: 400 })
        }

        // Check if the user is the creator of the project
        const project = await db.query.projects.findFirst({
            where: eq(projects.id, projectId)
        })

        if (!project) {
            return new NextResponse("Project not found", { status: 404 })
        }

        if (project.creatorId !== session.user.id) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        // Update the project
        await db
            .update(projects)
            .set({
                name,
                description: description || null
            })
            .where(eq(projects.id, projectId))

        return new NextResponse("Project updated successfully", { status: 200 })
    } catch (error) {
        console.error("Error updating project:", error)
        return new NextResponse("Internal Server Error", { status: 500 })
    }
} 