import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { Pencil, Save, X, Trash2, UserPlus, UserMinus } from "lucide-react"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { DeleteProjectButton } from "@/components/DeleteProjectButton"
import { Subtask, Project } from "@/app/types"

interface GeneratedSubtasksProps {
    project: Project
    members: {
        userId: string
        userName: string | null
        userEmail: string
    }[]
    userId: string
    initialSubtasks: Subtask[]
    generatedSubtasksId:  number | null
}

export function GeneratedSubtasks({
    project,
    members,
    userId,
    initialSubtasks,
    generatedSubtasksId
}: GeneratedSubtasksProps) {
    const [isSaving, setIsSaving] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [isEditingProject, setIsEditingProject] = useState(false)
    const [editingIndex, setEditingIndex] = useState<number | null>(null)
    const [editedSubtask, setEditedSubtask] = useState<Subtask | null>(null)
    const [selectedMember, setSelectedMember] = useState<string>("")
    const [hasUnsavedSubtasks, setHasUnsavedSubtasks] = useState(false)
    const [subtasks, setSubtasks] = useState<Subtask[]>(initialSubtasks)
    const [generatedSubtasks_Id, setGeneratedSubtasksId] = useState<number | null>(generatedSubtasksId)
    const [editedProject, setEditedProject] = useState({
        name: project.name,
        description: project.description || ""
    })

    useEffect(() => {
        setHasUnsavedSubtasks(subtasks.length > 0)
    }, [subtasks])

    const handleEditProject = () => {
        setIsEditingProject(true)
    }

    const handleSaveProject = async () => {
        try {
            const response = await fetch(`/api/projects/${project.id}`, {
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

    const handleGenerateSubtasks = async () => {
        setIsLoading(true)
        try {
            const response = await fetch('/api/gemini', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ projectId: project.id }),
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

            setGeneratedSubtasksId(data.id)
            setSubtasks(subtasksWithStatus)
            toast.success('Subtasks generated successfully!')
        } catch (error) {
            console.error('Error generating subtasks:', error)
            toast.error(error instanceof Error ? error.message : 'Failed to generate subtasks')
        } finally {
            setIsLoading(false)
        }
    }

    const handleSaveTasks = async () => {
        if (subtasks.length === 0) {
            toast.error("No subtasks to save")
            return
        }

        setIsSaving(true)
        try {
            const response = await fetch('/api/tasks/save', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    projectId: project.id,
                    subtasks: subtasks.map(subtask => ({
                        ...subtask,
                        assignedMembers: subtask.assignedMembers.map(memberName => {
                            const member = members.find(m => 
                                m.userName === memberName || 
                                m.userEmail === memberName
                            )
                            return member?.userId || memberName
                        }),
                        status: "todo"
                    })),
                }),
            })

            if (!response.ok) {
                throw new Error("Failed to save subtasks")
            }

            const data = await response.json()
            toast.success("Subtasks saved to ToDo List successfully!")
            setHasUnsavedSubtasks(false)
        } catch (error) {
            console.error("Error saving subtasks:", error)
            toast.error("Failed to save subtasks")
        } finally {
            setIsSaving(false)
        }
    }

    const handleEdit = (index: number) => {
        setEditingIndex(index)
        setEditedSubtask({ ...subtasks[index] })
    }

    const updateGenerateSubtasks = async (newSubtasks: Subtask[]) => {
        try {
            const response = await fetch(`/api/generated-subtasks/${generatedSubtasks_Id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ subtasks: newSubtasks }),
            })

            if (!response.ok) {
                throw new Error("Failed to update subtask in DB")
            }

            setEditingIndex(null)
            setEditedSubtask(null)
            setHasUnsavedSubtasks(true)
        } catch (error) {
            console.error("Error updating subtask:", error)
            toast.error("Failed to update subtask in database")
        }
    }

    const handleSave = async (index: number) => {
        if (editedSubtask) {
            const newSubtasks = [...subtasks]
            newSubtasks[index] = editedSubtask
            setSubtasks(newSubtasks)
            await updateGenerateSubtasks(newSubtasks)
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

    const handleDelete = async (index: number) => {
        const newSubtasks = [...subtasks]
        newSubtasks.splice(index, 1)
        setSubtasks(newSubtasks)
        await updateGenerateSubtasks(newSubtasks)
        toast.success('Subtask deleted successfully!')
    }

    return (
        <div className="space-y-8">
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
                                <h1 className="text-2xl font-bold">{editedProject.name}</h1>
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
                                    projectId={project.id}
                                    creatorId={project.creatorId}
                                    userId={userId}
                                />
                            </div>
                        </>
                    )}
                </div>
                {!isEditingProject && editedProject.description && (
                    <p className="text-muted-foreground mb-4">{editedProject.description}</p>
                )}
            </div>

            {subtasks.length > 0 && (
                <div className="rounded-lg border bg-card">
                    <div className="p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold">Latest Generated Subtasks</h2>
                            <div className="flex items-center gap-4">
                                <p className="text-sm text-muted-foreground">
                                    Last updated: {new Date().toISOString().split('T')[0]} {new Date().toTimeString().split(' ')[0]}
                                </p>
                                {subtasks.length > 0 && (
                                    <Button
                                        onClick={handleSaveTasks}
                                        disabled={isSaving || !hasUnsavedSubtasks}
                                        variant="secondary"
                                    >
                                        {isSaving ? "Saving..." : "Save Tasks"}
                                    </Button>
                                )}
                            </div>
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
                                                                    value={member.userId}
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
                                                            {members.find(m => m.userId === member)?.userName || member}
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
                                                        onClick={() => handleDelete(index)}
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
                                                        {members.find(m => m.userId === member)?.userName || member}
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
        </div>
    )
}