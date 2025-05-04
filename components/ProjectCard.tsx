"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { updateProjectDescription } from "@/actions/projectActions"
import { toast } from "sonner"
import { Pencil, Save, Loader2 } from "lucide-react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { getAvatarUrl } from "@/lib/avatars"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"

interface ProjectCardProps {
    id: number
    name: string
    description: string
    role: string
    userId: string
    deadline?: string | null
    members?: {
        userId: string
        userName: string | null
        userEmail: string
        userImage: string | null
        profile?: {
            name: string | null
            avatarId: string | null
        } | null
    }[]
}

export function ProjectCard({ id, name, description, role, userId, deadline, members = [] }: ProjectCardProps) {
    const router = useRouter()
    const [isEditing, setIsEditing] = useState(false)
    const [editedDescription, setEditedDescription] = useState(description)
    const [isPending, startTransition] = useTransition()

    const handleSave = () => {
        startTransition(async () => {
            try {
                const result = await updateProjectDescription({
                    projectId: id,
                    description: editedDescription,
                    userId
                })

                if (result.success) {
                    toast.success("Description updated successfully")
                    setIsEditing(false)
                    router.refresh()
                } else {
                    toast.error(result.error || "Failed to update description")
                }
            } catch (error) {
                console.error("Description update error:", error)
                toast.error("An unexpected error occurred")
            }
        })
    }

    return (
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow">
            <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold">{name}</h3>
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">{role}</span>
                </div>
                {deadline && (
                    <div className="mb-2 flex items-center gap-1 text-blue-600 font-medium text-xs">
                        <span className="flex items-center gap-1">
                            <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            <span className="">Due:</span>
                        </span>
                        {new Date(deadline).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                    </div>
                )}
                <div className="space-y-2 mb-4">
                    {isEditing ? (
                        <div className="space-y-2">
                            <Textarea
                                value={editedDescription}
                                onChange={(e) => setEditedDescription(e.target.value)}
                                placeholder="Enter project description"
                                className="min-h-[80px]"
                                disabled={isPending}
                            />
                            <div className="flex justify-end space-x-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        setIsEditing(false)
                                        setEditedDescription(description)
                                    }}
                                    disabled={isPending}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={handleSave}
                                    disabled={isPending}
                                >
                                    {isPending ? (
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
                            <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="ml-2"
                                onClick={() => setIsEditing(true)}
                            >
                                <Pencil className="h-4 w-4" />
                            </Button>
                        </div>
                    )}
                </div>
                <div className="flex items-center justify-between mt-4">
                    <div className="flex -space-x-2 overflow-hidden">
                        <TooltipProvider>
                            {members.slice(0, 4).map((member) => {
                                const displayName = member.profile?.name || member.userName || member.userEmail.split('@')[0]
                                const avatarId = member.profile?.avatarId || member.userImage
                                const avatarUrl = avatarId ? getAvatarUrl(avatarId) : null

                                return (
                                    <Tooltip key={member.userId}>
                                        <TooltipTrigger asChild>
                                            <Avatar 
                                                className="w-8 h-8 border-2 border-background hover:translate-y-[-5px] transition-transform"
                                            >
                                                <AvatarImage src={avatarUrl || ""} alt={displayName} />
                                                <AvatarFallback className="text-xs bg-primary/10">
                                                    {displayName[0]?.toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>{displayName}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                )
                            })}
                            {members.length > 4 && (
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Avatar 
                                            className="w-8 h-8 border-2 border-background"
                                        >
                                            <AvatarFallback className="bg-primary/10 text-xs">
                                                +{members.length - 4}
                                            </AvatarFallback>
                                        </Avatar>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>{members.length - 4} more members</p>
                                    </TooltipContent>
                                </Tooltip>
                            )}
                        </TooltipProvider>
                    </div>
                    <Link href={`/projects/${id}`}>
                        <Button variant="outline" size="sm">Open</Button>
                    </Link>
                </div>
            </div>
        </div>
    )
}