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
    status: "todo" | "inprogress" | "done"
    note: string | null
    requiredSkills: Skill[]
    assignedMembers: User[]
    projectId: number
    dueDate?: Date
    createdAt: Date
    updatedAt: Date
} 

export interface Subtask {
    title: string
    description: string
    requiredSkills: string[]
    assignedMembers: string[]
    reasoning: string
    status: "todo" | "inprogress" | "done"
}

export interface Project {
    id: number
    name: string
    description: string | null
    creatorId: string
}