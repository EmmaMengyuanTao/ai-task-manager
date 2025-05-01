"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { InviteUserForm } from "@/components/InviteUserForm"
import { DeleteProjectButton } from "@/components/DeleteProjectButton"
import { ProjectSidebar } from "@/components/ProjectSidebar"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Pencil, Save, X, Trash2, UserPlus, UserMinus } from "lucide-react"
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
    arrayMove,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { SortableItem } from "@/components/SortableItem"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { ProjectMembersSection } from "@/components/ProjectMembersSection"

export interface Subtask {
    title: string
    description: string
    requiredSkills: string[]
    assignedMembers: string[]
    reasoning: string
    status: "todo" | "inprogress" | "completed"
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
    const [editingIndex, setEditingIndex] = useState<number | null>(null)
    const [editedSubtask, setEditedSubtask] = useState<Subtask | null>(null)
    const [isEditingProject, setIsEditingProject] = useState(false)
    const [editedProject, setEditedProject] = useState({
        name: project.name,
        description: project.description || ""
    })
    const [selectedMember, setSelectedMember] = useState<string>("")
    const [activeId, setActiveId] = useState<string | null>(null)

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

    const handleAddMember = () => {
        if (selectedMember && editedSubtask) {
            if (!editedSubtask.assignedMembers.includes(selectedMember)) {
                setEditedSubtask({
                    ...editedSubtask,
                    assignedMembers: [...editedSubtask.assignedMembers, selectedMember]
                })
                setSelectedMember("")
                toast.success('Member added successfully!')
            } else {
                toast.error('Member already assigned!')
            }
        }
    }

    const handleRemoveMember = (member: string) => {
        if (editedSubtask) {
            setEditedSubtask({
                ...editedSubtask,
                assignedMembers: editedSubtask.assignedMembers.filter(m => m !== member)
            })
            toast.success('Member removed successfully!')
        }
    }

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string)
    }

    const handleDragEnd = (event: DragEndEvent) => {
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

        // Move to the new column
        const sourceSubtasks = subtasks.filter(subtask => subtask.status === activeStatus)
        const destSubtasks = subtasks.filter(subtask => subtask.status === overStatus)

        const [movedSubtask] = sourceSubtasks.splice(activeIndex, 1)
        movedSubtask.status = overStatus as "todo" | "inprogress" | "completed"
        destSubtasks.push(movedSubtask) // Always append to the end

        const newSubtasks = subtasks.map(subtask => {
            if (subtask.status === activeStatus) {
                return sourceSubtasks.shift() || subtask
            }
            if (subtask.status === overStatus) {
                return destSubtasks.shift() || subtask
            }
            return subtask
        })

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

                        {subtasks.length > 0 && (
                            <div className="rounded-lg border bg-card mb-8">
                                <div className="p-6">
                                    <div className="flex justify-between items-center mb-4">
                                        <h2 className="text-xl font-semibold">Generated Subtasks</h2>
                                        <p className="text-sm text-muted-foreground">
                                            Last updated: {new Date().toISOString().split('T')[0]} {new Date().toTimeString().split(' ')[0]}
                                        </p>
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
                                                        <div className="space-y-2">
                                                            <div className="flex items-center gap-2">
                                                                <Select
                                                                    value={selectedMember}
                                                                    onValueChange={setSelectedMember}
                                                                >
                                                                    <SelectTrigger className="w-[180px]">
                                                                        <SelectValue placeholder="Select a member" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        {members.map(member => (
                                                                            <SelectItem
                                                                                key={member.userId}
                                                                                value={member.userName || member.userEmail}
                                                                            >
                                                                                {member.userName || member.userEmail}
                                                                            </SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                                <Button
                                                                    size="sm"
                                                                    onClick={handleAddMember}
                                                                    disabled={!selectedMember}
                                                                >
                                                                    <UserPlus className="h-4 w-4 mr-2" />
                                                                    Add
                                                                </Button>
                                                            </div>
                                                            <div className="flex flex-wrap gap-2">
                                                                {editedSubtask?.assignedMembers.map((member) => (
                                                                    <div
                                                                        key={member}
                                                                        className="flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-secondary/10"
                                                                    >
                                                                        {member}
                                                                        <Button
                                                                            size="sm"
                                                                            variant="ghost"
                                                                            className="h-4 w-4 p-0"
                                                                            onClick={() => handleRemoveMember(member)}
                                                                        >
                                                                            <UserMinus className="h-3 w-3" />
                                                                        </Button>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
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
                                                items={subtasks
                                                    .filter(subtask => subtask.status === "todo")
                                                    .map((_, index) => `todo-${index}`)}
                                                strategy={verticalListSortingStrategy}
                                            >
                                                {subtasks
                                                    .filter(subtask => subtask.status === "todo")
                                                    .map((subtask, index) => (
                                                        <SortableItem
                                                            key={`todo-${index}`}
                                                            id={`todo-${index}`}
                                                            subtask={subtask}
                                                        />
                                                    ))}
                                            </SortableContext>
                                        </div>
                                    </div>

                                    <div className="space-y-4 p-4 rounded-lg bg-background">
                                        <h3 className="text-lg font-medium">In Progress</h3>
                                        <div className="space-y-2 min-h-[100px]">
                                            <SortableContext
                                                items={subtasks
                                                    .filter(subtask => subtask.status === "inprogress")
                                                    .map((_, index) => `inprogress-${index}`)}
                                                strategy={verticalListSortingStrategy}
                                            >
                                                {subtasks
                                                    .filter(subtask => subtask.status === "inprogress")
                                                    .map((subtask, index) => (
                                                        <SortableItem
                                                            key={`inprogress-${index}`}
                                                            id={`inprogress-${index}`}
                                                            subtask={subtask}
                                                        />
                                                    ))}
                                            </SortableContext>
                                        </div>
                                    </div>

                                    <div className="space-y-4 p-4 rounded-lg bg-background">
                                        <h3 className="text-lg font-medium">Completed</h3>
                                        <div className="space-y-2 min-h-[100px]">
                                            <SortableContext
                                                items={subtasks
                                                    .filter(subtask => subtask.status === "completed")
                                                    .map((_, index) => `completed-${index}`)}
                                                strategy={verticalListSortingStrategy}
                                            >
                                                {subtasks
                                                    .filter(subtask => subtask.status === "completed")
                                                    .map((subtask, index) => (
                                                        <SortableItem
                                                            key={`completed-${index}`}
                                                            id={`completed-${index}`}
                                                            subtask={subtask}
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
                                                {subtasks.find(subtask =>
                                                    subtask.status === activeId.split("-")[0] &&
                                                    subtask === subtasks[parseInt(activeId.split("-")[1])]
                                                )?.title}
                                            </h4>
                                        </div>
                                    ) : null}
                                </DragOverlay>
                            </DndContext>
                        </div>
                    </div>
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