"use client"

import React, { useState, useTransition } from "react"
import { useRouter } from 'next/navigation'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { X, Pencil } from "lucide-react"
import { updateProfileAndSkills } from "@/actions/profileActions"
import { toast } from "sonner"
import { AvatarSelector } from './avatar-selector';
import { type AvatarId, getAvatarUrl } from '@/lib/avatars';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog"
import useSWR, { mutate } from 'swr'
import { Textarea } from "@/components/ui/textarea"
import { AnimatePresence, motion } from "framer-motion"

interface ProfileFormProps {
    userId: string
    initialData: {
        profileId: string | null
        name: string | null
        skills: string[]
        description: string | null
        avatarId: AvatarId | null
    }
}

export function ProfileForm({ initialData, userId }: ProfileFormProps) {
    const router = useRouter()
    const [name, setName] = useState(initialData.name || "")
    const [skills, setSkills] = useState<string[]>(initialData.skills || [])
    const [newSkill, setNewSkill] = useState("")
    const [isPending, startTransition] = useTransition()
    const [description, setDecription] = useState(initialData.description || "")
    const [avatarId, setAvatarId] = useState<AvatarId | null>(initialData.avatarId || "default")
    const [isAvatarDialogOpen, setIsAvatarDialogOpen] = useState(false)

    const handleAddSkill = () => {
        const trimmedSkill = newSkill.trim()
        if (trimmedSkill !== "" && !skills.includes(trimmedSkill)) {
            setSkills([...skills, trimmedSkill])
            setNewSkill("")
        } else if (skills.includes(trimmedSkill)) {
            toast.info(`Skill "${trimmedSkill}" already added.`)
            setNewSkill("")
        }
    }

    const handleRemoveSkill = (skillToRemove: string) => {
        setSkills(skills.filter((skill) => skill !== skillToRemove))
    }

    const handleAvatarSelect = (id: AvatarId) => {
        setAvatarId(id)
        setIsAvatarDialogOpen(false)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        startTransition(async () => {
            try {
                const result = await updateProfileAndSkills({
                    userId,
                    name,
                    skills,
                    description,
                    avatarId
                })

                if (result.success) {
                    toast.success("Profile updated successfully!")
                    router.refresh()
                    mutate('/api/profile')
                } else {
                    toast.error(result.error || "Failed to update profile.")
                }
            } catch (error) {
                console.error("Profile update error:", error)
                toast.error("An unexpected error occurred.")
            }
        })
    }

    return (
        <motion.form
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            onSubmit={handleSubmit}
            className="w-full max-w-xl space-y-4 rounded-xl border border-gray-200 bg-white text-card-foreground p-8 shadow-md"
        >
            <h2 className="text-xl font-semibold text-center">Edit Profile</h2>
            
            <div className="flex flex-col items-center justify-center space-y-4">
                <div className="relative">
                    <Avatar className="w-15 h-15">
                        <AvatarImage 
                            src={getAvatarUrl(avatarId || "default")} 
                            alt="Profile avatar" 
                        />
                        <AvatarFallback>
                            {name ? name.charAt(0).toUpperCase() : 'U'}
                        </AvatarFallback>
                    </Avatar>
                    <Dialog open={isAvatarDialogOpen} onOpenChange={setIsAvatarDialogOpen}>
                        <DialogTrigger asChild>
                            <Button 
                                size="icon" 
                                className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full" 
                                variant="secondary"
                            >
                                <Pencil className="h-4 w-4" />
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogTitle className="text-lg font-semibold">Select Avatar</DialogTitle>
                            <AvatarSelector 
                                currentAvatarId={avatarId} 
                                onSelect={handleAvatarSelect} 
                            />
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <div className="space-y-1">
                <label htmlFor="name" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Name
                </label>
                <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    disabled={isPending}
                />
            </div>

            <div className="space-y-1">
                <label htmlFor="description" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Profile
                </label>
                <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDecription(e.target.value)}
                    placeholder="Tell us about yourself"
                    disabled={isPending}
                    rows={3}
                    className="resize-y max-h-40"
                />
            </div>

            <div className="space-y-3">
                <label className="text-sm font-medium">Skills</label>
                <div className="flex min-h-[40px] flex-wrap items-center gap-2 rounded-md border border-input bg-white p-2">
                    <AnimatePresence mode="wait">
                        {skills.length > 0 ? (
                            skills.map((skill) => (
                                <motion.span
                                    key={skill}
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0.8, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <Badge
                                        variant="secondary"
                                        className="flex items-center gap-1 pl-2 pr-1 py-0.5"
                                    >
                                        {skill}
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveSkill(skill)}
                                            className="ml-1 rounded-full p-0.5 outline-none ring-offset-background hover:bg-muted focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                            aria-label={`Remove ${skill} skill`}
                                            disabled={isPending}
                                        >
                                            <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                                        </button>
                                    </Badge>
                                </motion.span>
                            ))
                        ) : (
                            <motion.p
                                key="placeholder"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="px-1 text-sm text-muted-foreground"
                            >
                                No skills added yet.
                            </motion.p>
                        )}
                    </AnimatePresence>
                </div>

                <div className="flex gap-2">
                    <Input
                        id="newSkill"
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        placeholder="Add a new skill (e.g., React, Python)"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddSkill();
                            }
                        }}
                        disabled={isPending}
                    />
                    <Button
                        type="button"
                        onClick={handleAddSkill}
                        variant="outline"
                        disabled={isPending || newSkill.trim() === ""}
                    >
                        Add Skill
                    </Button>
                </div>
            </div>

            <Button
                type="submit"
                variant="gradient"
                className="w-full h-10 mt-2"
                disabled={isPending}
            >
                {isPending ? "Saving..." : "Save Profile"}
            </Button>
        </motion.form>
    )
}