"use client"

import { useState, useTransition } from "react"
import { useRouter } from 'next/navigation'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"
import { updateProfileAndSkills } from "@/actions/profileActions"
import { toast } from "sonner"

interface ProfileFormProps {
    userId: string
    initialData: {
        profileId: string | null
        name: string | null
        skills: string[]
        description: string | null
    }
}

export function ProfileForm({ initialData, userId }: ProfileFormProps) {
    const router = useRouter()
    const [name, setName] = useState(initialData.name || "")
    const [skills, setSkills] = useState<string[]>(initialData.skills || [])
    const [newSkill, setNewSkill] = useState("")
    const [isPending, startTransition] = useTransition()
    const [description, setDecription] = useState(initialData.description || "")

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        startTransition(async () => {
            try {
                const result = await updateProfileAndSkills({
                    userId,
                    name,
                    skills,
                    description
                })

                if (result.success) {
                    toast.success("Profile updated successfully!")
                    router.refresh()
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
        <form onSubmit={handleSubmit} className="w-full max-w-md space-y-6 rounded-lg border bg-card text-card-foreground p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-center">Edit Profile</h2>
            <div className="space-y-2">
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

            <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Profile
                </label>
                <Input
                    id="description"
                    value={description}
                    onChange={(e) => setDecription(e.target.value)}
                    placeholder="Tell us about yourself"
                    disabled={isPending}
                />
            </div>

            <div className="space-y-4">
                <label className="text-sm font-medium">Skills</label>
                <div className="flex min-h-[40px] flex-wrap items-center gap-2 rounded-md border border-input bg-background p-2">
                    {skills.length > 0 ? (
                        skills.map((skill) => (
                            <Badge key={skill} variant="secondary" className="flex items-center gap-1 pl-2 pr-1 py-0.5">
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
                        ))
                    ) : (
                        <p className="px-1 text-sm text-muted-foreground">No skills added yet.</p>
                    )}
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

            <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? "Saving..." : "Save Profile"}
            </Button>
        </form>
    )
}