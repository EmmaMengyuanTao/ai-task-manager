"use client";
import Link from "next/link"
import { Menu, ChevronLeft } from "lucide-react"
import { UserAccountNav } from "@/components/user-account-nav"
import { authClient } from "@/lib/auth-client"
import { getAvatarUrl } from "@/lib/avatars"

export function Header({ collapsed, setCollapsed }: { collapsed: boolean, setCollapsed: (c: boolean) => void }) {
    const { data: session } = authClient.useSession()
    
    return (
        <header className="sticky top-0 z-50 px-5 py-3 border-b bg-background/60 backdrop-blur">
            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <button
                        className="p-2 rounded hover:bg-muted transition flex items-center justify-center"
                        onClick={() => setCollapsed(!collapsed)}
                        aria-label={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                    >
                        {collapsed ? <Menu size={24} /> : <ChevronLeft size={24} />}
                    </button>
                    <Link href="/" className="flex items-center gap-2 text-title-foreground px-10">
                        <span className="inline-block w-8 h-8 rounded-lg bg-gradient-to-tr from-pink-400 to-orange-400" />
                        <span className="text-lg font-bold pl-2">TaskMosaic</span>
                    </Link>
                </div>
                
                {session && (
                    <UserAccountNav 
                        user={{
                            name: session.user.name,
                            email: session.user.email,
                            avatarUrl: getAvatarUrl(session.user.image)
                        }} 
                    />
                )}
            </div>
        </header>
    )
}
