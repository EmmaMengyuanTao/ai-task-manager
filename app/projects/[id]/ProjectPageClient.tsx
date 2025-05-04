"use client"

import { useState } from "react"
import { ProjectSidebar } from "@/components/ProjectSidebar"
import { ProjectMembersSection } from "./sections/ProjectMembersSection"
import { GeneratedSubtasks } from "./sections/GeneratedSubtasks"
import { TodoList } from "./sections/TodoList"
import { Subtask, Project } from "@/app/types"

interface ProjectPageClientProps {
    project: Project,
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
    members,
    canInvite,
    userId,
}: ProjectPageClientProps) {
    
    const [activeSection, setActiveSection] = useState("subtasks")

    return (
        <div className="flex h-[calc(100vh-4rem)]">
            <ProjectSidebar
                projectId={project.id}
                canInvite={canInvite}
                members={members}
                activeSection={activeSection}
                onSectionChange={setActiveSection}
            />
            <main className="flex-1 overflow-y-auto py-8 px-10">
                {activeSection === "subtasks" && (
                    <GeneratedSubtasks
                        project={project}
                        members={members}
                        userId={userId}
                    />
                )}

                {activeSection === "todolist" && (
                    <TodoList projectId={project.id} />
                )}

                {activeSection === "members" && (
                    <ProjectMembersSection 
                        projectId={project.id}
                        canInvite={canInvite}
                        members={members}
                    />
                )}
            </main>
        </div>
    )
} 