"use client"

import { InviteUserForm } from "@/components/InviteUserForm"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { getAvatarUrl } from "@/lib/avatars"

interface ProjectMembersSectionProps {
    projectId: number
    canInvite: boolean
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
}

export function ProjectMembersSection({ projectId, canInvite, members }: ProjectMembersSectionProps) {
    return (
        <div className="rounded-lg border bg-card">
            <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Project Members</h2>
                    {canInvite && (
                        <InviteUserForm projectId={projectId} />
                    )}
                </div>
                <div className="grid gap-4">
                    {members.map(member => {
                        const displayName = member.profile?.name || member.userName || member.userEmail.split('@')[0]
                        const avatarId = member.profile?.avatarId || member.userImage
                        const avatarUrl = avatarId ? getAvatarUrl(avatarId) : null
                        
                        return (
                            <div
                                key={member.userId}
                                className="flex items-center justify-between p-3 rounded-md border"
                            >
                                <div className="flex items-center gap-3">
                                    <Avatar className="w-10 h-10">
                                        <AvatarImage src={avatarUrl || ""} alt={displayName} />
                                        <AvatarFallback className="bg-primary/10">
                                            {displayName[0]?.toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-medium">{displayName}</p>
                                        <p className="text-sm text-muted-foreground">{member.userEmail}</p>
                                    </div>
                                </div>
                                <div>
                                    <span className="px-2 py-1 text-xs rounded-full bg-primary/10">
                                        {member.userId === "creator" ? "Creator" : (member.role || "Member")}
                                    </span>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
} 