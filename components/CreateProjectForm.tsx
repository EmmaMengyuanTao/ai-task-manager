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
import DatePicker from './DatePicker';

export function CreateProjectForm({ userId }: { userId: string }) {
    const router = useRouter()
    const [open, setOpen] = useState(false)
    const [isPending, startTransition] = useTransition()
    const [formData, setFormData] = useState({
        name: "",
        description: ""
    })
    const [dueDate, setDueDate] = useState<Date | null>(null);

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
                    deadline: dueDate,
                    creatorId: userId
                })

                if (result.success) {
                    toast.success("Project created successfully")
                    setFormData({ name: "", description: "" })
                    setDueDate(null)
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
        <Dialog
            open={open}
            onOpenChange={(isOpen) => {
                if (isOpen) {
                    setDueDate(null);
                }
                setOpen(isOpen);
            }}
        >
            <DialogTrigger asChild>
                <Button variant="gradient">Create New Project</Button>
            </DialogTrigger>
            <DialogContent className="max-w-full sm:max-w-lg md:max-w-xl lg:max-w-2xl mx-4 my-8 bg-white rounded-lg shadow-lg p-6 max-h-[90vh]">
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
                            className="border border-gray-300 bg-gray-50 focus-visible:ring-1 focus-visible:ring-blue-500 rounded"
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
                            className="border border-gray-300 bg-gray-50 focus-visible:ring-1 focus-visible:ring-blue-500 rounded"
                        />
                    </div>

                    <DatePicker 
                        date={dueDate}
                        onDateChange={setDueDate}
                        buttonClassName="h-10 px-4 py-2 w-auto"
                    />
                    
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