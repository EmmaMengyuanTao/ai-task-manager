"use client"
import { useOptimistic, useActionState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import { Todo } from "@/database/schema"
import { TodoItem } from "./TodoItem"
import { createTodo } from "@/actions/todos"
import { toast } from "sonner"

export function TodoList({ todos }: { todos: Todo[] }) {
    // Add a placeholder Todo while the server action is running.
    const [optimisticTodos, addOptimisticTodo] = useOptimistic<Todo[], string>(
        todos,
        (currentTodos, newTitle) => {
            return [
                {
                    id: `optimistic-${Date.now()}`, // temporary id
                    title: newTitle,
                    completed: false,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    userId: "optimistic-user", // fake user id
                },
                ...currentTodos,
            ]
        }
    );

    const [state, formAction, isPending] = useActionState<{ error?: string }, FormData >(
        async (_prevState, formData: FormData) => { 
            const title = formData.get("title")?.toString().trim() || "";
            if (title) addOptimisticTodo(title);
            const result = await createTodo(formData);
            if (result?.error) {
                toast.error(result.error)
            }
            return result;
        },
        { error: undefined }
    );


    return (
        <div className="space-y-4">
            <form className="flex gap-2 items-stretch" action={formAction}>
                <div className="flex gap-2 items-stretch w-full">
                    <Input
                        name="title"
                        placeholder={"Add a new todo..."}
                        disabled={isPending}
                    />
                    <Button type="submit" disabled={isPending}>
                        {isPending ? "Adding..." : "Add"}
                    </Button>
                </div>
            </form>

            <ul className="space-y-2">
                {optimisticTodos.map((todo) => (
                    <TodoItem key={todo.id} todo={todo} />
                ))}
            </ul>
        </div>
    )
} 