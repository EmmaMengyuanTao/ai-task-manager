"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { updateProjectDescription } from "@/actions/projectActions"
import { toast } from "sonner"
import { Pencil, Save, Loader2 } from "lucide-react"

interface ProjectCardProps {
    id: number
    name: string
    description: string
    role: string
    userId: string
}

export function ProjectCard({ id, name, description, role, userId }: ProjectCardProps) {
    const router = useRouter()
    const [isEditing, setIsEditing] = useState(false)
    const [editedDescription, setEditedDescription] = useState(description)
    const [isPending, startTransition] = useTransition()

    const handleSave = () => {
        startTransition(async () => {
            try {
                const result = await updateProjectDescription({
                    projectId: id,
                    description: editedDescription,
                    userId
                })

                if (result.success) {
                    toast.success("Description updated successfully")
                    setIsEditing(false)
                    router.refresh()
                } else {
                    toast.error(result.error || "Failed to update description")
                }
            } catch (error) {
                console.error("Description update error:", error)
                toast.error("An unexpected error occurred")
            }
        })
    }

    return (
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow">
            <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold">{name}</h3>
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">{role}</span>
                </div>
                <div className="space-y-2 mb-4">
                    {isEditing ? (
                        <div className="space-y-2">
                            <Textarea
                                value={editedDescription}
                                onChange={(e) => setEditedDescription(e.target.value)}
                                placeholder="Enter project description"
                                className="min-h-[80px]"
                                disabled={isPending}
                            />
                            <div className="flex justify-end gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        setIsEditing(false)
                                        setEditedDescription(description)
                                    }}
                                    disabled={isPending}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={handleSave}
                                    disabled={isPending}
                                >
                                    {isPending ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="mr-2 h-4 w-4" />
                                            Save
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-start justify-between">
                            <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="ml-2"
                                onClick={() => setIsEditing(true)}
                            >
                                <Pencil className="h-4 w-4" />
                            </Button>
                        </div>
                    )}
                </div>
                <div className="flex justify-end">
                    <Link href={`/projects/${id}`}>
                        <Button variant="outline" size="sm">Open</Button>
                    </Link>
                </div>
            </div>
        </div>
    )
}