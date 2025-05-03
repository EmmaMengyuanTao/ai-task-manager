"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { DeleteProjectButton } from "@/components/DeleteProjectButton"
import { ProjectSidebar } from "@/components/ProjectSidebar"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Pencil, Save, X } from "lucide-react"
import { ProjectMembersSection } from "./sections/ProjectMembersSection"
import { GeneratedSubtasks } from "./sections/GeneratedSubtasks"
import { TodoList } from "./sections/TodoList"
import { Subtask } from "@/app/types"

interface ProjectPageClientProps {
    project: {
        id: number
        name: string
        description: string | null
        creatorId: string
    }
    projectId: number
    members: {
        userId: string
        userName: string | null
        userEmail: string
        userImage: string | null
        profile?: {
            name: string | null
            avatarId: string | null
        } | null
        role: string | null
        joinedAt: Date
    }[]
    canInvite: boolean
    userId: string
    initialSubtasks: Subtask[]
}

export function ProjectPageClient({
    project,
    projectId,
    members,
    canInvite,
    userId,
    initialSubtasks
}: ProjectPageClientProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [subtasks, setSubtasks] = useState<Subtask[]>(
        initialSubtasks.map(subtask => ({
            ...subtask,
            status: "todo" as const
        }))
    )
    const [activeSection, setActiveSection] = useState("subtasks")
    const [isEditingProject, setIsEditingProject] = useState(false)
    const [editedProject, setEditedProject] = useState({
        name: project.name,
        description: project.description || ""
    })

    const handleGenerateSubtasks = async () => {
        setIsLoading(true)
        try {
            const response = await fetch('/api/gemini', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ projectId }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to generate subtasks')
            }

            if (!data.subtasks) {
                throw new Error('Invalid response format from AI')
            }

            // Add status field to each subtask and set all to "todo"
            const subtasksWithStatus = data.subtasks.map((subtask: Subtask) => ({
                ...subtask,
                status: "todo" as const
            }))

            setSubtasks(subtasksWithStatus)
            toast.success('Subtasks generated successfully!')
        } catch (error) {
            console.error('Error generating subtasks:', error)
            toast.error(error instanceof Error ? error.message : 'Failed to generate subtasks')
        } finally {
            setIsLoading(false)
        }
    }

    const handleEditProject = () => {
        setIsEditingProject(true)
    }

    const handleSaveProject = async () => {
        try {
            const response = await fetch(`/api/projects/${projectId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: editedProject.name,
                    description: editedProject.description
                }),
            })

            if (!response.ok) {
                throw new Error('Failed to update project')
            }

            setIsEditingProject(false)
            toast.success('Project updated successfully!')
        } catch (error) {
            console.error('Error updating project:', error)
            toast.error('Failed to update project')
        }
    }

    const handleCancelProject = () => {
        setIsEditingProject(false)
        setEditedProject({
            name: project.name,
            description: project.description || ""
        })
    }

    const handleDeleteSubtask = async (index: number) => {
        try {
            const newSubtasks = [...subtasks]
            newSubtasks.splice(index, 1)
            setSubtasks(newSubtasks)
            toast.success('Subtask deleted successfully!')
        } catch (error) {
            console.error('Error deleting subtask:', error)
            toast.error('Failed to delete subtask')
        }
    }

    const handleUpdateSubtask = (index: number, subtask: Subtask) => {
        const newSubtasks = [...subtasks]
        newSubtasks[index] = subtask
        setSubtasks(newSubtasks)
    }

    return (
        <div className="flex h-[calc(100vh-4rem)]">
            <ProjectSidebar
                projectId={projectId}
                canInvite={canInvite}
                members={members}
                activeSection={activeSection}
                onSectionChange={setActiveSection}
            />
            <main className="flex-1 overflow-y-auto py-8 px-10">
                {activeSection === "subtasks" && (
                    <>
                        <div className="mb-8">
                            <div className="flex justify-between items-center mb-4">
                                {isEditingProject ? (
                                    <div className="flex-1 space-y-4">
                                        <div className="flex items-center gap-2">
                                            <Input
                                                value={editedProject.name}
                                                onChange={(e) => setEditedProject({ ...editedProject, name: e.target.value })}
                                                placeholder="Project name"
                                                className="text-2xl font-bold"
                                            />
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    onClick={handleSaveProject}
                                                >
                                                    <Save className="h-4 w-4 mr-2" />
                                                    Save
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={handleCancelProject}
                                                >
                                                    <X className="h-4 w-4 mr-2" />
                                                    Cancel
                                                </Button>
                                            </div>
                                        </div>
                                        <Textarea
                                            value={editedProject.description}
                                            onChange={(e) => setEditedProject({ ...editedProject, description: e.target.value })}
                                            placeholder="Project description"
                                            className="min-h-[100px]"
                                        />
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex items-center gap-2">
                                            <h1 className="text-2xl font-bold">{project.name}</h1>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={handleEditProject}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                onClick={handleGenerateSubtasks}
                                                disabled={isLoading}
                                            >
                                                {isLoading ? "Generating..." : "Generate Subtasks"}
                                            </Button>
                                            <DeleteProjectButton
                                                projectId={projectId}
                                                creatorId={project.creatorId}
                                                userId={userId}
                                            />
                                        </div>
                                    </>
                                )}
                            </div>
                            {!isEditingProject && project.description && (
                                <p className="text-muted-foreground mb-4">{project.description}</p>
                            )}
                        </div>

                        <GeneratedSubtasks
                            projectId={projectId}
                            subtasks={subtasks}
                            members={members}
                            onUpdate={handleUpdateSubtask}
                            onDelete={handleDeleteSubtask}
                        />
                    </>
                )}

                {activeSection === "todolist" && (
                    <TodoList projectId={projectId} />
                )}

                {activeSection === "members" && (
                    <ProjectMembersSection 
                        projectId={projectId}
                        canInvite={canInvite}
                        members={members}
                    />
                )}
            </main>
        </div>
    )
} 