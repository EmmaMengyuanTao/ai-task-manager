"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface ProfileFormProps {
    initialData?: {
        id: string
        name: string | null
        email: string | null
        description: string | null
        userId: string
        createdAt: Date | null
        updatedAt: Date | null
    }
}

export function ProfileForm({ initialData }: ProfileFormProps) {
    const [formData, setFormData] = useState({
        name: initialData?.name || "",
        email: initialData?.email || "",
        description: initialData?.description || ""
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        // 这里添加提交逻辑
        console.log("Profile data:", formData)
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">
                    Name
                </label>
                <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter your name"
                />
            </div>

            <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                    Email
                </label>
                <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Enter your email"
                />
            </div>

            <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-medium">
                    Profile
                </label>
                <Input
                    id="description"
                    type="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Share your story"
                />
            </div>

            <Button type="submit">Save Profile</Button>
        </form>
    )
}