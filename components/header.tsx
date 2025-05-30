"use client";
import Link from "next/link"
import { Menu, ChevronLeft } from "lucide-react"
import { UserAccountNav } from "@/components/user-account-nav"
import { authClient } from "@/lib/auth-client"
import { getAvatarUrl } from "@/lib/avatars"
import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then(res => res.json())

export function Header({ collapsed, setCollapsed }: { collapsed: boolean, setCollapsed: (c: boolean) => void }) {
    const { data: session } = authClient.useSession()
    const { data: profile } = useSWR(session ? '/api/profile' : null, fetcher)
    
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
                        <img src="/Logo.png" alt="TaskMosaic Logo" className="w-8 h-8" />
                        <span className="text-lg font-bold pl-2">TaskMosaic</span>
                    </Link>
                </div>
                
                <UserAccountNav 
                    user={session ? {
                        name: profile?.name ?? session.user.name,
                        email: session.user.email,
                        avatarUrl: getAvatarUrl(profile?.avatarId ?? session.user.image)
                    } : null}
                />
            </div>
        </header>
    )
}
