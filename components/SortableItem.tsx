"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Task } from "@/app/types"

interface SortableItemProps {
    id: string
    task: Task
}

export function SortableItem({ id, task }: SortableItemProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={`p-4 rounded-lg border border-border/50 bg-card hover:bg-card/80 transition-colors ${isDragging ? "shadow-lg" : ""
                }`}
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
    )
} 