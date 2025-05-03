import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import {
    DndContext,
    DragEndEvent,
    DragOverlay,
    DragStartEvent,
    MouseSensor,
    TouchSensor,
    useSensor,
    useSensors,
} from "@dnd-kit/core"
import {
    SortableContext,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { SortableItem } from "@/components/SortableItem"
import { Task } from "@/app/types"

interface TodoListProps {
    projectId: number
}

export function TodoList({ projectId }: TodoListProps) {
    const [tasks, setTasks] = useState<Task[]>([])
    const [activeId, setActiveId] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    const sensors = useSensors(
        useSensor(MouseSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(TouchSensor, {
            activationConstraint: {
                delay: 300,
                tolerance: 5,
            },
        })
    )

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

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string)
    }

    const handleDragEnd = async (event: DragEndEvent) => {
        setActiveId(null)
        const { active, over } = event
        if (!over) return

        const activeId = active.id as string
        const overId = over.id as string

        // Extract status from the IDs
        const [activeStatus] = activeId.split("-")
        const [overStatus] = overId.split("-")
        const activeIndex = parseInt(activeId.split("-")[1])

        // If dropped in the same column, keep the same order
        if (activeStatus === overStatus) {
            return
        }

        // Find the task being moved
        const taskToUpdate = tasks.find(task => 
            task.status === activeStatus && 
            task === tasks[parseInt(activeId.split("-")[1])]
        )

        if (!taskToUpdate) return

        try {
            // Update task status in the database
            const response = await fetch(`/api/tasks/${taskToUpdate.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    status: overStatus,
                }),
            })

            if (!response.ok) {
                throw new Error("Failed to update task status")
            }

            // Update local state
            setTasks(prevTasks => 
                prevTasks.map(task => 
                    task.id === taskToUpdate.id 
                        ? { ...task, status: overStatus as "todo" | "inprogress" | "completed" }
                        : task
                )
            )

            toast.success("Task status updated successfully")
        } catch (error) {
            console.error("Error updating task status:", error)
            toast.error("Failed to update task status")
        }
    }

    if (isLoading) {
        return <div className="p-6">Loading tasks...</div>
    }

    return (
        <div className="rounded-lg border bg-card">
            <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">Todo List</h2>
                <DndContext
                    sensors={sensors}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                >
                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-4 p-4 rounded-lg bg-background">
                            <h3 className="text-lg font-medium">To Do</h3>
                            <div className="space-y-2 min-h-[100px]">
                                <SortableContext
                                    items={tasks
                                        .filter(task => task.status === "todo")
                                        .map((_, index) => `todo-${index}`)}
                                    strategy={verticalListSortingStrategy}
                                >
                                    {tasks
                                        .filter(task => task.status === "todo")
                                        .map((task, index) => (
                                            <SortableItem
                                                key={`todo-${task.id}`}
                                                id={`todo-${task.id}`}
                                                task={task}
                                            />
                                        ))}
                                </SortableContext>
                            </div>
                        </div>

                        <div className="space-y-4 p-4 rounded-lg bg-background">
                            <h3 className="text-lg font-medium">In Progress</h3>
                            <div className="space-y-2 min-h-[100px]">
                                <SortableContext
                                    items={tasks
                                        .filter(task => task.status === "inprogress")
                                        .map((_, index) => `inprogress-${index}`)}
                                    strategy={verticalListSortingStrategy}
                                >
                                    {tasks
                                        .filter(task => task.status === "inprogress")
                                        .map((task, index) => (
                                            <SortableItem
                                                key={`inprogress-${task.id}`}
                                                id={`inprogress-${task.id}`}
                                                task={task}
                                            />
                                        ))}
                                </SortableContext>
                            </div>
                        </div>

                        <div className="space-y-4 p-4 rounded-lg bg-background">
                            <h3 className="text-lg font-medium">Completed</h3>
                            <div className="space-y-2 min-h-[100px]">
                                <SortableContext
                                    items={tasks
                                        .filter(task => task.status === "completed")
                                        .map((_, index) => `completed-${index}`)}
                                    strategy={verticalListSortingStrategy}
                                >
                                    {tasks
                                        .filter(task => task.status === "completed")
                                        .map((task, index) => (
                                            <SortableItem
                                                key={`completed-${index}`}
                                                id={`completed-${index}`}
                                                task={task}
                                            />
                                        ))}
                                </SortableContext>
                            </div>
                        </div>
                    </div>
                    <DragOverlay>
                        {activeId ? (
                            <div className="p-4 rounded-md border bg-white shadow-lg">
                                <h4 className="font-medium">
                                    {tasks.find(task =>
                                        task.status === activeId.split("-")[0] &&
                                        task === tasks[parseInt(activeId.split("-")[1])]
                                    )?.title}
                                </h4>
                            </div>
                        ) : null}
                    </DragOverlay>
                </DndContext>
            </div>
        </div>
    )
} 