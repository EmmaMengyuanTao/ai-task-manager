"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Loader2, Trash2 } from "lucide-react"
import { deleteProject } from "@/actions/projectActions"
import { toast } from "sonner"

interface DeleteProjectButtonProps {
    projectId: number
    creatorId: string
    userId: string
}

export function DeleteProjectButton({ projectId, creatorId, userId }: DeleteProjectButtonProps) {
    const router = useRouter()
    const [open, setOpen] = useState(false)
    const [isPending, startTransition] = useTransition()
    
    // Only the creator can delete the project
    const canDelete = creatorId === userId

    if (!canDelete) return null

    const handleDelete = () => {
        startTransition(async () => {
            try {
                const result = await deleteProject({
                    projectId,
                    userId
                })

                if (result.success) {
                    toast.success("Project deleted successfully")
                    setOpen(false)
                    router.push("/projects")
                } else {
                    toast.error(result.error || "Failed to delete project")
                }
            } catch (error) {
                console.error("Project deletion error:", error)
                toast.error("An unexpected error occurred")
            }
        })
    }

    return (
        <>
            <Button 
                variant="destructive" 
                size="sm" 
                onClick={() => setOpen(true)}
            >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
            </Button>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Delete Project</DialogTitle>
                    </DialogHeader>
                    <p className="py-5 mt-2 text-sm">
                        Are you sure you want to delete this project? This action cannot be undone 
                        and all project data will be permanently lost.
                    </p>
                    <DialogFooter className="flex gap-2 mt-6">
                        <Button 
                            variant="outline" 
                            onClick={() => setOpen(false)}
                            disabled={isPending}
                        >
                            Cancel
                        </Button>
                        <Button 
                            variant="destructive" 
                            onClick={handleDelete}
                            disabled={isPending}
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                "Delete Project"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
} 