"use server"

import { eq, and, sql } from "drizzle-orm"
import { headers } from "next/headers"
import { revalidatePath } from "next/cache"

import { auth } from "@/lib/auth"
import { db } from "@/database/db"
import { users } from "@/database/schema"

export async function toggleUserActive(
    formData: FormData
): Promise<{ error?: string }> {
    const session = await auth.api.getSession({
        headers: await headers()
    })
    
    if(session?.user?.role !== "admin") {
        return { error: "Access Denied. Only admins can ban/unban user" };
    }

    const id = formData.get("id") as string;

    try {
        // Update only if the todo belongs to the current user
        await db
            .update(users)
            .set({ banned: sql`NOT ${users.banned}` })
            .where(eq(users.id, id));

        revalidatePath("/admin");
        return {};
    } catch (error: any) {
        return { error: error.message || "Failed to toggle User!" };
    }
}

