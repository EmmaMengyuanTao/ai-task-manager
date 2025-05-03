import { useState, useEffect } from "react"
import { toast } from "sonner"
import { Task } from "@/app/types"

interface TodoListProps {
    projectId: number
}

export function TodoList({ projectId }: TodoListProps) {
    const [tasks, setTasks] = useState<Task[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const response = await fetch(`/api/projects/${projectId}/tasks`)
                if (!response.ok) {
                    throw new Error("Failed to fetch tasks")
                }
                const data = await response.json()
                setTasks(data)
            } catch (error) {
                console.error("Error fetching tasks:", error)
                toast.error("Failed to load tasks")
            } finally {
                setIsLoading(false)
            }
        }

        fetchTasks()
    }, [projectId])

    if (isLoading) {
        return <div className="p-6">Loading tasks...</div>
    }

    const columns = [
        { id: "todo", title: "To Do" },
        { id: "inprogress", title: "In Progress" },
        { id: "completed", title: "Completed" },
    ]

    return (
        <div className="rounded-lg border bg-card">
            <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">Todo List</h2>
                <div className="grid grid-cols-3 gap-4">
                    {columns.map((column) => {
                        const columnTasks = tasks.filter(task => task.status === column.id)

                        return (
                            <div key={column.id} className="space-y-4 p-4 rounded-lg bg-background">
                                <h3 className="text-lg font-medium">{column.title}</h3>
                                <div className="space-y-2 min-h-[100px] p-2 rounded-md border border-dashed border-border/50">
                                    {columnTasks.map((task) => (
                                        <div
                                            key={`${column.id}-${task.id}`}
                                            className="p-4 rounded-lg border border-border/50 bg-card hover:bg-card/80"
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className="font-medium text-card-foreground">{task.title}</h4>
                                            </div>
                                            <p className="text-sm text-muted-foreground">{task.description}</p>
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {task.requiredSkills?.filter(skill => skill?.id).map((skill) => (
                                                    <span
                                                        key={`skill-${skill.id}`}
                                                        className="px-2 py-1 text-xs rounded-full bg-primary/10"
                                                    >
                                                        {skill.name}
                                                    </span>
                                                ))}
                                            </div>
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {task.assignedMembers?.filter(member => member?.id).map((member) => (
                                                    <span
                                                        key={`member-${member.id}`}
                                                        className="px-2 py-1 text-xs rounded-full bg-secondary/10 text-secondary-foreground"
                                                    >
                                                        {member.name}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
} 