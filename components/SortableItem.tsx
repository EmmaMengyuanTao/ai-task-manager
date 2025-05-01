"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Subtask } from "@/app/projects/[id]/ProjectPageClient"

interface SortableItemProps {
    id: string
    subtask: Subtask
}

export function SortableItem({ id, subtask }: SortableItemProps) {
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
                <h4 className="font-medium text-card-foreground">{subtask.title}</h4>
            </div>
            <p className="text-sm text-muted-foreground">{subtask.description}</p>
            <div className="flex flex-wrap gap-2 mt-2">
                {subtask.assignedMembers.map((member) => (
                    <span
                        key={member}
                        className="px-2 py-1 text-xs rounded-full bg-secondary/10 text-secondary-foreground"
                    >
                        {member}
                    </span>
                ))}
            </div>
        </div>
    )
} 