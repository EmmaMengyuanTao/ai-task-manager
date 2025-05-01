"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { InviteUserForm } from "@/components/InviteUserForm"
import { DeleteProjectButton } from "@/components/DeleteProjectButton"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Loader2, Save, Pencil } from "lucide-react"
import { updateProjectDescription, updateProjectName } from "@/actions/projectActions"

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
    initialSubtasks: any[]
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
    const [subtasks, setSubtasks] = useState(initialSubtasks)
    const [isEditing, setIsEditing] = useState(false)
    const [editedName, setEditedName] = useState(project.name)
    const [editedDescription, setEditedDescription] = useState(project.description || "")
    const [isSaving, setIsSaving] = useState(false)

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

    const handleSave = async () => {
        setIsSaving(true)
        try {
            const [nameResult, descriptionResult] = await Promise.all([
                updateProjectName({
                    projectId,
                    name: editedName,
                    userId
                }),
                updateProjectDescription({
                    projectId,
                    description: editedDescription,
                    userId
                })
            ])

            if (nameResult.success && descriptionResult.success) {
                toast.success("Project updated successfully")
                setIsEditing(false)
            } else {
                toast.error(nameResult.error || descriptionResult.error || "Failed to update project")
            }
        } catch (error) {
            console.error("Project update error:", error)
            toast.error("An unexpected error occurred")
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <main className="py-8 px-10 container max-w-6xl mx-auto">
            <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                    {isEditing ? (
                        <Input
                            value={editedName}
                            onChange={(e) => setEditedName(e.target.value)}
                            placeholder="Enter project name"
                            className="text-2xl font-bold"
                            disabled={isSaving}
                        />
                    ) : (
                        <h1 className="text-2xl font-bold">{project.name}</h1>
                    )}
                    <div className="flex items-center gap-2">
                        <DeleteProjectButton
                            projectId={projectId}
                            creatorId={project.creatorId}
                            userId={userId}
                        />
                        {canInvite && (
                            <InviteUserForm projectId={projectId} />
                        )}
                    </div>
                </div>
                <div className="space-y-4">
                    {isEditing ? (
                        <div className="space-y-2">
                            <Textarea
                                value={editedDescription}
                                onChange={(e) => setEditedDescription(e.target.value)}
                                placeholder="Enter project description"
                                className="min-h-[100px]"
                                disabled={isSaving}
                            />
                            <div className="flex justify-end gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        setIsEditing(false)
                                        setEditedName(project.name)
                                        setEditedDescription(project.description || "")
                                    }}
                                    disabled={isSaving}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={handleSave}
                                    disabled={isSaving}
                                >
                                    {isSaving ? (
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
                            <p className="text-muted-foreground">{project.description || "No description"}</p>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setIsEditing(true)}
                                >
                                    <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                    onClick={handleGenerateSubtasks}
                                    disabled={isLoading}
                                >
                                    {isLoading ? "Generating..." : "Generate Subtasks"}
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
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
                                    <h3 className="font-medium mb-2">{subtask.title}</h3>
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
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <div className="rounded-lg border bg-card">
                <div className="p-6">
                    <h2 className="text-xl font-semibold mb-4">Project Members</h2>
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
        </main>
    )
} 