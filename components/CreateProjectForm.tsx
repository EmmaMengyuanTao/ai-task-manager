"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { createProject } from "@/actions/projectActions"
import { toast } from "sonner"

export function CreateProjectForm({ userId }: { userId: string }) {
    const router = useRouter()
    const [open, setOpen] = useState(false)
    const [isPending, startTransition] = useTransition()
    const [formData, setFormData] = useState({
        name: "",
        description: ""
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        
        if (!formData.name.trim()) {
            toast.error("Project name cannot be empty")
            return
        }

        startTransition(async () => {
            try {
                const result = await createProject({
                    name: formData.name,
                    description: formData.description,
                    creatorId: userId
                })

                if (result.success) {
                    toast.success("Project created successfully")
                    setFormData({ name: "", description: "" })
                    setOpen(false)
                    router.refresh()
                } else {
                    toast.error(result.error || "Failed to create project")
                }
            } catch (error) {
                console.error("Project creation error:", error)
                toast.error("An unexpected error occurred")
            }
        })
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>Create New Project</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create New Project</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 mt-6">
                    <div className="space-y-3">
                        <Label htmlFor="name" className="text-sm font-medium block mb-1.5">
                            Project Name
                        </Label>
                        <Input
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Enter project name"
                            disabled={isPending}
                            required
                            className="focus-visible:ring-1 focus-visible:ring-offset-1"
                        />
                    </div>
                    <div className="space-y-3">
                        <Label htmlFor="description" className="text-sm font-medium block mb-1.5">
                            Project Description (Optional)
                        </Label>
                        <Textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Describe the project content and goals"
                            disabled={isPending}
                            rows={4}
                            className="focus-visible:ring-1 focus-visible:ring-offset-1"
                        />
                    </div>
                    <div className="flex justify-end mt-6">
                        <Button type="submit" disabled={isPending}>
                            {isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                "Create Project"
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
} 