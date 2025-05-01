"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { InviteUserForm } from "@/components/InviteUserForm"
import { DeleteProjectButton } from "@/components/DeleteProjectButton"
import { ProjectSidebar } from "@/components/ProjectSidebar"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Pencil, Save, X, Trash2 } from "lucide-react"

interface Subtask {
    title: string
    description: string
    requiredSkills: string[]
    assignedMembers: string[]
    reasoning: string
}

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
    const [subtasks, setSubtasks] = useState<Subtask[]>(initialSubtasks)
    const [activeSection, setActiveSection] = useState("subtasks")
    const [editingIndex, setEditingIndex] = useState<number | null>(null)
    const [editedSubtask, setEditedSubtask] = useState<Subtask | null>(null)
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

            setSubtasks(data.subtasks)
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

    const handleEdit = (index: number) => {
        setEditingIndex(index)
        setEditedSubtask({ ...subtasks[index] })
    }

    const handleSave = (index: number) => {
        if (editedSubtask) {
            const newSubtasks = [...subtasks]
            newSubtasks[index] = editedSubtask
            setSubtasks(newSubtasks)
            setEditingIndex(null)
            setEditedSubtask(null)
            toast.success('Subtask updated successfully!')
        }
    }

    const handleCancel = () => {
        setEditingIndex(null)
        setEditedSubtask(null)
    }

    const handleChange = (field: keyof Subtask, value: string) => {
        if (editedSubtask) {
            setEditedSubtask({
                ...editedSubtask,
                [field]: value
            })
        }
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

                        {subtasks.length > 0 && (
                            <div className="rounded-lg border bg-card mb-8">
                                <div className="p-6">
                                    <div className="flex justify-between items-center mb-4">
                                        <h2 className="text-xl font-semibold">Generated Subtasks</h2>
                                        <p className="text-sm text-muted-foreground">Last updated: {new Date().toLocaleString()}</p>
                                    </div>
                                    <div className="grid gap-4">
                                        {subtasks.map((subtask, index) => (
                                            <div
                                                key={index}
                                                className="p-4 rounded-md border"
                                            >
                                                {editingIndex === index ? (
                                                    <div className="space-y-4">
                                                        <div className="flex justify-between items-center">
                                                            <Input
                                                                value={editedSubtask?.title || ""}
                                                                onChange={(e) => handleChange("title", e.target.value)}
                                                                placeholder="Task title"
                                                            />
                                                            <div className="flex gap-2">
                                                                <Button
                                                                    size="sm"
                                                                    onClick={() => handleSave(index)}
                                                                >
                                                                    <Save className="h-4 w-4 mr-2" />
                                                                    Save
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    onClick={handleCancel}
                                                                >
                                                                    <X className="h-4 w-4 mr-2" />
                                                                    Cancel
                                                                </Button>
                                                            </div>
                                                        </div>
                                                        <Textarea
                                                            value={editedSubtask?.description || ""}
                                                            onChange={(e) => handleChange("description", e.target.value)}
                                                            placeholder="Task description"
                                                            className="min-h-[100px]"
                                                        />
                                                        <Textarea
                                                            value={editedSubtask?.reasoning || ""}
                                                            onChange={(e) => handleChange("reasoning", e.target.value)}
                                                            placeholder="Reasoning"
                                                            className="min-h-[60px]"
                                                        />
                                                    </div>
                                                ) : (
                                                    <>
                                                        <div className="flex justify-between items-center mb-2">
                                                            <h3 className="font-medium">{subtask.title}</h3>
                                                            <div className="flex items-center gap-2">
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    onClick={() => handleEdit(index)}
                                                                >
                                                                    <Pencil className="h-4 w-4" />
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    onClick={() => handleDeleteSubtask(index)}
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                        <p className="text-muted-foreground mb-2">{subtask.description}</p>
                                                        <div className="flex flex-wrap gap-2 mb-2">
                                                            {subtask.requiredSkills.map((skill: string) => (
                                                                <span
                                                                    key={skill}
                                                                    className="px-2 py-1 text-xs rounded-full bg-primary/10"
                                                                >
                                                                    {skill}
                                                                </span>
                                                            ))}
                                                        </div>
                                                        <div className="flex flex-wrap gap-2 mb-2">
                                                            {subtask.assignedMembers.map((member: string) => (
                                                                <span
                                                                    key={member}
                                                                    className="px-2 py-1 text-xs rounded-full bg-secondary/10"
                                                                >
                                                                    {member}
                                                                </span>
                                                            ))}
                                                        </div>
                                                        <p className="text-sm text-muted-foreground">{subtask.reasoning}</p>
                                                    </>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}

                {activeSection === "todolist" && (
                    <div className="rounded-lg border bg-card">
                        <div className="p-6">
                            <h2 className="text-xl font-semibold mb-4">Todo List</h2>
                            <p className="text-muted-foreground">Todo list coming soon...</p>
                        </div>
                    </div>
                )}

                {activeSection === "members" && (
                    <div className="rounded-lg border bg-card">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-semibold">Project Members</h2>
                                {canInvite && (
                                    <InviteUserForm projectId={projectId} />
                                )}
                            </div>
                            <div className="grid gap-4">
                                {members.map(member => (
                                    <div
                                        key={member.userId}
                                        className="flex items-center justify-between p-3 rounded-md border"
                                    >
                                        <div className="flex items-center gap-3">
                                            {member.userImage ? (
                                                <img
                                                    src={member.userImage}
                                                    alt={member.userName || ""}
                                                    className="w-10 h-10 rounded-full"
                                                />
                                            ) : (
                                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                    {member.userName?.[0] || member.userEmail[0]}
                                                </div>
                                            )}
                                            <div>
                                                <p className="font-medium">{member.userName}</p>
                                                <p className="text-sm text-muted-foreground">{member.userEmail}</p>
                                            </div>
                                        </div>
                                        <div>
                                            <span className="px-2 py-1 text-xs rounded-full bg-primary/10">
                                                {member.role}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    )
} 