import {
    DndContext,
    closestCenter,
    DragEndEvent,
    useDroppable,
    useDraggable,
} from "@dnd-kit/core"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { Task } from "@/app/types"

interface TodoListProps {
    projectId: number
}

function DroppableColumn({ id, children }: { id: string; children: React.ReactNode }) {
    const { setNodeRef } = useDroppable({ id })
    
    return (
        <div ref={setNodeRef} className="space-y-4 p-4 rounded-lg bg-background">
            {children}
        </div>
    )
}
    
function DraggableCard({ task }: { task: Task }) {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({ id: task.id.toString() })
    const style = transform ? { transform: `translate(${transform.x}px, ${transform.y}px)` } : undefined

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            className="p-4 rounded-lg border border-border/50 bg-card hover:bg-card/80"
        >
            <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium text-card-foreground">{task.title}</h4>
            </div>
            <p className="text-sm text-muted-foreground">{task.description}</p>
            <div className="flex flex-wrap gap-2 mt-2">
                {task.requiredSkills?.filter(skill => skill?.id).map((skill) => (
                    <span key={`skill-${skill.id}`} className="px-2 py-1 text-xs rounded-full bg-primary/10">
                        {skill.name}
                    </span>
                ))}
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
                {task.assignedMembers?.filter(member => member?.id).map((member) => (
                    <span key={`member-${member.id}`} className="px-2 py-1 text-xs rounded-full bg-secondary/10 text-secondary-foreground">
                        {member.name}
                    </span>
                ))}
            </div>
        </div>
    )
}
    
export function TodoList({ projectId }: TodoListProps) {
    const [tasks, setTasks] = useState<Task[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const response = await fetch(`/api/projects/${projectId}/tasks`)
                if (!response.ok) throw new Error("Failed to fetch tasks")
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
    }, [ projectId ])

    const columns = [
        { id: "todo", title: "To Do" },
        { id: "inprogress", title: "In Progress" },
        { id: "done", title: "Done" },
    ]

    const handleDragEnd = async (event: DragEndEvent) => {
        const { over, active } = event
        if (!over) return

        const taskId = active.id
        const newStatus = over.id as "todo" | "inprogress" | "done"

        setTasks(prev =>
            prev.map(task =>
                task.id.toString() === taskId ? { ...task, status: newStatus } : task
            )
        )

        try {
            const response = await fetch(`/api/tasks/${taskId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            })

            if (!response.ok) {
                throw new Error("Failed to update task status")
            }

            toast.success("Task status updated successfully")
        } catch (error) {
            console.error("Failed to update task:", error)
            toast.error("Failed to update task status")

            setTasks(prev =>
                prev.map(task =>
                    task.id.toString() === taskId ? { ...task, status: task.status } : task
                )
            )
        }
    }

    if (isLoading) return <div className="p-6">Loading tasks...</div>

    return (
        <div className="rounded-lg border bg-card">
            <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Todo List</h2>
            <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <div className="grid grid-cols-3 gap-4">
                    {columns.map(column => {
                        const columnTasks = tasks.filter(task => task.status === column.id)
                        return (
                            <DroppableColumn key={column.id} id={column.id}>
                                <h3 className="text-lg font-medium">{column.title}</h3>
                                <div className="space-y-2 min-h-[100px] p-2 rounded-md border border-dashed border-border/50">
                                    {columnTasks.map(task => (
                                        <DraggableCard key={task.id} task={task} />
                                    ))}
                                </div>
                            </DroppableColumn>
                        )
                    })}
                </div>
            </DndContext>
            </div>
        </div>
    )
}
    