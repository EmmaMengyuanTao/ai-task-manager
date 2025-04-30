"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Loader2, UserPlus } from "lucide-react"
import { inviteUserToProject } from "@/actions/projectActions"
import { toast } from "sonner"

interface InviteUserFormProps {
    projectId: number
}

export function InviteUserForm({ projectId }: InviteUserFormProps) {
    const router = useRouter()
    const [open, setOpen] = useState(false)
    const [isPending, startTransition] = useTransition()
    const [email, setEmail] = useState("")

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        
        if (!email.trim()) {
            toast.error("Please enter an email address")
            return
        }

        startTransition(async () => {
            try {
                const result = await inviteUserToProject({
                    projectId,
                    email,
                    role: "member"
                })

                if (result.success) {
                    toast.success(result.message || "Invitation sent successfully")
                    setEmail("")
                    setOpen(false)
                    router.refresh()
                } else {
                    toast.error(result.error || "Failed to send invitation")
                }
            } catch (error) {
                console.error("Invitation error:", error)
                toast.error("An unexpected error occurred")
            }
        })
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm">
                    <UserPlus className="h-4 w-4 mr-1" />
                    Invite
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Invite User to Project</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 mt-6">
                    <div className="space-y-3">
                        <Label htmlFor="email" className="text-sm font-medium block mb-1.5">
                            User Email
                        </Label>
                        <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter user email address"
                            disabled={isPending}
                            required
                            className="focus-visible:ring-1 focus-visible:ring-offset-1"
                        />
                        <p className="text-xs text-muted-foreground mt-2">
                            You can only invite registered users. If the email doesn't exist, an error will be shown.
                        </p>
                    </div>
                    <div className="flex justify-end mt-6">
                        <Button type="submit" disabled={isPending}>
                            {isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Inviting...
                                </>
                            ) : (
                                "Send Invitation"
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
} 