"use server"

import { eq, and, sql } from "drizzle-orm"
import { headers } from "next/headers"
import { revalidatePath } from "next/cache"

import { auth } from "@/lib/auth"
import { db } from "@/database/db"
import { todos, insertTodoSchema } from "@/database/schema"

export async function createTodo(
    formData: FormData
): Promise<{ error?: string }> {
    const session = await auth.api.getSession({
        headers: await headers()
    })
    
    if(!session) {
        return { error: "Not authenticated" };
    }

    const title = formData.get("title")?.toString().trim() ?? "";

    const parseResult = insertTodoSchema.safeParse({ title, userId: session.user.id });
    if (!parseResult.success) {
        return {
            error: parseResult.error.format().title?._errors?.[0] || "Invalid input",
        }
    }

    await new Promise(resolve => setTimeout(resolve, 1000)); // simulate delay

    await db.insert(todos).values({
        title,
        userId: session.user.id,
    });

    revalidatePath("/todos");

    return {};
}

export async function toggleTodo(
    formData: FormData
): Promise<{ error?: string }> {
    const session = await auth.api.getSession({
        headers: await headers()
    })
    
    if(!session) {
        return { error: "Not authenticated" };
    }

    const id = formData.get("id") as string;

    try {
        // Update only if the todo belongs to the current user
        await db
            .update(todos)
            .set({ completed: sql`NOT ${todos.completed}` })
            .where(and(
                eq(todos.id, id), 
                eq(todos.userId, session.user.id)
            ));

        revalidatePath("/todos");
        return {};
    } catch (error: any) {
        return { error: error.message || "Failed to toggle Todo!" };
    }
}

export async function deleteTodo(formData: FormData) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if(!session) {
        console.error("Not authenticated");
        return;
    }

    // Check if user is admin
    if (session.user.role != "admin") {
        console.error("Unauthorized: Admin access required to delete todo");
        return;
    }

    const id = formData.get("id") as string;
    await db.delete(todos)
        .where(eq(todos.id, id));

    revalidatePath("/admin");
}
