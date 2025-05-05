"use client"

import Link from "next/link"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { UserRound, LogOut } from "lucide-react"

interface UserAccountNavProps {
    user: {
        name: string | null
        email: string | null
        avatarUrl: string | null
    } | null
}

export function UserAccountNav({ user }: UserAccountNavProps) {
    if (!user) {
        return (
            <Link href="/auth/sign-in">
                <button className="px-4 py-2 rounded bg-primary text-white font-medium hover:bg-primary/90 transition">Login</button>
            </Link>
        )
    }
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <div className="flex items-center gap-2 cursor-pointer">
                    <span className="text-sm font-medium hidden sm:inline-block">
                        {user.name}
                    </span>
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatarUrl || ""} alt="User avatar" />
                        <AvatarFallback>
                            {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                        </AvatarFallback>
                    </Avatar>
                </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="break-all">{user.email}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <Link href="/profile">
                    <DropdownMenuItem className="cursor-pointer">
                        <UserRound className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                    </DropdownMenuItem>
                </Link>
                <Link href="/auth/sign-out">
                    <DropdownMenuItem className="cursor-pointer">
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Sign out</span>
                    </DropdownMenuItem>
                </Link>
            </DropdownMenuContent>
        </DropdownMenu>
    )
} 