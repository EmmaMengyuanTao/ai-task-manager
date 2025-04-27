import { TodoList } from "@/components/TodoList"
import { todos as todosTable, Todo } from "@/database/schema"

import { auth } from "@/lib/auth";
import { headers } from "next/headers";

import { db } from "@/database/db"
import { eq, desc } from 'drizzle-orm';

export default async function TodosPage() {

    const session = await auth.api.getSession({
        headers: await headers()
    })

    if(!session) {
        return (
            <main className="py-8 px-4">
                <p>No Authentication ! Please Sign In !</p>
            </main>
        )
    }

    const todos: Todo[] = await db.query.todos.findMany({
        where: eq(todosTable.userId, session.user.id),
        orderBy: [desc(todosTable.createdAt)],
    });

    return (
        <main className="py-8 px-4">
            <section className="container mx-auto">
                <h1 className="text-2xl font-bold mb-6">My Todos</h1>
                <TodoList todos={todos} />
            </section>
        </main>
    )
} 