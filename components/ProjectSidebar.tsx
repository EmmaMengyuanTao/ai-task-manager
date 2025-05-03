"use client"

import { Button } from "@/components/ui/button"
import { InviteUserForm } from "@/components/InviteUserForm"
import { cn } from "@/lib/utils"

interface ProjectSidebarProps {
    projectId: number
    canInvite: boolean
    members: {
        userId: string
        userName: string | null
        userEmail: string
        userImage: string | null
        role: string | null
        joinedAt: Date
    }[]
    activeSection: string
    onSectionChange: (section: string) => void
}

export function ProjectSidebar({
    projectId,
    canInvite,
    members,
    activeSection,
    onSectionChange
}: ProjectSidebarProps) {
    return (
        <div className="w-64 h-full border-r bg-card">
            <div className="flex flex-col h-full">
                <div className="p-4 border-b">
                    <h2 className="text-lg font-semibold">Project Navigation</h2>
                </div>
                <div className="flex-1 overflow-y-auto">
                    <nav className="p-4 space-y-2">
                        <Button
                            variant={activeSection === "subtasks" ? "default" : "ghost"}
                            className="w-full justify-start"
                            onClick={() => onSectionChange("subtasks")}
                        >
                            Generated Subtasks
                        </Button>
                        <Button
                            variant={activeSection === "todolist" ? "default" : "ghost"}
                            className="w-full justify-start"
                            onClick={() => onSectionChange("todolist")}
                        >
                            Todo List
                        </Button>
                        <Button
                            variant={activeSection === "members" ? "default" : "ghost"}
                            className="w-full justify-start"
                            onClick={() => onSectionChange("members")}
                        >
                            Project Members
                        </Button>
                    </nav>
                </div>
            </div>
        </div>
    )
}