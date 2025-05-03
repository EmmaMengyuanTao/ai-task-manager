export interface Skill {
    id: number
    name: string
    description: string
    createdAt: Date
}

export interface User {
    id: number
    name: string
    email: string
}

export interface Task {
    id: number
    title: string
    description: string
    status: "todo" | "inprogress" | "completed"
    note: string | null
    requiredSkills: Skill[]
    assignedMembers: User[]
    projectId: number
    dueDate?: Date
    createdAt: Date
    updatedAt: Date
} 