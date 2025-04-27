import { useTransition } from "react";
import { Todo } from "@/database/schema";
import { Checkbox } from "@/components/ui/checkbox";
import { toggleTodo } from "@/actions/todos"
import { toast } from "sonner"

export function TodoItem({ todo }: { todo: Todo }) {
    const [isPending, startTransition] = useTransition();

    const handleToggle = () => {
        const formData = new FormData();
        formData.append("id", todo.id);

        startTransition(() => {
            toggleTodo(formData).then((res) => {
                if (res.error) {
                    toast.error(res.error);
                }
            });
        });
    };

    return (
        <li
            key={todo.id}
            className={`flex items-center gap-2 rounded-lg border px-4 py-2`}
        >
            <Checkbox
                checked={todo.completed}
                onCheckedChange={handleToggle}
                disabled={isPending}
            />
            <span className={`flex-1 ${todo.completed ? "line-through text-muted-foreground" : ""}`}>
                {todo.title}
            </span>
        </li>
    )
}