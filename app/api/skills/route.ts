import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { db } from "@/database/db"
import { skills } from "@/database/schema/skills"

export async function GET(req: Request) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        })

        if (!session) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const allSkills = await db.select().from(skills)
        return NextResponse.json(allSkills)
    } catch (error) {
        console.error("[SKILLS_LIST]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
} 